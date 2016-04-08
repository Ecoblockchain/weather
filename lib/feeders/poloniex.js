var inherits = require("util").inherits;
var EventEmitter = require('events').EventEmitter;
var polo = require("poloniex-unofficial");

inherits(Poloniex, EventEmitter);

function Poloniex(base_currency, trade_currency, key, secret) {
  Poloniex.super_.call(this);

  // if (Array.isArray(pairs) == false) {
  //   pairs = [pairs];
  // }
  //
  // this.pairs = pairs.map(function(p) {return p.toUpperCase();});

  this.base_currency = base_currency;
  this.trade_currency = trade_currency;
  this.pair = (base_currency + "_" + trade_currency).toUpperCase();

  this.push = polo.api("push");
  this.account = polo.api("trading", {
    "key": key,
    "secret": secret
  });
};

Poloniex.prototype.name = function() {
  return "poloniex";
};

Poloniex.prototype.start = function(runner) {
  var self = this;

  this.account.returnBalances(function(err, balances) {
    if (err) return self.emit("error", new Error(err));

    var supply = {
      base: parseFloat(balances[self.base_currency]),
      trade: parseFloat(balances[self.trade_currency])
    };

    self.emit("initial_supply", supply);

    self.push.ticker(function(err, response) {
      if (err) {
        console.log("An error occurred: " + err.msg);
        // TODO: What do I do here?
      } else {
        if (self.pair == response.currencyPair) {
          var currencies = response.currencyPair.split("_");
          var options = {
            price: parseFloat(response.last),
            timestamp: new Date().getTime(),
            base_currency: currencies[0],
            trade_currency: currencies[1],
            feeder: self.name()
          };
          self.emit("tick", options);
        }
      }
    });
  });



};

module.exports = Poloniex;
