function Nest(_num_ants, _num_scouts)
{
  var num_ants = _num_ants;
  var num_scouts = _num_scouts;  

  var queued_ants = [];

  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    // The nest may send up to one ant out each step

    // First priority - clear the initial scout population
    if (num_scouts > 0 || (PATH_INTERACTION && num_ants > 0)) {
      if (INITIAL_PATH) {
        if (Math.random() < .5) {
          tree_ants.push(new Ant(food_node_a));
        } else {
          tree_ants.push(new Ant(food_node_b));
        }
        num_scouts--;
        num_ants--;        
      } else {
        tree_ants.push(new Ant());
        num_scouts--;
        num_ants--;
      }
    }

    // Second priority - send out new ants queued up by returning ants
    else if (NEST_INTERACTION && queued_ants.length > 0 && num_ants > 0) {
      // Remove ant from the front of the queue (array)
      var temp_ant = queued_ants.splice(0, 1);

      // Give path to the new ant
      if (GIVE_PATH) {
        tree_ants.push(new Ant(temp_ant.path));
      }
      // Don't give path to the new ant
      else {
        tree_ants.push(new Ant());
      }
      num_ants--;
    } 
  }
  
  this.queue = function(_ant) {
    queued_ants.push(_ant);
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
