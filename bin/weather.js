#!/usr/bin/env node
var weather = require("../index.js")
var argv = require("yargs").argv;
var path = require("path");

if (argv.config == null && argv.c == null) {
  console.log("Error: -c / --config not set.")
  process.exit(1);
}

var config = require(path.resolve(argv.c || argv.config));
var strategy = argv.s || argv.strategy || Object.keys(config)[0];
strategy = config[strategy];

weather.run([strategy]);
