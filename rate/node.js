function Node(_parent, _depth, _isRight) 
{
  this.parent = _parent;
  this.depth = _depth;
  this.isRight = _isRight;
  this.right = null;
  this.left = null;
  this.has_path_ant = false;

  this.weight = 1;
  this.width = 2 * Math.PI;
  this.food = 0;
  this.pheromone = 0;
  this.scent = false;
  this.scent_dist = 0;
  this.ants = 0;

  this.foodColor = '#3A5';
  
  this.theta = Math.PI/2;
  this.x = (WIDTH/2);
  this.y = (HEIGHT/2);
  this.text_x = this.x;
  this.text_y = this.y;

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

  this.getPath = function() {
    if (this.depth == 0) {
      return [];
    } else {
      var parent_path = this.parent.getPath();
      parent_path.push(this.isRight);
      return parent_path;
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
    _ctx.fillStyle = '#B93';
    _ctx.beginPath();
    _ctx.arc(this.x, this.y, NODE_DRAW_RADIUS+5, 0, Math.PI*2, true); 
    _ctx.closePath();
    _ctx.fill();  
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

    if (this.right != null) {
      this.right.draw();
    }
    if (this.left != null) {
      this.left.draw();
    }
  }
}
