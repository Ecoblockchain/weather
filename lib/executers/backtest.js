var inherits = require("util").inherits;
var EventEmitter = require("events");
var Trade = require("../trade");

inherits(BackTest, EventEmitter);

function BackTest() {
  this.first_tick = null;
  this.last_tick = null;
  this.state = null;
};

BackTest.prototype.event = function(event, options) {
  var fn = this[event];

  // Ignore events we don't handle.
  if (fn == null) {
    return;
  }

  fn.call(this, options);
};

BackTest.prototype.tick = function(options) {
  this.last_tick = options;

  if (this.first_tick == null) {
    this.first_tick = options;
  }
};

BackTest.prototype.set_state = function(state) {
  var self = this;

  this.state = state;

  this.state.on("execute_trade", function(trade) {
    // We execute all trades for free automatically, so execute this one.
    var price = trade.price;

    if (price == "margin") {
      price = self.last_tick.price;
    }

    var executed_amount;

    if (trade.type == "buy") {
      executed_amount = trade.amount / price;
    } else {
      executed_amount = trade.amount * price;
    }

    trade.set_executed(executed_amount, price);
  });
};

module.exports = BackTest;
