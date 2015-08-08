#Molecule.js
It's yet another little library for making creating classes easy. It borrows a little bit from PHP, ember.js, and .NET.

[![Build Status](https://travis-ci.org/dxprog/molecule.js.svg)](https://travis-ci.org/dxprog/molecule.js)

##Use

    // Simple class
    var MyClass = Molecule({
        __construct: function() {
            // The __construct function is called automatically when the object is instantiated via new
        }
    });

    // Extended class
    var ExtendedClass = MyClass.extend({
        __construct: function() {
            // Call the parent __construct
            this.super.__construct.apply(this, arguments);
        }
    });

    // Multiple extension
    var ExtendedClass = Molecule(MyClass, ExtendedClass, {
        __construct: function() {
            // Call the parent __construct
            this.super.__construct.apply(this, arguments);
        }
    });

    var instance = new ExtendedClass();