function Nest(_num_ants, _num_scouts)
{
  var num_ants = _num_ants;
  var num_scouts = _num_scouts;  

  var queued_ants = [];

  var time = 0;
  
  var left_bin = 0;
  var right_bin = 0;  
  var left_return_array = [];
  var right_return_array = [];
  var left_length = 0;
  var right_length = 0;

  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    time++;

    // Update the return_arrays every 10s
    if (time % 10 === 0) {
      var left_point = [time, left_bin];
      var right_point = [time, right_bin];
      left_return_array.push(left_point);
      left_length++;
      right_return_array.push(right_point);
      right_length++;
      left_bin = 0;
      right_bin = 0;
    }

    // The nest may send up to one ant out each step

    // First priority - clear the initial scout population
    while (num_scouts > 0 || (!NEST_INTERACTION && num_ants > 0)) {
      if (INITIAL_PATH) {
        if (Math.random() < .5) {
          this.queue(new Ant(food_node_a));
        } else {
          this.queue(new Ant(food_node_b));
        }
      } else {
        this.queue(new Ant());
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
        this.queue(new Ant());
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
        this.queue(new Ant(_ant.dest));
      }
    }
    else {
      for (var i=num_recruited; i>0; i--) {
        this.queue(new Ant());
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
    ctx.fillText(num_ants + queued_ants.length, WIDTH/2 - 15, HEIGHT/2 + NEST_RADIUS - 40);
  }
  
  this.returnHome = function(_ant) 
  {
    // If true, the ant came from the right
    if (_ant.path[0]) {
      right_bin++;
    }
    // Otherwise, it came from the left
    else {
      left_bin++;
    }
  }

  this.stayHome = function()
  {
    num_ants++;
  }

  this.getRateSeries = function(_side, _len)
  {
    var a = _side ? right_return_array : left_return_array;
    var a_len = _side ? right_length : left_length;
    var return_len = Math.min(a_len, _len);

    return [ a.slice(a_len - return_len) ];
  }
}
