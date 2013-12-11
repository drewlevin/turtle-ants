var date = new Date();

function sqr(x) { return x * x; }
function dist2(_x1, _y1, _x2, _y2) { return sqr(_x1-_x2) + sqr(_y1-_y2); }

function Node(_parent, _depth, _isRight) 
{
  this.parent = _parent;
  this.depth = _depth;
  this.isRight = _isRight;
  this.right = null;
  this.left = null;

  this.waiting_array = [];

  this.observer = null;

  this.weight = 1;
  this.width = 2 * Math.PI;
  this.food = 0;
  this.pheromone = 0;
  this.scent = false;
  this.scent_dist = 0;
  this.ants = 0;

  this.foodColor = '#3A5';
  
  this.theta = 0;
  this.x = (WIDTH/2);
  this.y = (HEIGHT/2);
  this.text_x = this.x;
  this.text_y = this.y;
  this.observation_x1 = this.x;
  this.observation_y1 = this.y;
  this.observation_x2 = this.x;
  this.observation_y2 = this.y;

  this.out_parent_x = WIDTH/2;
  this.out_parent_y = HEIGHT/2;
  this.out_right_x = WIDTH/2;
  this.out_right_y = HEIGHT/2;
  this.out_left_x = WIDTH/2;
  this.out_left_y = HEIGHT/2;
  this.in_parent_x = WIDTH/2;
  this.in_parent_y = HEIGHT/2;
  this.in_right_x = WIDTH/2;
  this.in_right_y = HEIGHT/2;
  this.in_left_x = WIDTH/2;
  this.in_left_y = HEIGHT/2;

  var decay = 0;

  this.contains = function(_x, _y) 
  {
    return (Math.pow(this.x - _x, 2) + Math.pow(this.y - _y, 2) <= 
      Math.pow(NODE_RADIUS, 2));
  }

  this.edgeContains = function(_x, _y)
  {
    var dist;
    // rule out the root
    if (this.parent != null) {
      var l2 = dist2(this.x, this.y, this.parent.x, this.parent.y);
      if (l2 == 0) { 
        dist = dist2(_x, _y, this.x, this.y);
      }
      else {
        var t = ((_x - this.x) * (this.parent.x - this.x) + (_y - this.y) * (this.parent.y - this.y)) / l2;
        if (t < 0) dist = dist2(_x, _y, this.x, this.y);
        else if (t > 1) dist = dist2(_x, _y, this.parent.x, this.parent.y);
        else dist = dist2(_x, _y, this.x + t * (this.parent.x-this.x), this.y + t * (this.parent.y-this.y));
      }
      return dist <= BRANCH_RADIUS * BRANCH_RADIUS;
    }
    return false;
  }

  this.getPath = function() {
    if (this.depth == 0) {
      return [];
    } else {
      var parent_path = this.parent.getPath();
      parent_path.push(this.isRight);
      return parent_path;
    }
  }

  this.getChild = function(_path) {
    if (_path.length == 0) {
      return this;
    }
    else {
      return _path.shift() ? this.right.getChild(_path) : this.left.getChild(_path);
    }
  }

  this.update = function()
  {
    if (this.food > 0) {
      decay += Number(FOOD_DECAY);
      while (decay >= 1 && this.food > 0) {
        this.food -= 1;
        decay -= 1;
      }
    }

    if (this.food == 0 && this.right === null && this.left === null) {
      if (Math.random() < NEW_FOOD_PROB) {
        this.food = MAX_FOOD;
      }
    }

    if (PHEROMONE && this.pheromone > 0) {
      this.pheromone = this.pheromone * (1 - PHEROMONE_DECAY);
    }

    if (this.right != null) {
      this.right.update();
    }
    if (this.left != null) {
      this.left.update();
    }

    // Check for smell updates after the child updates so scent can percolate
    if (CAN_SMELL) {
      if (this.right == null) {
        this.scent = this.food > 0;
        this.scent_dist = 1;
      }
      else {
        this.scent = ((this.right.scent && this.right.scent_dist + 1 <= SCENT_RADIUS) || 
                      (this.left.scent && this.left.scent_dist + 1 <= SCENT_RADIUS));
        if (this.scent) {
          if (this.right.scent && this.left.scent) {
            this.scent_dist = Math.min(this.right.scent_dist + 1, this.left.scent_dist + 1);
          }
          else if (this.right.scent) {
            this.scent_dist = this.right.scent_dist + 1;
          }
          else if (this.left.scent) {
            this.scent_dist = this.left.scent_dist + 1;
          }
          else {
            this.scent = false;
          }
        }
      }
    }

    if (this.observer != null) {
      this.observer.update();
    }
  }

  this.initObservers = function() {
    if (this.observer != null) {
      this.observer.init();
    }
    if (this.right != null) {
      this.right.initObservers();
    }
    if (this.left != null) {
      this.left.initObservers();
    }
  };

  this.signalReturn = function(_dir, _food) 
  {
    for (var a=0; a<this.waiting_array.length; a++) {
      if (_food) {
        if (_dir) {
          this.waiting_array[a].right_count++;
        }
        else {
          this.waiting_array[a].left_count++;
        }
      }
    }
  }

  this.addWatcher = function(_ant)
  {
    this.waiting_array.push(_ant);
  }

  this.removeWatcher = function(_id)
  {
    var temp = -1;
    for (var i=0; i<this.waiting_array.length; i++) {
	if (this.waiting_array[i].id == _id) {
	    temp = i;
	    break;
	}
    }  
    this.waiting_array.splice(temp, 1);
  }

  this.drawTree = function(_ctx)
  {
    if (this.right != null)
    {
      _ctx.lineWidth = BRANCH_WIDTH;
      _ctx.strokeStyle = "rgb(100, 80, 30)";
      _ctx.beginPath();
      _ctx.moveTo(this.x, this.y);
      _ctx.lineTo(this.right.x, this.right.y);
      _ctx.stroke();
      this.right.drawTree(_ctx);
    }
    if (this.left != null)
    {
      _ctx.lineWidth = BRANCH_WIDTH;
      _ctx.strokeStyle = "rgb(100, 80, 30)";
      _ctx.beginPath();
      _ctx.moveTo(this.x, this.y);
      _ctx.lineTo(this.left.x, this.left.y);
      _ctx.stroke();
      this.left.drawTree(_ctx);
    }
    
    _ctx.fillStyle = '#862';
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_DRAW_RADIUS, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();
  }
  
  this.drawSelected = function(_ctx)
  {
    _ctx.fillStyle = "rgb(60, 160, 200)";
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_RADIUS, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();  

    _ctx.fillStyle = '#862';
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_DRAW_RADIUS, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();  
  }

  this.drawSelectedEdge = function(_ctx)
  {
//    var t = date.getMilliseconds() / 1000.0;

    _ctx.lineWidth = BRANCH_RADIUS;
    _ctx.strokeStyle = "rgb(60, 160, 200)";
    _ctx.beginPath();
    _ctx.moveTo(this.x, this.y);
    _ctx.lineTo(this.parent.x, this.parent.y);
    _ctx.stroke();

    _ctx.lineWidth = BRANCH_WIDTH;
    _ctx.strokeStyle = "rgb(100, 80, 30)";
    _ctx.beginPath();
    _ctx.moveTo(this.x, this.y);
    _ctx.lineTo(this.parent.x, this.parent.y);
    _ctx.stroke();
  }

  this.draw = function()
  {
    // Draw pheromone trails
    if (PHEROMONE && this.pheromone > 0) 
    {      
      var scale = Math.log(this.pheromone) / Math.log(10);
      scale = Math.max(Math.min(scale, 3.5), 0.0) / 3.5;

      ctx.lineWidth = BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(" + Math.floor(100+(scale*150)) + 
                          ", " + Math.floor(80+(scale*120))  + 
                          ", " + Math.floor(30+(scale*45)) + ")";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.parent.x, this.parent.y);
      ctx.stroke();
    }

    // Draw food scent trails
    if (!PHEROMONE && CAN_SMELL && this.scent && this.parent != null) 
    {
      ctx.lineWidth = BRANCH_WIDTH;
      ctx.strokeStyle = "rgb(145, 160, 80)";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.parent.x, this.parent.y);
      ctx.stroke();
    }

    // Draw food
    if (this.food > 0) {
      ctx.fillStyle = this.foodColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, NODE_DRAW_RADIUS + (this.food / (MAX_FOOD / FOOD_DRAW_RADIUS)), 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();  
    }

    // Show the number of ants on the current branch
    if (SHOW_ANT_COUNT) {
      ctx.fillStyle = '#777';
      ctx.font = 'bold 14px ariel';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.ants, this.text_x, this.text_y);
    }

    // Draw an observation station
    if (this.observer != null) {
      if (this.observer.id != 0) {
        ctx.lineWidth = BRANCH_WIDTH;
        ctx.strokeStyle = "rgb(63, 63, 255)";
        ctx.beginPath();
        ctx.moveTo(this.observation_x1, this.observation_y1);
        ctx.lineTo(this.observation_x2, this.observation_y2);
        ctx.stroke();

        // Draw eye icon and id
        ctx.drawImage(eye_icon, this.observation_x1-8, this.observation_y1-8);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px ariel';
        ctx.textBaseline = 'middle';
        // place the id in the correct quadrant
        var width_correction = Math.floor(Math.log(this.observer.id)/Math.LN10) * 4;

        if (this.observation_x1 > this.observation_x2) {
          if (this.observation_y1 > this.observation_y2) {
            ctx.fillText(this.observer.id, this.observation_x1+8-width_correction, this.observation_y1+8);
          }
          else {
            ctx.fillText(this.observer.id, this.observation_x1+8-width_correction, this.observation_y1-8);
          }
        }
        else
        {
          if (this.observation_y1 > this.observation_y2) {
            ctx.fillText(this.observer.id, this.observation_x1-12-width_correction, this.observation_y1+8);
          }
          else {
            ctx.fillText(this.observer.id, this.observation_x1-12-width_correction, this.observation_y1-8);
          }
        }
      }
    }

    if (this.right != null) {
      this.right.draw();
    }
    if (this.left != null) {
      this.left.draw();
    }
  }
}
