function Quad(_x, _y, _w, _h)
{
  var nodes = [];
  var children = null;
  
  var x = _x;
  var y = _y;
  var w = _w;
  var h = _h;
  
  this.getChildren = function() {
    return children;
  }
  
  this.containsNode = function(node)
  {
    return (node.x+NODE_RADIUS > x && node.x-NODE_RADIUS < x+w &&
            node.y+NODE_RADIUS > y && node.y-NODE_RADIUS < y+h);
  }
  
  this.containsPoint = function(_x, _y)
  {
    return (_x > x && _x < x+w && _y > y && _y < y+h);
  }
  
  this.addNode = function(node)
  {
    // Leaf quad, add a new node
    if (children == null && nodes.length < NODE_LIMIT) {
      nodes.push(node);
    } 
    // Expand leaf quad to branching quad
    else if (children == null && w > 1) 
    {
      nodes.push(node);
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
      nodes = [];
    } 
    // Branching quad, keep drilling down
    else 
    {
      for (var q in children) {
        if (children[q].containsNode(node)) {
          children[q].addNode(node);
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

  this.draw = function()
  {
    if (children == null) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fillStyle = "rgba(0, 0, 0, 0.0)";;
      ctx.fill();
      ctx.lineWidth = 1;
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
