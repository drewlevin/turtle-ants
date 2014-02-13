function Nest(_num_ants, _num_scouts)
{
  var ant_index = 1;

  var num_ants = _num_ants;
  var num_scouts = _num_scouts;  

  var queued_ants = [];

  if (INITIAL_PATH)
    placeInitial();

  function placeInitial()
  {
    var place_num_a;
    var place_num_b;
    var len_a = food_node_a.depth;
    var len_b = food_node_b.depth;
    var a_path = food_node_a.getPath();
    var b_path = food_node_b.getPath();

    // Total number of ants to place on the tree
    var initial_ants = NEST_INTERACTION ? num_scouts : num_ants;

    // Get the ant densities for the two initial paths
    if (BALANCED_POP) {
      place_num_a = initial_ants / 4;
      place_num_b = initial_ants / 4;
    }
    else {
      place_num_a = initial_ants / 6;
      place_num_b = initial_ants / 3;
    }

    // Place the ants with a uniform distribution
    var origin;
    var dest;
    var ant;
    // Place the path a ants
    for (var i=0; i<place_num_a; i++) {
      // One Outgoing
      pos = len_a * Math.random();
      origin = root;
      for (var j=0; j<pos-1; j++) {
        origin = a_path[j] ? origin.right : origin.left;
      }
      dest = a_path[Math.floor(pos)] ? origin.right : origin.left;

      ant = new Ant(ant_index, food_node_a);
      ant.origin = origin;
      ant.dest = dest;
      ant.dist = pos - Math.floor(pos);
      ant_index++;

      tree_ants.push(ant);

      // And one returning;
      pos = len_a * Math.random();
      dest = root;
      for (var j=0; j<pos-1; j++) {
        dest = a_path[j] ? dest.right : dest.left;
      }
      origin = a_path[Math.floor(pos)] ? dest.right : dest.left;

      ant = new Ant(ant_index, food_node_a);
      ant.origin = origin;
      ant.dest = dest;
      ant.dist = pos - Math.floor(pos);
      ant.found_food = true;
      ant.returning = true;
      ant_index++;

      tree_ants.push(ant);
    }

    // place the path b ants
    for (var i=0; i<place_num_b; i++) {
      // One Outgoing
      pos = len_b * Math.random();
      origin = root;
      for (var j=0; j<pos-1; j++) {
        origin = b_path[j] ? origin.right : origin.left;
      }
      dest = b_path[Math.floor(pos)] ? origin.right : origin.left;

      ant = new Ant(ant_index, food_node_b);
      ant.origin = origin;
      ant.dest = dest;
      ant.dist = pos - Math.floor(pos);
      ant_index++;

      tree_ants.push(ant);

      // And one returning;
      pos = len_b * Math.random();
      dest = root;
      for (var j=0; j<pos-1; j++) {
        dest = b_path[j] ? dest.right : dest.left;
      }
      origin = b_path[Math.floor(pos)] ? dest.right : dest.left;

      ant = new Ant(ant_index, food_node_b);
      ant.origin = origin;
      ant.dest = dest;
      ant.dist = pos - Math.floor(pos);
      ant.found_food = true;
      ant.returning = true;
      ant_index++;

      tree_ants.push(ant);
    }

    num_scouts = 0;
    num_ants -= initial_ants;
  }

  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    // First priority - clear the initial scout population
    while (num_scouts > 0 || (!NEST_INTERACTION && num_ants > 0)) {
      this.queue(new Ant(ant_index, null));
      ant_index++;
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
