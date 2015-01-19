/*
 * ants.model.js
 * Root model module
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.model = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var
    params = null,  // Get reference in config function
    consts = null,

    time = 0,

    root = null,
    nest = null,

    observers = null,

    food_nodes = [],
    ant_list = [],

    total_runs = 0,

    node_id = 1,

    // External variables
    food_accumulator = 0,
    cluster_size = 0
  ;


  // ------------------ Private Functions -------------------- //
  function buildTree (node, depth) {
    if (node.parent !== null) {
      node.observer = new observers.Observer();
    }
    // Double branch
    if (depth > params.DEPTH - params.FULL_TREE_DEPTH) {
      node.right = new Ants.model.node(node_id++, node, node.depth + 1, true, params);
      node.left = new Ants.model.node(node_id++, node, node.depth + 1, false, params);

      buildTree(node.right, depth - 1);
      buildTree(node.left, depth - 1);
    }
    // Single or double branch
    else if (depth > 0) {

      // right child
      if (Math.random() < params.CHILD_PROB) {
        node.right = new Ants.model.node(node_id++, node, node.depth + 1, true, params);
        buildTree(node.right, depth - 1);
      }
      // left child
      if (Math.random() < params.CHILD_PROB) {
        node.left = new Ants.model.node(node_id++, node, node.depth + 1, false, params);
        buildTree(node.left, depth - 1);
      }
    }
    // Leaf
    if (node.right === null && node.left === null) {
      food_accumulator += Number(params.FOOD_PROB);

      //    if (Math.random() < FOOD_PROB) {
      if ((!params.CLUSTERED && food_accumulator >= 1 ) ||
          (params.CLUSTERED && cluster_size > 0)) {

        food_accumulator -= 1.0;
        cluster_size--;

        node.food = params.MAX_FOOD;
        node.initial_food = params.MAX_FOOD;

        food_nodes.push(node);
      }
    }
  }

  // Used to reset when performing multiple runs at once
  function reset_run() {
    var continue_updating = true;

    observers.storeRun();

    total_runs++;

    // If the model is done, generate the report and stop.
    if (total_runs >= params.NUM_RUNS) {
      Ants.report.generate(observers.getCollection());
      continue_updating = false;
    }
    // Otherwise, reset for another model run and continue.
    else {
      ant_list = [];
      food_nodes = [];

      Math.seedrandom(params.TREE_SEED);

      node_id = 1;

      root.init();

      Ants.params.incrementSeed(total_runs);

      Math.seedrandom(params.ANT_SEED);

      nest.init(root);

      time = 0;
    }

    return continue_updating;
  }

  // ------------------ Public Functions -------------------- //
  var config = function (_params, _consts) {
    params = _params;
    consts = _consts;

    nest = Ants.model.nest;
    nest.config(params);

    observers = Ants.model.observer;
    observers.config(params, consts);
  };

  var init = function () {

    observers.init();

    Math.seedrandom(params.TREE_SEED);

    time = 0;

    node_id = 1;

    root = new Ants.model.node(node_id++, null, 0, true, params);

    buildTree(root, params.DEPTH);

    Math.seedrandom(params.ANT_SEED);

    nest.init(root);
  };

  var update = function () {
    var a, new_ant;

    time++;

    // Release a new ants if one is waiting
    new_ant = nest.update();
    if (new_ant !== null) {
      ant_list.push(new_ant);
    }

    // Update the tree
    root.update(time);

    // Update the individual ants
    for (a = ant_list.length-1; a >= 0; a--) {
      if (!ant_list[a].update().is_recirculating) {
        ant_list.splice(a, 1);
      }
    }

    // Check to see if the model should continue, reset, or stop.
    // Return true to continue
    if (params.SAVE_REPORT && params.NUM_OBSERVATIONS > 0 &&
        time >= params.NUM_OBSERVATIONS *
                params.OBSERVATION_RATE + params.OBSERVATION_TIME) {
      return reset_run();
    }

    // Otherwise, continue updating normally
    return true;
  };

  var reset = function () {
    food_nodes = [];
    ant_list = [];

    total_runs = 0;

    init();
  };

  var getRoot = function () {
    return root;
  };

  var getNest = function () {
    return nest;
  };

  var getAnts = function () {
    return ant_list;
  };

  var getTime = function () {
    return time;
  };

  var getTotalRuns = function () {
    return total_runs;
  };

  var addObserver = function (_observer) {
    var id;
    if (_observer.id === 0) {
      // Add the observer to the observer array and get its new id
      observers.addObserver(_observer);
    }
  };

  var removeObserver = function (_observer) {
    if (_observer.id !== 0) {
      observers.removeObserver(_observer);
    }
  };

  return { config:         config,
           init:           init,
           update:         update,
           reset:          reset,
           getRoot:        getRoot,
           getNest:        getNest,
           getAnts:        getAnts,
           getTime:        getTime,
           getTotalRuns:   getTotalRuns,
           addObserver:    addObserver,
           removeObserver: removeObserver };
}());
