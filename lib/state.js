var inherits = require("util").inherits;
var EventEmitter = require("events");
var Position = require("./position");
var Trade = require("./trade");

inherits(State, EventEmitter);

function State() {
  State.super_.call(this);
  this.trades = [];
  this.positions = [];
  this.open_buys = [];
  this.open_sells = [];

  // Supply available for new positions
  this.open_supply = {
    trade: 0,
    base: 0
  };

  // Supply reserved for open positions
  this.reserved_supply = {
    trade: 0,
    base: 0
  };
};

State.prototype.open_position = function(type, amount, price) {
  var self = this;

  var position = new Position(type);
  this.positions.push(position);

  position.on("pending_open", function() {
    self.reserveSupply(position.opening_trade);
  });

  position.on("open", function() {
    self.swapSupply(position.opening_trade);
  });

  position.on("pending_close", function() {
    // Note: Supply's automatically reserved since position is open
  });

  position.on("closed", function() {
    // Remove the position from the opened list.
    if (position.type == "buy") {
      var index = self.open_buys.indexOf(position);
      self.open_buys.splice(index, 1);
    } else {
      var index = self.open_sells.indexOf(position);
      self.open_sells.splice(index, 1);
    }

    self.swapSupply(position.closing_trade);
    self.unreserveSupply(position.closing_trade);
  });

  // Pass trades up to the runner so they can be sent
  // to the executor.
  position.on("execute_trade", function(trade) {
    self.emit("execute_trade", trade);
  });

  if (position.type == "sell") {
    this.open_sells.push(position);
  } else {
    this.open_buys.push(position);
  }

  position.open(amount, price);
};

State.prototype.totalOpenSupply = function(type) {
  return this.open_supply[type];
};

State.prototype.hasOpenSupply = function(type, amount) {
  if (amount == null) {
    return this.open_supply[type] > 0;
  }

  return this.open_supply[type] >= amount;
};

State.prototype.hasOpenSupplyForTrade = function(trade) {
  var type = trade.type == "buy" ? "base" : "trade";

  return this.hasOpenSupply(type, trade.amount);
};

State.prototype.reserveSupply = function(trade) {
  if (this.hasOpenSupplyForTrade(trade) == false) {
    throw new Error("Cannot reserve supply for trade! Not enough supply!")
  }

  var currency = trade.type == "buy" ? "base" : "trade";

  // Move open supply to the reserved supply
  this.open_supply[currency] -= trade.amount;
  this.reserved_supply[currency] += trade.amount;
};

// Move reserved supply from one side to the other
// when a trade is executed.
State.prototype.swapSupply = function(trade) {
  var currency = trade.type == "buy" ? "base" : "trade";
  var other_currency = trade.type == "buy" ? "trade" : "base";

  this.reserved_supply[currency] -= trade.amount;
  this.reserved_supply[other_currency] += trade.executed_amount;
};

// Move reserved supply back to the open supply for a recently
// closed position. Only pass this function a position's closing trade.
// Remember: the
State.prototype.unreserveSupply = function(trade) {
  var currency = trade.type == "buy" ? "trade" : "base";

  this.reserved_supply[currency] -= trade.executed_amount;
  this.open_supply[currency] += trade.executed_amount;
};

State.prototype.addSupply = function(type, amount) {
  this.open_supply[type] += amount;
};

module.exports = State;
