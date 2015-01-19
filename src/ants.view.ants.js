/*
 * ants.view.ants.js
 * Ant view module.  Singleton object renders all Ants.model.ant objects.
 * Requires an array of all ant model objects.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.view.ants = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var
    params = null,
    consts = null,
    model  = null,

    baseColor = '#333',
    foodColor = '#3A5',
    failColor = '#D33'
  ;

  // ------------------ Private Functions -------------------- //

  function getNodeView (id) {
    return Ants.view.getNodeView(id);
  }

  function getPosition (ant)
  {
    var
      x, y,
      originView = getNodeView(ant.origin.id),
      destView   = getNodeView(ant.dest.id)
    ;

    // If moving outward
    if (!ant.returning) {
      if (ant.dest.isRight) {
        x = originView.out_right_x + ant.dist * (destView.out_parent_x - originView.out_right_x);
        y = originView.out_right_y + ant.dist * (destView.out_parent_y - originView.out_right_y);
      } else {
        x = originView.out_left_x + ant.dist * (destView.out_parent_x - originView.out_left_x);
        y = originView.out_left_y + ant.dist * (destView.out_parent_y - originView.out_left_y);
      }

    }
    // If moving home
    else {
      if (ant.origin.isRight) {
        x = originView.in_parent_x + ant.dist * (destView.in_right_x - originView.in_parent_x);
        y = originView.in_parent_y + ant.dist * (destView.in_right_y - originView.in_parent_y);
      } else {
        x = originView.in_parent_x + ant.dist * (destView.in_left_x - originView.in_parent_x);
        y = originView.in_parent_y + ant.dist * (destView.in_left_y - originView.in_parent_y);
      }
    }

    return [x, y];
  }

  function renderAnt (ctx, ant) {

    var xy = getPosition(ant);

    ctx.fillStyle = ant.found_food ? foodColor : baseColor;
    ctx.beginPath();
    ctx.arc(xy[0], xy[1], consts.ANT_RADIUS, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }

  // ------------------ Public Functions -------------------- //
  var config = function (_model, _params, _consts) {
    params = _params;
    consts = _consts;
    model  = _model;
  };

  var init = function () {

  };

  var render = function (ctx, antList) {
    var
      i,
      ant_list = model.getAnts()
    ;

    for (i=ant_list.length-1; i>=0; i--) {
      renderAnt(ctx, ant_list[i]);
    }
  };

  // ------------------ Return Class -------------------- //
  return { config: config,
           init:   init,
           render: render };
}());
