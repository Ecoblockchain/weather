var inherits = require("util").inherits;
var EventEmitter = require("events");
var Trade = require("../trade");

inherits(BackTest, EventEmitter);

function BackTest() {
  this.first_tick = null;
  this.last_tick = null;
  this.trades = [];
  this.supply = {
    base: null,
    trade: null
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

  if (this.first_tick == null) {
    this.first_tick = options;
  }
};

BackTest.prototype.initial_supply = function(options) {
  this.supply = {
    base: options.base,
    trade: options.trade
  };
};

BackTest.prototype.supply_change = function(options) {
  this.supply[options.type] = options.amount;
};

BackTest.prototype.update_supply = function(options) {
  this.supply_change(options);
  this.emit("supply_change", options);
};

BackTest.prototype.margin_buy = function(options) {
  var trade = new Trade("buy", options.amount, this.last_tick.price);

  this.trades.push(trade);

  // First, remove the available supply so we don't spend it.
  this.update_supply({
    type: "base",
    amount: this.supply["base"] - trade.valueInBaseCurrency()
  });

  // There'd usually be a time delay here, but this is a backtest.
  // The buy was successful
  this.update_supply({
    type: "trade",
    amount: this.supply["trade"] + trade.valueInTradeCurrency()
  });
};

BackTest.prototype.margin_sell = function(options) {
  var trade = new Trade("sell", options.amount, this.last_tick.price);

  this.trades.push(trade);

  // First, remove the available supply so we don't spend it.
  this.update_supply({
    type: "trade",
    amount: this.supply["trade"] - trade.valueInTradeCurrency()
  });

  // There'd usually be a time delay here, but this is a backtest.
  // The sell was successful
  this.update_supply({
    type: "base",
    amount: this.supply["base"] + trade.valueInBaseCurrency()
  });
};

module.exports = BackTest;
