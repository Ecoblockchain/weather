var inherits = require("util").inherits;
var EventEmitter = require('events').EventEmitter;
var path = require("path");
var Bubbler = require("./bubbler");

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
  this.bubble("tick", this.feeder, [this.executor, this.decider]);
  this.bubble("book", this.feeder, [this.executor, this.decider]);
  this.bubble("supply_change", this.feeder, [this.executor, this.decider]);

  this.feeder.on("stop", function() {
    self.emit("stop");
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

Runner.prototype.stop = function() {
  console.log("Stop called by feeder.");
};

Runner.prototype.error = function(err) {
  console.log("Fatal error:" + err.stack);
};

module.exports = Runner;
