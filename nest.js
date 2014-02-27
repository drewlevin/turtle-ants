function Nest(_num_ants, _num_scouts)
{
  var ant_index = 1;

  var num_ants = _num_ants;
  var num_scouts = _num_scouts;  

  var queued_ants = [];

  if (INITIAL_PATH)
    placeInitial();

  function shuffle(o){ //v1.0
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
  };

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

    var path_time_a = len_a / ANT_SPEED;
    var path_time_b = len_b / ANT_SPEED;

    // Get the ant populations for the two initial paths
    if (BALANCED_POP) {
      place_num_a = initial_ants / 2;
      place_num_b = initial_ants / 2;
    }
    else {
      place_num_a = initial_ants / 3;
      place_num_b = 2 * initial_ants / 3;
    }

    // Place the ants with a uniform distribution
    var origin;
    var dest;
    var ant;
    // Place the path a ants
    for (var i=0; i<place_num_a; i++) {
      group = Math.random();
      pos = Math.random();
      // Add to waiting at the nest group
      if (group < RATE_WAIT_TIME / (RATE_WAIT_TIME + 2*path_time_a)) {
        ant = new Ant(ant_index, food_node_a);
        ant.origin = root;
        ant.dest = root;
        ant.dist = 1.0;
        ant.setPosition();
        ant.watching = true;
        ant.watching_time = Math.floor(pos*RATE_WAIT_TIME);
        root.addWatcher(ant);
        ant_index++;

        tree_ants.push(ant);
      }
      // Add to outgoing group
      else if (group < (RATE_WAIT_TIME+path_time_a) / (RATE_WAIT_TIME + 2*path_time_a)) {
        pos *= len_a;
        origin = root;
        for (var j=0; j<pos-1; j++) {
          origin = a_path[j] ? origin.right : origin.left;
        }
        dest = a_path[Math.floor(pos)] ? origin.right : origin.left;

        ant = new Ant(ant_index, food_node_a);
        ant.origin = origin;
        ant.dest = dest;
        ant.dist = pos - Math.floor(pos);
        ant.setPosition();
        ant_index++;

        tree_ants.push(ant);
      }
      // Add to incoming group
      else {
        pos *= len_a;
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
        ant.setPosition();
        ant_index++;

        tree_ants.push(ant);
      }
    }

    // place the path b ants
    for (var i=0; i<place_num_b; i++) {
      group = Math.random();
      pos = Math.random();
      // Add to waiting at the nest group
      if (group < RATE_WAIT_TIME / (RATE_WAIT_TIME + 2*path_time_b)) {
        ant = new Ant(ant_index, food_node_b);
        ant.origin = root;
        ant.dest = root;
        ant.dist = 1.0;
        ant.setPosition();
        ant.watching = true;
        ant.watching_time = Math.floor(pos*RATE_WAIT_TIME);
        root.addWatcher(ant);
        ant_index++;

        tree_ants.push(ant);
      }
      // Add to outgoing group
      else if (group < (RATE_WAIT_TIME+path_time_b) / (RATE_WAIT_TIME + 2*path_time_b)) {
        pos *= len_b;
        origin = root;
        for (var j=0; j<pos-1; j++) {
          origin = b_path[j] ? origin.right : origin.left;
        }
        dest = b_path[Math.floor(pos)] ? origin.right : origin.left;

        ant = new Ant(ant_index, food_node_b);
        ant.origin = origin;
        ant.dest = dest;
        ant.dist = pos - Math.floor(pos);
        ant.setPosition();
        ant_index++;

        tree_ants.push(ant);
      }
      // Add to incoming group
      else {
        pos *= len_b;
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
        ant.setPosition();
        ant_index++;

        tree_ants.push(ant);
      }
    }

    shuffle(tree_ants);

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
