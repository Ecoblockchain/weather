var inherits = require("util").inherits;
var EventEmitter = require("events");
var Trade = require("./trade");

inherits(Position, EventEmitter);

function Position(type) {
  Position.super_.call(this);
  this.type = type;
  this.opening_trade = null;
  this.closing_trade = null;
  this.state = "new";
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

Position.prototype.close = function(price) {
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
    self.emit("closed");
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

Position.prototype.value = function() {
  var value = this.opening_trade.valueInBaseCurrency();

  if (this.isClosed()) {
    value = this.closing_trade.valueInBaseCurrency() - value;
  }

  return value;
};

Position.prototype.isOpen = function() {
  return this.state == "open";
}

Position.prototype.isClosed = function() {
  return this.state == "closed";
};

module.exports = Position;
