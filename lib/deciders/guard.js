var inherits = require("util").inherits;
var EventEmitter = require("events");
var moment = require("moment");

inherits(Guard, EventEmitter);

// resolution: time in ms
function Guard() {
  Guard.super_.call(this);
};

Guard.prototype.event = function(event, options) {
  this[event].call(this, options);
};

Guard.prototype.price_change = function(options) {
  if (this.last_price == null) {
    this.last_price = options.price;
    this.last_timestamp = options.timestamp;
    console.log(`Trend: unknown`);
    console.log(this.last_timestamp);
    return;
  }

  if (options.timestamp >= this.last_timestamp + this.resolution) {
    if (options.price > this.last_price) {
      console.log("Trend: Up");
      this.trend_history.push("up");
      //console.log(options.timestamp);
    }

    if (options.price < this.last_price) {
      console.log("Trend: Down");
      this.trend_history.push("down");
      //console.log(options.timestamp);
    }

    this.last_price = options.price;
    this.last_timestamp = options.timestamp;
  }
};

module.exports = Guard;
