/*
 * Ants.params.js
 * Parameter Object
 *   - Contains parameters used for the model.  These parameters should never
 *     be changed during a model run.
 *   - Acts as the interface between the HTML UI and the model.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.params = (function () {
    'use strict';

  // ------------------ Private Variables -------------------- //
  var params = {

    // Constants
    TREE_SEED: 'Tree!',
    ANT_SEED: 'Ants!',

    // Output Control
    SHOW_OUTPUT: false,

    // Report Generation
    SAVE_REPORT: true,
    NUM_RUNS: 5,
    NUM_OBSERVATIONS: 1,
    OBSERVATION_RATE: 6000,
    OBSERVATION_TIME: 0,
    BIN_SIZE: 10,
    SMOOTH_LENGTH: 20,

    // Environment
    DEPTH: 8,
    FULL_TREE_DEPTH: 4,
    CHILD_PROB: 0.5,
    FOOD_PROB: 0.5,
    MAX_FOOD: 1000,
    FOOD_DECAY: 0.0,
    NEW_FOOD_PROB: 0.0000,
    CLUSTERED: false,

    // Ants
    NEST_ANTS: 500,
    ANT_SPEED: 0.01,
    RETURN_TO_FOOD: true,
    SWITCH_PATH: 0.001,
    CAN_SMELL: false,
    SCENT_RADIUS: 1,

    // Interaction Headers
    NEST_INTERACTION: false,
    PATH_INTERACTION: false, // PATH will not work if pheromone is enabled
    PHEROMONE: false,
    INITIAL_PATH: false,

    // Nest Interaction
    SEARCHING: 100,
    RECRUIT_PROB: 0.005,
    STAY_HOME_FAIL: 0.75,
    STAY_HOME_SUCCESS: 0.25,
    NEST_TIME: 100000,
    GIVE_PATH: false,

    // Path Interaction
    WAIT_TIME: 50,
    WEIGHT_LINEAR: true,
    WEIGHT_COUNT: false,

    // Pheromone Interaction
    PHEROMONE_DECAY: 0.001,
    SENSE_LINEAR: true,
    SENSE_LOG: false,
    SENSE_CONST: false,

    // Rate Equalization
    BALANCED_POP: true,
    BLUE_RATIO: 4,
    RATE_NULL: false,
    RATE_RANDOM: false,
    RATE_REPULSE: true,
    RATE_REPULSE_LINEAR: true,
    RATE_REPULSE_SIGMOID: false,
    RATE_REPULSE_STEP: false,
    RATE_REPULSE_STEP2: false,
    RATE_REPULSE_STEP4: false,
    RATE_WAIT_TIME: 60,
  };

  var root_ant_seed = params.ANT_SEED;

  // ------------------ Public Functions -------------------- //
  var getParams = function () {
    return params;
  };

  // Gets values from the param object and sets them in UI
  var setInputValues = function () {

    $('#in_output').attr('checked', params.SHOW_OUTPUT);

    $('#in_treeseed').val(params.TREE_SEED);
    $('#in_antseed').val(params.ANT_SEED);

    $('#in_savereport').attr('checked', params.SAVE_REPORT);
    $('#in_numruns').val(params.NUM_RUNS);
    $('#in_observations').val(params.NUM_OBSERVATIONS);
    $('#in_obsrate').val(params.OBSERVATION_RATE);
    $('#in_obslength').val(params.OBSERVATION_TIME);

    $('#in_treedepth').val(params.DEPTH);
    $('#in_fulldepth').val(params.FULL_TREE_DEPTH);
    $('#in_branchprob').val(params.CHILD_PROB);
    $('#in_foodprob').val(params.FOOD_PROB);
    $('#in_foodamount').val(params.MAX_FOOD);
    $('#in_fooddecay').val(params.FOOD_DECAY);
    $('#in_newfoodprob').val(params.NEW_FOOD_PROB);
    $('#in_clustered').attr('checked', params.CLUSTERED);

    $('#in_population').val(params.NEST_ANTS);
    $('#in_speed').val(params.ANT_SPEED);
    $('#in_initialpaths').attr('checked', params.INITIAL_PATH);
    $('#in_returntofood').attr('checked', params.RETURN_TO_FOOD);
    $('#in_pathswitch').val(params.SWITCH_PATH);
    $('#in_cansmell').attr('checked', params.CAN_SMELL);
    $('#in_scentradius').val(params.SCENT_RADIUS);

    $('#in_searching').val(params.SEARCHING);
    $('#in_recruitprob').val(params.RECRUIT_PROB);
    $('#in_stayhomefail').val(params.STAY_HOME_FAIL);
    $('#in_stayhomesuccess').val(params.STAY_HOME_SUCCESS);
    $('#in_nesttime').val(params.NEST_TIME);
    $('#in_givepath').attr('checked', params.GIVE_PATH);

    $('#in_waittime').val(params.WAIT_TIME);
    $('#in_decisionweighting').val(params.WEIGHT_LINEAR ? "Linear" : "Count");

    $('#in_decayrate').val(params.PHEROMONE_DECAY);
    $('#in_senseprofile').val(params.SENSE_LINEAR ? "Linear" : (params.SENSE_LOG ? "Log" : "Const"));

    $('#in_balancedpop').attr('checked', params.BALANCED_POP);
    $('#in_blueratio').val(params.BLUE_RATIO);
    $('#in_ratestrategy').val(params.RATE_RANDOM ? "Rand" : (params.RATE_REPULSE ? "Opp." : "Stay"));
    $('#in_oppprofile').val(params.RATE_REPULSE_LINEAR ? "Linear" :
    (params.RATE_REPULSE_SIG ? "Sig" :
      (params.RATE_REPULSE_STEP ? "Step" :
        (params.RATE_REPULSE_STEP2 ? "Step2" : "Step4"))));
    $('#in_ratewait').val(params.RATE_WAIT_TIME);

    $('#in_nestinteraction').attr('checked', params.NEST_INTERACTION);
    if (!params.NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide(250);
    } else {
    $('#div_nestinteraction').stop().show(250);
    }
    $('#in_pathinteraction').attr('checked', params.PATH_INTERACTION);
    if (!params.PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide(250);
    } else {
    $('#div_pathinteraction').stop().show(250);
    }
    $('#in_pheromone').attr('checked', params.PHEROMONE);
    if (!params.PHEROMONE) {
    $('#div_pheromone').stop().hide(250);
    } else {
    $('#div_pheromone').stop().show(250);
    }
    $('#in_initialpaths').attr('checked', params.INITIAL_PATH);
    if (!params.INITIAL_PATH) {
    $('#div_rateeq').stop().hide(250);
    } else {
    $('#div_rateeq').stop().show(250);
    }
  };

  var getInputValues = function () {
    params.TREE_SEED = $('#in_treeseed').val();
    params.ANT_SEED = $('#in_antseed').val();

    params.SAVE_REPORT = $('#in_savereport').is(':checked');
    params.NUM_RUNS = Number($('#in_numruns').val());
    params.NUM_OBSERVATIONS = Number($('#in_observations').val());
    params.OBSERVATION_RATE = Number($('#in_obsrate').val());
    params.OBSERVATION_TIME = Number($('#in_obslength').val());

    params.DEPTH = $('#in_treedepth').val();
    params.FULL_TREE_DEPTH = $('#in_fulldepth').val();
    params.CHILD_PROB = $('#in_branchprob').val();
    params.FOOD_PROB = $('#in_foodprob').val();
    params.MAX_FOOD = $('#in_foodamount').val();
    params.FOOD_DECAY = $('#in_fooddecay').val();
    params.NEW_FOOD_PROB = $('#in_newfoodprob').val();
    params.CLUSTERED = $('#in_clustered').is(':checked');

    params.NEST_ANTS = $('#in_population').val();
    params.ANT_SPEED = Number($('#in_speed').val());
    params.INITIAL_PATH = $('#in_initialpaths').is(':checked');
    params.RETURN_TO_FOOD = $('#in_returntofood').is(':checked');
    params.SWITCH_PATH = $('#in_pathswitch').val();
    params.CAN_SMELL = $('#in_cansmell').is(':checked');
    params.SCENT_RADIUS = $('#in_scentradius').val();

    params.NEST_INTERACTION = $('#in_nestinteraction').is(':checked');
    params.PATH_INTERACTION = $('#in_pathinteraction').is(':checked');
    params.PHEROMONE = $('#in_pheromone').is(':checked');

    params.SEARCHING = $('#in_searching').val();
    params.RECRUIT_PROB = $('#in_recruitprob').val();
    params.STAY_HOME_FAIL = $('#in_stayhomefail').val();
    params.STAY_HOME_SUCCESS = $('#in_stayhomesuccess').val();
    params.NEST_TIME = $('#in_nesttime').val();
    params.GIVE_PATH = $('#in_givepath').is(':checked');

    params.WAIT_TIME = Number($('#in_waittime').val());
    params.WEIGHT_LINEAR = $('#in_decisionweighting').val() == "Linear";
    params.WEIGHT_COUNT = $('#in_decisionweighting').val() == "Count";

    params.PHEROMONE_DECAY = Number($('#in_decayrate').val());
    params.SENSE_LINEAR = $('#in_senseprofile').val() == "Linear";
    params.SENSE_LOG = $('#in_senseprofile').val() == "Log";
    params.SENSE_CONST = $('#in_senseprofile').val() == "Const";

    params.BALANCED_POP = $('#in_balancedpop').is(':checked');
    params.BLUE_RATIO = Number($('#in_blueratio').val());
    params.RATE_STAY = $('#in_ratestrategy').val() == "Stay";
    params.RATE_RANDOM = $('#in_ratestrategy').val() == "Rand";
    params.RATE_REPULSE = $('#in_ratestrategy').val() == "Opp.";
    params.RATE_REPULSE_LINEAR = $('#in_oppprofile').val() == "Linear";
    params.RATE_REPULSE_SIGMOID = $('#in_oppprofile').val() == "Sig";
    params.RATE_REPULSE_STEP = $('#in_oppprofile').val() == "Step";
    params.RATE_REPULSE_STEP2 = $('#in_oppprofile').val() == "Step2";
    params.RATE_REPULSE_STEP4 = $('#in_oppprofile').val() == "Step4";
    params.RATE_WAIT_TIME = Number($('#in_ratewait').val());


    if (!params.NEST_INTERACTION) {
    $('#div_nestinteraction').stop().hide(250);
    } else {
    $('#div_nestinteraction').stop().show(250);
    }
    if (!params.PATH_INTERACTION) {
    $('#div_pathinteraction').stop().hide(250);
    } else {
    $('#div_pathinteraction').stop().show(250);
    }
    if (!params.PHEROMONE) {
    $('#div_pheromone').stop().hide(250);
    } else {
    $('#div_pheromone').stop().show(250);
    }
    if (!params.INITIAL_PATH) {
    $('#div_rateeq').stop().hide(250);
    } else {
    $('#div_rateeq').stop().show(250);
    }

    root_ant_seed = params.ANT_SEED;
  };

  var incrementSeed = function(_index) {
    params.ANT_SEED = root_ant_seed + '_' + _index;
    $('#in_antseed').val(params.ANT_SEED);
  };
  // Return public interface
  return { getParams:      getParams,
           setInputValues: setInputValues,
           getInputValues: getInputValues,
           incrementSeed:  incrementSeed };

}());
