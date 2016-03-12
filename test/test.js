var assert = require('chai').assert;
var fs = require("fs");
var Runner = require("../lib/runner");

// Path relative to the
var config = require("./config.js");

describe("test", function() {
  it("profit from kraken's BTC/LTC market with the trendfollower, 100% of trades matched", function(done) {
    this.timeout(300000);
    var runner = new Runner(config["test"]);
    runner.run();
    runner.on("stop", done);
    runner.on("error", done);
  });
});
