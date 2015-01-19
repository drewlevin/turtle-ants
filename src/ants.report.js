/*
 * ants.report.js
 * Standalone module for generating reports
 */

/*jslint          browser : true,  continue : true,
  devel  : true,  indent : 2,      maxerr  : 50,
  newcap : true,  nomen : true,    plusplus : true,
  regexp : true,  sloppy : true,   vars : false,
  white  : true
*/

/*global $, Ants */

Ants.report = (function () {
  'use strict';

  // ------------------ Private Variables -------------------- //
  var
    params = null,  // Set with config

    // Cross-browser carriage return support
    eol =
      (function() {
        var plat = navigator.platform.toLowerCase();
        if (plat.indexOf('win') != -1) return "\r\n";
        else if (plat.indexOf('mac') != -1) return "\r";
        else return "\n";
      }())
  ;

  // ------------------ Private Functions -------------------- //
  function generateReportString(_collection) {
    var
      values,
      stats,
      mean,
      output = "",
      i, j, run
    ;

    for (i = 0; i < _collection[0].length; i++) {
      for (j = 0; j < params.NUM_OBSERVATIONS; j++) {
        values = [];
        for (run = 0; run < params.NUM_RUNS; run++) {
          values.push(_collection[run][i].outgoing[j]);
        }

        stats = Stats(values);
        mean = Math.floor(stats.getArithmeticMean() * 100) / 100;

        output += mean;
        output += (j === params.NUM_OBSERVATIONS - 1) ? "" : ",  ";
      }
      output += eol;
    }
    return output;
  }

  function generateErrorString(_collection) {
    var
      values,
      stats,
      std,
      output = "",
      i, j, run
    ;

    for (i = 0; i < _collection[0].length; i++) {
      for (j = 0; j < params.NUM_OBSERVATIONS; j++) {
        values = [];
        for (run = 0; run < params.NUM_RUNS; run++) {
          values.push(_collection[run][i].outgoing[j]);
        }

        stats = Stats(values);
        std =
          Math.floor(
            (stats.getStandardDeviation() / Math.sqrt(params.NUM_RUNS)) * 100
          ) / 100;

        output += std;
        output += j === (params.NUM_OBSERVATIONS - 1) ? "" : ",  ";
      }
      output += eol;
    }
    return output;
  }

  // ------------------ Public Functions -------------------- //
  var config = function (_params) {
    params = _params;
  }

  var generate = function (_collection) {
    var blob;

    blob = new Blob([generateReportString(_collection)], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "report.txt");

    // Observer error reports
    blob = new Blob([generateErrorString(_collection)], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "error.txt");
  };

  // ------------------ Return Module -------------------- //
  return {
    config   : config,
    generate : generate
  };
}());


