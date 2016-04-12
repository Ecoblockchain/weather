var inherits = require("util").inherits;
var EventEmitter = require("events");
var util = require("../util");

inherits(SMA, EventEmitter);

function SMA(resolutions) {
  var self = this;

  SMA.super_.call(this);
  if (!Array.isArray(resolutions)) {
    resolutions = [resolutions];
  }

  this.resolutions = resolutions.map(function(r) {return util.resolutionAsMilliseconds(r)});
  this.maxResolution = Math.max.apply(Math, resolutions);
  this.averages = {};
  this.histories = {};
  this.sums = {};

  this.resolutions.forEach(function(resolution) {
    self.averages[resolution] = [];
    self.histories[resolution] = [];
    self.sums[resolution] = 0;
  });
};

SMA.prototype.tick = function(tick) {
  var self = this;

  this.resolutions.forEach(function(resolution) {
    var history = self.histories[resolution];

    history.push(tick);

    self.sums[resolution] += tick.price;

    var oldest = history[0];

    while (oldest.timestamp < tick.timestamp - resolution) {
      var removed = history.shift();

      self.sums[resolution] -= removed.price;

      if (history.length > 0) {
        oldest = history[0];
      }
    }

    //console.log(self.sums[resolution])
  });

  // Average
  this.resolutions.forEach(function(resolution) {
    var average = self.sums[resolution] / self.histories[resolution].length;
    self.averages[resolution].push(average);
  });
};

module.exports = SMA;
