function generateReportSingleTableString(_run) {
  var output = "Run " + (_run+1) + eol;
  for (var i=0; i<observer_array.length; i++) {
    output += "Observer " + observer_array[i].id + " Outgoing: ";
    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      output += observer_collection[_run][i].outgoing[j];
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }
    output += eol;

    output += "Observer " + observer_array[i].id + " Incoming: ";
    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      output += observer_collection[_run][i].incoming[j];
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }    
    output += eol;
  }
  output += eol;
  return output;
}

function generateReportString() {
  var output = "";  

  var values, stats;
  var mean, std;

/*
  for (var i=0; i<NUM_RUNS; i++) {
    output += generateReportSingleTableString(i);
  }
*/
  for (var i=0; i<observer_collection[0].length; i++) {
//    output += "Observer " + observer_array[i].id + " Outgoing: ";
    if (INITIAL_PATH) {
      for (var j=0; j<NUM_OBSERVATIONS; j++) {
        values = [];
        for (var run=0; run<NUM_RUNS; run++) {    
          values.push(observer_collection[run][i].outgoing[j]);
        }

        stats = Stats(values);
        mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
        std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS))* 100) / 100;

        output += mean;
        output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
      }
      output += eol;
    }
    else {
      for (var j=0; j<NUM_OBSERVATIONS; j++) {
        values = [];
        for (var run=0; run<NUM_RUNS; run++) {    
          values.push(observer_collection[run][i].outgoing[j]);
        }

        stats = Stats(values);
        mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
        std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS))* 100) / 100;

  //      output += mean + " +/- " + std;
        output += mean;
        output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
      }
      output += eol;
  /*
      output += "Observer " + observer_array[i].id + " Incoming: ";  

      for (var j=0; j<NUM_OBSERVATIONS; j++) {
        values = [];
        for (var run=0; run<NUM_RUNS; run++) {    
          values.push(observer_collection[run][i].incoming[j]);
        }    
        stats = Stats(values);
        mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
        std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS)) * 100) / 100;
        output += mean + " +/- " + std;
        output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
      }
      output += eol;
  */
    }
  }
  return output;
}

function generateErrorString() {
  var output = "";  

  var values, stats;
  var mean, std;

  for (var i=0; i<observer_collection[0].length; i++) {
//    output += "Observer " + observer_array[i].id + " Outgoing: ";

    for (var j=0; j<NUM_OBSERVATIONS; j++) {
      values = [];
      for (var run=0; run<NUM_RUNS; run++) {    
        values.push(observer_collection[run][i].outgoing[j]);
      }

      stats = Stats(values);
      mean = Math.floor(stats.getArithmeticMean() * 100) / 100;
      std = Math.floor((2 * stats.getStandardDeviation() / Math.sqrt(NUM_RUNS))* 100) / 100;
      output += std;
      output += j == NUM_OBSERVATIONS-1 ? "" : ",  ";
    }
    output += eol;
  }
  return output;
}

function generateReports() 
{
  if (observer_array.length > 0 && !GENERATED_REPORT) {

    var blob = new Blob([generateReportString()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "report.txt");

    blob = new Blob([generateErrorString()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "error.txt");    

    GENERATED_REPORT = true;

    var div, flot_div, column_div, top, markings_array;
    var column_offset, column_width, column_div_width = 1180;
    var time_rate_ratio = OBSERVATION_TIME / OBSERVATION_RATE;

    var report_div = $('#report');
    report_div.css({'visibility': 'visible'});
    report_div.animate({'height': (5+305*observer_array.length)+'px'}, 1000);

    for (o in observer_array) {
      top = 5+(275*o);
      div = $('<div></div>', {'class': 'report_container'}).css({'top': top+'px'});

      $('<h4>Observer '+ observer_array[o].id +'</h4>').appendTo(div);

      flot_div = $('<div></div>', {'class': 'report_flot'}).appendTo(div);
      column_div = $('<div></div>', {'class': 'report_columns'}).appendTo(div);

      div.appendTo(report_div);

      column_offset = (column_div_width * time_rate_ratio) / (time_rate_ratio + NUM_OBSERVATIONS);
      column_width  = column_offset / time_rate_ratio;

      for (var i=0; i<NUM_OBSERVATIONS; i++) {
        $('<div class="report_single_column">Outgoing: ' + 
             observer_array[o].getOutgoingCount(OBSERVATION_RATE*(i+1), OBSERVATION_RATE*(i+1)+OBSERVATION_TIME) +
          '<br/>Incoming : ' +
             observer_array[o].getIncomingCount(OBSERVATION_RATE*(i+1), OBSERVATION_RATE*(i+1)+OBSERVATION_TIME) +
          '</div>').css({'width': Math.floor(column_width-20)+'px',
                         'left' : (Math.floor(column_offset)+Math.floor(column_width)*i)+'px'
                        }).appendTo(column_div);
      }

      markings_array = [];
      for (var i=0; i<NUM_OBSERVATIONS; i++) {
        markings_array.push({ color: "#e8cfac", lineWidth: "1",
                              xaxis: { from: OBSERVATION_RATE*(i+1), 
                                       to: OBSERVATION_RATE*(i+1)+OBSERVATION_TIME-1 } });
      }
      var options = $.extend(true, {}, PLOT_OPTIONS);
      options['grid'] = { markings: markings_array };
      $.plot(flot_div, 
             [ { label: 'Outgoing', data: observer_array[o].getOutgoingSeries(TIME) } , 
               { label: 'Incoming', data: observer_array[o].getIncomingSeries(TIME) } , 
               { label: 'Outgoing Smoothed', data: observer_array[o].getOutgoingSmoothed(TIME) } , 
               { label: 'Incoming Smoothed', data: observer_array[o].getIncomingSmoothed(TIME) } ] , 
             options );
    }
  }
}

