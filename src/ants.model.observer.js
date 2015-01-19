/*
 * ants.model.observer.js
 * Observer model class.  Use 'new' to instantiate a new observer.
 * Requires a unique id. Used to track the number of ants moving both towards
 * and away from the nest over a specific branch.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.model.observer = (function () {
  'use strict';

  // ------------------ Static Variables -------------------- //
  var
    params = null,
    consts = null,

    observer_id = 0,            // tracks available id values
    completed_runs = 0,

    observer_array = [],        // holds references to tracked observers
    observer_collection = []    // holds copies of observers from previous runs
  ;

  // ------------------ Static  Functions -------------------- //
  var config = function(_params, _consts) {
    params = _params;
    consts = _consts;
  };

  var init = function() {
    observer_id = 0;
    completed_runs = 0;

    observer_array = [];
    observer_collection = [];
  };

  var addObserver = function (_observer) {
    _observer.id = ++observer_id;

    observer_array.push(_observer);
  };

  var removeObserver = function (_observer) {
    var
      o = 0,
      index = 0,
      removed_observer = null
    ;

    for (o in observer_array) {
      if (_observer.id === observer_array[o].id) {
        index = o;
        break;
      }
    }

    removed_observer = observer_array.splice(index, 1);
    removed_observer[0].id = 0;
  };

  var storeRun = function () {
    var collection = [];
    var i;

    for (i=0; i<observer_array.length; i++) {
      var observer = {};
      var incoming = [];
      var outgoing = [];

      observer.id = observer_array[i].id;

      for (var j = 0; j < params.NUM_OBSERVATIONS; j++) {
        incoming.push(
          observer_array[i].getIncomingCount(
            params.OBSERVATION_RATE * (j + 1),
            params.OBSERVATION_RATE * (j + 1) + params.OBSERVATION_TIME
        ));
        outgoing.push(
          observer_array[i].getOutgoingCount(
            params.OBSERVATION_RATE * (j + 1),
            params.OBSERVATION_RATE * (j + 1) + params.OBSERVATION_TIME
        ));
      }
      observer.incoming = incoming;
      observer.outgoing = outgoing;

      collection.push(observer);
    }
    observer_collection.push(collection);
  };

  var getCollection = function () {
    return observer_collection;
  };

  // ------------------ Class Definition -------------------- //
  var Observer = function () {
    this.id = 0

    this.outgoing_bin = 0;
    this.incoming_bin = 0;

    this.outgoing_length = 0;
    this.incoming_length = 0;

    this.outgoing = [];
    this.incoming = [];
    this.outgoing_total = [];
    this.incoming_total = [];
  };

  // ------------------ Public Functions -------------------- //
  Observer.prototype.init = function() {
    this.outgoing_bin = 0;
    this.incoming_bin = 0;

    this.outgoing_length = 0;
    this.incoming_length = 0;

    this.outgoing = [];
    this.incoming = [];
    this.outgoing_total = [];
    this.incoming_total = [];
  };

  Observer.prototype.update = function (_time) {
    // Update the arrays every BIN_SIZE seconds
    if (_time % consts.BIN_SIZE === 0) {
      var
        outgoing_point = [_time, this.outgoing_bin],
        incoming_point = [_time, this.incoming_bin],

        outgoing_total_point = this.outgoing_length === 0 ?
          [_time, this.outgoing_bin] :
          [_time, this.outgoing_total[this.outgoing_length-1][1] + this.outgoing_bin],
        incoming_total_point = this.incoming_length === 0 ?
          [_time, this.incoming_bin] :
          [_time, this.incoming_total[this.incoming_length-1][1] + this.incoming_bin]
      ;

      this.outgoing.push(outgoing_point);
      this.outgoing_length++;

      this.incoming.push(incoming_point);
      this.incoming_length++;

      this.outgoing_total.push(outgoing_total_point);
      this.incoming_total.push(incoming_total_point);

      this.outgoing_bin = 0;
      this.incoming_bin = 0;
    }
  };

  Observer.prototype.addOutgoing = function() {
    this.outgoing_bin++;
  };

  Observer.prototype.addIncoming = function() {
    this.incoming_bin++;
  };

  Observer.prototype.getOutgoingCount = function(_start, _stop) {
    var
      start_index = Math.floor(_start / consts.BIN_SIZE)-1,
      stop_index = Math.floor(_stop / consts.BIN_SIZE)-1,
      acc = 0,
      i
    ;
    // Bounds check
    if (_start < consts.BIN_SIZE || stop_index >= this.outgoing_length) {
      return 0;
    }

    for (i=start_index; i<stop_index; i++) {
      acc += this.outgoing[i][1];
    }
    return acc;
  };

  Observer.prototype.getIncomingCount = function(_start, _stop) {
    var
      start_index = Math.floor(_start / consts.BIN_SIZE)-1,
      stop_index = Math.floor(_stop / consts.BIN_SIZE)-1,
      acc = 0,
      i
    ;
    // Bounds check
    if (_start < consts.BIN_SIZE || stop_index >= this.incoming_length) {
      return 0;
    }

    for (i=start_index; i<stop_index; i++) {
      acc += this.incoming[i][1];
    }
    return acc;
  };

  // ----------- Return Static Functions and Class Definition ------------- //
  return {
    Observer       : Observer,
    config         : config,
    init           : init,
    addObserver    : addObserver,
    removeObserver : removeObserver,
    storeRun       : storeRun,
    getCollection  : getCollection
  };
}());
