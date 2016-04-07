var Runner = require("./runner.js");
var _ = require("lodash");

module.exports = function(strategy, callback) {
  var conf = _.clone(strategy);

  var runner = new Runner(conf);
  runner.run();
  runner.on("stop", function(summary) {
    var result = {
      strategy: strategy,
      summary: summary
    };

    callback(null, JSON.stringify(result));
  });
  runner.on("error", callback);
};
