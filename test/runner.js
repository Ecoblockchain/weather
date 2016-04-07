#!/usr/bin/env node
var async = require("async");
var _ = require("lodash");
var workerFarm = require('worker-farm');
var workers = workerFarm(require.resolve('./worker'));
var argv = require('yargs').argv;

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function print(result) {
  console.log("------------------");
  console.log("Parameters:")

  Object.keys(result.options).forEach(function(key) {
    var name = toTitleCase(key.replace("_", " "));
    var value = result.options[key];
    console.log("   " + name + ": " + value);
  });
  console.log("");
  console.log("Total Trades: ", result.summary.total_trades);
  console.log("Profit: ", result.summary.profit);
  console.log("Loss: ", result.summary.loss);
  console.log("P/L %: ", result.summary.profit_loss_percent * 100);
  console.log("Total P/L: ", result.summary.total_profit_and_loss);
};

// extra closure to get proper scoping on 'i'

var runs = [];
var count = 0;

for (var r = 1; r <= 5; r++) {
  for (var surety = 2; surety <= 10; surety++) {
    for (var risk_percent = 0; risk_percent <= 3; risk_percent++) {
      //for (var strict = 0; strict <= 1; strict++) {
        runs.push({
          resolution: (r*5) + " hours",
          surety: surety,
          risk_percent: risk_percent * .05,
          strict_trends: false //strict == 1
        })
      //}
    }
  }
}

// runs.push({
//   resolution: "5 minutes",
//   surety: 5,
//   risk_percent: .25,
//   strict_trends: false
// });

if (argv.p) {
  console.log(runs)
  process.exit();
}

console.log("Running " + runs.length + " runs...");

var count = 0;
var highest = null;
var lowest_p_over_l = null;


runs.forEach(function(run) {
  workers(run, function (err, result) {
    result = JSON.parse(result);

    if (highest == null) {
      highest = result
    } else if (result.summary.total_profit_and_loss > highest.summary.total_profit_and_loss) {
      highest = result
    }

    if (lowest_p_over_l == null) {
      lowest_p_over_l = result;
    } else if (result.summary.profit_loss_percent < lowest_p_over_l.summary.profit_loss_percent) {
      lowest_p_over_l = result;
    }

    count += 1;

    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line
    process.stdout.write(((count / runs.length) * 100).toFixed(2) + "%");

    if (count == runs.length) {
      console.log(highest.summary.positions)

      print(highest);
      //print(lowest_p_over_l);



      workerFarm.end(workers);
    }
  });
});
