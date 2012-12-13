function getDescription(id)
{
  var title = '';
  var range = '';
  var desc = '';
  var init = '';
  switch(id)
  {
    case 'in_treedepth':
      title = 'Tree Depth';
      range = '3 to 10';
      desc = 'Sets the maximum depth of the branching tree';
      init = '10';
      break;
    default:
      title = '<p class="title">Error</p>';
      desc = '<p class="desc">' + id + '</p>';
  }
  var text =
    '<p class="title">' +
        '<span class="bold">' + title + ': </span>' + 
        '<span class="italic">(' + range + ')</span>' +
    '</p>' + 
    '<p class="desc">' + desc + '</p><br/>' +
    '<p class="desc italic">Default: ' + init + '</p>';
  return text;
}
