var inherits = require("util").inherits;
var EventEmitter = require('events').EventEmitter;
var path = require("path");
var _ = require("lodash");
var Bubbler = require("./bubbler");
var Trade = require("./trade");
var State = require("./state");

inherits(Runner, EventEmitter);

function Runner(strategy) {
  Runner.super_.call(this);
  this.strategy = strategy;

  this.state = new State();

  if (strategy.deciders == null) {
    throw new Error("Decider must be set!");
  }

  if (strategy.feeders == null) {
    throw new Error("Feeds must be set!");
  }

  if (strategy.executers == null) {
    throw new Error("Executer must be set!");
  }

  this.feeders = this.resolve_dependency("feeders");
  this.analyzers = this.resolve_dependency("analyzers");
  this.deciders = this.resolve_dependency("deciders");
  this.executors = this.resolve_dependency("executers");

  this.deciders.trigger("setRunner", this);

  this.initial_supply = null;
  this.first_tick = null;
  this.last_tick = null;
};

Runner.prototype.resolve_dependency = function(type) {
  var self = this;

  var items = {};

  Object.keys(this.strategy[type]).forEach(function(dependency_name) {
    var dependency_config = self.strategy[type][dependency_name].slice();
    var dependency_path = path.join("..", "lib", type, dependency_name + ".js");
    var dependency_class = require(dependency_path);

    // Needed for Function.prototype.bind.apply().
    dependency_config.unshift(null);

    items[dependency_name] = new (Function.prototype.bind.apply(dependency_class, dependency_config));
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

Runner.prototype.get = function(analyzer_name, decider) {
  var analyzer = this.analyzers.get(analyzer_name);
  var decider_name = decider.name;

  if (analyzer == null) {
    throw new Error("Analyzer '" + analyzer_name + "' is not defined in the configuration! Cannot use decider '" + decider_name + "' unless the '" + analyzer_name + "' analyzer is added to the strategy.");
  }

  return analyzer;
}

Runner.prototype.run = function() {
  var self = this;

  this.emit("start");

  // Feeder events
  this.bubble("tick", this.feeders, [this.analyzers, this.executors, this.deciders, this]);
  this.bubble("book", this.feeders, [this.analyzers, this.executors, this.deciders]);

  this.feeders.on("initial_supply", function(supply) {
    self.initial_supply = supply;
    self.state.addSupply("base", supply.base);
    self.state.addSupply("trade", supply.trade);
  });

  this.feeders.on("stop", function() {
    self.stop();
  });

  this.feeders.on("error", function(err) {
    self.emit("error", err);
  });

  // Decider events
  this.bubble("margin_buy", this.deciders, this.executors);
  this.bubble("margin_sell", this.deciders, this.executors);

  // Executor events
  this.bubble("supply_change", this.executors, this.deciders);

  this.deciders.event("set_state", this.state);
  this.executors.event("set_state", this.state);

  // Get things started.
  this.feeders.trigger("start", this);
};

Runner.prototype.stop = function(err) {
  var summary;
  if (!err) {
    summary = this.summary();
  }
  this.emit("stop", err, summary);
};

Runner.prototype.event = function(event, options) {
  if (event == "tick") {
    this.last_tick = options;

    if (this.first_tick == null) {
      this.first_tick = options;
    }
  }

  if (event == "initial_supply" && this.initial_supply == null) {
    this.initial_supply = options;
  }
};

Runner.prototype.summary = function() {
  var self = this;

  var profit = 0;
  var loss = 0;

  var trade_count = 0;

  this.state.positions.forEach(function(position) {
    var value = position.value(self.last_tick.price);

    if (value > 0) {
      profit += value;
    } else {
      loss += Math.abs(value);
    }

    if (position.isClosed()) {
      trade_count += 2;
    } else if (position.isOpen()) {
      trade_count += 1;
    }
  });

  var summary = {
    total_trades: trade_count,
    profit: profit,
    loss: loss,
    total_profit_and_loss: profit - loss,
    profit_loss_percent: loss / profit,
    positions: this.state.positions
  };

  return summary;
};

Runner.prototype.error = function(err) {
  console.log("Fatal error:" + err.stack);
};

module.exports = Runner;
