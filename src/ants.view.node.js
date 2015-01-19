/*
 * ants.view.node.js
 * Node (tree branch) view class.  Use 'new' to instantiate a node view object.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.view.node = (function () {
  'use strict';

  // ------------------ Object Definition -------------------- //
  var NodeView = function (_parent, _node, _consts, _params, _icon) {
    this.consts = _consts;
    this.params = _params;

    this.id = _node.id;

    this.parent = _parent;
    this.node = _node;

    this.icon = _icon;

    this.right = null;
    this.left  = null;

    this.weight = 1;
    this.width = 2 * Math.PI;  // Proportion of the circumference

    this.x = this.consts.WIDTH/2;
    this.y = this.consts.HEIGHT/2;

    this.theta = 0;

    this.foodColor = '#3A5';

    this.text_x = this.x;
    this.text_y = this.y;
    this.observation_x1 = this.x;
    this.observation_y1 = this.y;
    this.observation_x2 = this.x;
    this.observation_y2 = this.y;

    this.out_parent_x = this.consts.WIDTH/2;
    this.out_parent_y = this.consts.HEIGHT/2;
    this.out_right_x = this.consts.WIDTH/2;
    this.out_right_y = this.consts.HEIGHT/2;
    this.out_left_x = this.consts.WIDTH/2;
    this.out_left_y = this.consts.HEIGHT/2;
    this.in_parent_x = this.consts.WIDTH/2;
    this.in_parent_y = this.consts.HEIGHT/2;
    this.in_right_x = this.consts.WIDTH/2;
    this.in_right_y = this.consts.HEIGHT/2;
    this.in_left_x = this.consts.WIDTH/2;
    this.in_left_y = this.consts.HEIGHT/2;
  };

  // ------------------ Private Variables -------------------- //

  // ------------------ Private Functions -------------------- //
  function sqr(x) { return x * x; }
  function dist2(_x1, _y1, _x2, _y2) { return sqr(_x1-_x2) + sqr(_y1-_y2); }

  // ------------------ Public Functions -------------------- //
  NodeView.prototype.contains = function(_x, _y)
  {
    return (Math.pow(this.x - _x, 2) + Math.pow(this.y - _y, 2) <=
      Math.pow(this.consts.NODE_RADIUS, 2));
  };

  NodeView.prototype.edgeContains = function(_x, _y)
  {
    var dist;
    // rule out the root
    if (this.parent !== null) {
      var l2 = dist2(this.x, this.y, this.parent.x, this.parent.y);
      if (l2 === 0) {
        dist = dist2(_x, _y, this.x, this.y);
      }
      else {
        var t = ((_x - this.x) * (this.parent.x - this.x) +
                 (_y - this.y) * (this.parent.y - this.y)) / l2;
        if (t < 0) dist = dist2(_x, _y, this.x, this.y);
        else if (t > 1) dist = dist2(_x, _y, this.parent.x, this.parent.y);
        else dist = dist2(_x, _y, this.x + t * (this.parent.x-this.x),
                          this.y + t * (this.parent.y-this.y));
      }
      return dist <= this.consts.BRANCH_RADIUS * this.consts.BRANCH_RADIUS;
    }
    return false;
  };

  NodeView.prototype.renderTree = function (ctx) {
    if (this.right !== null)
    {
      ctx.lineWidth = this.consts.BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(100, 80, 30)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.right.x, this.right.y);
      ctx.stroke();
      this.right.renderTree(ctx);
    }
    if (this.left !== null)
    {
      ctx.lineWidth = this.consts.BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(100, 80, 30)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.left.x, this.left.y);
      ctx.stroke();
      this.left.renderTree(ctx);
    }

    ctx.fillStyle = '#862';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.consts.NODE_DRAW_RADIUS, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  };

  NodeView.prototype.render = function (ctx) {
    // Draw pheromone trails
    if (this.params.PHEROMONE && this.node.pheromone > 0)
    {
      var scale = Math.log(this.node.pheromone) / Math.log(10);
      scale = Math.max(Math.min(scale, 3.5), 0.0) / 3.5;

      ctx.lineWidth = this.consts.BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(" + Math.floor(100+(scale*150)) +
                          ", " + Math.floor(80+(scale*120))  +
                          ", " + Math.floor(30+(scale*45)) + ")";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.parent.x, this.parent.y);
      ctx.stroke();
    }

    // Draw food scent trails
    if (!this.params.PHEROMONE && this.params.CAN_SMELL &&
        this.node.scent && this.parent !== null)
    {
      ctx.lineWidth = this.consts.BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(145, 160, 80)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.parent.x, this.parent.y);
      ctx.stroke();
    }

    // Draw food
    if (this.node.food > 0) {
      ctx.fillStyle = this.foodColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y,
              this.consts.NODE_DRAW_RADIUS +
                (this.node.food / (this.params.MAX_FOOD /
                                   this.consts.FOOD_DRAW_RADIUS)),
              0, Math.PI*2, true);
      ctx.closePath();
      ctx.fill();
    }

    // Show the number of ants on the current branch
    if (this.consts.SHOW_ANT_COUNT) {
      ctx.fillStyle = '#777';
      ctx.font = 'bold 14px ariel';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.node.ants, this.text_x, this.text_y);
    }

    if (this.consts.SHOW_BRANCH_DIRECTION) {
      ctx.fillStyle = '#777';
      ctx.font = 'bold 14px ariel';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.node.isRight ? 'R' : 'L', this.text_x, this.text_y);
    }

    // Draw an observation station
    if (this.node.observer !== null) {
      if (this.node.observer.id !== 0) {
        ctx.lineWidth = this.consts.BRANCH_WIDTH;
        ctx.strokeStyle = "rgb(63, 63, 255)";
        ctx.beginPath();
        ctx.moveTo(this.observation_x1, this.observation_y1);
        ctx.lineTo(this.observation_x2, this.observation_y2);
        ctx.stroke();

        // Draw eye icon and id
        ctx.drawImage(this.icon, this.observation_x1-8, this.observation_y1-8);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px ariel';
        ctx.textBaseline = 'middle';
        // place the id in the correct quadrant
        var width_correction =
          Math.floor(Math.log(this.node.observer.id)/Math.LN10) * 4;

        if (this.observation_x1 > this.observation_x2) {
          if (this.observation_y1 > this.observation_y2) {
            ctx.fillText(this.node.observer.id,
                         this.observation_x1+8-width_correction,
                         this.observation_y1+8);
          }
          else {
            ctx.fillText(this.node.observer.id,
                         this.observation_x1+8-width_correction,
                         this.observation_y1-8);
          }
        }
        else
        {
          if (this.observation_y1 > this.observation_y2) {
            ctx.fillText(this.node.observer.id,
                         this.observation_x1-12-width_correction,
                         this.observation_y1+8);
          }
          else {
            ctx.fillText(this.node.observer.id,
                         this.observation_x1-12-width_correction,
                         this.observation_y1-8);
          }
        }
      }
    }

    if (this.right !== null) {
      this.right.render(ctx);
    }
    if (this.left !== null) {
      this.left.render(ctx);
    }
  };

  NodeView.prototype.drawSelected = function(ctx)
  {
    ctx.fillStyle = "rgb(60, 160, 200)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.consts.NODE_RADIUS, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#862';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.consts.NODE_DRAW_RADIUS, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }

  NodeView.prototype.drawSelectedEdge = function(ctx)
  {
    ctx.lineWidth = this.consts.BRANCH_RADIUS;
    ctx.strokeStyle = "rgb(60, 160, 200)";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.parent.x, this.parent.y);
    ctx.stroke();

    ctx.lineWidth = this.consts.BRANCH_WIDTH;
    ctx.strokeStyle = "rgb(100, 80, 30)";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.parent.x, this.parent.y);
    ctx.stroke();
  }

  // ------------------ Return Class -------------------- //
  return NodeView;
}());
