var inherits = require("util").inherits;
var CandleStick = require("./candlestick");

inherits(TrendFollower, CandleStick);

// resolution: time in ms
function TrendFollower(resolution, surety) {
  TrendFollower.super_.call(this, resolution);
  this.surety = surety || 2;
};

TrendFollower.prototype.event = function(event, options) {
  var fn = this[event];

  // Ignore events we don't handle.
  if (fn == null) {
    return;
  }

  fn.call(this, options);
};

TrendFollower.prototype.candle_closed = function(candle) {
  // console.log("open: " + candle.open);
  // console.log("close:" + candle.close);
  // console.log("high: " + candle.high);
  // console.log("low:  " + candle.low);
  // console.log("count:" + candle.price_events.length)
  // console.log("---")

  var candles = this.get_candles(this.surety);

  if (candles.length < this.surety) {
    return;
  }

  if (this.isUptrend(candles)) {
    if (this.state.open_sells.length >= 1) {
      this.state.open_sells.forEach(function(sell) {
        sell.close("margin");
      });
    }

    if (this.state.hasOpenSupply("base")) {
      this.state.open_position("buy", this.state.totalOpenSupply("base"), "margin");
    }
  } else if(this.isDowntrend(candles)) {

    if (this.state.open_buys.length >= 1) {
      this.state.open_buys.forEach(function(buy) {
        buy.close("margin");
      });
    }

    if (this.state.hasOpenSupply("trade")) {
      this.state.open_position("sell", this.state.totalOpenSupply("trade"), "margin");
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

    if ((current.open * direction) > (last.open * direction) && (current.close * direction) > (last.close * direction)) {
      continue;
    } else {
      return false;
    }
  }

  return true;
};

module.exports = TrendFollower;
