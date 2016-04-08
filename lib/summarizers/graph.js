var inherits = require("util").inherits;
var EventEmitter = require("events").EventEmitter;
var path = require("path");
var moment = require("moment");
var d3 = require("d3");
var jsdom = require("jsdom");
var multiline = require("multiline");
var fs = require("fs");

inherits(Graph, EventEmitter);

function Graph(outputDir, resolution) {
  Graph.super_.call(this);

  resolution = (resolution || "1 day").split(" ");

  if (resolution.length > 0) {
    resolution[0] = parseInt(resolution[0]);
  }

  this.resolution = moment.duration.apply(moment.duration, resolution).asMilliseconds();
  this.outputDir = path.resolve(outputDir || process.cwd());
  this.history = [];
  this.cohort = [];
};

Graph.prototype.tick = function(options) {
  if (this.cohort.length == 0) {
    this.cohort.push(options);
    return;
  }

  var first = this.cohort[0];
  if (first.timestamp + this.resolution <= options.timestamp) {
    var sum = 0;
    this.cohort.forEach(function(tick) {
      sum += tick.price;
    });
    var average = sum / this.cohort.length;

    var last = this.cohort[this.cohort.length - 1];
    var timestamp = first.timestamp + ((last.timestamp - first.timestamp) / 2);

    this.history.push({date: timestamp, average: average});
    this.cohort = [];
  } else {
    this.cohort.push(options);
  }
};

Graph.prototype.summarize = function(summary) {

  var document = jsdom.jsdom('<!DOCTYPE html><html><meta http-equiv="content-type" content="text/html; charset=utf-8"><head></head><body></body></html>');
  var window = document.defaultView;
  var head = document.getElementsByTagName('head')[0];
  style = document.createElement("style");
  style.type = 'text/css';
  style.innerHTML = multiline(function(){/*
    html {
      width: 100%;
      height: 100%;
    }

    body {
      font: 10px sans-serif;
      width: 100%;
      height: 100%;
    }

    .axis path,
    .axis line {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }

    .x.axis path {
      display: none;
    }

    .line {
      fill: none;
      stroke: steelblue;
      stroke-width: 1.5px;
    }
  */});
  head.appendChild(style);

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var formatDate = d3.time.format("%d-%b-%y");

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.average); });

  var svg = d3.select(document.body).append("svg")
    .attr("id", "svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('viewBox','0 0 600 600')
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(this.history, function(d) { return d.date; }));
  y.domain(d3.extent(this.history, function(d) { return d.average; }));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price (base)");

  svg.append("path")
    .datum(this.history)
    .attr("class", "line")
    .attr("d", line);


  var filename = (summary.strategy.name || "Unnamed Strategy") + "_" + new Date().getTime() + ".html";
  filename = filename.replace(" ", "_");
  filename = filename.toLowerCase();

  fs.writeFileSync(path.resolve(path.join(this.outputDir, filename)), window.document.documentElement.outerHTML, {encoding: "utf8"});
};

module.exports = Graph;
