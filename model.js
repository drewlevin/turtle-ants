var WIDTH = 0;
var HEIGHT = 0;

var TIME = 0;

// Constants
var TREE_SEED = 'Tree!';
var ANT_SEED = 'Ants!';

// Output Control
var SHOW_OUTPUT = true;

// Report Generation
var SAVE_REPORT = true;
var NUM_RUNS = 1;
var NUM_OBSERVATIONS = 6;
var OBSERVATION_RATE = 600;
var OBSERVATION_TIME = 60;

// Environment
var DEPTH = 10;
var FULL_TREE_DEPTH = 4;
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

var RUNNING = false;

var GENERATED_REPORT = false;

var PLOT_OPTIONS = 
    {
      xaxis: {tickSize: 100}, 
      yaxis: {min: 0},
      selection: {mode: "x"},
      legend: {position: "nw" }
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

var total_runs = 0;
var root_ant_seed = ANT_SEED;
var food_nodes = [];
var tree_ants = [];
var lymph_ants = [];
var nest = null;
var food_node_a;
var food_node_b;
var food_node_a_path;
var food_node_b_path;

var nearest_food = null;
var farthest_food = null;
var nearest_empty = null;
var farthest_empty = null;
var nearest_food_dist = 1e99;
var farthest_food_dist = 0;
var nearest_empty_dist = 1e99;
var farthest_empty_dist = 0;

var observer_array = [];
var observer_collection = [];
var observer_id = 1;
var eye_icon = null;

val eol = (function() {
  var plat = navigator.platform.toLowerCase();
  if (plat.indexOf('win') != -1) return "\r\n";
  else if (plat.indexOf('mac') != -1) return "\r";
  else return "\n";
}()); 

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
  if (node.parent != null ) {
    node.observer = new Observer(0, node);
  }

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
    dist = DEPTH - depth + 1;
    node.weight = 10; 
    if (Math.random() < FOOD_PROB) {
      node.food = MAX_FOOD;
      food_nodes.push(node);

      if (dist < nearest_food_dist) {
        nearest_food = node;
        nearest_food_dist = dist;
      }
      if (dist >= farthest_food_dist) {
        farthest_food = node;
        farthest_food_dist = dist;
      }
    }
    else {
      if (dist <= nearest_empty_dist) {
        nearest_empty = node;
        nearest_empty_dist = dist;
      }
      if (dist > farthest_empty_dist) {
        farthest_empty = node;
        farthest_empty_dist = dist;
      }
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

function generateReportSingleTableString(_run) {
  var output = "Run " + (_run+1) + "\n";
  for (var i=0; i<observer_array.length; i++) {
    output += "Observer " + observer_array[i].id + " Outgoing: ";
    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      output += observer_collection[_run][i].outgoing[j];
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }
    output += eol;

    output += "Observer " + observer_array[i].id + " Incoming: ";
    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      output += observer_collection[_run][i].incoming[j];
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }    
    output += eol;
  }
  output += eol;
  return output;
}

function generateReportString() {
  var output = "";  

  var values, stats;
  var mean, std;

  for (var i=0; i<NUM_RUNS; i++) {
    output += generateReportSingleTableString(i);
  }

  for (var i=0; i<observer_array.length; i++) {
    output += "Observer " + observer_array[i].id + " Outgoing: ";

    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      values = [];
      for (var run=0; run<NUM_RUNS; run++) {    
        values.push(observer_collection[run][i].outgoing[j]);
      }
      stats = Stats(values);
      mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
      std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS))* 100) / 100;
      output += mean + " +/- " + std;
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }
    output += eol;

    output += "Observer " + observer_array[i].id + " Incoming: ";  

    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      values = [];
      for (var run=0; run<NUM_RUNS; run++) {    
        values.push(observer_collection[run][i].incoming[j]);
      }    
      stats = Stats(values);
      mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
      std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS)) * 100) / 100;
      output += mean + " +/- " + std;
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }
    output += eol;
  }

  return output;
}

function generateReports() 
{
  if (observer_array.length > 0 && !GENERATED_REPORT) {

    var blob = new Blob([generateReportString()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "report.txt")
console.log("saveAs");

    GENERATED_REPORT = true;

    var div, flot_div, column_div, top, markings_array;
    var column_offset, column_width, column_div_width = 1180;
    var time_rate_ratio = OBSERVATION_TIME / OBSERVATION_RATE;

    var report_div = $('#report');
    report_div.css({'visibility': 'visible'});
    report_div.animate({'height': (5+305*observer_array.length)+'px'}, 1000);

    for (o in observer_array) {
      top = 5+(275*o);
      div = $('<div></div>', {'class': 'report_container'}).css({'top': top+'px'});

      $('<h4>Observer '+ observer_array[o].id +'</h4>').appendTo(div);

      flot_div = $('<div></div>', {'class': 'report_flot'}).appendTo(div);
      column_div = $('<div></div>', {'class': 'report_columns'}).appendTo(div);

      div.appendTo(report_div);

      column_offset = (column_div_width * time_rate_ratio) / (time_rate_ratio + NUM_OBSERVATIONS);
      column_width  = column_offset / time_rate_ratio;

      for (var i=0; i<NUM_OBSERVATIONS; i++) {
        $('<div class="report_single_column">Outgoing: ' + 
             observer_array[o].getOutgoingCount(OBSERVATION_RATE*(i+1), OBSERVATION_RATE*(i+1)+OBSERVATION_TIME) +
          '<br/>Incoming : ' +
             observer_array[o].getIncomingCount(OBSERVATION_RATE*(i+1), OBSERVATION_RATE*(i+1)+OBSERVATION_TIME) +
          '</div>').css({'width': Math.floor(column_width-20)+'px',
                         'left' : (Math.floor(column_offset)+Math.floor(column_width)*i)+'px'
                        }).appendTo(column_div);
      }

      markings_array = [];
      for (var i=0; i<NUM_OBSERVATIONS; i++) {
        markings_array.push({ color: "#e8cfac", lineWidth: "1",
                              xaxis: { from: OBSERVATION_RATE*(i+1), 
                                       to: OBSERVATION_RATE*(i+1)+OBSERVATION_TIME-1 } });
      }
      var options = $.extend(true, {}, PLOT_OPTIONS);
      options['grid'] = { markings: markings_array };
      $.plot(flot_div, 
             [ { label: 'Outgoing', data: observer_array[o].getOutgoingSeries(TIME) } , 
               { label: 'Incoming', data: observer_array[o].getIncomingSeries(TIME) } , 
               { label: 'Outgoing Smoothed', data: observer_array[o].getOutgoingSmoothed(TIME) } , 
               { label: 'Incoming Smoothed', data: observer_array[o].getIncomingSmoothed(TIME) } ] , 
             options );
    }
  }
}

function autoAddObservers() {
  addObserver(nearest_food);
  addObserver(farthest_food);
  addObserver(nearest_empty);
  addObserver(farthest_empty);
}

function addObserver(_edge) 
{
  if (_edge.observer.id == 0) {
    _edge.observer.id = observer_id;
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
  removed_observer[0].edge.observer.id = 0;

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

  if (!RUNNING) {
    render();
  }
}

function mouseClick(e)
{
  if (hover_edge != null) {
    if (hover_edge.observer.id == 0) {
      addObserver(hover_edge);
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

function reset_model_run() {  

  tree_ants = [];
  food_nodes = [];

  for (o in observer_array) {
    observer_array[o].div.remove();
  }
  observer_array = [];
  observer_id = 1;

  nearest_food = null;
  farthest_food = null;
  nearest_empty = null;
  farthest_empty = null;
  nearest_food_dist = 99;
  farthest_food_dist = 0;
  nearest_empty_dist = 99;
  farthest_empty_dist = 0;

  GENERATED_REPORT = false;

  Math.seedrandom(TREE_SEED);

  picker = new Quad(0, 0, WIDTH, HEIGHT);
  root = new Node(null, 0, true);

  buildTree(root, DEPTH);

  autoAddObservers();
  root.initObservers();

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

  root.initObservers();

  TIME = 0;
  update();
}

function reset(e)
{
  food_nodes = [];
  tree_ants = [];

  nearest_food = null;
  farthest_food = null;
  nearest_empty = null;
  farthest_empty = null;
  nearest_food_dist = 99;
  farthest_food_dist = 0;
  nearest_empty_dist = 99;
  farthest_empty_dist = 0;

  total_runs = 0;

  static_canvas = document.createElement('canvas');
  static_canvas.width = WIDTH;
  static_canvas.height = HEIGHT;
  static_ctx = static_canvas.getContext('2d');

  for (o in observer_array) {
    observer_array[o].div.remove();
  }
  observer_collection = [];
  observer_array = [];
  observer_id = 1;

  var child_array = $('#report').contents().each(function(i,v) { $(this).remove(); });
  $('#report').css({'visibility': 'hidden', 'height': '0px'});
  GENERATED_REPORT = false;

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

    if (SAVE_REPORT && NUM_OBSERVATIONS > 0 && 
        TIME >= NUM_OBSERVATIONS * OBSERVATION_RATE + OBSERVATION_TIME) 
    {
      var collection = [];
      for (var i=0; i<observer_array.length; i++) {
        var observer = {};
        var incoming = [];
        var outgoing = [];

        observer.id = observer_array.id;

        for (var j=0; j<NUM_OBSERVATIONS; j++) {
          incoming.push(observer_array[i].getIncomingCount(OBSERVATION_RATE*(j+1), 
                                                           OBSERVATION_RATE*(j+1)+OBSERVATION_TIME));
          outgoing.push(observer_array[i].getOutgoingCount(OBSERVATION_RATE*(j+1), 
                                                           OBSERVATION_RATE*(j+1)+OBSERVATION_TIME));
        }
        observer.incoming = incoming;
        observer.outgoing = outgoing;

        collection.push(observer);
      }       
      observer_collection.push(collection);

      total_runs++;

      if (total_runs == NUM_RUNS) {
        RUNNING = false;
        $('#button_start').html("Start");
        generateReports();
      }
      else {
        ANT_SEED = root_ant_seed + '_' + total_runs;
        $('#in_antseed').val(ANT_SEED);
        
        reset_model_run();
      }
    }
    else {
      setTimeout(update, 16);
    }
  }
}

function render()
{
  if (RUNNING) {
    requestAnimationFrame(render);
  }

  ctx.fillStyle = '#EEE';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(static_canvas, 0, 0);

  ctx.fillStyle = '#222';
  ctx.font = 'bold 20px courier';
  ctx.fillText('Time: ' + Math.floor(TIME / 1), 10, 20);
  ctx.fillText('Run: ' + Number(Math.min(NUM_RUNS, total_runs+1)), 620, 20);

//  for (n in food_nodes) {
//    food_nodes[n].draw();
//  }
//  picker.draw();

  root.draw();
  
  if (hover_node != null)
    hover_node.drawSelected(ctx);
  else if (hover_edge != null)
    hover_edge.drawSelectedEdge(ctx);

  for (a in tree_ants) {
    tree_ants[a].draw();
  }

  nest.draw();

  if (SHOW_OUTPUT) {
    for (o in observer_array) {
      $.plot(observer_array[o].flot, 
             [ { label: 'Outgoing', data: observer_array[o].getOutgoingTotal(50) } , 
               { label: 'Incoming', data: observer_array[o].getIncomingTotal(50) } ] , 
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
  RUNNING = false;
  $('#button_start').html("Start");

  Math.seedrandom(TREE_SEED);

  TIME = 0;

  picker = new Quad(0, 0, WIDTH, HEIGHT);
  root = new Node(null, 0, true);

  buildTree(root, DEPTH);

  autoAddObservers();
  root.initObservers();

  positionTree(root);

  Math.seedrandom(ANT_SEED);

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

  render();
}

function getInputValues()
{
  TREE_SEED =  $('#in_treeseed').val();
  ANT_SEED =  $('#in_antseed').val();

  SAVE_REPORT = $('#in_savereport').is(':checked');
  NUM_RUNS =  Number($('#in_numruns').val());
  NUM_OBSERVATIONS = Number($('#in_observations').val());
  OBSERVATION_RATE = Number($('#in_obsrate').val());
  OBSERVATION_TIME = Number($('#in_obslength').val());

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
  $('#in_output').attr('checked', SHOW_OUTPUT);

  $('#in_treeseed').val(TREE_SEED);
  $('#in_antseed').val(ANT_SEED);

  $('#in_savereport').attr('checked', SAVE_REPORT);
  $('#in_numruns').val(NUM_RUNS);
  $('#in_observations').val(NUM_OBSERVATIONS);
  $('#in_obsrate').val(OBSERVATION_RATE);
  $('#in_obslength').val(OBSERVATION_TIME);

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
  
  eye_icon = new Image();
  eye_icon.src = 'img/eye.png';

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
  
  $('#in_output').click(function() {
    SHOW_OUTPUT = $(this).is(':checked');
    if (SHOW_OUTPUT) {
      for (o in observer_array) {
        observer_array[o].div.appendTo('#output');
      }
    }
    else {
      for (o in observer_array) {
        observer_array[o].div.detach();
      }
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
