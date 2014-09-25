// Ant.js
// Nov 12, 2012
//
// Implementation of the Ant class.  Contains state information, an update function,
// and a draw function.

function Ant(_id, _dest) {

  // Public Variables
  this.id = _id;
  this.path = (_dest == null) ? [] : _dest.getPath().slice(0); // slice for deep copy
  this.first = true;
  this.origin = root;
  this.dest = root;
  this.dist = PATH_INTERACTION ? 1.0 : 0.0;  // So PATH_INTERACTION at the nest works immediately
  this.returning = false;
  this.found_food = false;
  this.watching = false;
  this.watching_time = 0;
  this.left_count = 0; this.right_count = 0;
  this.x = 0; this.y = 0;
  this.color = (_dest != null) ? ((_dest.food > 0) ? _dest.foodColor : '#333') : '#333';
  this.speed_mult = 1.0; // 0.5 * Math.random() + 0.75;
  // Make initial branching decision
  if (!PATH_INTERACTION) {
    this.branch();
  }
}


/* update
 *   Updates the Ant's position
 */
Ant.prototype.update = function()
{
  // Update the ant's position
  if (!this.watching) {
    this.dist += ANT_SPEED*this.speed_mult;
    this.setPosition()
  }

  // At a node - choose new destination
  if (this.dist >= 1)
  {
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

        total_trips++;

        // If the ant found food
        if (this.origin.food > 0) {
          this.found_food = true;
          if (!INITIAL_PATH) {
            food_gathered++;
            this.origin.food--;
            this.color = this.origin.foodColor;
          }
        }
        // If the ant didn't find food
        else {
          this.found_food = false;
          if (!INITIAL_PATH) {
            this.color = '#D33';
            this.path = [];
          }
        }
      }

      // If the ant is at a branch point (choose branch)
      else {
        // If doing rete equalization AND at the nest, choose one of the two paths based on the strategy
        if (INITIAL_PATH && this.dest.depth == 0 && RATE_REPULSE) {
          if (!this.watching) {
            this.watching = true;
            this.watching_time = 0;
            this.dest.addWatcher(this);
          }
          else if (this.watching_time < RATE_WAIT_TIME) {
            this.watching_time++;
          }
          else {
            this.watching = false;
            this.watching_time = 0;
            this.dest.removeWatcher(this.id)
            this.branch();
          }
        }
        // If Path Interaction is active and there is a decision to make
        else if (PATH_INTERACTION && this.dest.right != null && this.dest.left != null) {// && this.dest.depth == 0) { // ROOT ONLY
          if (!this.watching) {
            this.watching = true;
            this.watching_time = 0;
            this.dest.addWatcher(this);
          }
          else if (this.watching_time < WAIT_TIME) {
            this.watching_time++;
          }
          else {
            this.watching = false;
            this.watching_time = 0;
            this.dest.removeWatcher(this.id)
            this.branch();
          }
        }
        else {
          this.dist = 0;
          this.branch();
        }
      }
    }
    // If moving home
    else {
      this.origin.ants -= 1;
      this.dist = 0;
      // If Path Interaction, send a singal to other ants
      if (PATH_INTERACTION || (INITIAL_PATH && RATE_REPULSE && this.dest.depth == 0)) { // && this.dest.depth == 0) { // ONLY FOR ROOT
        this.dest.signalReturn(this.origin.isRight, this.found_food);
      }
      // If at a regular branch
      if (this.dest.parent != null) {
        this.origin = this.dest;
        this.dest = this.dest.parent;
        this.origin.ants += 1;
      }
      // If back at the nest
      else {
        if (!INITIAL_PATH) {
          this.color = '#333';
        }
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
        this.dist = 1.0;
      }
    }
  }

  // False means the ant is recirculating
  return false;
}


/* setPosition
 *   Helper function for update.  Updates an ant's x and y coordinates given
 *   the ant's origin, destination, and distance.
 */
Ant.prototype.setPosition = function()
{
  // If moving outward
  if (!this.returning) {
    if (this.dest.isRight) {
      this.x = this.origin.out_right_x + this.dist * (this.dest.out_parent_x - this.origin.out_right_x);
      this.y = this.origin.out_right_y + this.dist * (this.dest.out_parent_y - this.origin.out_right_y);
    } else {
      this.x = this.origin.out_left_x + this.dist * (this.dest.out_parent_x - this.origin.out_left_x);
      this.y = this.origin.out_left_y + this.dist * (this.dest.out_parent_y - this.origin.out_left_y);
    }

    if (this.dest.observer != null && this.dist >= 0.5 && this.dist < 0.5 + ANT_SPEED*this.speed_mult) {
      this.dest.observer.addOutgoing(this.color);
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

    if (this.origin.observer != null && this.dist >= 0.5 && this.dist < 0.5 + ANT_SPEED*this.speed_mult) {
      this.origin.observer.addIncoming(this.color);
    }

    if (PHEROMONE && this.found_food) {
      this.origin.pheromone++;
    }
  }
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
//  var old_origin = this.origin; // PATH_INTERACTION at root only

  this.dest.ants -= 1;
  this.origin = this.dest;

  // If rate equalization is checked, limit the search to two paths
  //  food_node_a and food_node_b
  if (INITIAL_PATH) {
    var d;
    if (this.path.length > this.dest.depth) {
      if (this.dest.depth == 0 && !this.first) {
        // If random rate equalization
        if (RATE_RANDOM) {
          this.path = Math.random() < 0.5 ? food_node_a.getPath().slice(0) : food_node_b.getPath().slice(0);
        }
        // If repulsive rate equalization
        else if (RATE_REPULSE && this.right_count + this.left_count > 0 && !this.first) {
          if (RATE_REPULSE_LINEAR) {
            // If the ant went right previously, and then counted more ants coming back from the right,
            // go left with a probability linear to the number of ants
            proportion = this.right_count / (this.right_count + this.left_count);
            if (proportion > 0.5 &&
                this.path[0] &&
                Math.random() < 2.0*(proportion - 0.5))
            {
              this.path = left_path.getPath().slice(0);
            }
            else if (proportion < 0.5 &&
                    !this.path[0] &&
                    Math.random() < 2.0*(0.5 - proportion))
            {
              this.path = right_path.getPath().slice(0);
            }
          }
          else if (RATE_REPULSE_SIGMOID) {
            proportion = this.right_count / (this.right_count + this.left_count);
            if (proportion > 0.5 &&
                this.path[0] &&
                Math.random() < 1.0 / (1.0+Math.exp(-25.0*(proportion-0.75))))
            {
              this.path = left_path.getPath().slice(0);
            }
            else if (proportion < 0.5 &&
                    !this.path[0] &&
                    Math.random() < 1.0 / (1.0+Math.exp(-25.0*(-proportion+0.25))))
            {
              this.path = right_path.getPath().slice(0);
            }

          }
          else if (RATE_REPULSE_STEP) {
            proportion = this.right_count / (this.right_count + this.left_count);
            if (proportion > 0.5 && this.path[0])
            {
              this.path = left_path.getPath().slice(0);
            }
            else if (proportion < 0.5 && !this.path[0])
            {
              this.path = right_path.getPath().slice(0);
            }

          }
          else if (RATE_REPULSE_STEP2) {
            proportion = this.right_count / (this.right_count + this.left_count);
            if (proportion > 0.5 &&
                this.path[0] &&
                Math.random() < 0.5)
            {
              this.path = left_path.getPath().slice(0);
            }
            else if (proportion < 0.5 &&
                    !this.path[0] &&
                    Math.random() < 0.5)
            {
              this.path = right_path.getPath().slice(0);
            }

          }
          else if (RATE_REPULSE_STEP4) {
            proportion = this.right_count / (this.right_count + this.left_count);
            if (proportion > 0.5 &&
                this.path[0] &&
                Math.random() < 0.25)
            {
              this.path = left_path.getPath().slice(0);
            }
            else if (proportion < 0.5 &&
                    !this.path[0] &&
                    Math.random() < 0.25)
            {
              this.path = right_path.getPath().slice(0);
            }

          }
        this.right_count = 0;
        this.left_count = 0;
    	  this.dist = 0;
        }
      }
      this.first = false;
      this.dest = this.path[this.dest.depth] ? this.dest.right : this.dest.left;
    }
    else {
      if (this.dest.right != null && this.dest.left == null) {
        d = true;
      }
      else if (this.dest.right == null && this.dest.left != null) {
        d = false;
      }
      else {
        d = Math.random() < 0.5;
      }
      this.dest = d ? this.dest.right : this.dest.left;
      this.path.push(d);
    }
  }
  // If the ant has a destination in mind
  else if (this.found_food && Math.random() > SWITCH_PATH && !PHEROMONE && RETURN_TO_FOOD) {
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
    else if (PATH_INTERACTION) { // && old_origin.depth == 0) { // ROOT ONLY
      if (WEIGHT_LINEAR) {
	      if (this.right_count + this.left_count == 0) {
	    	  d = Math.random() < 0.5;
	      }
	      else {
	    	  d = Math.random() < this.right_count / (this.right_count + this.left_count);
	      }
      }
      else { // WEIGHT_COUNT
        d = this.right_count > this.left_count ?
              true :
	            (this.left_count > this.right_count ?
		             false :
                 Math.random() < 0.5);
      }
      this.right_count = 0;
      this.left_count = 0;
  	  this.dist = 0;
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

