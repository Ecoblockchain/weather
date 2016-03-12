function Bubbler(items) {
  this.items = items;
};

Bubbler.prototype.event = function(name, options) {
  this.items.forEach(function(item) {
    item.event(name, options);
  });
};

Bubbler.prototype.on = function() {
  var args = Array.prototype.slice.call(arguments);

  this.items.forEach(function(item) {
    item.on.apply(item, args);
  });
};

Bubbler.prototype.emit = function() {
  var args = Array.prototype.slice.call(arguments);

  this.items.forEach(function(item) {
    item.emit.apply(item, args);
  });
};

Bubbler.prototype.trigger = function() {
  var args = Array.prototype.slice.call(arguments);

  var fn_name = args.shift();

  this.items.forEach(function(item) {
    item[fn_name].apply(item, args);
  });
};


module.exports = Bubbler;
