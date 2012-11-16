// Ant.js
// Nov 12, 2012
//
// Implementation of the Ant class.  Contains state information, an update function,
// and a draw function.

function Ant(_dest) {

  // Public Variables
  this.path = (_dest == null) ? [] : _dest.getPath().slice(0);
  this.first = (_dest == null);
  this.origin = root;
  this.dest = root;
  this.dist = 0;
  this.returning = false;
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
  // Update the ant's position
  this.dist += ANT_SPEED;

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

  // Choose new destination
  if (this.dist >= 1) 
  {
    this.dist = 0;

    // If moving outward
    if (!this.returning) 
    {
      // If the ant is at a leaf (turn around)
      if (this.dest.right == null) 
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
      // If at a regular branch
      if (this.dest.parent != null) {
        this.origin = this.dest;
        this.dest = this.dest.parent;
        this.origin.ants += 1;
      }
      // If back at the nest
      else {
        // If the ant stays at the nest
        if (Math.random() < STOP_SEARCHING) {
          nest.returnHome();
          return true;
        } 
        // If the ant goes back out to search again
        else {
          this.returning = false;
          this.origin = root;
          this.branch();
        }
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
  if (!this.first && Math.random() > SWITCH_PATH && !PHEROMONE && RETURN_TO_FOOD) {
    this.dest = this.path[this.dest.depth] ? this.dest.right : this.dest.left;
  }
  // If the ant needs to choose a new destination
  else {
    var d;

    // If the ant is switching off its path, clear the excess path array
    if (this.path.length > this.dest.depth) {  
      this.path.splice(this.dest.depth, this.path.length - this.dest.depth - 1);
    }
    
    // If using pheromone trails to weight the decision
    if (PHEROMONE) {
      var r = sense(this.dest.right.pheromone);
      var l = sense(this.dest.left.pheromone);
      d = Math.random() < r / (r + l);
    } 
    // If not using pheromone trails
    else {
      d = Math.random() < 0.5;
    }
    // Set the 
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
  if (SENSE_LINEAR)
    return ((-1/(1+Math.pow(2,-.001*(p-25000))))+1)*p+1;
  // Logarithmic pheromone profile
  else 
    return ((-1/(1+Math.pow(2,-10*((Math.log(p+1)/Math.log(2))-12.0))))+1)*Math.log(p+1)/Math.log(2)+1;
}

