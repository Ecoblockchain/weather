var inherits = require("util").inherits;
var EventEmitter = require("events").EventEmitter;

var util = require("../util");

inherits(Overview, EventEmitter);

function Overview() {
  Overview.super_.call(this);
};

Overview.prototype.printItem = function(item) {
  Object.keys(item).forEach(function(key) {
    var name = util.toTitleCase(key.replace("_", " "));
    var value = item[key];
    console.log("   " + name + ": " + value);
  });
};

Overview.prototype.summary = function(summary) {
  var strategy = summary.strategy;

  console.log("------------------");
  console.log("Strategy: " + (strategy.name || "Unnamed Strategy"));

  this.printItem(strategy.deciders);
  this.printItem(strategy.analyzers);

  console.log("");
  console.log("Total Trades: ", summary.total_trades);
  console.log("Profit: ", summary.profit);
  console.log("Loss: ", summary.loss);
  console.log("P/L %: ", summary.profit_loss_percent * 100);
  console.log("Total P/L: ", summary.total_profit_and_loss);
};

module.exports = Overview;
