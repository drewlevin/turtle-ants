var WIDTH = 0;
var HEIGHT = 0;

var TIME = 0;

// Environment
var DEPTH = 10;
var FULL_TREE_DEPTH =4;
var CHILD_PROB = 0.5;
var FOOD_PROB = 0.5;
var MAX_FOOD = 1000;
var FOOD_DECAY = 0.0;
var NEW_FOOD_PROB = 0.0000;

// Ants
var NEST_ANTS = 1000;
var ANT_SPEED = 0.01;
var INITIAL_PATH = false;
var RETURN_TO_FOOD = false;
var SWITCH_PATH = 0.001;
var CAN_SMELL = false;
var SCENT_RADIUS = 1;

// Interaction Headers
var NEST_INTERACTION = false;
var PATH_INTERACTION = false; // PATH will not work if pheromone is enabled
var PHEROMONE = false;

// Nest Interaction
var SEARCHING = 100;
var RECRUIT_PROB = 0.005;
var STAY_HOME_FAIL = 0.75;
var STAY_HOME_SUCCESS = 0.25;
var NEST_TIME = 100000;
var GIVE_PATH = false;

// Path Interaction
var STAY_PROB = 0.05;
var INTERACT_PROB = 0.75;
var AVERAGE_TIME = 500;

// Pheromone Interaction
var PHEROMONE_DECAY = 0.001;
var SENSE_LINEAR = true;
var SENSE_LOG = false;
var SENSE_CONST = false;

// Graphic constants
var NODE_RADIUS = 7;
var BRANCH_RADIUS = 7;
var ANT_RADIUS = 2;
var BRANCH_WIDTH = 3;
var NODE_DRAW_RADIUS = 4;
var NEST_RADIUS = 8;
var FOOD_DRAW_RADIUS = 3;
var OBSERVATION_LENGTH = 20;

var QUAD_LIMIT = 4;

var SHOW_ANT_COUNT = false;

var RUNNING = true;

var PLOT_OPTIONS = 
    {
      xaxis: {tickSize: 100}, 
      yaxis: {min: 0, tickSize: 5}
    };


var l = 35;

// Globals
var root;
var lymph;
var picker;
var ctx;
var static_canvas;
var static_ctx;
var hover_node = null;
var hover_edge = null;

var food_nodes = [];
var tree_ants = [];
var lymph_ants = [];
var nest = null;
var food_node_a;
var food_node_b;
var food_node_a_path;
var food_node_b_path;

var observer_array = [];
var observer_id = 1;
var eye_icon = null;

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
  // Double branch
  if (depth > DEPTH - FULL_TREE_DEPTH ) {
    node.right = new Node(node, node.depth + 1, true);
    node.left  = new Node(node, node.depth + 1, false);

    buildTree(node.right, depth-1);
    buildTree(node.left, depth-1);

    node.weight = node.right.weight + node.left.weight;
  } 
  // Single or double branch
  else if (depth > 0) {
    node.weight = 1;

    // right child
    if (Math.random() < CHILD_PROB) {
      node.right = new Node(node, node.depth + 1, true);
      buildTree(node.right, depth-1);
      node.weight += node.right.weight;
    }
    // left child
    if (Math.random() < CHILD_PROB) {
      node.left = new Node(node, node.depth + 1, false);
      buildTree(node.left, depth-1);
      node.weight += node.left.weight;
    }
  }
  // Leaf
  if (node.right == null && node.left == null) {
    node.weight = 10; 
    if (Math.random() < FOOD_PROB) {
      node.food = MAX_FOOD;
      food_nodes.push(node);
    }
  }
}

function positionTree(node)
{
  node.x = (WIDTH/2)  + (node.depth * l) * Math.cos(node.theta);
  node.y = (HEIGHT/2) + (node.depth * l) * Math.sin(node.theta);

  var skew = BRANCH_WIDTH / 2 + ANT_RADIUS;

  // Branch right
  if (node.right != null) {

    var right_proportion = 1;
    if (node.left != null) {
      right_proportion = node.right.weight / (node.right.weight + node.left.weight);
    }

    node.right.theta = node.theta - node.width * (1-right_proportion) / 2;
    node.right.width = node.width * right_proportion;

    positionTree(node.right);

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
  }

  // Branch left
  if (node.left != null) {

    var left_proportion = 1;
    if (node.right != null) {
      left_proportion = node.left.weight / (node.right.weight + node.left.weight);
    }

    node.left.theta = node.theta + node.width * (1-left_proportion) / 2;  
    node.left.width = node.width * left_proportion;
  
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
    
    theta = Math.atan2(node.left.y - node.y, node.left.x - node.x) + Math.PI/2;
    node.out_left_x = node.x + skew * Math.cos(theta);
    node.out_left_y = node.y + skew * Math.sin(theta);
    node.in_left_x = node.x - skew * Math.cos(theta);
    node.in_left_y = node.y - skew * Math.sin(theta);
  }

  // Leaf
  if (node.right == null && node.left == null && node.parent != null) {
    var theta = Math.atan2(node.y - node.parent.y, node.x - node.parent.x) + Math.PI/2;
    node.out_parent_x = node.x + skew * Math.cos(theta);
    node.out_parent_y = node.y + skew * Math.sin(theta);
    node.in_parent_x = node.x - skew * Math.cos(theta);
    node.in_parent_y = node.y - skew * Math.sin(theta);
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

    var mid_x = (node.parent.x + node.x) / 2.0;
    var mid_y = (node.parent.y + node.y) / 2.0;

    node.observation_x1 = mid_x + (OBSERVATION_LENGTH / 2.0) * Math.cos(theta);
    node.observation_y1 = mid_y + (OBSERVATION_LENGTH / 2.0) * Math.sin(theta);
    node.observation_x2 = mid_x - (OBSERVATION_LENGTH / 2.0) * Math.cos(theta);
    node.observation_y2 = mid_y - (OBSERVATION_LENGTH / 2.0) * Math.sin(theta);    
  }

  picker.addNode(node);
  picker.addEdge(node);
}

function createObserver(_edge) 
{
  if (_edge.observer == null) {
    _edge.observer = new Observer(observer_id, _edge);
    observer_id++;

    _edge.observer.createDiv(observer_array.length);

    observer_array.push(_edge.observer);
  }
}

function removeObserver(_id)
{
  var index = 0;
  for (o in observer_array) {
    if (_id == observer_array[o].id) {
      index = o;
      break;
    }
  }
  
  var removed_observer = observer_array.splice(index, 1);
  removed_observer[0].div.remove();
  removed_observer[0].edge.observer = null;

  for (o in observer_array) {
    observer_array[o].div.animate({'top': (45 + 175*o) + 'px'}, 500);
  }
}

function mouseMove(e)
{
  var off = $("#canvas").offset();
  var x = e.pageX - off.left;
  var y = e.pageY - off.top;

  hover_node = picker.getNode(x, y);
  hover_edge = picker.getEdge(x, y);
}

function mouseClick(e)
{
  if (hover_edge != null) {
    if (hover_edge.observer == null) {
      createObserver(hover_edge);
    }
    else {
      removeObserver(hover_edge.observer.id);
    }
  }
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

  for (o in observer_array) {
    observer_array[o].div.remove();
  }
  observer_array = [];
  observer_id = 1;

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
    TIME++;

    nest.update();
    root.update();

    for (a in tree_ants) {
      if (tree_ants[a].update()) {
        tree_ants.splice(a, 1);
      }
    }

    for (o in observer_array) {
      observer_array[o].update();
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

    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px courier';
//    ctx.textBaseline = 'middle';
    ctx.fillText('Time: ' + Math.floor(TIME / 10), 10, 20);

  //  for (n in food_nodes) {
  //    food_nodes[n].draw();
  //  }

//    picker.draw();

    root.draw();
    
    if (hover_node != null)
      hover_node.drawSelected(ctx);
    else if (hover_edge != null)
      hover_edge.drawSelectedEdge(ctx);

    for (a in tree_ants) {
      tree_ants[a].draw();
    }

    nest.draw();

    for (o in observer_array) {
      $.plot(observer_array[o].flot, 
             [ { label: 'Outgoing', data: observer_array[o].getOutgoingSeries(50) } , 
               { label: 'Incoming', data: observer_array[o].getIncomingSeries(50) } ] , 
             PLOT_OPTIONS);
    }
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
  TIME = 0;

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

  eye_icon = new Image();
  eye_icon.src = 'img/eye.png';
}

function getInputValues()
{
  DEPTH = $('#in_treedepth').val();
  FULL_TREE_DEPTH = $('#in_fulldepth').val();
  CHILD_PROB = $('#in_branchprob').val();
  FOOD_PROB = $('#in_foodprob').val();
  MAX_FOOD = $('#in_foodamount').val();
  FOOD_DECAY = $('#in_fooddecay').val();
  NEW_FOOD_PROB = $('#in_newfoodprob').val();

  NEST_ANTS = $('#in_population').val();
  ANT_SPEED = Number($('#in_speed').val());
  INITIAL_PATH = $('#in_initialpaths').is(':checked');
  RETURN_TO_FOOD = $('#in_returntofood').is(':checked');
  SWITCH_PATH = $('#in_pathswitch').val();
  CAN_SMELL = $('#in_cansmell').is(':checked');
  SCENT_RADIUS = $('#in_scentradius').val();

  NEST_INTERACTION = $('#in_nestinteraction').is(':checked');
  PATH_INTERACTION = $('#in_pathinteraction').is(':checked');
  PHEROMONE = $('#in_pheromone').is(':checked');

  SEARCHING = $('#in_searching').val();
  RECRUIT_PROB = $('#in_recruitprob').val();
  STAY_HOME_FAIL = $('#in_stayhomefail').val();
  STAY_HOME_SUCCESS = $('#in_stayhomesuccess').val();
  NEST_TIME = $('#in_nesttime').val();
  GIVE_PATH = $('#in_givepath').is(':checked');

  STAY_PROB = $('#in_stayprob').val();
  INTERACT_PROB = $('#in_interactprob').val();
  AVERAGE_TIME = $('#in_averagetime').val();

  PHEROMONE_DECAY = $('#in_decayrate').val();
  SENSE_LINEAR = $('#in_senseprofile').val() == "Linear";
  SENSE_LOG = $('#in_senseprofile').val() == "Log";
  SENSE_CONST = $('#in_senseprofile').val() == "Const";

  if (!NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide(250);
  } else {
    $('#div_nestinteraction').stop().show(250);
  }
  if (!PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide(250);
  } else {
    $('#div_pathinteraction').stop().show(250);
  }
  if (!PHEROMONE) {
    $('#div_pheromone').stop().hide(250);
  } else {
    $('#div_pheromone').stop().show(250);
  }
}

function setInputValues()
{
  $('#in_treedepth').val(DEPTH);
  $('#in_fulldepth').val(FULL_TREE_DEPTH);
  $('#in_branchprob').val(CHILD_PROB);
  $('#in_foodprob').val(FOOD_PROB);
  $('#in_foodamount').val(MAX_FOOD);
  $('#in_fooddecay').val(FOOD_DECAY);
  $('#in_newfoodprob').val(NEW_FOOD_PROB);

  $('#in_population').val(NEST_ANTS);
  $('#in_speed').val(ANT_SPEED);
  $('#in_initialpaths').attr('checked', INITIAL_PATH);
  $('#in_returntofood').attr('checked', RETURN_TO_FOOD);
  $('#in_pathswitch').val(SWITCH_PATH);
  $('#in_cansmell').attr('checked', CAN_SMELL);
  $('#in_scentradius').val(SCENT_RADIUS);

  $('#in_searching').val(SEARCHING);
  $('#in_recruitprob').val(RECRUIT_PROB);
  $('#in_stayhomefail').val(STAY_HOME_FAIL);
  $('#in_stayhomesuccess').val(STAY_HOME_SUCCESS);
  $('#in_nesttime').val(NEST_TIME);
  $('#in_givepath').attr('checked', GIVE_PATH);

  $('#in_stayprob').val(STAY_PROB);
  $('#in_interactprob').val(INTERACT_PROB);
  $('#in_averagetime').val(AVERAGE_TIME);

  $('#in_decayrate').val(PHEROMONE_DECAY);
  $('#in_senseprofile').val(SENSE_LINEAR ? "Linear" : (SENSE_LOG ? "Log" : "Const"));

  $('#in_nestinteraction').attr('checked', NEST_INTERACTION);
  if (!NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide(250);
  } else {
    $('#div_nestinteraction').stop().show(250);
  }
  $('#in_pathinteraction').attr('checked', PATH_INTERACTION);
  if (!PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide(250);
  } else {
    $('#div_pathinteraction').stop().show(250);
  }
  $('#in_pheromone').attr('checked', PHEROMONE);
  if (!PHEROMONE) {
    $('#div_pheromone').stop().hide(250);
  } else {
    $('#div_pheromone').stop().show(250);
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
  
  $('#canvas').mousemove(function(e) { mouseMove(e); });
  $('#canvas').click(function(e) { mouseClick(e); });
//  $('#canvas').click(function(e) { mouseClick(e); });

  $('#button_start').click(function(e) { pause(e) });
  $('#button_reset').click(function(e) { reset(e) });
  $('#button_revert').click(function(e) { revert(e) });
  $('#button_apply').click(function(e) { apply_changes(e) });

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
  

  setInputValues();

  pos = $('#canvas').position();
  $('<div id="documentation"></div>').css( 
      { "top": (pos.top + 50) + "px", "left": (pos.left + 435) + "px"}
     ).prependTo($('#main_container'));

  $('.hoverdoc').hover(
    function() {
      pos = $(this).position();
      element = $(this).next().children('select, input');
      $('#documentation').html(getDescription(element));
      $('#documentation').css("top", pos.top);
      $('#documentation').stop(true,true).fadeIn(150);
    } ,
    function() {
      $('#documentation').css("top", pos.top);
      $('#documentation').stop(true,true).fadeOut(150);
    });


  init();

  update();
  render();
});
