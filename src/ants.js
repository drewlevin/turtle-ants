/*
 * ants.js
 * Root namespace module
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent  : 2,     maxerr   : 50,
  newcap : true,  nomen   : true,  plusplus : true,
  regexp : true,  sloppy  : true,  vars     : false,
  white  : true
*/
/*global $, Ants */

var Ants = (function () {
  'use strict';

  var
    $canvas = null,
    $start  = null,
    $reset  = null,
    $revert = null,
    $apply  = null,

    ctx = null,

    params = null,
    consts = null,

    model = null,
    view  = null,

    running = false;

  // ------------------ Private Functions -------------------- //

  // Request Animation Frame Shim
  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelRequestAnimationFrame = window[vendors[x] +
        'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
          },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
  }());

  function mouseMove (e) {
    view.mouseMove(e, ctx, running);
  }

  function mouseClick (e) {
    view.mouseClick(e);

    render(ctx);
  }

  function pause (e) {
    if (running) {
      running = false;
      $start.html("Start");
    } else {
      running = true;
      $start.html("Pause");
      update();
      render();
    }
  }

  function reset (e) {
    running = false;

    model.reset();

    init();
  }

  function revert (e) {
    Ants.params.setInputValues();
  }

  function apply (e) {
    Ants.params.getInputValues();
    reset(e);
  }

  function update () {
    var time;
    if (running) {
      if (model.update()) {
        setTimeout(update, 0);
      }
    }
  }

  function render () {
    if (running) {
      requestAnimationFrame(render);
    }
    view.render(ctx);
  }

  function init () {
    running = false;
    $start.html("Start");

    model.init();
    view.init();

    view.render(ctx);
  }

  // ------------------ Public Functions -------------------- //

  var config = function (_$canvas, _$start, _$reset, _$revert, _$apply) {
    // Configure
    $canvas = _$canvas;
    $start  = _$start;
    $reset  = _$reset;
    $revert = _$revert;
    $apply  = _$apply;

    Ants.consts.config($canvas.width(), $canvas.height());

    params = Ants.params.getParams();
    consts = Ants.consts.getConstants();

    Ants.report.config(params);

    model = Ants.model;
    view  = Ants.view;

    model.config(params, consts);
    view.config($canvas, model, params, consts);

    // Link Html
    ctx = $canvas[0].getContext("2d");

    $canvas.mousemove(function(e) {
      mouseMove(e);
    });
    $canvas.click(function(e) {
      mouseClick(e);
    });
    $start.click(function(e) {
      pause(e);
    });
    $reset.click(function(e) {
      reset(e);
    });
    $revert.click(function(e) {
      revert(e);
    });
    $apply.click(function(e) {
      apply(e);
    });

    $('#lgnd_environment').click(function() {
      $('#div_environment').stop().slideToggle(250);
    });

    $('#lgnd_ants').click(function() {
      $('#div_ants').stop().slideToggle(250);
    });

    $('#span_nestinteraction').click(function() {
      $('#div_nestinteraction').stop().slideToggle(250);
    });
    $('#span_pathinteraction').click(function() {
      $('#div_pathinteraction').stop().slideToggle(250);
    });
    $('#span_pheromone').click(function() {
      $('#div_pheromone').stop().slideToggle(250);
    });
    $('#span_initialpaths').click(function() {
      $('#div_rateeq').stop().slideToggle(250);
    });

    // Pheromone and Path Interaction are exclusive
    $('#in_pathinteraction').click(function() {
      if ($(this).is(':checked')) {
        $('#in_pheromone').attr('checked', false);
      }
    });
    $('#in_pheromone').click(function() {
      if ($(this).is(':checked')) {
        $('#in_pathinteraction').attr('checked', false);
      }
    });

    // Share path only works if remember food is checked
    $('#in_givepath').click(function() {
      if ($(this).is(':checked')) {
        $('#in_returntofood').attr('checked', true);
      }
    });
    $('#in_returntofood').click(function() {
      if (!$(this).is(':checked')) {
        $('#in_givepath').attr('checked', false);
      }
    });

    // Initialize
    Ants.params.setInputValues();
    Ants.tooltips.init();

    Ants.model.init();            // Make sure to init the model before the view
    Ants.view.init();

    Ants.view.render(ctx);
  };

  return { config: config };
}());
