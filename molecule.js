function Classinator(proto) {
  var retVal = function() {
    if (typeof this.__constructor === 'function') {
      this.__constructor.apply(this, arguments);
    }
  };
  retVal._isClass = true;

  if (this._isClass) {
    retVal.prototype = new this();
  }

  retVal.extend = Classinator;

  for (var i in proto) {
    if (proto.hasOwnProperty(i)) {

      // Check for override
      if (typeof retVal.prototype[i] === 'function') {
        var _super = retVal.prototype[i];
        retVal.prototype[i] = (function(_super) {
          var _wrap = function() {
            proto[i].apply(this, arguments);
          };
          _wrap.super = function() {
            _super.apply(this, arguments);
          };
          return _wrap;
        }(_super));
      } else {
        retVal.prototype[i] = proto[i];
      }

    }
  }

  return retVal;
}

var Car = Classinator({
  __constructor: function(make, model) {
    this.make = make;
    this.model = model;
  },

  identify: function() {
    console.log('I am a ' + this.make + ' ' + this.model);
  }

});

var Chevy = Car.extend({
  __constructor: function(model) {
    this.__constructor.super('Chevy', model);
  }
});

var aveo = new Chevy('Aveo');
aveo.identify();
