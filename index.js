#!/usr/bin/env node
var workerFarm = require('worker-farm');
var workers = workerFarm(require.resolve('./lib/worker'));
var util = require("./lib/util");

function print(result) {
  console.log("------------------");
  console.log("Strategy:")

  var deciders = result.strategy.deciders;

  Object.keys(deciders).forEach(function(key) {
    var name = util.toTitleCase(key.replace("_", " "));
    var value = deciders[key];
    console.log("   " + name + ": " + value);
  });
  console.log("");
  console.log("Total Trades: ", result.summary.total_trades);
  console.log("Profit: ", result.summary.profit);
  console.log("Loss: ", result.summary.loss);
  console.log("P/L %: ", result.summary.profit_loss_percent * 100);
  console.log("Total P/L: ", result.summary.total_profit_and_loss);
};

function run(strategies) {
  var noun = "strategies";
  if (strategies.length == 1) {
    noun = "strategy";
  }

  console.log("Running " + strategies.length + " " + noun + "...");

  var count = 0;
  var highest = null;

  strategies.forEach(function(run) {
    workers(run, function (err, result) {
      result = JSON.parse(result);

      if (highest == null) {
        highest = result
      } else if (result.summary.total_profit_and_loss > highest.summary.total_profit_and_loss) {
        highest = result
      }

      count += 1;

      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);  // move cursor to beginning of line
      process.stdout.write(((count / strategies.length) * 100).toFixed(2) + "%");

      if (count == strategies.length) {
        process.stdout.clearLine();  // clear current text
        process.stdout.cursorTo(0);  // move cursor to beginning of line
        console.log(highest.summary.positions)
        print(highest);
        workerFarm.end(workers);
      }
    });
  });
};

module.exports = {
  print: print,
  run: run
};
