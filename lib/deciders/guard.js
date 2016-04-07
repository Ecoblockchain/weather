var inherits = require("util").inherits;
var EventEmitter = require("events");
var moment = require("moment");

inherits(Guard, EventEmitter);

function Guard(percent_risk) {
  Guard.super_.call(this);
  this.state = null;
  this.percent_risk = percent_risk || 0;
  this.name = "Guard(" + percent_risk + ")";
};

Guard.prototype.event = function(event, options) {
  var fn = this[event];

  // Ignore events we don't handle.
  if (fn == null) {
    return;
  }

  fn.call(this, options);
};

Guard.prototype.set_state = function(state) {
  this.state = state;
};

Guard.prototype.tick = function(options) {
  var self = this;

  this.state.open_buys.forEach(function(buy) {
    if (options.price < buy.opening_trade.price - (buy.opening_trade.price * self.percent_risk)) {
      buy.close("margin", self);
    }
  });

  this.state.open_sells.forEach(function(sell) {
    if (options.price > sell.opening_trade.price + (sell.opening_trade.price * self.percent_risk)) {
      sell.close("margin", self);
    }
  });
};

module.exports = Guard;
