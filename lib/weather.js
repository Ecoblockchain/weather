var argv = require("yargs").argv;
var fs = require("fs");
var Runner = require("./runner");

if (argv.config == null && argv.c == null) {
  console.log("Error: -c / --config not set.")
  process.exit(1);
}

if (argv.strategy == null && argv.s == null) {
  console.log("Error: -s / --strategy not set.");
}

var config = JSON.parse(fs.readFileSync(argv.config, {encoding: "utf8"}));

var runner = new Runner(config[strategy]);
runner.run();

module.exports = Runner;
