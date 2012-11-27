var WIDTH = 0;
var HEIGHT = 0;

var DEPTH = 10;
var FULL_TREE_DEPTH = 4;
var CHILD_PROB = 0.60;
var FOOD_PROB = 0.35;
var MAX_FOOD = 1000;

var NEST_ANTS = 1000;
var SEARCHING = 100;
var ANT_SPEED = 0.01;
var SWITCH_PATH = 0.001;
var INITIAL_PATH = false;
var RETURN_TO_FOOD = false;

var NEST_INTERACTION = true;
var PATH_INTERACTION = false;
var PHEROMONE = false;

var TEMP_NEST_INERACTION = true;
var TEMP_PATH_INTERACTION = false;
var TEMP_PHEROMONE = false;

var REINFORCEMENT_STR = 0.75;
var GIVE_PATH = true;
var CAN_SMELL = false;
var SCENT_DECAY = 0.75;

var STAY_PROB = 0.05;
var INTERACT_PROB = 0.75;
var AVERAGE_TIME = 1000;

var PHEROMONE_DECAY = 0.001;
var SENSE_LINEAR = true;

var NODE_RADIUS = 7;
var ANT_RADIUS = 2;
var BRANCH_WIDTH = 3;
var NODE_DRAW_RADIUS = 4;
var NEST_RADIUS = 8;
var FOOD_DRAW_RADIUS = 3;

var NODE_LIMIT = 3;

var SHOW_ANT_COUNT = false;

var RUNNING = true;

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

function apply_changes(e)
{
  getInputValues();
  reset(e);
}

function revert(e)
{
  setInputValues();
}

function reset(e)
{
  food_nodes = [];
  tree_ants = [];
  lymph_ants = [];

  static_canvas = document.createElement('canvas');
  static_canvas.width = WIDTH;
  static_canvas.height = HEIGHT;
  static_ctx = static_canvas.getContext('2d');

  init();
}

function pause(e) 
{
  if (RUNNING) {
    RUNNING = false;
    $('#button_start').html("Start");
  } else {
    RUNNING = true;
    $('#button_start').html("Pause");
    update();
    render();
  }
}

function update()
{
  if (RUNNING) {
    nest.update();
    root.update();

    for (a in tree_ants) {
      if (tree_ants[a].update()) {
        tree_ants.splice(a, 1);
      }
    }

    setTimeout(update, 16);
  }
}

function render()
{
  if (RUNNING) {
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

  if (INITIAL_PATH) {
    food_node_a = food_nodes[Math.floor(Math.random() * food_nodes.length)];
    food_node_b = food_nodes[Math.floor(Math.random() * food_nodes.length)];
    food_node_a.foodColor = '#C22';
    food_node_b.foodColor = '#22C';

    if (PHEROMONE) {
      init_pheromones(2000, root, food_node_a.getPath());
      init_pheromones(2000, root, food_node_b.getPath());
    }
  }

  nest = new Nest(NEST_ANTS, SEARCHING);

  root.drawTree(static_ctx);
}

function getInputValues()
{
  DEPTH = $('#in_treedepth').val();
  FULL_TREE_DEPTH = $('#in_fulldepth').val();
  CHILD_PROB = $('#in_branchprob').val();
  FOOD_PROB = $('#in_foodprob').val();
  MAX_FOOD = $('#in_foodamount').val();

  NEST_ANTS = $('#in_population').val();
  SEARCHING = $('#in_searching').val();
  ANT_SPEED = Number($('#in_speed').val());
  SWITCH_PATH = $('#in_pathswitch').val();
  INITIAL_PATH = $('#in_initialpaths').is(':checked');
  RETURN_TO_FOOD = $('#in_returntofood').is(':checked');

  REINFORCEMENT_STR = $('#in_recruitstrength').val();
  GIVE_PATH = $('#in_givepath').is(':checked');
  CAN_SMELL = $('#in_cansmell').is(':checked');
  SCENT_DECAY = $('#in_scentdecay').val();

  STAY_PROB = $('#in_stayprob').val();
  INTERACT_PROB = $('#in_interactprob').val();
  AVERAGE_TIME = $('#in_averagetime').val();

  PHEROMONE_DECAY = $('#in_decayrate').val();
  SENSE_LINEAR = $('#in_senseprofile').val() == "Linear";


  if (!TEMP_NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide();
    NEST_INTERACTION = false;
  } else {
    $('#div_nestinteraction').stop().show(250);
    NEST_INTERACTION = true;
  }
  if (!TEMP_PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide();
    PATH_INTERACTION = false;
  } else {
    $('#div_pathinteraction').stop().show(250);
    PATH_INTERACTION = true;
  }
  if (!TEMP_PHEROMONE) {
    $('#div_pheromone').stop().hide();
    PHEROMONE = false;
  } else {
    $('#div_pheromone').stop().show(250);
    PHEROMONE = true;
  }
}

function setInputValues()
{
  $('#in_treedepth').val(DEPTH);
  $('#in_fulldepth').val(FULL_TREE_DEPTH);
  $('#in_branchprob').val(CHILD_PROB);
  $('#in_foodprob').val(FOOD_PROB);
  $('#in_foodamount').val(MAX_FOOD);

  $('#in_population').val(NEST_ANTS);
  $('#in_searching').val(SEARCHING);
  $('#in_speed').val(ANT_SPEED);
  $('#in_pathswitch').val(SWITCH_PATH);
  $('#in_initialpaths').attr('checked', INITIAL_PATH);
  $('#in_returntofood').attr('checked', RETURN_TO_FOOD);

  $('#in_recruitstrength').val(REINFORCEMENT_STR);
  $('#in_givepath').attr('checked', GIVE_PATH);
  $('#in_cansmell').attr('checked', CAN_SMELL);
  $('#in_scentdecay').val(SCENT_DECAY);

  $('#in_stayprob').val(STAY_PROB);
  $('#in_interactprob').val(INTERACT_PROB);
  $('#in_averagetime').val(AVERAGE_TIME);

  $('#in_decayrate').val(PHEROMONE_DECAY);
  $('#in_senseprofile').val(SENSE_LINEAR ? "Linear" : "Log");

  if (!NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide();
    TEMP_NEST_INTERACTION = false;
  } else {
    $('#div_nestinteraction').stop().show(250);
    TEMP_NEST_INTERACTION = true;
  }
  if (!PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide();
    TEMP_PATH_INTERACTION = false;
  } else {
    $('#div_pathinteraction').stop().show(250);
    TEMP_PATH_INTERACTION = true;
  }
  if (!PHEROMONE) {
    $('#div_pheromone').stop().hide();
    TEMP_PHEROMONE = false;
  } else {
    $('#div_pheromone').stop().show(250);
    TEMP_PHEROMONE = true;
  }
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

  $('#button_start').click(function(e) { pause(e) });
  $('#button_reset').click(function(e) { reset(e) });
  $('#button_revert').click(function(e) { revert(e) });
  $('#button_apply').click(function(e) { apply_changes(e) });

  $('#fs_nestinteraction legend').click(function() {
    $('#div_nestinteraction').stop().show(250);
    $('#div_pathinteraction').stop().hide(250);
    $('#div_pheromone').stop().hide(250);
    TEMP_NEST_INTERACTION = true;
    TEMP_PATH_INTERACTION = false;
    TEMP_PHEROMONE = false;
  });
  $('#fs_pathinteraction legend').click(function() {
    $('#div_pathinteraction').stop().show(250);
    $('#div_nestinteraction').stop().hide(250);
    $('#div_pheromone').stop().hide(250);
    TEMP_NEST_INTERACTION = false;
    TEMP_PATH_INTERACTION = true;
    TEMP_PHEROMONE = false;
  });
  $('#fs_pheromone legend').click(function() {
    $('#div_pheromone').stop().show(250);
    $('#div_pathinteraction').stop().hide(250);
    $('#div_nestinteraction').stop().hide(250);
    TEMP_NEST_INTERACTION = false;
    TEMP_PATH_INTERACTION = false;
    TEMP_PHEROMONE = true;
  });

  setInputValues();

  init();

  update();
  render();
});
