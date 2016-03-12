function Trade(type, amount, price, timestamp) {
  this.type = type;
  this.amount = amount;
  this.price = price;
  this.timestamp = new Date().getTime();
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

module.exports = Trade;
