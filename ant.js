function sense(p)
{
    //return ((-1/(1+Math.pow(2,-10*((Math.log(p+1)/Math.log(2))-12.0))))+1)*Math.log(p+1)/Math.log(2)+1;
    return ((-1/(1+Math.pow(2,-.001*(p-25000))))+1)*p+1;
}

function Ant(_dest)
{
  var path = (_dest == null) ? [] : _dest.getPath().slice(0);
  var origin = root;
  var dest = root;
  var dist = 0;
  var node_index = 0;
  var returning = false;
  var first = (_dest == null);

  this.color = (_dest != null) ? ((_dest.food > 0) ? _dest.foodColor : '#333') : '#333';
  
  if (first)
  {
    var r = sense(dest.right.pheromone);
    var l = sense(dest.left.pheromone);
    var d = Math.random() < r / (r + l);
    dest = d ? dest.right : dest.left;
    path.push(d);
  } else {
    dest = path[dest.depth] ? dest.right : dest.left;
  }

  dest.ants = dest.ants + 1;
  
  var x, y;

  this.update = function() 
  {
    dist += ANT_SPEED;

    // Searching Ants
    if (!returning) {    
      if (dest.isRight) {
        x = origin.out_right_x + dist * (dest.out_parent_x - origin.out_right_x);
        y = origin.out_right_y + dist * (dest.out_parent_y - origin.out_right_y);
      } else {
        x = origin.out_left_x + dist * (dest.out_parent_x - origin.out_left_x);
        y = origin.out_left_y + dist * (dest.out_parent_y - origin.out_left_y);
      }
      // At Node
      if (dist >= 1) {
        // Branch Node
        if (dest.right != null) {
          dest.ants = dest.ants - 1;
          origin = dest;
          if (first) {
            var r = sense(dest.right.pheromone);
            var l = sense(dest.left.pheromone);
            var d = Math.random() < r / (r + l);
            dest = d ? dest.right : dest.left;
            path.push(d);
          } else {
//            if (Math.random() < SWITCH_PATH) {
              first = true;
              path.splice(dest.depth, path.length - dest.depth - 1);
              var r = sense(dest.right.pheromone);
              var l = sense(dest.left.pheromone);
              var d = Math.random() < r / (r + l);
              dest = d ? dest.right : dest.left;
              path.push(d);              
//            } else {
//              dest = path[dest.depth] ? dest.right : dest.left;
//            }
          } 
          dest.ants = dest.ants + 1;     
        // Turn around   
        } else { 
          if (dest.food > 0) {
            this.found_food = true;
            dest.food--;           
            this.color = dest.foodColor;
          } else {
            this.found_food = false;
            this.color = '#333';
          }
        
          returning = true;
          first = false;
          
          var temp_origin = dest;
          dest = origin;
          origin = temp_origin;
          dist = 0;
          return false;
        }
        dist = 0;
      }
    // Returning Ants
    } else {
      if (this.found_food) {
        origin.pheromone = origin.pheromone + 1;
      }

      if (origin.isRight) {
        x = origin.in_parent_x + dist * (dest.in_right_x - origin.in_parent_x);
        y = origin.in_parent_y + dist * (dest.in_right_y - origin.in_parent_y);
      } else {
        x = origin.in_parent_x + dist * (dest.in_left_x - origin.in_parent_x);
        y = origin.in_parent_y + dist * (dest.in_left_y - origin.in_parent_y);
      }
      if (dist >= 1) {
        origin.ants = origin.ants - 1;
        if (dest.parent != null) {
          origin = dest;
          dest = dest.parent;
          origin.ants = origin.ants + 1;
        // Back at nest
        } else {
          if (Math.random() < STOP_SEARCHING)
          {
            nest.returnHome();
            return true;
          } else {
            origin = root;
            returning = false;
            dist = 0;
            if (Math.random() < SWITCH_PATH) {
              first = true;
              path = [];
              var d = Math.random() < .5;
              dest = d ? root.right : root.left;
              path.push(d);                            
            } else {
              dest = path[0] ? root.right : root.left;
            }
            dest.ants = dest.ants + 1;
          }
          return false;
        }
        dist = 0;
      }
    }
    return false;
  }
  
  this.draw = function()
  {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, ANT_RADIUS, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
  }
}
