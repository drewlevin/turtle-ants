// Ant.js
// Nov 12, 2012
//
// Implementation of the Ant class.  Contains state information, an update function,
// and a draw function.

function Ant(_dest) {

  // Public Variables
  this.path = (_dest == null) ? [] : _dest.getPath().slice(0); // slice for deep copy
  this.first = (_dest == null);
  this.origin = root;
  this.dest = root;
  this.dist = 0;
  this.returning = false;
  this.found_food = false;
  this.directing = false;
  this.x = 0; this.y = 0;
  this.color = (_dest != null) ? ((_dest.food > 0) ? _dest.foodColor : '#333') : '#333';

  // Constructor
  this.branch();
}


/* update
 *   Updates the Ant's position
 */
Ant.prototype.update = function() 
{
  // Check to see if the ant will stop directing
  if (this.directing) {
    if (Math.random() < (1.0 / AVERAGE_TIME)) {
      this.directing = false;
      this.origin.has_path_ant = false;
    } else {
      this.dist = ((((this.dist*100 + 1) - 80) % 5) + 80) / 100.0;
    }
  }

  // Update the ant's position
  if (!this.directing) {
    this.dist += ANT_SPEED;
  }

  // If moving outward
  if (!this.returning) {
    if (this.dest.isRight) {
      this.x = this.origin.out_right_x + this.dist * (this.dest.out_parent_x - this.origin.out_right_x);
      this.y = this.origin.out_right_y + this.dist * (this.dest.out_parent_y - this.origin.out_right_y);
    } else {
      this.x = this.origin.out_left_x + this.dist * (this.dest.out_parent_x - this.origin.out_left_x);
      this.y = this.origin.out_left_y + this.dist * (this.dest.out_parent_y - this.origin.out_left_y);
    }
  } 
  // If moving home
  else {
    if (this.origin.isRight) {
      this.x = this.origin.in_parent_x + this.dist * (this.dest.in_right_x - this.origin.in_parent_x);
      this.y = this.origin.in_parent_y + this.dist * (this.dest.in_right_y - this.origin.in_parent_y);
    } else {
      this.x = this.origin.in_parent_x + this.dist * (this.dest.in_left_x - this.origin.in_parent_x);
      this.y = this.origin.in_parent_y + this.dist * (this.dest.in_left_y - this.origin.in_parent_y);
    }
   
    if (PHEROMONE && this.found_food) {
      this.origin.pheromone++;
    }
  }

  // At a node - choose new destination
  if (this.dist >= 1) 
  {
    this.dist = 0;

    // If moving outward
    if (!this.returning) 
    {
      // If the ant is at a leaf (turn around)
      if (this.dest.right == null && this.dest.left == null) 
      {
        var temp_origin = this.dest;

        this.returning = true;      
        this.dist = 0;
        this.dest = this.origin;
        this.origin = temp_origin;

        // If the ant found food
        if (this.origin.food > 0) {
          this.found_food = true;
          /* Do not remove food for rate balancing experiment
            this.origin.food--;           
          */
          this.color = this.origin.foodColor;
          this.first = false;
        } 
        // If the ant didn't find food
        else {
          this.found_food = false;
          this.color = '#333';
          this.first = true;
          this.path = [];
        }
      } 

      // If the ant is at a branch point (choose branch)
      else {
        this.branch();
      }
    } 
    // If moving home
    else {
      this.origin.ants -= 1;
      
      // If Path Interaction, check to see if the ant stays
      if (PATH_INTERACTION) {
        if (this.found_food && !this.origin.has_path_ant && !this.directing && 
            this.dest.right != null && this.dest.left != null &&
            Math.random() < STAY_PROB) {
          this.directing = true;
          this.origin.has_path_ant = true;
          this.dist = 0.8;
          return false;
        }
      }
      // If at a regular branch
      if (this.dest.parent != null) {
        this.origin = this.dest;
        this.dest = this.dest.parent;
        this.origin.ants += 1;
      }
      // If back at the nest
      else {
        // Check in with the nest to allow for rate measurement
        nest.returnHome(this);

        // Nest Interaction - determine to stop or bring a friend
        if (NEST_INTERACTION) {
          // If the ant found food there's a chance to send new ants out
          if (this.found_food) {
            nest.recruit(this);
            // Chance to stop searching
            if (Math.random() < STAY_HOME_SUCCESS) {
              nest.returnHome();
              return true;
            }
          }
          // If the ant didn't find food there's a chance to stay home
          else if (!this.found_food && Math.random() < STAY_HOME_FAIL) {
            nest.stayHome();
            return true;        // True means the ant stays home
          }
        }

        // If you didn't return home, go out again
        this.returning = false;
        this.origin = root;
        this.branch();
      }
    }
  }
  
  // False means the ant is recirculating
  return false;
}


/* branch
 *   Helper function for update.  Updates an ant's destination information when an ant
 * needs to choose a new direction.  Assumes that the ant is at a valid branch.;
 *   1) Leave current edge
 *   2) Choose new direction
 *   3) Update state to reflect new direction
 */
Ant.prototype.branch = function()
{
  this.dest.ants -= 1;
  this.origin = this.dest;

  // If the ant has a destination in mind
  if (!this.first && this.found_food && Math.random() > SWITCH_PATH && !PHEROMONE && RETURN_TO_FOOD) {
    this.dest = this.path[this.dest.depth] ? this.dest.right : this.dest.left;
  }
  // If the ant needs to choose a new destination
  else {
    var d;

    // If the ant is switching off its path, clear the excess path array
    if (this.path.length > this.dest.depth) {  
      this.path.splice(this.dest.depth, this.path.length - this.dest.depth - 1);
    }
    
    // If there's only one possible direction
    if (this.dest.right != null && this.dest.left == null) {
      d = true;      
    }
    else if (this.dest.right == null && this.dest.left != null) {
      d = false;
    }
    // If using pheromone trails to weight the decision
    else if (PHEROMONE) {
      var r = sense(this.dest.right.pheromone);
      var l = sense(this.dest.left.pheromone);
      if (!SENSE_CONST) {
        d = Math.random() < r / (r + l);
      }
      else {
        if (r == l) {
          d = Math.random() < 0.5;
        }
        else {
          d = r > l;
        }
      }
    }
    // If ants can be recruited on the path
    else if (PATH_INTERACTION) {
      // If there is a recruiter to the right and NOT the left
      if (this.dest.right.has_path_ant && !this.dest.left.has_path_ant &&
          Math.random() < INTERACT_PROB) {
        d = true;
      }
      // If there is a recruiter to the left and NOT the right
      else if (!this.dest.right.has_path_ant && this.dest.left.has_path_ant &&
               Math.random() < INTERACT_PROB) {
        d = false;
      }
      // Otherwise it's 50/50
      else {
        d = Math.random() < 0.5;
      }
    }
    // If ants can smell food 
    else if (CAN_SMELL) {
      var r = this.dest.right.scent;
      var l = this.dest.left.scent;
      if (r && !l) {
        d = true;
      }
      else if (!r && l) {
        d = false;
      }
      else {
        d = Math.random() < 0.5;
      }
    }
    // If not using pheromone or scent trails
    else {
      d = Math.random() < 0.5;
    }
    // Set the destination 
    this.dest = d ? this.dest.right : this.dest.left;
    this.path.push(d);              
  }

  this.dest.ants += 1;
}

/* draw
 *   Draws the ant on the canvas.  Assumes a global 'ctx' canvas variable
 */
Ant.prototype.draw = function()
{
  if (!this.directing) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, ANT_RADIUS, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
  }
  // If the ant is recruiting other ants on the path
  else {
    ctx.fillStyle = '#A39';
    ctx.beginPath();
    ctx.arc(this.x, this.y, ANT_RADIUS * 2, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();    
  }
}

/* sense
 *   Pheromone sensing function.  Weights the path choice according to pheromone quantity.
 */
function sense(p)
{
  // Linear pheromone profile
  if (SENSE_LINEAR) {
    return ((-1/(1+Math.pow(2,-.001*(p-25000))))+1)*p+1;
  }
  // Logarithmic pheromone profile
  else if (SENSE_LOG) {
    return ((-1/(1+Math.pow(2,-10*((Math.log(p+1)/Math.log(2))-14.0))))+1)*Math.log(p+1)/Math.log(2)+1; 
  }
  // Only checks to see which side is larger
  else if (SENSE_CONST) {
    return p;
  }
}

