var fs = require("fs");
var inherits = require("util").inherits;
var EventEmitter = require('events').EventEmitter;
var LineByLineReader = require('line-by-line');

inherits(CSV, EventEmitter);

function CSV(file, base_currency, trade_currency, base_supply, trade_supply) {
  CSV.super_.call(this);
  this.file = file;
  this.base_currency = base_currency;
  this.trade_currency = trade_currency;
  this.supply = {
    base: base_supply || 10,
    trade: trade_supply || 0
  };
};

CSV.prototype.name = function() {
  return "bitcoincharts_csv";
};

CSV.prototype.start = function(runner) {
  var self = this;

  this.emit("initial_supply", {
    base: this.supply.base,
    trade: this.supply.trade
  });

  var lr = new LineByLineReader(this.file);

  lr.on('error', function(err) {
    self.emit(err);
  });

  lr.on('line', function(line) {
    var parts = line.split(",");

    var timestamp =  parseInt(parts[0] + "000");
    var one_base_worth_this_many = parseFloat(parts[1]);
    var base_spent = parseFloat(parts[2]);

    var one_trade_worth_this_many = 1 / one_base_worth_this_many;

    self.emit("tick", {
      price: one_trade_worth_this_many,
      timestamp: timestamp,
      base_currency: self.base_currency,
      trade_currency: self.trade_currency,
      feeder: self.name()
    });
  });

  lr.on('end', function() {
    self.emit("stop");
  });
};

module.exports = CSV;
