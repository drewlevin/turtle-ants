/*
 * ants.model.ant.js
 * Ant model class.  Use 'new' to instantiate an ant.
 * Requires a unique _id, the nest object, the root node, and the model params
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.model.ant = (function () {
  'use strict';

  // ------------------ Object Definition -------------------- //
  var Ant = function (_id, _dest, root, _params) {
    this.params = _params;

    // Public Variables
    this.id = _id;
    this.path = _dest === null ? [] : _dest.getPath().slice(0); // slice for deep copy
    this.origin = root;
    this.dest = root;
    this.dist = this.params.PATH_INTERACTION ? 1.0 : 0.0;  // So PATH_INTERACTION at the nest works immediately
    this.returning = false;
    this.found_food = false;
    this.watching = false;
    this.watching_time = 0;
    this.left_count = 0; this.right_count = 0;
    this.speed_mult = 1.0; // 0.5 * Math.random() + 0.75;

    // Make initial branching decision
    if (!this.params.PATH_INTERACTION) {
      this.branch();
    }
  };

  // ------------------ Private Variables -------------------- //

  // ------------------ Private Functions -------------------- //
  Ant.prototype.sense = function (p)
  {
    // Linear pheromone profile
    if (this.params.SENSE_LINEAR) {
  //    return ((-1/(1+Math.pow(2,-.001*(p-25000))))+1)*p+1;
      return p+1;
    }
    // Logarithmic pheromone profile
    else if (this.params.SENSE_LOG) {
  //    return ((-1/(1+Math.pow(2,-10*((Math.log(p+1)/Math.log(2))-14.0))))+1)*Math.log(p+1)/Math.log(2)+1;
      return Math.log(p+1)/Math.log(2)+1;
    }
    // Only checks to see which side is larger
    else if (this.params.SENSE_CONST) {
      return p;
    }
  };

  // ------------------ Public Functions -------------------- //
  Ant.prototype.update = function()
  {
    var returnObj = {
          total_trips: 0,
          food_gathered: 0,
          is_recirculating: true
        };

    // Update the ant's position
    if (!this.watching) {
      this.dist += this.params.ANT_SPEED*this.speed_mult;
      //this.setPosition();
    }

    // If moving outward
    if (!this.returning) {
      if (this.dest.observer !== null && this.dist >= 0.5 &&
          this.dist < 0.5 + this.params.ANT_SPEED*this.speed_mult) {
        this.dest.observer.addOutgoing();
      }
    }
    // If moving home
    else {
      if (this.origin.observer !== null && this.dist >= 0.5 &&
          this.dist < 0.5 + this.params.ANT_SPEED*this.speed_mult) {
        this.origin.observer.addIncoming();
      }

      if (this.params.PHEROMONE && this.found_food) {
        this.origin.pheromone++;
      }
    }

    // At a node - choose new destination
    if (this.dist >= 1)
    {
      // If moving outward
      if (!this.returning)
      {
        // If the ant is at a leaf (turn around)
        if (this.dest.right === null && this.dest.left === null)
        {
          var temp_origin = this.dest;

          this.returning = true;
          this.dist = 0;
          this.dest = this.origin;
          this.origin = temp_origin;

          returnObj.total_trips++;

          // If the ant found food
          if (this.origin.food > 0) {
            this.found_food = true;
            returnObj.food_gathered++;
            this.origin.food--;
          }
          // If the ant didn't find food
          else {
            this.found_food = false;
            this.path = [];
          }
        }

        // If the ant is at a branch point (choose branch)
        else {
          // If Path Interaction is active and there is a decision to make
          if (this.params.PATH_INTERACTION &&
              this.dest.right !== null &&
              this.dest.left !== null) { // && this.dest.depth == 0) { // ROOT ONLY
            if (!this.watching) {
              this.watching = true;
              this.watching_time = 0;
              this.dest.addWatcher(this);
            }
            else if (this.watching_time < this.params.WAIT_TIME) {
              this.watching_time++;
            }
            else {
              this.watching = false;
              this.watching_time = 0;
              this.dest.removeWatcher(this.id);
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
        if (this.params.PATH_INTERACTION) { // && this.dest.depth === 0) { // ONLY FOR ROOT
          this.dest.signalReturn(this.origin.isRight, this.found_food);
        }
        // If at a regular branch
        if (this.dest.parent !== null) {
          this.origin = this.dest;
          this.dest = this.dest.parent;
          this.origin.ants += 1;
        }
        // If back at the nest
        else {
          // Nest Interaction - determine to stop or bring a friend
          if (this.params.NEST_INTERACTION) {
            // If the ant found food there's a chance to send new ants out
            if (this.found_food) {
              Ants.model.nest.recruit(this);
              // Chance to stop searching
              if (Math.random() < this.params.STAY_HOME_SUCCESS) {
                Ants.model.nest.returnHome();
                returnObj.is_recirculating = false;
              }
            }
            // If the ant didn't find food there's a chance to stay home
            else if (!this.found_food && Math.random() < STAY_HOME_FAIL) {
              Ants.model.nest.returnHome();
              returnObj.is_recirculating = false; // false means the ant stays home
            }
          }
          // If you didn't return home, go out again
          this.returning = false;
          this.origin = this.dest;
          this.dist = 1.0;
        }
      }
    }

    return returnObj;
  };

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

    // Test to see if a successful ant switches its path
//    if (this.found_food && Math.random() > this.params.SWITCH_PATH &&
//        !this.params.PHEROMONE && this.params.RETURN_TO_FOOD) {
//      this.dest = this.path[this.dest.depth] ? this.dest.right : this.dest.left;
//    }
    // If the ant needs to choose a new destination
    if (false) { console.log(''); }
    else {
      var d, r, l;

      // If the ant is switching off its path, clear the excess path array
      if (this.path.length > this.dest.depth) {
        this.path.splice(this.dest.depth, this.path.length - this.dest.depth - 1);
      }

      // If there's only one possible direction
      if (this.dest.right !== null && this.dest.left === null) {
        d = true;
      }
      else if (this.dest.right === null && this.dest.left !== null) {
        d = false;
      }
      // If using pheromone trails to weight the decision
      else if (this.params.PHEROMONE) {
        r = this.sense(this.dest.right.pheromone);
        l = this.sense(this.dest.left.pheromone);
        if (!this.params.SENSE_CONST) {
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
      else if (this.params.PATH_INTERACTION) { // && old_origin.depth == 0) { // ROOT ONLY
        if (this.params.WEIGHT_LINEAR) {
          if (this.right_count + this.left_count === 0) {
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
      else if (this.params.CAN_SMELL) {
        r = this.dest.right.scent;
        l = this.dest.left.scent;
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
  };

  // ------------------ Return Class -------------------- //
  return Ant;
}());
