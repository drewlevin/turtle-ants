/*
 * ants.model.nest.js
 * Nest model object
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.model.nest = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var
    ant_index   = 1,

    num_ants    = 0,
    num_scouts  = 0,

    queued_ants = [],

    root        = null,
    params      = null;

  // ------------------ Private Functions -------------------- //
  function shuffle (o) {
      for(var j, x, i = o.length;
          i;
          j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  }

  function queue (_ant) {
    queued_ants.push(_ant);
    num_ants--;
  }

  // ------------------ Public Functions -------------------- //
  var config = function (_params) {
    params = _params;
  }

  var init = function (_root) {
    root = _root;

    num_ants = params.NEST_ANTS;
    num_scouts = params.SEARCHING;

    queued_ants = [];
  };

  var update = function() {
    var i,        // Loop index
        new_ant = null;  // Ant to add to the tree_ant list


    // First priority - clear the initial scout population
    while (num_scouts > 0 || (!params.NEST_INTERACTION && num_ants > 0)) {
      queue(new Ants.model.ant(ant_index, null, root, params));
      ant_index++;
      num_scouts--;
    }

    // Second priority - send out ants randomly based on the nest time parameter
    if (num_ants > 0) {
      var expected = (1.0 / params.NEST_TIME) * num_ants;
      var definite = Math.floor(expected);
      var extra = expected - definite;
      var leaving = definite + (Math.random() < extra ? 1 : 0);
      for (i=0; i < leaving && num_ants > 0; i++) {
        queue(new Ants.model.ant(ant_index, null, root, params));
        ant_index++;
      }
    }

    // Send out a max of one ant per timestep to help stagger them
    if (queued_ants.length > 0) {
      new_ant = queued_ants.shift();
    }
    return new_ant;
  };

  var recruit = function(_ant) {
    var num_recruited = 0;
    for (i=num_ants; i>0; i--) {
      num_recruited += Math.random() < params.RECRUIT_PROB ? 1 : 0;
    }
    if (params.GIVE_PATH) {
      for (i=num_recruited; i>0; i--) {
        queue(new Ants.model.ant(ant_index, _ant.dest, root, params));
        ant_index++;
      }
    }
    else {
      for (i=num_recruited; i>0; i--) {
        queue(new Ants.model.ant(ant_index, null, root, params));
        ant_index++;
      }
    }
  };

  var returnHome = function() {
    num_ants++;
  };

  var getNum = function() {
    return num_ants;
  };

  var getQueued = function () {
    return queued_ants.length;
  };

  // ------------------ Return Public Interface -------------------- //
  return { config:     config,
           init:       init,
           update:     update,
           recruit:    recruit,
           returnHome: returnHome,
           getNum:     getNum,
           getQueued:  getQueued };
}());
