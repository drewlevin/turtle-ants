/*
 * ants.model.quad.js
 * Quad tree model class.  Use 'new' to instantiate a quad object.
 * Used to optimize mouse-over collision detection.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/
/*global $, Ants */

Ants.model.quad = (function () {
  'use strict';

  // ------------------ Private Functions -------------------- //

  // Finds handedness of a triangle, helper for line segment intersection
  function checkTriDir(_x1, _y1, _x2, _y2, _x3, _y3)
  {
    var dir = (((_x2 - _x1)*(_y3 - _y1)) - ((_x3 - _x1)*(_y2 - _y1)));
    return dir > 0 ? 1 : (dir < 0 ? -1 : 0);
  }

  // checks to see if two line segments 1-2 and 3-4 intersect
  function checkLineIntersect(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4)
  {
    if (checkTriDir(_x1, _y1, _x2, _y2, _x3, _y3) !==
        checkTriDir(_x1, _y1, _x2, _y2, _x4, _y4)) {
      if (checkTriDir(_x3, _y3, _x4, _y4, _x1, _y1) !==
          checkTriDir(_x3, _y3, _x4, _y4, _x2, _y2)) {
        return true;
      }
    }
    return false;
  }

  // ------------------ Class Definition -------------------- //
  var Quad = function (_x, _y, _w, _h, _consts) {

    this.consts = _consts;

    this.nodes = [];
    this.edges = [];
    this.children = null;

    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
  };

  Quad.prototype.getChildren = function() {
    return this.children;
  };

  Quad.prototype.containsNode = function(_node)
  {
    return (_node.x+this.consts.NODE_RADIUS > this.x          &&
            _node.x-this.consts.NODE_RADIUS < this.x + this.w &&
            _node.y+this.consts.NODE_RADIUS > this.y          &&
            _node.y-this.consts.NODE_RADIUS < this.y + this.h);
  };

  Quad.prototype.containsEdge = function(_edge) {
    // rule out the root
    if (_edge.parent !== null) {
      // check for completely inside box
      if (_edge.x > this.x && _edge.x < this.x+this.w &&
          _edge.y > this.y && _edge.y < this.y+this.h &&
          _edge.parent.x > this.x && _edge.parent.x < this.x+this.w &&
          _edge.parent.y > this.y && _edge.parent.y < this.y+this.h) {
        return true;
      }
      // check for box intersection, one border at a time
      // left edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             this.x, this.y, this.x, this.y+this.h))
        return true;
      // top edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             this.x, this.y, this.x+this.w, this.y))
        return true;
      // right edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             this.x+this.w,this.y,this.x+this.w,this.y+this.h))
        return true;
      // bottom edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             this.x,this.y+this.h,this.x+this.w,this.y+this.h))
        return true;
    }
  };

  Quad.prototype.containsPoint = function(_x, _y)
  {
    return (_x > this.x && _x < this.x+this.w &&
            _y > this.y && _y < this.y+this.h);
  };

  Quad.prototype.addNode = function(_node)
  {
    // Leaf quad, add a new node
    if (this.children === null &&
        this.nodes.length + this.edges.length < this.consts.QUAD_LIMIT) {
      this.nodes.push(_node);
    }
    // Expand leaf quad to branching quad
    else if (this.children === null && this.w > 1)
    {
      this.nodes.push(_node);
      this.children =
        [new Quad(this.x, this.y, this.w/2, this.h/2, this.consts),
         new Quad(this.x+this.w/2, this.y, this.w/2, this.h/2, this.consts),
         new Quad(this.x, this.y+this.h/2, this.w/2, this.h/2, this.consts),
         new Quad(this.x+this.w/2, this.y+this.h/2,
                  this.w/2, this.h/2, this.consts)
        ];

      for (var n in this.nodes) {
        for (var q in this.children) {
          if (this.children[q].containsNode(this.nodes[n])) {
            this.children[q].addNode(this.nodes[n]);
          }
        }
      }
      for (var e in this.edges) {
        for (var q in this.children) {
          if (this.children[q].containsEdge(this.edges[e])) {
            this.children[q].addEdge(this.edges[e]);
          }
        }
      }
      this.nodes = [];
      this.edges = [];
    }
    // Branching quad, keep drilling down
    else
    {
      for (var q in this.children) {
        if (this.children[q].containsNode(_node)) {
          this.children[q].addNode(_node);
        }
      }
    }
  };

  Quad.prototype.addEdge = function(_edge)
  {
    // Leaf quad, add a new node
    if ((this.children === null &&
         this.nodes.length + this.edges.length < this.consts.QUAD_LIMIT) ||
        this.w === 1) {
      this.edges.push(_edge);
    }
    // Expand leaf quad to branching quad
    else if (this.children === null)
    {
      this.edges.push(_edge);
      this.children =
        [new Quad(this.x, this.y, this.w/2, this.h/2, this.consts),
         new Quad(this.x+this.w/2, this.y, this.w/2, this.h/2, this.consts),
         new Quad(this.x, this.y+this.h/2, this.w/2, this.h/2, this.consts),
         new Quad(this.x+this.w/2, this.y+this.h/2,
                  this.w/2, this.h/2, this.consts)
        ];

      for (var n in this.nodes) {
        for (var q in this.children) {
          if (this.children[q].containsNode(this.nodes[n])) {
            this.children[q].addNode(this.nodes[n]);
          }
        }
      }
      for (var e in this.edges) {
        for (var q in this.children) {
          if (this.children[q].containsEdge(this.edges[e])) {
            this.children[q].addEdge(this.edges[e]);
          }
        }
      }
      this.nodes = [];
      this.edges = [];
    }
    // Branching quad, keep drilling down
    else
    {
      for (var q in this.children) {
        if (this.children[q].containsEdge(_edge)) {
          this.children[q].addEdge(_edge);
        }
      }
    }
  };

  Quad.prototype.getNode = function(_x, _y)
  {
    if (this.children === null)
    {
      for (var n in this.nodes) {
        if (this.nodes[n].contains(_x, _y)) {
          return this.nodes[n];
        }
      }
      return null;
    }
    else {
      for (var q in this.children) {
        if (this.children[q].containsPoint(_x, _y)) {
          return this.children[q].getNode(_x, _y);
        }
      }
      return null;
    }
  };

  Quad.prototype.getEdge = function(_x, _y)
  {
    if (this.children === null)
    {
      for (var e in this.edges) {
        if (this.edges[e].edgeContains(_x, _y)) {
          return this.edges[e];
        }
      }
      return null;
    }
    else {
      for (var q in this.children) {
        if (this.children[q].containsPoint(_x, _y)) {
          return this.children[q].getEdge(_x, _y);
        }
      }
      return null;
    }
  };

  Quad.prototype.getQuad = function(_x, _y)
  {
    if (this.children === null) {
      return this;
    }
    else {
      for (var q in this.children) {
        if (this.children[q].containsPoint(_x, _y)) {
          return this.children[q].getQuad(_x, _y);
        }
      }
      return null;
    }
  };

  Quad.prototype.renderQuad = function (ctx) {
    if (this.children === null) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.w, this.h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.0)";;
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
    else {
      for (var q in this.children) {
        this.children[q].renderQuad(ctx);
      }
    }
  };

  // Highlight the active quad (disabled)
  Quad.prototype.render = function (ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(127, 127, 0, 1.0)";
    ctx.stroke();
  };

// ------------------ Return Class -------------------- //
  return Quad;
}());
