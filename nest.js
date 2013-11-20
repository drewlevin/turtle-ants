function Nest(_num_ants, _num_scouts)
{
  var ant_index = 1;

  var num_ants = _num_ants;
  var num_scouts = _num_scouts;  

  var queued_ants = [];

  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    // The nest may send up to one ant out each step

    // First priority - clear the initial scout population
    while (num_scouts > 0 || (!NEST_INTERACTION && num_ants > 0)) {
      if (INITIAL_PATH) {
        if (Math.random() < .5) {
          this.queue(new Ant(ant_index, food_node_a));
          ant_index++;
        } else {
          this.queue(new Ant(ant_index, food_node_b));
          ant_index++;
        }
      } else {
        this.queue(new Ant(ant_index, null));
        ant_index++;
      }
      num_scouts--;
    }

    // Second priority - send out ants randomly based on the nest time parameter
    if (num_ants > 0) {
      var expected = (1.0 / NEST_TIME) * num_ants;
      var definite = Math.floor(expected);
      var extra = expected - definite;
      var leaving = definite + (Math.random() < extra ? 1 : 0);
      for (var i=0; i < leaving && num_ants > 0; i++) {
        this.queue(new Ant(ant_index, null));
        ant_index++;
      }
    }

    // Send out a max of one ant per timestep to help stagger them
    if (queued_ants.length > 0) {
      tree_ants.push(queued_ants.shift());
    }
  }
  
  this.queue = function(_ant) {
    queued_ants.push(_ant);
    num_ants--;
  }

  this.recruit = function(_ant) {
    var num_recruited = 0;
    for (var i=num_ants; i>0; i--) {
      num_recruited += Math.random() < RECRUIT_PROB ? 1 : 0;
    }
    if (GIVE_PATH) {
      for (var i=num_recruited; i>0; i--) {
        this.queue(new Ant(ant_index, _ant.dest));
        ant_index++;
      }
    }
    else {
      for (var i=num_recruited; i>0; i--) {
        this.queue(new Ant(ant_index, null));
        ant_index++;
      }
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
    ctx.fillText(Number(num_ants) + queued_ants.length, WIDTH/2 + NEST_RADIUS + 10, HEIGHT/2);
  }
  
  this.returnHome = function()
  {
    num_ants++;
  }
}
