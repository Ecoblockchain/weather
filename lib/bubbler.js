function Bubbler(items) {
  this.keys = Object.keys(items);
  this.items = items;
};

Bubbler.prototype.event = function(event, options) {
  var self = this;

  this.keys.forEach(function(key) {
    var item = self.items[key];

    var fn = item[event];

    // Ignore events not handled.
    if (fn == null) {
      return;
    }

    // I really don't know why I have to catch these explicitly.
    // But oh well.
    try {
      fn.call(item, options);
    } catch(e) {
      item.emit("error", e);
    }
  });
};

Bubbler.prototype.on = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  this.keys.forEach(function(key) {
    var item = self.items[key];
    item.on.apply(item, args);
  });
};

Bubbler.prototype.emit = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  this.keys.forEach(function(key) {
    var item = self.items[key];
    item.emit.apply(item, args);
  });
};

Bubbler.prototype.trigger = function() {
  var self = this;
  var args = Array.prototype.slice.call(arguments);

  var fn_name = args.shift();

  this.keys.forEach(function(key) {
    var item = self.items[key];
    var fn = item[fn_name];

    if (fn == null) {
      throw new Error("Cannot trigger function " + fn_name + "!")
    }

    // I really don't know why I have to catch these explicitly.
    // But oh well.
    try {
      fn.apply(item, args);
    } catch(e) {
      item.emit("error", e);
    }
  });
};

Bubbler.prototype.get = function(name) {
  return this.items[name];
};


module.exports = Bubbler;
