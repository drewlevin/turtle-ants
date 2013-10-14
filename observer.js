function Observer(_id, _edge) {
  this.id = _id;
  this.edge = _edge;
  this.div = null;
  this.flot = null;

  var SMOOTH_LENGTH = 20;

  var time = 0;

  var outgoing_bin = 0;
  var incoming_bin = 0;

  var outgoing_length = 0;
  var incoming_length = 0;
  
  var outgoing = [];
  var incoming = [];
  var outgoing_smoothed = [];
  var incoming_smoothed = [];

  this.addOutgoing = function()
  {
    outgoing_bin++;
  }

  this.addIncoming = function()
  {
    incoming_bin++;
  }

  this.update = function() 
  {
    time++;

    // Update the every 10s
    if (time % 10 === 0) {
      var outgoing_smoothed_point;
      var incoming_smoothed_point;

      var outgoing_point = [time, outgoing_bin];
      var incoming_point = [time, incoming_bin];

      outgoing.push(outgoing_point);
      outgoing_length++;

      incoming.push(incoming_point);
      incoming_length++;

      if (incoming_length == 1) {
        incoming_smoothed_point = [time, incoming_bin / SMOOTH_LENGTH];
        outgoing_smoothed_point = [time, outgoing_bin / SMOOTH_LENGTH];
      }
      else if (incoming_length <= SMOOTH_LENGTH) {
        incoming_smoothed_point = [time, incoming_smoothed[incoming_length-2][1] + incoming_bin / SMOOTH_LENGTH];
        outgoing_smoothed_point = [time, outgoing_smoothed[outgoing_length-2][1] + outgoing_bin / SMOOTH_LENGTH];
      }
      else {
//console.log(incoming_length, incoming, incoming_smoothed);
        incoming_smoothed_point = 
          [time, incoming_smoothed[incoming_length-2][1] + (incoming_bin - incoming[incoming_length-SMOOTH_LENGTH-1][1]) / SMOOTH_LENGTH];
        outgoing_smoothed_point = 
          [time, outgoing_smoothed[outgoing_length-2][1] + (outgoing_bin - outgoing[outgoing_length-SMOOTH_LENGTH-1][1]) / SMOOTH_LENGTH];
      }

      incoming_smoothed.push(incoming_smoothed_point);
      outgoing_smoothed.push(outgoing_smoothed_point);

      outgoing_bin = 0;
      incoming_bin = 0;
    }
  }

  this.getOutgoingSeries = function(_len)
  {
    var return_len = Math.min(outgoing_length, _len);
    return outgoing.slice(outgoing_length - return_len);
  }

  this.getIncomingSeries = function(_len)
  {
    var return_len = Math.min(incoming_length, _len);
    return incoming.slice(incoming_length - return_len);
  }

  this.getOutgoingSmoothed = function(_len)
  {
    var return_len = Math.min(outgoing_length, _len);
    return outgoing_smoothed.slice(outgoing_length - return_len);
  }

  this.getIncomingSmoothed = function(_len)
  {
    var return_len = Math.min(incoming_length, _len);
    return incoming_smoothed.slice(incoming_length - return_len);
  }

  this.createDiv = function(_index)
  {
    var top = 45+(175*_index);

    this.div = $('<div></div>', {'class': 'output_container'}).css({'top': top+'px'});

    $('<h4>Observer '+this.id+'</h4>').appendTo(this.div);

    var img = $('<img/>', {'src': 'img/close_large.png', 'class': 'img_close'}).appendTo(this.div);
    img.hover(function() { $(this).attr('src', 'img/close_hover_large.png'); },
              function() { $(this).attr('src', 'img/close_large.png'); });
    img.click(generateRemoveCall(this.id));

    this.flot = $('<div></div>', {'class': 'flot'}).appendTo(this.div);

    if (SHOW_OUTPUT) {
      this.div.appendTo('#output');
    }
  }

  function generateRemoveCall(_id) {
    return function() { removeObserver(_id) };
  }
}
