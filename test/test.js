var assert = require('chai').assert;
var fs = require("fs");
var Runner = require("../lib/runner");
var moment = require("moment");
var async = require("async");

// Path relative to the
var config = require("./config.js");

var highest = null;

var run = function(resolution, callback) {
  config.test.deciders.trendfollower = [resolution];

  console.log("Running resolution " + resolution + "...");

  var runner = new Runner(config.test);
  runner.run();
  runner.on("stop", function(summary) {
    if (highest == null) {
      highest = {
        resolution: resolution,
        summary: summary
      };
    } else if (summary.total_profit_and_loss > highest.summary.total_profit_and_loss) {
      highest = {
        resolution: resolution,
        summary: summary
      };
    }

    callback();
  });
  runner.on("error", callback);
};

var resolutions = [];

// 168 hours = 7 days
for (var i = 1; i <= 168; i++) {
  resolutions.push(i + " hours");
}

async.eachSeries(resolutions, run, function() {
  console.log(highest);
});
