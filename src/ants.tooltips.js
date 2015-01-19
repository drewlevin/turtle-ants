/*
 * Ants.tooltips.js
 * Tooltip Object
 *   - Contains tooltip text for html parameter hover display.
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.tooltips = (function () {

  // ------------------ Private Functions -------------------- //
  function getDescription (element) {
    id = element.attr('id');

    var title = '';
    var desc = '';
    var init = '';
    var min_range = element.attr('min');
    var max_range = element.attr('max');
    var range_link = ' to ';

    if (min_range === undefined) {
      min_range = '';
      max_range = '';
      range_link = '';
    }
    else if (max_range === undefined) {
      min_range = '(' + min_range;
      range_link = ' and up';
      max_range = ')';
    }
    else {
      min_range = '(' + min_range;
      max_range = max_range + ')';
    }

    var range = min_range + range_link + max_range;

    switch(id)
    {
      case 'in_treeseed':
        title = 'Tree RNG Seed';
        desc = 'Sets the initial seed for the random number generator that generates the tree.';
        init = 'Ants!';
        break;
      case 'in_antseed':
        title = 'Ant RNG Seed';
        desc = 'Sets the initial seed for the random number generator that governs ant behavior.';
        init = 'Ants!';
        break;
      case 'in_savereport':
        title = 'Generate Report';
        desc = 'Toggles the generation and saving of a text file report of the results.';
        init = '60';
        break;
      case 'in_numruns':
        title = 'Number of Model Runs';
        desc = 'The number of model runs used to calculate variance.';
        init = '5';
        break;
      case 'in_observations':
        title = 'Observations';
        desc = 'Sets the total number of obsrevations taken.  The model will automatically stop after the last observation unless this value is set to 0.';
        init = '0';
        break;
      case 'in_obsrate':
        title = 'Observation Interval';
        desc = 'Sets the interval at which observations are taken (i.e. every N time steps).';
        init = '600';
        break;
      case 'in_obslength':
        title = 'Duration of Observation';
        desc = 'Controls over what period of time a single observation is taken';
        init = '60';
        break;
      case 'in_treedepth':
        title = 'Tree Depth';
        desc = 'Sets the maximum depth of the branching tree.';
        init = '10';
        break;
      case 'in_fulldepth':
        title = 'Full Depth';
        desc = 'The depth of the tree guaranteed to be fully branching.';
        init = '4';
        break;
      case 'in_branchprob':
        title = 'Branching Probability';
        desc = 'The probability that the tree continues to brach at each level once past the full branching depth.';
        init = '0.5';
        break;
      case 'in_foodprob':
        title = 'Food Probability';
        desc = 'The probability that there will be food at any given leaf.';
        init = '0.25';
        break;
      case 'in_foodamount':
        title = 'Food Amount';
        desc = 'The amount of food in each food patch.  Each ant consumes one food per trip.';
        init = '500';
        break;
      case 'in_fooddecay':
        title = 'Food Decay';
        desc = 'Each food patch decreases linearly by this amount each time step.';
        init = '0.25';
        break;
      case 'in_newfoodprob':
        title = 'New Food Probability';
        desc = 'Each empty leaf node has this probability of growing a new full food patch each time step';
        init = '0.00001';
        break;
      case 'in_clustered':
        title = 'Food Clustering';
        desc = 'Determines whether or not food is spatially clustered.';
        init = 'false';
        break;
      case 'in_population':
        title = 'Population';
        desc = 'The number of ants that start in the nest.';
        init = '1000';
        break;
      case 'in_speed':
        title = 'Ant Speed';
        desc = 'The distance an ant travels each timestep.  Each branch has length 1.';
        init = '0.01';
        break;
      case 'in_initialpaths':
        title = 'Initial Paths';
        desc = 'Toggles whether to create two default paths (red and blue) at the beginning of the simulation.';
        init = 'false';
        break;
      case 'in_returntofood':
        title = 'Return to Food';
        desc = 'Toggles whether or not ants remember their full path when they find food.';
        init = 'false';
        break;
      case 'in_pathswitch':
        title = 'Path Switching Probability';
        desc = 'The probability that an ant will deviate from its path if it is returning to a known food location.';
        init = '0.001';
        break;
      case 'in_cansmell':
        title = 'Can Smell';
        desc = 'Sets whether ants can smell food from a few branches away or not.  If so, ants probabilistically alter their search towards the food.';
        init = 'false';
        break;
      case 'in_scentradius':
        title = 'Scent Radius';
        desc = 'How many branches away ants can smell food';
        init = '1';
        break;
      case 'in_searching':
        title = 'Searching Ant Population';
        desc = 'The number of ants that start out searching (only used in nest interaction).';
        init = '100';
        break;
      case 'in_recruitprob':
        title = 'Recruiting Probability';
        desc = 'If ant ant returns with food, it interacts with each ant in the nest and stimulates them to leave the nest with this probability (per ant).';
        init = '0.75';
        break;
      case 'in_stayhome':
        title = 'Stay Home after Fail';
        desc = 'If an ant returns to the nest without food, it will stop searching with this probability.';
        init = '0.75';
        break;
      case 'in_nesttime':
        title = 'Average Time in Nest';
        desc = 'The average amount of timesteps each non-searching ant stays inside the nest before venturing out again.';
        init = '100,000';
        break;
      case 'in_givepath':
        title = 'Share Path with Recruits';
        desc = 'Determines whether or not an ant can communicate its entire path when it has recruited a new ant to search.  When enabled, also enables the "Remember Path" checkbox.';
        init = 'false';
        break;
      case 'in_waittime':
        title = 'Time Spent Wwatching';
        desc = 'The time take to watch at an intersection before choosing a direction.';
        init = '50';
        break;
      case 'in_decisionweighting':
        title = 'How population counts are compared.';
        desc = 'The function used to weight the counts of returning ants from the two differen trails.';
        init = 'Linear';
        break;
      case 'in_decayrate':
        title = 'Decay Rate';
        desc = 'The fraction of the pheromone that decays each timestep.';
        init = '0.001';
        break;
      case 'in_senseprofile':
        title = 'Sense Profile';
        desc = 'Determines whether the strength of the pheromone is determined by a linear transformation or a logarithmic transformation.';
        init = 'Linear';
        break;
      default:
        title = '<p class="title">Error</p>';
        desc = '<p class="desc">' + id + '</p>';
    }

    var text =
      '<p class="title">' +
          '<span class="bold">' + title + ': </span>' +
          '<span class="italic">' + range + '</span>' +
      '</p>' +
      '<p class="desc">' + desc + '</p><br/>' +
      '<p class="desc italic">Default: ' + init + '</p>';

    return text;
  }

  // ------------------ Public Functions -------------------- //
  var init = function () {
    // Get canvas position
    pos = $('#canvas').position();

    // Create a default documentation div (originally display: none)
    $('<div id="documentation"></div>').css({
      "top": (pos.top + 50) + "px",
      "left": (pos.left + 435) + "px"
    }).prependTo($('#main_container'));

    // Attach the hover action to all objects that have tooltips (.hoverdoc)
    $('.hoverdoc').hover(
      function() {
        pos = $(this).position();
        element = $(this).next().children('select, input');
        $('#documentation').html(getDescription(element));
        $('#documentation').css("top", pos.top);
        $('#documentation').stop(true, true).fadeIn(150);
      },
      function() {
        $('#documentation').css("top", pos.top);
        $('#documentation').stop(true, true).fadeOut(150);
      }
    );
  };

  // Return public interface
  return { init: init };

}());
