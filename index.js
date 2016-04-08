#!/usr/bin/env node
var fs = require("fs");
var async = require("async");
var worker = require("./lib/worker")
var Farm = require('worker-farm/lib/farm');
//var workers = new workerFarm(require.resolve('./lib/worker'));

var farm = new Farm({maxRetries: 0}, require.resolve('./lib/worker'));
var workers = farm.setup();

function killWorkers() {
  farm.childKeys().forEach(function(id) {
    farm.stopChild(id);
  });
  farm.end();
}

function run(strategies, parallel, summarize) {
  if (parallel == null) {
    parallel = true;
  }

  parallel = !!parallel;

  var noun = "strategies";
  if (strategies.length == 1) {
    noun = "strategy";
  }

  console.log("Running " + strategies.length + " " + noun + "...");

  var count = 0;
  var highest = null;

  function recordResult(result) {
    count += 1;

    if (highest == null) {
      highest = result
    } else if (result.summary.total_profit_and_loss > highest.summary.total_profit_and_loss) {
      highest = result
    }

    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line
    process.stdout.write(((count / strategies.length) * 100).toFixed(2) + "%");
  };

  function clearPercent() {
    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line
  }

  if (!parallel) {
    async.eachSeries(strategies, function(strategy, finished) {
      worker(strategy, summarize, function(err, result) {
        if (err) return finished(err);
        recordResult(result);
        finished(null, result);
      })
    }, function(err) {
      if (err) {
        console.log(err.stack);
        return;
      }
      clearPercent();
    });
  } else {
    strategies.forEach(function(run) {
      workers(run, summarize, function (err, result) {
        if (err) {
          console.log(err.stack);
          killWorkers();
          return;
        }

        result = JSON.parse(result);

        recordResult(result);

        if (count == strategies.length) {
          clearPercent();
          farm.end();
        }
      });
    });
  }
};

module.exports = {
  run: run
};
