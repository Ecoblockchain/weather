var inherits = require("util").inherits;
var EventEmitter = require("events");

inherits(Decider, EventEmitter);

function Decider() {
  Decider.super_.call(this);
  this.runner = null;
  this.state = null;
};

Decider.prototype.setRunner = function(runner) {
  this.runner = runner;
  this.initialize();
};

Decider.prototype.initialize = function() {
  // Do nothing by default.
};

Decider.prototype.set_state = function(state) {
  this.state = state;
};

Decider.prototype.get = function(name) {
  return this.runner.get(name, this);
};

module.exports = Decider;
