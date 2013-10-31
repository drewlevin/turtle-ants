function Observer(_id, _edge) {
  this.id = _id;
  this.edge = _edge;
  this.div = null;
  this.flot = null;

  var BIN_SIZE = 10;
  var SMOOTH_LENGTH = 20;

  var outgoing_bin = 0;
  var incoming_bin = 0;

  var outgoing_length = 0;
  var incoming_length = 0;
  
  var outgoing = [];
  var incoming = [];
  var outgoing_total = [];
  var incoming_total = [];
  var outgoing_smoothed = [];
  var incoming_smoothed = [];

  this.init = function() 
  {
    outgoing_bin = 0;
    incoming_bin = 0;

    outgoing_length = 0;
    incoming_length = 0;
    
    outgoing = [];
    incoming = [];
    outgoing_total = [];
    incoming_total = [];
    outgoing_smoothed = [];
    incoming_smoothed = [];
  }

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
    // Update the arrays every BIN_SIZE seconds
    if (TIME % BIN_SIZE === 0) {
      var outgoing_smoothed_point;
      var incoming_smoothed_point;

      var outgoing_point = [TIME, outgoing_bin];
      var incoming_point = [TIME, incoming_bin];

      var outgoing_total_point = outgoing_length === 0 ? 
            [TIME, outgoing_bin] :
            [TIME, outgoing_total[outgoing_length-1][1] + outgoing_bin];
      var incoming_total_point = incoming_length === 0 ?
            [TIME, incoming_bin] :
            [TIME, incoming_total[incoming_length-1][1] + incoming_bin];

      outgoing.push(outgoing_point);
      outgoing_length++;

      incoming.push(incoming_point);
      incoming_length++;

      outgoing_total.push(outgoing_total_point);
      incoming_total.push(incoming_total_point);

      if (incoming_length == 1) {
        incoming_smoothed_point = [TIME, incoming_bin / SMOOTH_LENGTH];
        outgoing_smoothed_point = [TIME, outgoing_bin / SMOOTH_LENGTH];
      }
      else if (incoming_length <= SMOOTH_LENGTH) {
        incoming_smoothed_point = [TIME, incoming_smoothed[incoming_length-2][1] + incoming_bin / SMOOTH_LENGTH];
        outgoing_smoothed_point = [TIME, outgoing_smoothed[outgoing_length-2][1] + outgoing_bin / SMOOTH_LENGTH];
      }
      else {
//console.log(incoming_length, incoming, incoming_smoothed);
        incoming_smoothed_point = 
          [TIME, incoming_smoothed[incoming_length-2][1] + (incoming_bin - incoming[incoming_length-SMOOTH_LENGTH-1][1]) / SMOOTH_LENGTH];
        outgoing_smoothed_point = 
          [TIME, outgoing_smoothed[outgoing_length-2][1] + (outgoing_bin - outgoing[outgoing_length-SMOOTH_LENGTH-1][1]) / SMOOTH_LENGTH];
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

  this.getOutgoingTotal = function(_len)
  {
    var return_len = Math.min(outgoing_length, _len);
    return outgoing_total.slice(outgoing_length - return_len);
  }

  this.getIncomingTotal = function(_len)
  {
    var return_len = Math.min(incoming_length, _len);
    return incoming_total.slice(incoming_length - return_len);
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

  this.getOutgoingCount = function(_start, _stop) { 
    if (_start < BIN_SIZE || _stop > TIME) {
      return 0;
    }
    var start_index = Math.floor(_start / BIN_SIZE)-1;
    var stop_index = Math.floor(_stop / BIN_SIZE)-1;
    var acc = 0;
    for (var i=start_index; i<stop_index; i++) {
      acc += outgoing[i][1];
    }
    return acc;
  }

  this.getIncomingCount = function(_start, _stop) {
    if (_start < BIN_SIZE || _stop > TIME) {
      return 0;
    }
    var start_index = Math.floor(_start / BIN_SIZE)-1;
    var stop_index = Math.floor(_stop / BIN_SIZE)-1;
    var acc = 0;
    for (var i=start_index; i<stop_index; i++) {
      acc += incoming[i][1];
    }
    return acc;
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
