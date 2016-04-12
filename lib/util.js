var moment = require("moment");

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function resolutionAsMilliseconds(resolution) {
  resolution = resolution.split(" ");

  if (resolution.length > 0) {
    resolution[0] = parseInt(resolution[0]);
  }

  return moment.duration.apply(moment.duration, resolution).asMilliseconds();
}

module.exports = {
  toTitleCase: toTitleCase,
  resolutionAsMilliseconds: resolutionAsMilliseconds
}
