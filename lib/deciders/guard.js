var inherits = require("util").inherits;
var moment = require("moment");

var Decider = require("../decider");

inherits(Guard, Decider);

function Guard(percent_risk) {
  Guard.super_.call(this);
  this.percent_risk = percent_risk || 0;
  this.name = "Guard(" + percent_risk + ")";
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

Guard.prototype.name = function() {
  return "guard";
}

module.exports = Guard;
