var config = require("./config.js");
var Runner = require("../lib/runner");
var _ = require("lodash");

module.exports = function(options, callback) {
  var conf = _.clone(config.test);

  conf.deciders.trendfollower = [options.resolution, options.surety || 2, options.strict_trends == null ? true : options.strict];
  config.test.deciders.guard = [options.risk_percent];

  var runner = new Runner(conf);
  runner.run();
  runner.on("stop", function(summary) {
    var result = {
      options: options,
      summary: summary
    };

    callback(null, JSON.stringify(result));
  });
  runner.on("error", callback);
};
