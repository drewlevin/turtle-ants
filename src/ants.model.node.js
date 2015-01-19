/*
 * ants.model.node.js
 * Node (tree branch) model class.  Use 'new' to instantiate a node object.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.model.node = (function () {
  'use strict';

  // ------------------ Class Definition -------------------- //
  var Node = function (_id, _parent, _depth, _isRight, _params) {
    this.id = _id;

    this.parent = _parent;
    this.depth = _depth;
    this.isRight = _isRight;
    this.right = null;
    this.left = null;

    this.waiting_array = [];

    this.observer = null;

    this.food = 0;
    this.initial_food = 0;
    this.decay = 0;
    this.pheromone = 0;
    this.scent = false;
    this.scent_dist = 0;
    this.ants = 0;

    this.params = _params;
  };

  // ------------------ Public Functions -------------------- //
  Node.prototype.getPath = function() {
    if (this.depth === 0) {
      return [];
    } else {
      var parent_path = this.parent.getPath();
      parent_path.push(this.isRight);
      return parent_path;
    }
  };

  Node.prototype.equals = function(_path) {
    var eq = false;
    if (this.path.length === _path.length) {
      for (var i=this.path.length-1; i>=0; i--) {
        if (this.path[i] !== _path[i])
          break;
      }
      eq = true;
    }
    return eq;
  };

  Node.prototype.getChild = function(_path) {
    if (_path.length === 0) {
      return this;
    }
    else {
      return _path.shift() ?
               this.right.getChild(_path) :
               this.left.getChild(_path);
    }
  };

  Node.prototype.update = function(_time) {
    if (this.food > 0) {
      this.decay += Number(this.params.FOOD_DECAY);
      while (this.decay >= 1 && this.food > 0) {
        this.food -= 1;
        this.decay -= 1;
      }
    }

    if (this.food === 0 && this.right === null && this.left === null) {
      if (Math.random() < this.params.NEW_FOOD_PROB) {
        this.food = this.params.MAX_FOOD;
      }
    }

    if (this.params.PHEROMONE && this.pheromone > 0) {
      this.pheromone = this.pheromone * (1 - this.params.PHEROMONE_DECAY);
    }

    if (this.observer !== null) {
      this.observer.update(_time);
    }

    // Recursive Calls
    if (this.right !== null) {
      this.right.update(_time);
    }
    if (this.left !== null) {
      this.left.update(_time);
    }

    // Check for smell updates after the child updates so scent can percolate
    if (this.params.CAN_SMELL) {
      if (this.right === null) {
        this.scent = this.food > 0;
        this.scent_dist = 1;
      }
      else {
        this.scent = ((this.right.scent && this.right.scent_dist + 1 <= this.params.SCENT_RADIUS) ||
                      (this.left.scent && this.left.scent_dist + 1 <= this.params.SCENT_RADIUS));
        if (this.scent) {
          if (this.right.scent && this.left.scent) {
            this.scent_dist = Math.min(this.right.scent_dist + 1, this.left.scent_dist + 1);
          }
          else if (this.right.scent) {
            this.scent_dist = this.right.scent_dist + 1;
          }
          else if (this.left.scent) {
            this.scent_dist = this.left.scent_dist + 1;
          }
          else {
            this.scent = false;
          }
        }
      }
    }
  };

  Node.prototype.initObservers = function() {
    if (this.observer !== null) {
      this.observer.init();
    }
    if (this.right !== null) {
      this.right.initObservers();
    }
    if (this.left !== null) {
      this.left.initObservers();
    }
  };

  Node.prototype.signalReturn = function(_dir, _food) {
    if (_food) {
      for (var a=0; a<this.waiting_array.length; a++) {
        if (_dir) {
          this.waiting_array[a].right_count++;
        }
        else {
          this.waiting_array[a].left_count++;
        }
      }
    }
  };

  Node.prototype.addWatcher = function(_ant) {
    this.waiting_array.push(_ant);
  };

  Node.prototype.removeWatcher = function(_id) {
    var temp = -1;
    for (var i=this.waiting_array.length-1; i>=0; i--) {
      if (this.waiting_array[i].id == _id) {
          temp = i;
          break;
      }
    }
    if (temp >= 0)
      this.waiting_array.splice(temp, 1);
    else
      console.log('Error: removing ant from waiting list failed: ' + _id);
  };

  Node.prototype.init = function() {
    this.waiting_array = [];

    this.food = this.initial_food;
    this.decay = 0;
    this.pheromone = 0;
    this.scent = false;
    this.scent_dist = 0;
    this.ants = 0;

    if (this.right !== null) {
      this.right.init();
    }
    if (this.left !== null) {
      this.left.init();
    }
  };

  // ------------------ Return Class -------------------- //
  return Node;
}());
