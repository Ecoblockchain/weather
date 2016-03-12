var inherits = require("util").inherits;
var EventEmitter = require("events");

inherits(BackTest, EventEmitter);

function BackTest() {
  this.last_tick = null;
  this.supply = {
    base: 0,
    trade: 0
  };
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
};

BackTest.prototype.supply_change = function(options) {
  this.supply[options.type] = options.amount;
};

BackTest.prototype.update_supply = function(options) {
  this.supply_change(options);
  this.emit("supply_change", options);
};

BackTest.prototype.margin_buy = function(options) {
  console.log("MARGIN BUY - " + (options.amount / this.last_tick.price) + " @ " + this.last_tick.price);

  console.log("amount", options.amount);
  console.log("supply", this.supply["base"]);
  console.log("after", this.supply["base"] - options.amount);

  // First, remove the available supply so we don't spend it.
  this.update_supply({
    type: "base",
    amount: this.supply["base"] - options.amount
  });

  // There'd usually be a time delay here, but this is a backtest.
  // The buy was successful
  this.update_supply({
    type: "trade",
    amount: this.supply["trade"] + (options.amount / this.last_tick.price)
  });

  console.log(this.supply);
};

BackTest.prototype.margin_sell = function(options) {
  console.log("MARGIN SELL - " + options.amount + " @ " + this.last_tick.price);

  console.log("amount", options.amount);
  console.log("supply", this.supply["trade"]);
  console.log("after", this.supply["trade"] - (options.amount * this.last_tick.price));

  // First, remove the available supply so we don't spend it.
  this.update_supply({
    type: "trade",
    amount: this.supply["trade"] - options.amount
  });

  // There'd usually be a time delay here, but this is a backtest.
  // The buy was successful
  this.update_supply({
    type: "base",
    amount: this.supply["base"] + (options.amount * this.last_tick.price)
  });

  console.log(this.supply);
};

module.exports = BackTest;
