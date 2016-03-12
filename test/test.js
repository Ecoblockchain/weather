var assert = require('chai').assert;
var fs = require("fs");
var Runner = require("../lib/runner");

// Path relative to the
var config = require("./config.js");

describe("TrendFollower w/ Guard", function() {
  it("should profit from kraken's BTC/LTC market", function(done) {
    this.timeout(300000);
    var runner = new Runner(config["test"]);
    runner.run();
    runner.on("stop", function(summary) {

      done();
    });
    runner.on("error", done);
  });
});
