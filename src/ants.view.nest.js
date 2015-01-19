/*
 * ants.view.nest.js
 * Nest view object
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent  : 2,     maxerr  : 50,
  newcap : true,  nomen   : true,  plusplus : true,
  regexp : true,  sloppy  : true,  vars : false,
  white  : true
*/
/*global $, Ants */

Ants.view.nest = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var params = null,
      consts = null,

      nest   = null;

  // ------------------ Private Functions -------------------- //

  // ------------------ Public Functions -------------------- //
  var config = function (_nest, _params, _consts) {
    params = _params;
    consts = _consts;
    nest   = _nest;
  };

  var init = function () {

  };

  var render = function(ctx) {
    ctx.fillStyle = '#863';
    ctx.beginPath();
    ctx.arc(consts.WIDTH/2, consts.HEIGHT/2, consts.NEST_RADIUS,
            0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px ariel';
    ctx.textBaseline = 'middle';
    ctx.fillText(Number(nest.getNum()) + nest.getQueued(),
                 consts.WIDTH/2 + consts.NEST_RADIUS + 10, consts.HEIGHT/2);
  };

  // ------------------ Return Public Interface -------------------- //
  return { config: config,
           init:   init,
           render: render };
}());
