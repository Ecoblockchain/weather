var inherits = require("util").inherits;
var Decider = require("../decider");

inherits(TrendFollower, Decider);

function TrendFollower(surety, strict_trends) {
  TrendFollower.super_.call(this);
  this.surety = surety || 1;
  this.name = "TrendFollower";
  if (strict_trends) {
    this.strict_trends = true;
  } else {
    this.strict_trends = false;
  }
};

TrendFollower.prototype.initialize = function() {
  var self = this;

  this.get("candlestick").on("candle_closed", function(candle) {
    self.candle_closed(candle);
  });
};

TrendFollower.prototype.candle_closed = function(candle) {
  var self = this;

  var candles = this.get("candlestick").get_candles(this.surety);

  // console.log(candle.price_events.length);
  // console.log(candles.map(function(c) {return c.price_events.length}));
  // return this.runner.stop(new Error());

  if (candles.length < this.surety) {
    return;
  }

  if (this.isUptrend(candles)) {
    if (this.state.open_sells.length >= 1) {
      this.state.open_sells.forEach(function(sell) {
        sell.close("margin", self);
      });
    }

    if (this.state.hasOpenSupply("base")) {
      var position = this.state.open_position("buy", this.state.totalOpenSupply("base"), "margin", this);

      // If another decider closes our position, reevaluate.
      position.on("close", function(decider) {
        if (decider != self) {
          self.reset();
        }
      });
    }
  } else if(this.isDowntrend(candles)) {

    if (this.state.open_buys.length >= 1) {
      this.state.open_buys.forEach(function(buy) {
        buy.close("margin", self);
      });
    }

    if (this.state.hasOpenSupply("trade")) {
      var position = this.state.open_position("sell", this.state.totalOpenSupply("trade"), "margin", this);

      // If another decider closes our position, reevaluate.
      position.on("close", function(decider) {
        if (decider != self) {
          self.reset();
        }
      });
    }
  }
};

TrendFollower.prototype.isUptrend = function(candles) {
  return this.isTrend(candles, 1)
};

TrendFollower.prototype.isDowntrend = function(candles) {
  return this.isTrend(candles, -1);
};

TrendFollower.prototype.isTrend = function(candles, direction) {
  if (direction == null) {
    direction = -1;
  }

  for (var i = 1; i < candles.length; i++) {
    var last = candles[i - 1];
    var current = candles[i];

    if (this.strict_trends == true) {
      if ((current.low * direction) > (last.low * direction) && (current.high * direction) > (last.high * direction)) {
        continue;
      }
    } else {
      if ((current.low * direction) > (last.low * direction) || (current.high * direction) > (last.high * direction)) {
        continue;
      }
    }

    return false;
  }

  return true;
};

TrendFollower.prototype.name = function() {
  return "trendfollower";
};

module.exports = TrendFollower;
