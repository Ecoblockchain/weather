var inherits = require("util").inherits;
var EventEmitter = require('events').EventEmitter;
var path = require("path");
var _ = require("lodash");
var Bubbler = require("./bubbler");
var Trade = require("./trade");

inherits(Runner, EventEmitter);

function Runner(strategy) {
  Runner.super_.call(this);
  this.strategy = strategy;

  if (strategy.deciders == null) {
    throw new Error("Decider must be set!");
  }

  if (strategy.feeders == null) {
    throw new Error("Feeds must be set!");
  }

  if (strategy.executers == null) {
    throw new Error("Executer must be set!");
  }

  this.feeder = this.resolve_dependency("feeders");
  this.decider = this.resolve_dependency("deciders");
  this.executor = this.resolve_dependency("executers");

  this.initial_supply = null;
  this.first_tick = null;

  this.state = {};
};

Runner.prototype.resolve_dependency = function(type) {
  var self = this;

  var items = Object.keys(this.strategy[type]).map(function(dependency_name) {
    var dependency_config = self.strategy[type][dependency_name];
    var dependency_path = path.join("..", "lib", type, dependency_name + ".js");
    var dependency_class = require(dependency_path);

    // Needed for Function.prototype.bind.apply().
    dependency_config.unshift(null);

    return new (Function.prototype.bind.apply(dependency_class, dependency_config));
  });

  return new Bubbler(items);
};

Runner.prototype.bubble = function(event, from, to) {
  if (Array.isArray(to) == false) {
    to = [to];
  }

  from.on(event, function(options) {
    to.forEach(function(item) {
      item.event(event, options);
    });
  });
};

Runner.prototype.run = function() {
  var self = this;

  console.log("Running...");
  this.emit("start");

  // Feeder events
  this.bubble("tick", this.feeder, [this.executor, this.decider, this]);
  this.bubble("book", this.feeder, [this.executor, this.decider]);
  this.bubble("supply_change", this.feeder, [this.executor, this.decider]);
  this.bubble("initial_supply", this.feeder, [this.executor, this.decider, this]);

  this.feeder.on("stop", function() {
    self.stop();
    self.emit("stop")
  });

  this.feeder.on("error", function(err) {
    self.emit("error", err);
  });

  // Decider events
  this.bubble("margin_buy", this.decider, this.executor);
  this.bubble("margin_sell", this.decider, this.executor);

  // Executor events
  this.bubble("supply_change", this.executor, this.decider);

  // Get things started.
  this.feeder.trigger("start", this);
};

Runner.prototype.event = function(event, options) {
  if (event == "tick" && this.first_tick == null) {
    this.first_tick = options;
  }

  if (event == "initial_supply" && this.initial_supply == null) {
    this.initial_supply = options;
  }
};

Runner.prototype.stop = function() {
  var executors = this.executor.items;

  var trades = [];

  executors.forEach(function(executor) {
    Array.prototype.push.apply(trades, executor.trades);
  });

  trades.sort(function(a, b) {
    if (a.timestamp < b.timestamp) {
      return -1;
    }
    if (a.timestamp > b.timestamp) {
      return 1;
    }
    // a must be equal to b
    return 0;
  });

  var profit = 0;
  var loss = 0;

  var value =
    (new Trade("buy", this.initial_supply.base, this.first_tick.price)).valueInBaseCurrency() +
    (new Trade("sell", this.initial_supply.trade, this.first_tick.price)).valueInBaseCurrency();

  trades.forEach(function(trade) {
    var new_value = trade.valueInBaseCurrency();

    if (new_value > value) {
      profit += new_value - value;
    }

    if (new_value < value) {
      loss += value - new_value;
    }

    value = new_value;
  });

  var summary = {
    total_trades: trades.length,
    profit: profit,
    loss: loss,
    total_profit_and_loss: profit - loss
  };

  console.log(summary);
};

Runner.prototype.error = function(err) {
  console.log("Fatal error:" + err.stack);
};

module.exports = Runner;
