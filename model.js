var WIDTH = 0;
var HEIGHT = 0;

var DEPTH = 10;
var FULL_TREE_DEPTH = 4;

var NODE_RADIUS = 7;
var ANT_RADIUS = 2;
var BRANCH_WIDTH = 3;
var NODE_DRAW_RADIUS = 4;
var NEST_RADIUS = 8;
var FOOD_DRAW_RADIUS = 3;

var NODE_LIMIT = 3;

var ANT_SPEED = 0.01;
var CHILD_PROB = 0.60;
var LEAVE_PROB = 0.001;
var STOP_SEARCHING = 0.0001;
var SWITCH_PATH = 1.00;
var FOOD_PROB = 0.35;
var PHEROMONE_DECAY = 0.999;
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

  if (node.parent != null) {
    var theta = Math.atan2(node.y - node.parent.y, node.x - node.parent.x) + Math.PI/2;
    if (node.isRight) {
      node.text_x = (node.x + node.parent.x) / 2 - (3 * skew * Math.cos(theta));
      node.text_y = (node.y + node.parent.y) / 2 - (3 * skew * Math.sin(theta));
    } else {
      node.text_x = (node.x + node.parent.x) / 2 + (2 * skew * Math.cos(theta));
      node.text_y = (node.y + node.parent.y) / 2 + (2 * skew * Math.sin(theta));
    }
  }

  picker.addNode(node);
}


function mouseMove(e)
{
  var off = $("#canvas").offset();
  var x = e.pageX - off.left;
  var y = e.pageY - off.top;

  hover_node = picker.getNode(x, y);
}

function update()
{
  nest.update();
  root.update();

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

//  for (n in food_nodes) {
//    food_nodes[n].draw();
//  }

  root.draw();
  
  if (hover_node != null)
    hover_node.drawSelected(ctx);
    
  for (a in tree_ants) {
    tree_ants[a].draw();
  }

  nest.draw();
}

function init_pheromones(amount, node, path)
{
  if (node.right != null && node.left != null) {
    if (path[0]) {
      node.right.pheromone = amount;
      if (node.right != null) {
        init_pheromones(amount, node.right, path.splice(1, path.length - 1));
      }
    } else {
      node.left.pheromone = amount;
      if (node.left != null) {
        init_pheromones(amount, node.left, path.splice(1, path.length - 1));
      }
    }
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

  init_pheromones(2000, root, food_node_a.getPath());
  init_pheromones(2000, root, food_node_b.getPath());

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
  
//  $('#canvas').mousemove(function(e) { mouseMove(e); });

  init();

  update();
  render();
});
