var WIDTH = 0;
var HEIGHT = 0;

var DEPTH = 10;
var FULL_TREE_DEPTH = 4;

var NODE_RADIUS = 7;
var ANT_RADIUS = 2;
var BRANCH_WIDTH = 3;
var NODE_DRAW_RADIUS = 4;
var NEST_RADIUS = 15;
var FOOD_DRAW_RADIUS = 3;

var NODE_LIMIT = 3;

var ANT_SPEED = 0.01;
var CHILD_PROB = 0.60;
var LEAVE_PROB = 0.001;
var STOP_SEARCHING = 0.0001;
var SWITCH_PATH = 0.003;
var FOOD_PROB = 0.35;
var MAX_FOOD = 1000;
var NEST_ANTS = 1000;

var l = 35;

var root;
var lymph;
var picker;
var ctx;
var static_canvas;
var static_ctx;
var hover_node = null;

var food_nodes = [];
var tree_ants = [];
var lymph_ants = [];
var nest =  null;
var food_node_a;
var food_node_b;
var food_node_a_path;
var food_node_b_path;

// Request Animation Frame Shim
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelRequestAnimationFrame = window[vendors[x]+
        'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
}())

function Node(_parent, _depth, _isRight) 
{
  this.parent = _parent;
  this.depth = _depth;
  this.isRight = _isRight;
  this.right = null;
  this.left = null;

  this.weight = 1;
  this.width = 2 * Math.PI;
  this.food = 0;
  
  this.foodColor = '#3A5';
  
  this.theta = 0;
  this.x = (WIDTH/2);
  this.y = (HEIGHT/2);

  this.out_parent_x = WIDTH/2;
  this.out_parent_y = HEIGHT/2;
  this.out_right_x = WIDTH/2;
  this.out_right_y = HEIGHT/2;
  this.out_left_x = WIDTH/2;
  this.out_left_y = HEIGHT/2;
  this.in_parent_x = WIDTH/2;
  this.in_parent_y = HEIGHT/2;
  this.in_right_x = WIDTH/2;
  this.in_right_y = HEIGHT/2;
  this.in_left_x = WIDTH/2;
  this.in_left_y = HEIGHT/2;

  this.contains = function(_x, _y) 
  {
    return (Math.pow(this.x - _x, 2) + Math.pow(this.y - _y, 2) <= 
      Math.pow(NODE_RADIUS, 2));
  }

  this.getPath = function() {
    if (this.depth == 0) {
      return [];
    } else {
      var parent_path = this.parent.getPath();
      parent_path.push(this.isRight);
      return parent_path;
    }
  }

  this.drawTree = function(_ctx)
  {
    if (this.right != null)
    {
      _ctx.lineWidth = BRANCH_WIDTH;
      _ctx.strokeStyle = "rgb(100, 80, 30)";
      _ctx.beginPath();
      _ctx.moveTo(this.x, this.y);
      _ctx.lineTo(this.right.x, this.right.y);
      _ctx.stroke();
      this.right.drawTree(_ctx);
    }
    if (this.left != null)
    {
      _ctx.lineWidth = BRANCH_WIDTH;
      _ctx.strokeStyle = "rgb(100, 80, 30)";
      _ctx.beginPath();
      _ctx.moveTo(this.x, this.y);
      _ctx.lineTo(this.left.x, this.left.y);
      _ctx.stroke();
      this.left.drawTree(_ctx);
    }
    
    _ctx.fillStyle = '#862';
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_DRAW_RADIUS, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();
  }
  
  this.drawSelected = function(_ctx)
  {
    _ctx.fillStyle = '#B93';
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_DRAW_RADIUS+5, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();  
  }

  this.drawFood = function()
  {
    ctx.fillStyle = this.foodColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, NODE_DRAW_RADIUS + (this.food / (MAX_FOOD / FOOD_DRAW_RADIUS)), 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();  
  }
}

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
}

function Nest(_num_ants)
{
  var num_ants = _num_ants;
  
  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    if (Math.random() < LEAVE_PROB * num_ants) {
      if (Math.random() < .5) {
        tree_ants.push(new Ant(food_node_a));
      } else {
        tree_ants.push(new Ant(food_node_b));
      }
      num_ants--;        
    }
  }
  
  this.draw = function()
  {
    ctx.fillStyle = '#863';
    ctx.beginPath();
    ctx.arc(WIDTH/2, HEIGHT/2, NEST_RADIUS, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();  
    
    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px ariel';
    ctx.textBaseline = 'middle';
    ctx.fillText(num_ants, WIDTH/2 + NEST_RADIUS + 10, HEIGHT/2);

  }
  
  this.returnHome = function()
  {
    num_ants++;
  }
}

function Ant(_dest)
{
  var path = (_dest == null) ? [] : _dest.getPath().slice(0);
  var origin = root;
  var dest = root;
  var dist = 0;
  var node_index = 0;
  var returning = false;
  var first = (_dest == null);

  this.found_food = false;
  this.color = (_dest.food > 0) ? _dest.foodColor : '#333';
  
  if (first)
  {
    var d = Math.random() < .5;
    dest = d ? root.left : root.right;
    path.push(d);
  } else {
    dest = path[dest.depth] ? dest.right : dest.left;
  }
  
  var x, y;

  this.update = function() 
  {
    dist += ANT_SPEED;

    // Searching Ants
    if (!returning) {    
      if (dest.isRight) {
        x = origin.out_right_x + dist * (dest.out_parent_x - origin.out_right_x);
        y = origin.out_right_y + dist * (dest.out_parent_y - origin.out_right_y);
      } else {
        x = origin.out_left_x + dist * (dest.out_parent_x - origin.out_left_x);
        y = origin.out_left_y + dist * (dest.out_parent_y - origin.out_left_y);
      }
      // At Node
      if (dist >= 1) {
        // Branch Node
        if (dest.right != null) {
          origin = dest;
          if (first) {
            var d = Math.random() < .5;
            dest = d ? dest.right : dest.left;
            path.push(d);
          } else {
            if (Math.random() < SWITCH_PATH) {
              first = true;
              path.splice(dest.depth, path.length - dest.depth - 1);
              var d = Math.random() < .5;
              dest = d ? dest.right : dest.left;
              path.push(d);              
            } else {
              dest = path[dest.depth] ? dest.right : dest.left;
            }
          }      
        // Turn around   
        } else { 
          if (dest.food > 0) {
            this.found_food = true;
            dest.food--;           
            this.color = dest.foodColor;
          } else {
            this.found_food = false;
            this.color = '#333';
          }
        
          returning = true;
          first = false;
          
          var temp_origin = dest;
          dest = origin;
          origin = temp_origin;
          dist = 0;
          return false;
        }
        dist = 0;
      }
    // Returning Ants
    } else {
      if (origin.isRight) {
        x = origin.in_parent_x + dist * (dest.in_right_x - origin.in_parent_x);
        y = origin.in_parent_y + dist * (dest.in_right_y - origin.in_parent_y);
      } else {
        x = origin.in_parent_x + dist * (dest.in_left_x - origin.in_parent_x);
        y = origin.in_parent_y + dist * (dest.in_left_y - origin.in_parent_y);
      }
      if (dist >= 1) {
        if (dest.parent != null) {
          origin = dest;
          dest = dest.parent;
        } else {
          if (Math.random() < STOP_SEARCHING)
          {
            nest.returnHome();
            return true;
          } else {
            origin = root;
            returning = false;
            dist = 0;
            if (Math.random() < SWITCH_PATH) {
              first = true;
              path = [];
              var d = Math.random() < .5;
              dest = d ? root.right : root.left;
              path.push(d);                            
            } else {
              dest = path[0] ? root.right : root.left;
            }
          }
          return false;
        }
        dist = 0;
      }
    }
    return false;
  }
  
  this.draw = function()
  {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, ANT_RADIUS, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
  }
}

function buildTree(node, depth)
{
  if (depth > DEPTH - FULL_TREE_DEPTH || (depth > 0 && Math.random() < CHILD_PROB)) {
    node.right = new Node(node, node.depth + 1, true);
    node.left  = new Node(node, node.depth + 1, false);

    buildTree(node.right, depth-1);
    buildTree(node.left, depth-1);

    node.weight = node.right.weight + node.left.weight;
  } 
  else if (Math.random() < FOOD_PROB) {
    node.food = MAX_FOOD;
    food_nodes.push(node);
  }
}

function positionTree(node)
{
  node.x = (WIDTH/2)  + (node.depth * l) * Math.cos(node.theta);
  node.y = (HEIGHT/2) + (node.depth * l) * Math.sin(node.theta);

  var skew = BRANCH_WIDTH / 2 + ANT_RADIUS;

  // Branch
  if (node.right != null && node.left != null) {

    var right_proportion = node.right.weight / (node.right.weight + node.left.weight);

    node.right.theta = node.theta - node.width * (1-right_proportion) / 2;
    node.right.width = node.width * right_proportion;

    node.left.theta = node.theta + node.width * right_proportion / 2;  
    node.left.width = node.width * (1-right_proportion);
  
    positionTree(node.right);
    positionTree(node.left);

    // Ignore the root for the parent positions
    var theta;
    if (node.parent != null)
    {
      theta = Math.atan2(node.y - node.parent.y, node.x - node.parent.x) + Math.PI/2;
      node.out_parent_x = node.x + skew * Math.cos(theta);
      node.out_parent_y = node.y + skew * Math.sin(theta);
      node.in_parent_x = node.x - skew * Math.cos(theta);
      node.in_parent_y = node.y - skew * Math.sin(theta);
    }
    
    theta = Math.atan2(node.right.y - node.y, node.right.x - node.x) + Math.PI/2;
    node.out_right_x = node.x + skew * Math.cos(theta);
    node.out_right_y = node.y + skew * Math.sin(theta);
    node.in_right_x = node.x - skew * Math.cos(theta);
    node.in_right_y = node.y - skew * Math.sin(theta);

    theta = Math.atan2(node.left.y - node.y, node.left.x - node.x) + Math.PI/2;
    node.out_left_x = node.x + skew * Math.cos(theta);
    node.out_left_y = node.y + skew * Math.sin(theta);
    node.in_left_x = node.x - skew * Math.cos(theta);
    node.in_left_y = node.y - skew * Math.sin(theta);
/*
    var out_theta = Math.atan2((node.right.y + node.left.y)/2 - node.y, 
                               (node.right.x + node.left.x)/2 - node.x) + Math.PI/2;

    node.out_x = node.x + 1.5 * ANT_RADIUS * Math.cos(out_theta);
    node.out_y = node.y + 1.5 * ANT_RADIUS * Math.sin(out_theta);
    node.in_x = node.x - 1.5 * ANT_RADIUS * Math.cos(out_theta);
    node.in_y = node.y - 1.5 * ANT_RADIUS * Math.sin(out_theta);
*/
  // Leaf
  } else if (node.parent != null) {
    var theta = Math.atan2(node.y - node.parent.y, node.x - node.parent.x) + Math.PI/2;
    node.out_parent_x = node.x + skew * Math.cos(theta);
    node.out_parent_y = node.y + skew * Math.sin(theta);
    node.in_parent_x = node.x - skew * Math.cos(theta);
    node.in_parent_y = node.y - skew * Math.sin(theta);
/*
    node.out_x = node.x + 1.5 * ANT_RADIUS * Math.cos(node.theta+(Math.PI/2));
    node.out_y = node.y + 1.5 * ANT_RADIUS * Math.sin(node.theta+(Math.PI/2));
    node.in_x = node.x + 1.5 * ANT_RADIUS * Math.cos(node.theta-(Math.PI/2));
    node.in_y = node.y + 1.5 * ANT_RADIUS * Math.sin(node.theta-(Math.PI/2));
*/
  }
  picker.addNode(node);
}


function mouseMove(e)
{
  var off = $("#canvas").offset();
  var x = e.pageX - off.left;
  var y = e.pageY - off.top;

  hover_node = picker.getNode(x, y);
  
  $('#debug').text("Client: " + e.clientX + ", " + e.clientY + "        " +
                   "Page: " + e.pageX + ", " + e.pageY + "        " +
                   "Canvas: " + x + ", " + y);

}

function update()
{
  nest.update();

  for (a in tree_ants) {
    if (tree_ants[a].update()) {
      tree_ants.splice(a, 1);
    }
  }
  setTimeout(update, 16);
}


function render()
{
  requestAnimationFrame(render);

  ctx.fillStyle = '#EEE';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(static_canvas, 0, 0);

  for (n in food_nodes) {
    food_nodes[n].drawFood();
  }
  
  if (hover_node != null)
    hover_node.drawSelected(ctx);

  nest.draw();
    
  for (a in tree_ants) {
    tree_ants[a].draw();
  }
}

function init()
{
  picker = new Quad(0, 0, WIDTH, HEIGHT);
  root = new Node(null, 0, true);

  buildTree(root, DEPTH);

  positionTree(root);

  food_node_a = food_nodes[Math.floor(Math.random() * food_nodes.length)];
  food_node_b = food_nodes[Math.floor(Math.random() * food_nodes.length)];
  food_node_a.foodColor = '#C22';
  food_node_b.foodColor = '#22C';

  nest = new Nest(NEST_ANTS);

  root.drawTree(static_ctx);
}

$(document).ready(function() {  

  // Do this first
  WIDTH = $("#canvas").width();
  HEIGHT = $("#canvas").height();

  ctx = $('#canvas')[0].getContext("2d");
 
  static_canvas = document.createElement('canvas');
  static_canvas.width = WIDTH;
  static_canvas.height = HEIGHT;
  static_ctx = static_canvas.getContext('2d');
  
  $('#canvas').mousemove(function(e) { mouseMove(e); });

  init();

  update();
  render();
});
