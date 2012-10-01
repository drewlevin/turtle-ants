function Nest(_num_ants)
{
  var num_ants = _num_ants;
  
  this.getNum = function() { return num_ants; }
  
  this.update = function()
  {
    if (Math.random() < LEAVE_PROB * num_ants) {
      if (Math.random() < .5) {
        tree_ants.push(new Ant(food_node_a));
      } else {
        tree_ants.push(new Ant(food_node_b));
      }
      num_ants--;        
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
    ctx.fillText(num_ants, WIDTH/2 + NEST_RADIUS + 10, HEIGHT/2);

  }
  
  this.returnHome = function()
  {
    num_ants++;
  }
}
