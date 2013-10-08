// Finds handedness of a triangle, helper for line segment intersection
function checkTriDir(_x1, _y1, _x2, _y2, _x3, _y3)
{
  var dir = (((_x2 - _x1)*(_y3 - _y1)) - ((_x3 - _x1)*(_y2 - _y1)));
  return dir > 0 ? 1 : (dir < 0 ? -1 : 0);
}

// checks to see if two line segments 1-2 and 3-4 intersect
function checkLineIntersect(_x1, _y1, _x2, _y2, _x3, _y3, _x4, _y4)
{
  if (checkTriDir(_x1, _y1, _x2, _y2, _x3, _y3) != checkTriDir(_x1, _y1, _x2, _y2, _x4, _y4)) {
    if (checkTriDir(_x3, _y3, _x4, _y4, _x1, _y1) != checkTriDir(_x3, _y3, _x4, _y4, _x2, _y2)) {
      return true;
    }
  }
  return false;
}

function Quad(_x, _y, _w, _h)
{
  var nodes = [];
  var edges = [];
  var children = null;
  
  var x = _x;
  var y = _y;
  var w = _w;
  var h = _h;
  
  this.getChildren = function() {
    return children;
  }
  
  this.containsNode = function(_node)
  {
    return (_node.x+NODE_RADIUS > x && _node.x-NODE_RADIUS < x+w &&
            _node.y+NODE_RADIUS > y && _node.y-NODE_RADIUS < y+h);
  }
  /*
bool LineIntersectsRect( const Vector2f &v1, const Vector2f &v2, const Rect &r )
{
        Vector2f lowerLeft( r.x, r.y+r.height );
        Vector2f upperRight( r.x+r.width, r.y );
        Vector2f upperLeft( r.x, r.y );
        Vector2f lowerRight( r.x+r.width, r.y+r.height);
        // check if it is inside
        if (v1.x > lowerLeft.x && v1.x < upperRight.x && v1.y < lowerLeft.y && v1.y > upperRight.y &&
            v2.x > lowerLeft.x && v2.x < upperRight.x && v2.y < lowerLeft.y && v2.y > upperRight.y )
        {   
            return true;
        }
        // check each line for intersection
        if (LineIntersectLine(v1,v2, upperLeft, lowerLeft ) ) return true;
        if (LineIntersectLine(v1,v2, lowerLeft, lowerRight) ) return true;
        if (LineIntersectLine(v1,v2, upperLeft, upperRight) ) return true;
        if (LineIntersectLine(v1,v2, upperRight, lowerRight) ) return true;
        return false;
}
*/
  this.containsEdge = function(_edge) {
    // rule out the root
    if (_edge.parent != null) {
      // check for completely inside box
      if (_edge.x > x && _edge.x < x+w && _edge.y > y && _edge.y < y+h &&
          _edge.parent.x > x && _edge.parent.x < x+w && _edge.parent.y > y && _edge.parent.y < y+h) {
        return true;
      }
      // check for box intersection, one border at a time
      // left edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             x, y, x, y+h)) 
        return true;
      // top edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             x, y, x+w, y)) 
        return true;
      // right edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             x+w, y, x+w, y+h)) 
        return true;
      // bottom edge
      if (checkLineIntersect(_edge.x, _edge.y, _edge.parent.x, _edge.parent.y,
                             x, y+h, x+w, y+h)) 
        return true;
    }
    return false;
  }

  this.containsPoint = function(_x, _y)
  {
    return (_x > x && _x < x+w && _y > y && _y < y+h);
  }
  
  this.addNode = function(_node)
  {
    // Leaf quad, add a new node
    if (children == null && nodes.length + edges.length < QUAD_LIMIT) {
      nodes.push(_node);
    } 
    // Expand leaf quad to branching quad
    else if (children == null && w > 1) 
    {
      nodes.push(_node);
      children = [new Quad(x, y, w/2, h/2),
                  new Quad(x+w/2, y, w/2, h/2),
                  new Quad(x, y+h/2, w/2, h/2),
                  new Quad(x+w/2, y+h/2, w/2, h/2)];

      for (var n in nodes) {
        for (var q in children) {
          if (children[q].containsNode(nodes[n])) {
            children[q].addNode(nodes[n]);
          }
        }
      } 
      for (var e in edges) {
        for (var q in children) {
          if (children[q].containsEdge(edges[e])) {
            children[q].addEdge(edges[e]);
          }
        }
      } 
      nodes = [];
      edges = [];
    } 
    // Branching quad, keep drilling down
    else 
    {
      for (var q in children) {
        if (children[q].containsNode(_node)) {
          children[q].addNode(_node);
        }
      }
    } 
  }
  
  this.addEdge = function(_edge)
  {
    // Leaf quad, add a new node
    if ((children == null && nodes.length + edges.length < QUAD_LIMIT) || w == 1) {
      edges.push(_edge);
    } 
    // Expand leaf quad to branching quad
    else if (children == null) 
    {
      edges.push(_edge);
      children = [new Quad(x, y, w/2, h/2),
                  new Quad(x+w/2, y, w/2, h/2),
                  new Quad(x, y+h/2, w/2, h/2),
                  new Quad(x+w/2, y+h/2, w/2, h/2)];

      for (var n in nodes) {
        for (var q in children) {
          if (children[q].containsNode(nodes[n])) {
            children[q].addNode(nodes[n]);
          }
        }
      } 
      for (var e in edges) {
        for (var q in children) {
          if (children[q].containsEdge(edges[e])) {
            children[q].addEdge(edges[e]);
          }
        }
      } 
      nodes = [];
      edges = [];
    } 
    // Branching quad, keep drilling down
    else 
    {
      for (var q in children) {
        if (children[q].containsEdge(_edge)) {
          children[q].addEdge(_edge);
        }
      }
    } 
  }

  this.getNode = function(_x, _y)
  {
    if (children == null)
    {
      for (var n in nodes) {
        if (nodes[n].contains(_x, _y)) {
          return nodes[n];
        }
      }
      return null;
    }
    else {
      for (var q in children) {
        if (children[q].containsPoint(_x, _y)) {
          return children[q].getNode(_x, _y);
        }
      }
      return null;
    }
  }

  this.getEdge = function(_x, _y)
  {
    if (children == null)
    {
      for (var e in edges) {
        if (edges[e].edgeContains(_x, _y)) {
          return edges[e];
        }
      }
      return null;
    }
    else {
      for (var q in children) {
        if (children[q].containsPoint(_x, _y)) {
          return children[q].getEdge(_x, _y);
        }
      }
      return null;
    }
  }

  this.draw = function()
  {
    if (children == null) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.0)";;
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
    else {
      for (var q in children) {
        children[q].draw();
      } 
    }
  }
}
