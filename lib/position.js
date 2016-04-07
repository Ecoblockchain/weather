var inherits = require("util").inherits;
var EventEmitter = require("events");
var Trade = require("./trade");

inherits(Position, EventEmitter);

function Position(type, opened_by) {
  Position.super_.call(this);
  this.type = type;
  this.opening_trade = null;
  this.closing_trade = null;
  this.state = "new";
  this.opened_by = opened_by;
  this.closed_by = null;
};

Position.prototype.type = function() {
  return this.type;
};

Position.prototype.open = function(amount, price) {
  var self = this;

  if (this.state != "new") {
    throw new Error("You can only open a new position!");
  }

  this.opening_trade = new Trade(this.type, amount, price);

  this.state = "pending_open";
  this.emit("pending_open");

  this.opening_trade.on("error", function(e) {
    self.fail(e);
  });

  this.opening_trade.on("executed", function() {
    self.state = "open";
    self.emit("open");
  });

  this.emit("execute_trade", this.opening_trade);
};

Position.prototype.close = function(price, decider) {
  var self = this;

  if (this.state != "open") {
    throw new Error("You can only close an open position!");
  }

  var type = "sell";

  if (this.type == "sell") {
    type = "buy";
  }

  this.closing_trade = new Trade(type, this.opening_trade.executed_amount, price);

  this.state = "pending_close";
  this.emit("pending_close");

  this.closing_trade.on("error", function(e) {
    self.fail(e);
  });

  this.closing_trade.on("executed", function() {
    self.state = "closed";
    self.closed_by = decider;
    self.emit("closed", decider);
  });

  this.emit("execute_trade", this.closing_trade);
};

Position.prototype.fail = function(e) {
  this.state = "failed";

  this.emit("failed", e);
}

Position.prototype.amount = function() {
  return this.opening_trade.amount;
};

Position.prototype.value = function(price) {
  var closing_trade = this.closing_trade;
  var price = price || this.opening_trade.price;

  if (this.isOpen()) {
    var type = this.opening_trade.type == "buy" ? "sell" : "buy";
    var amount = this.opening_trade.executed_amount;

    closing_trade = new Trade(type, amount, price);
  }

  return closing_trade.valueInBaseCurrency() - this.opening_trade.valueInBaseCurrency();
};

Position.prototype.isOpen = function() {
  return this.state == "open";
}

Position.prototype.isClosed = function() {
  return this.state == "closed";
};

Position.prototype.toString = function() {
  var str = "Status: " + this.state + "\n" + this.opening_trade.toString();

  if (this.isClosed()) {
    str += "\n" + this.closing_trade.toString();
    str += "\nValue: " + this.value();
  }

  str += "\nOpened by: " + this.opened_by.name;

  if (this.isClosed()) {
    str += "\nClosed by: " + this.closed_by.name
  }

  return str;
}

Position.prototype.toJSON = function() {
  return {
    type: this.type,
    opening_trade: this.opening_trade.toJSON(),
    closing_trade: this.closing_trade == null ? null : this.closing_trade.toJSON(),
    state: this.state,
    opened_by: this.opened_by.name,
    closed_by: this.closed_by == null ? null : this.closed_by.name,
    value: this.closing_trade == null ? "unknown" : this.value()
  };
}

module.exports = Position;
