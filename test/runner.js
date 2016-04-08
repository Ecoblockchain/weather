#!/usr/bin/env node
var async = require("async");
var _ = require("lodash");
var argv = require('yargs').argv;
var weather = require("../index.js");
var path = require("path")
var _ = require("lodash")

var base_strategy = {
  "feeders": {
    "bitcoincharts_csv": ["./test/krakenLTC.csv", "BTC", "LTC", 10, 0]
  },
  "analyzers": {
    "candlestick": ["2 hour"]
  },
  "deciders": {
    "guard": [.5],
    "trendfollower": [5, true]
  },
  "executers": {
    "backtest": []
  }
};

var runs = [];
var count = 0;

for (var r = 1; r <= 30; r++) {
  for (var surety = 2; surety <= 5; surety++) {
    for (var risk_percent = 0; risk_percent <= 3; risk_percent++) {
      var strategy = _.clone(base_strategy);

      strategy.analyzers.candlestick = [r + " minutes"];
      strategy.deciders.trendfollower = [surety, true];
      strategy.deciders.guard = [risk_percent * .05];

      runs.push(strategy);
    }
  }
}


if (argv.p) {
  console.log(runs)
  process.exit();
}

weather.run(runs);
