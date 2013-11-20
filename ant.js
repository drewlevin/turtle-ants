// Ant.js
// Nov 12, 2012
//
// Implementation of the Ant class.  Contains state information, an update function,
// and a draw function.

function Ant(_id, _dest) {

  // Public Variables
  this.id = _id;
  this.path = (_dest == null) ? [] : _dest.getPath().slice(0); // slice for deep copy
  this.first = (_dest == null);
  this.origin = root;
  this.dest = root;
  this.dist = 0;
  this.returning = false;
  this.found_food = false;
  this.watching = false;
  this.watching_time = 0;
  this.left_count = 0; this.right_count = 0;
  this.x = 0; this.y = 0;
  this.color = (_dest != null) ? ((_dest.food > 0) ? _dest.foodColor : '#333') : '#333';

  // Make initial branching decision
  this.branch();
}


/* update
 *   Updates the Ant's position
 */
Ant.prototype.update = function() 
{
  // Update the ant's position
  if (!this.watching) {
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

    if (this.dest.observer != null && this.dist >= 0.5 && this.dist < 0.5 + ANT_SPEED) {
      this.dest.observer.addOutgoing();
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
   
    if (this.origin.observer != null && this.dist >= 0.5 && this.dist < 0.5 + ANT_SPEED) {
      this.origin.observer.addIncoming();
    }

    if (PHEROMONE && this.found_food) {
      this.origin.pheromone++;
    }
  }

  // At a node - choose new destination
  if (this.dist >= 1) 
  {
    if (!PATH_INTERACTION) {
      this.dist = 0;
    }

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
          this.origin.food--;           
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
      
      // If Path Interaction, send a singal to other ants
      if (PATH_INTERACTION) {
        this.dist = 0;
        this.dest.signalReturn(this.origin.isRight);
      }
      // If at a regular branch
      if (this.dest.parent != null) {
        this.origin = this.dest;
        this.dest = this.dest.parent;
        this.origin.ants += 1;
      }
      // If back at the nest
      else {
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
            nest.returnHome();
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
      if (!this.watching) {
        this.watching = true;
        this.watching_time = 0; 
        this.origin.addWatcher(this);
      }
      else {
        if (this.watching_time > WAIT_TIME) {
          this.watching = false;
          this.origin.removeWatcher(this.id);
          if (WEIGHT_LINEAR) {
            d = Math.random() < this.right_count / (this.right_count + this.left_count);
          }
          else { // WEIGHT_COUNT
            d = this.right_count > this.left_count ? 
                  true : 
	          (this.left_count > this.right_count ? 
		     false :
                     Math.random() < 0.5);
          }
	  this.dist = 0;
        }
        else {
          this.watching_time++;
        }
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

  this.origin = this.dest;
  this.dest.ants += 1;
}

/* draw
 *   Draws the ant on the canvas.  Assumes a global 'ctx' canvas variable
 */
Ant.prototype.draw = function()
{
  ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.arc(this.x, this.y, ANT_RADIUS, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
}

/* sense
 *   Pheromone sensing function.  Weights the path choice according to pheromone quantity.
 */
function sense(p)
{
  // Linear pheromone profile
  if (SENSE_LINEAR) {
//    return ((-1/(1+Math.pow(2,-.001*(p-25000))))+1)*p+1;
    return p+1;
  }
  // Logarithmic pheromone profile
  else if (SENSE_LOG) {
//    return ((-1/(1+Math.pow(2,-10*((Math.log(p+1)/Math.log(2))-14.0))))+1)*Math.log(p+1)/Math.log(2)+1; 
    return Math.log(p+1)/Math.log(2)+1; 
  }
  // Only checks to see which side is larger
  else if (SENSE_CONST) {
    return p;
  }
}

