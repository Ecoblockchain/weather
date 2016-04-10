var inherits = require("util").inherits;
var EventEmitter = require("events");

inherits(Trade, EventEmitter);

function Trade(type, amount, price, state) {
  this.type = type;

  // If the type is a "buy", then you're buying the amount's worth of the trade currency.
  // If the type is a "sell", then you're selling that amount of trade currency.
  // In a "buy" in the BTC/ETH exchange, the amount is in BTC.
  // In a "sell" in the BTC/ETH exchange, the amount is in ETH.
  // The currency of the executed_amount is always the opposite.

  this.amount = amount;
  this.price = price;
  this.timestamp = state.getTime();
  this.state = state;
  this.executed_amount = null; // Always in opposite currency!
  this.executed_timestamp = null;

  this.status = "open";
}

Trade.prototype.toString = function() {
  return "MARGIN " + this.type.toUpperCase() + " - " + this.valueInTradeCurrency() + " @ " + this.price;
}

Trade.prototype.valueInBaseCurrency = function() {
  var amount_of_base_currency = this.amount;

  if (this.type == "sell") {
    amount_of_base_currency = this.amount * this.price;
  }

  return amount_of_base_currency;
}

Trade.prototype.valueInTradeCurrency = function() {
  var amount_of_trade_currency = this.amount;

  if (this.type == "buy") {
    amount_of_trade_currency = this.amount / this.price;
  }

  return amount_of_trade_currency;
}

Trade.prototype.set_executed = function(amount, price) {
  this.executed_amount = amount;
  this.executed_timestamp = this.state.getTime();
  this.price = price; // Will override with same value, unless "margin"
  this.status = "executed";

  this.emit("executed");
};

Trade.prototype.error = function(e) {
  this.status = "error";
  this.emit("error", e);
}

Trade.prototype.toJSON = function() {
  return {
    amount: this.amount,
    price: this.price,
    timestamp: this.timestamp,
    executed_amount: this.executed_amount,
    executed_timestamp: this.executed_timestamp,
    status: this.status,
  };
};

module.exports = Trade;
