function getDescription(element)
{
  id = element.attr('id');

  var title = '';
  var desc = '';
  var init = '';
  var min_range = element.attr('min');
  var max_range = element.attr('max');
  var range_link = ' to ';

  if (min_range == undefined) {
    min_range = '';
    max_range = '';
    range_link = '';
  }
  else if (max_range == undefined) {
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
      init = '0.6';
      break;
    case 'in_foodprob':
      title = 'Food Probability';
      desc = 'The probability that there will be food at any given leaf.';
      init = '0.35';
      break;
    case 'in_foodamount':
      title = 'Food Amount';
      desc = 'The amount of food in each food patch.  Each ant consumes one food per trip.';
      init = '1000';
      break;
    case 'in_population':
      title = 'Population';
      desc = 'The number of ants that start in the nest.';
      init = '1000';
      break;
    case 'in_searching':
      title = 'Searching Ant Population';
      desc = 'The number of ants that start out searching (only used in nest interaction).';
      init = '100';
      break;
    case 'in_speed':
      title = 'Ant Speed';
      desc = 'The distance an ant travels each timestep.  Each branch has length 1.';
      init = '0.01';
      break;
    case 'in_pathswitch':
      title = 'Path Switching Probability';
      desc = 'The probability that an ant will deviate from its path if it is returning to a known food location.';
      init = '0.001';
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
    case 'in_recruitstrength':
      title = 'Recruiting Strength';
      desc = 'If ant ant returns with food, this is the probability that it recruits a friend.  If the ant returns without food, this is the probability that the ant decides to stay home.';
      init = '0.75';
      break;
    case 'in_givepath':
      title = 'Give Path to Buddy';
      desc = 'Determines whether or not an ant can communicate its entire path when it has recruited a new ant to search with it.';
      init = 'true';
      break;
    case 'in_cansmell':
      title = 'Can Smell';
      desc = 'Sets whether ants can smell food from a few branches away or not.  If so, ants probabilistically alter their search towards the food.';
      init = 'false';
      break;
    case 'in_scentdecay':
      title = 'Scent Decay';
      desc = 'For every branch away from food, this is the fraction that the scent decays.';
      init = '0.9';
      break;
    case 'in_stayprob':
      title = 'Stay Probability';
      desc = 'The chance that an ant who is returning from a successful trip chooses to stay at an intersection and direct new ants towards the direction it came from.';
      init = '0.05';
      break;
    case 'in_interactprob':
      title = 'Interaction Probability';
      desc = 'The chance that an ant directing traffic has an effect on a foraging ant.';
      init = '0.75';
      break;
    case 'in_averagetime':
      title = 'Average Directing Time';
      desc = 'Average time that a directing ant will stay in place before continuing its journey home.';
      init = '100';
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
//        '<span class="italic">(' + range + ')</span>' +
        '<span class="italic">' + range + '</span>' +
    '</p>' + 
    '<p class="desc">' + desc + '</p><br/>' +
    '<p class="desc italic">Default: ' + init + '</p>';
  return text;
}