#!/usr/bin/env node
var fs = require("fs");
var Farm = require('worker-farm/lib/farm');
//var workers = new workerFarm(require.resolve('./lib/worker'));

var farm = new Farm({maxRetries: 0, maxCallsPerWorker: 1}, require.resolve('./lib/worker'));
var workers = farm.setup();

var util = require("./lib/util");

function printItem(item) {
  Object.keys(item).forEach(function(key) {
    var name = util.toTitleCase(key.replace("_", " "));
    var value = item[key];
    console.log("   " + name + ": " + value);
  });
}

function print(result) {
  console.log("------------------");
  console.log("Strategy:")

  printItem(result.strategy.deciders);
  printItem(result.strategy.analyzers);

  console.log("");
  console.log("Total Trades: ", result.summary.total_trades);
  console.log("Profit: ", result.summary.profit);
  console.log("Loss: ", result.summary.loss);
  console.log("P/L %: ", result.summary.profit_loss_percent * 100);
  console.log("Total P/L: ", result.summary.total_profit_and_loss);
};

function killWorkers() {
  farm.childKeys().forEach(function(id) {
    farm.stopChild(id);
  });
  farm.end();
}

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
      if (err) {
        console.log(err.stack);
        killWorkers();
        return;
      }

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
        fs.writeFileSync("./defaulttrades.out", JSON.stringify(highest.summary.positions), {encoding: "utf8"});
        print(highest);
        farm.end();
      }
    });
  });
};

module.exports = {
  print: print,
  run: run
};
