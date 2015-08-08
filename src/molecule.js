(function(undefined) {

  var CONSTRUCTOR = '__construct';
  var PARENT = '_parent';

  /**
   * The molecule creator
   * @method Molecule
   * @param {Object} proto The methods and properties to create the object with
   * @return {Function} The molecule
   */
  function Molecule(proto) {

    // If multiple objects were passed, do a mixin
    if (arguments.length > 1) {
      return createMultiMolecule(Array.prototype.slice.call(arguments, 0));
    }

    var retVal = function() {

      // If a constructor was set, call it
      if (typeof this[CONSTRUCTOR] === 'function') {
        this[CONSTRUCTOR].apply(this, arguments);
      }

    };

    // If this is another molecule, extend properties and methods
    retVal._isMolecule = true;
    if (this._isMolecule) {
      retVal.prototype = Object.create(this.prototype);
      retVal.prototype.constructor = retVal;
    }

    // For forever chaining
    retVal.extend = Molecule;

    // Copy properties and methods to the generated function
    for (var i in proto) {
      if (proto.hasOwnProperty(i)) {

        // Check for overriden function from parent class
        if (typeof retVal.prototype[i] === 'function') {

          proto[i].super = (function(_super, i) {
            return function() {
              var _tempSuper;
              var retVal;

              // If the parent has a super function, temporarily swap out the child
              // functions super for the parent's so that we can call all the way up the chain
              if (typeof _super.super === 'function') {
                _tempSuper = this[i].super;
                this[i].super = _super.super;
              }
              retVal = _super.apply(this, arguments);

              // Restore the old super function
              if (_tempSuper) {
                this[i].super = _tempSuper;
              }

              return retVal;
            };
          }(retVal.prototype[i], i));
        }

        retVal.prototype[i] = proto[i];

      }
    }

    return retVal;
  }

  function createMultiMolecule(objects) {

    var i = 0;
    var count = objects.length;
    var retVal = null;

    // If the first object is a Molecule, start with that as the base
    if (objects[0] && objects[0]._isMolecule) {
      retVal = objects[0];
      i++;
    }

    for (; i < count; i++) {
      var obj = objects[i];
      if (typeof obj === 'object' || typeof obj === 'function') {
        if (retVal) {
          retVal = retVal.extend(obj._isMolecule ? obj.prototype : obj);
        } else {
          retVal = Molecule(obj);
        }
      } else {
        throw 'Class extensions must be a ';
      }
    }

    return retVal;

  }

  window.Molecule = Molecule;

}());