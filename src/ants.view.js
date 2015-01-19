/*
 * ants.view.js
 * Root view module
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.view = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var
    consts = null,      // Get reference in config function
    params = null,      // Get reference in config function

    rootView = null,    // Get reference in config function (view)
    nodeViewObj = {},
    nestView = null,
    antsView = null,
    quadtree = null,

    hover_quad = null,
    hover_node = null,
    hover_edge = null,

    model = null,       // Get reference in config function (view)

    icon = null,

    staticCanvas = null,
    staticCtx    = null
  ;

  // ------------------ Private Functions -------------------- //
  function buildTreeView (nodeView) {
    var node = nodeView.node;

    // Branch
    if (node.right !== null) {
      nodeView.right =
        new Ants.view.node(nodeView, node.right, consts, params, icon);
      nodeViewObj[node.right.id] = nodeView.right;
      buildTreeView(nodeView.right);
      nodeView.weight += nodeView.right.weight;
    }
    if (node.left !== null) {
      nodeView.left =
        new Ants.view.node(nodeView, node.left, consts, params, icon);
      nodeViewObj[node.left.id] = nodeView.left;
      buildTreeView(nodeView.left);
      nodeView.weight += nodeView.left.weight;
    }

    // Leaf
    if (node.right === null && node.left === null) {
      nodeView.weight = 10;
    }
  }

  function positionTreeView (nodeView) {
    var
      node = nodeView.node,
      theta,
      skew,
      right_proportion,
      left_proportion,
      mid_x,
      mid_y
    ;

    nodeView.x = (consts.WIDTH / 2) +
                 (node.depth * consts.BRANCH_LENGTH) * Math.cos(nodeView.theta);
    nodeView.y = (consts.HEIGHT / 2) +
                 (node.depth * consts.BRANCH_LENGTH) * Math.sin(nodeView.theta);

    skew = consts.BRANCH_WIDTH / 2 + consts.ANT_RADIUS;

    // Branch right
    if (nodeView.right !== null) {

      right_proportion = 1;
      if (nodeView.left !== null) {
        right_proportion = nodeView.right.weight /
                           (nodeView.right.weight + nodeView.left.weight);
      }

      nodeView.right.theta = nodeView.theta -
                             nodeView.width * (1 - right_proportion) / 2;
      nodeView.right.width = nodeView.width * right_proportion;

      positionTreeView(nodeView.right);

      // Ignore the root for the parent positions
      if (nodeView.parent !== null) {
        theta = Math.atan2(nodeView.y - nodeView.parent.y,
                           nodeView.x - nodeView.parent.x) + Math.PI / 2;
        nodeView.out_parent_x = nodeView.x + skew * Math.cos(theta);
        nodeView.out_parent_y = nodeView.y + skew * Math.sin(theta);
        nodeView.in_parent_x = nodeView.x - skew * Math.cos(theta);
        nodeView.in_parent_y = nodeView.y - skew * Math.sin(theta);
      }

      theta = Math.atan2(nodeView.right.y - nodeView.y,
                         nodeView.right.x - nodeView.x) + Math.PI / 2;
      nodeView.out_right_x = nodeView.x + skew * Math.cos(theta);
      nodeView.out_right_y = nodeView.y + skew * Math.sin(theta);
      nodeView.in_right_x = nodeView.x - skew * Math.cos(theta);
      nodeView.in_right_y = nodeView.y - skew * Math.sin(theta);
    }

    // Branch left
    if (nodeView.left !== null) {

      left_proportion = 1;
      if (nodeView.right !== null) {
        left_proportion = nodeView.left.weight /
                          (nodeView.right.weight + nodeView.left.weight);
      }

      nodeView.left.theta = nodeView.theta +
                            nodeView.width * (1 - left_proportion) / 2;
      nodeView.left.width = nodeView.width * left_proportion;

      positionTreeView(nodeView.left);

      // Ignore the root for the parent positions
      if (nodeView.parent !== null) {
        theta = Math.atan2(nodeView.y - nodeView.parent.y,
                           nodeView.x - nodeView.parent.x) + Math.PI / 2;
        nodeView.out_parent_x = nodeView.x + skew * Math.cos(theta);
        nodeView.out_parent_y = nodeView.y + skew * Math.sin(theta);
        nodeView.in_parent_x = nodeView.x - skew * Math.cos(theta);
        nodeView.in_parent_y = nodeView.y - skew * Math.sin(theta);
      }

      theta = Math.atan2(nodeView.left.y - nodeView.y,
                         nodeView.left.x - nodeView.x) + Math.PI / 2;
      nodeView.out_left_x = nodeView.x + skew * Math.cos(theta);
      nodeView.out_left_y = nodeView.y + skew * Math.sin(theta);
      nodeView.in_left_x = nodeView.x - skew * Math.cos(theta);
      nodeView.in_left_y = nodeView.y - skew * Math.sin(theta);
    }

    // Leaf
    if (nodeView.right === null &&
        nodeView.left === null &&
        nodeView.parent !== null) {
      theta = Math.atan2(nodeView.y - nodeView.parent.y,
                         nodeView.x - nodeView.parent.x) + Math.PI / 2;
      nodeView.out_parent_x = nodeView.x + skew * Math.cos(theta);
      nodeView.out_parent_y = nodeView.y + skew * Math.sin(theta);
      nodeView.in_parent_x = nodeView.x - skew * Math.cos(theta);
      nodeView.in_parent_y = nodeView.y - skew * Math.sin(theta);
    }

    if (nodeView.parent !== null) {
      theta = Math.atan2(nodeView.y - nodeView.parent.y,
                         nodeView.x - nodeView.parent.x) + Math.PI / 2;
      if (nodeView.node.isRight) {
        nodeView.text_x = (nodeView.x + nodeView.parent.x) / 2 -
                          (3 * skew * Math.cos(theta));
        nodeView.text_y = (nodeView.y + nodeView.parent.y) / 2 -
                          (3 * skew * Math.sin(theta));
      } else {
        nodeView.text_x = (nodeView.x + nodeView.parent.x) / 2 +
                          (2 * skew * Math.cos(theta));
        nodeView.text_y = (nodeView.y + nodeView.parent.y) / 2 +
                          (2 * skew * Math.sin(theta));
      }

      mid_x = (nodeView.parent.x + nodeView.x) / 2.0;
      mid_y = (nodeView.parent.y + nodeView.y) / 2.0;

      nodeView.observation_x1 = mid_x +
        (consts.OBSERVATION_LENGTH / 2.0) * Math.cos(theta);
      nodeView.observation_y1 = mid_y +
        (consts.OBSERVATION_LENGTH / 2.0) * Math.sin(theta);
      nodeView.observation_x2 = mid_x -
        (consts.OBSERVATION_LENGTH / 2.0) * Math.cos(theta);
      nodeView.observation_y2 = mid_y -
        (consts.OBSERVATION_LENGTH / 2.0) * Math.sin(theta);
    }

    quadtree.addNode(nodeView);
    quadtree.addEdge(nodeView);
  }

  // ------------------ Public Functions -------------------- //
  var config = function ($canvas, _model, _params, _consts) {

    consts = _consts;
    params = _params;
    model = _model;

    nestView = Ants.view.nest;
    antsView = Ants.view.ants;

    icon = new Image();
    icon.src = 'img/eye.png';

    nestView.config(model.getNest(), params, consts);
    antsView.config(model, params, consts);
  };

  var init = function () {
    nodeViewObj = {};

    rootView = new Ants.view.node(null, model.getRoot(), consts, params, icon);
    nodeViewObj[rootView.id] = rootView;

    quadtree = new Ants.model.quad(0, 0, consts.WIDTH, consts.HEIGHT, consts);

    window.quadtree = quadtree;

    buildTreeView(rootView);
    positionTreeView(rootView);

    staticCanvas = document.createElement('canvas');
    staticCanvas.width = consts.WIDTH;
    staticCanvas.height = consts.HEIGHT;
    staticCtx = staticCanvas.getContext('2d');

    rootView.renderTree(staticCtx);
    if (consts.DRAW_QUAD) {
      quadtree.renderQuad(staticCtx);
    }
  };

  var reset = function () {
    // Reset shouldn't call init automatically
    rootView = null;
  };

  var render = function (ctx) {

    // Redraw entire canvas, starting with the static elements
    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, consts.WIDTH, consts.HEIGHT);
    ctx.drawImage(staticCanvas, 0, 0);

    // Time and run values
    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px courier';
    ctx.fillText('Time: ' + Math.floor(model.getTime() / 1), 10, 20);
    ctx.fillText('Run: ' + Number(Math.min(params.NUM_RUNS,
                                           model.getTotalRuns() + 1)),
                 620, 20);

    // Render dynamic branch displays
    rootView.render(ctx);

    if (consts.DRAW_QUAD && hover_quad !== null)
      hover_quad.render(ctx);
    if (hover_node !== null)
      hover_node.drawSelected(ctx);
    else if (hover_edge !== null)
      hover_edge.drawSelectedEdge(ctx);

    antsView.render(ctx);
    nestView.render(ctx);
  };

  var getNodeView = function (id) {
    return nodeViewObj[id];
  }

  var mouseMove = function (e, ctx, running) {
    var off = $("#canvas").offset();
    var x = e.pageX - off.left;
    var y = e.pageY - off.top;

    if (consts.DRAW_QUAD) {
      hover_quad = quadtree.getQuad(x, y);
    }
    hover_node = quadtree.getNode(x, y);
    hover_edge = quadtree.getEdge(x, y);

    if (!running) {
      render(ctx);
    }
  };

  var mouseClick = function (e) {
    if (hover_edge !== null) {
      if (hover_edge.node.observer.id === 0) {
        model.addObserver(hover_edge.node.observer);
      } else {
        model.removeObserver(hover_edge.node.observer);
      }
    }
  };


  return { config: config,
           init:        init,
           reset:       reset,
           render:      render,
           getNodeView: getNodeView,
           mouseMove:   mouseMove,
           mouseClick:  mouseClick };
}());
