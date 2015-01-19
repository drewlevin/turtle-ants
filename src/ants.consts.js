/*
 * ants.consts.js
 * Constant values.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.consts = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  // Graphic constants
  var constants = {

    WIDTH:  0,
    HEIGHT: 0,

    NODE_RADIUS: 7,
    BRANCH_RADIUS: 7,
    ANT_RADIUS: 2,
    BRANCH_WIDTH: 3,
    BRANCH_LENGTH: 35,
    NODE_DRAW_RADIUS: 4,
    NEST_RADIUS: 8,
    FOOD_DRAW_RADIUS: 3,
    OBSERVATION_LENGTH: 20,

    QUAD_LIMIT: 4,
    DRAW_QUAD: false,

    SHOW_ANT_COUNT: false,
    SHOW_BRANCH_DIRECTION : false,

    BIN_SIZE: 10,

    PLOT_OPTIONS: {
      xaxis: {
        tickSize: 100
      },
      yaxis: {
        min: 0
      },
      selection: {
        mode: "x"
      },
      legend: {
        position: "nw"
      }
    }
  };

  // ------------------ Private Functions -------------------- //

  // ------------------ Public Functions -------------------- //
  var config = function (_width, _height) {
    constants.WIDTH  = _width;
    constants.HEIGHT = _height;
  };

  var get = function (_param) {
    return constants._param;
  };

  var getConstants = function () {
    return constants;
  };

  return { config:       config,
           get:          get,
           getConstants: getConstants };
}());
