// Bootstrapping for mocha (node) vs karma (browser) tests
var require = require || function(){};
var Molecule = typeof window !== 'undefined' ? window.Molecule : require('../src/molecule');
var sinon = sinon || require('sinon');
var expect = expect || require('chai').expect;

describe('Molecule tests', function() {

  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Basic tests', function() {

    it('should exist as Molecule', function() {
      expect(Molecule).to.be.a('function');
    });

    it('should create a function with the object properties on the prototype', function() {
      var MyClass = Molecule({
            func: function() {},
            prop: 'hi!'
          });
      expect(MyClass).to.be.a('function');

      var instance = new MyClass();
      expect(instance.func).to.be.a('function');
      expect(instance.prop).to.be.a('string');
    });

    it('should invoke the constructor', function() {
      var spy = sandbox.spy();
      var MyClass = Molecule({ __construct: spy });
      var instance = new MyClass();
      sinon.assert.calledOnce(spy);
    });
  });

  describe('class extending', function() {

    var MyClass;
    var yellSpy;

    beforeEach(function() {
      yellSpy = sandbox.spy();
      MyClass = Molecule({
        yell: yellSpy,
        prop: 'hi!'
      });
    });

    it('extended classes should inherit the parent methods/properties', function() {
      var talkSpy = sandbox.spy()
      var OtherClass = MyClass.extend({
        talk: talkSpy,
        val: 'value'
      });
      var instance = new OtherClass();

      // Child method
      instance.talk();
      sinon.assert.calledOnce(talkSpy);

      // Child property
      expect(instance.val).to.equal('value');

      // Parent method
      instance.yell();
      sinon.assert.calledOnce(yellSpy);

      // Parent property
      expect(instance.prop).to.equal('hi!');
    });

    it('overridden functions should have a super method', function() {
      var OtherClass = MyClass.extend({
        yell: function() {
          this.yell.super.call(this);
        }
      });
      var instance = new OtherClass();

      sandbox.spy(instance, 'yell');
      instance.yell();

      sinon.assert.calledOnce(instance.yell);
      sinon.assert.calledOnce(yellSpy);
    });

    it('should call super functions up the extension chain', function() {
      var class1Flag = false;
      var Class1 = MyClass.extend({
        yell: function() {
          class1Flag = true;
          this.yell.super.call(this);
        }
      });

      var Class2 = Class1.extend({
        yell: function() {
          this.yell.super.call(this);
        }
      });

      var instance = new Class2();
      sandbox.spy(instance, 'yell');
      instance.yell();

      sinon.assert.calledOnce(instance.yell);
      expect(class1Flag).to.equal(true);
      sinon.assert.calledOnce(yellSpy);
    });

    it('should return values up through the extension chain', function() {
      var hello = 'Hello';
      var Class1 = Molecule({
        talk: function() {
          return hello;
        }
      });

      var Class2 = Class1.extend({
        talk: function() {
          return this.talk.super.call(this);
        }
      });

      var instance = new Class2();
      expect(instance.talk()).to.equal(hello);
    });

  });

  describe('Multi-molecule definitions', function() {

    var duck;
    var weasel;

    beforeEach(function() {
      duck = {
        __construct: function() {
          this.animal = [ 'duck' ];
        },
        quack: function() {
          return 'quack';
        }
      };

      weasel = {
        __construct: function() {
          this.__construct.super.call(this);
          this.animal.push('weasel');
        },
        weasel: function() {
          return 'weasel things';
        }
      };
    });

    it('should correctly mixin multiple objects', function() {
      var Platypus = Molecule(duck, weasel, {
        toString: function() {
          return this.animal.join(' ');
        }
      });
      var platypus = new Platypus();

      expect(platypus.toString()).to.equal('duck weasel');
      expect(platypus.quack).to.be.a('function');
      expect(platypus.weasel).to.be.a('function');

    });

    it('should extend Molecules where possible', function() {
      var Duck = Molecule(duck);
      var Weasel = Molecule(weasel);
      var Mutant = Molecule(Duck, Weasel, {
        __construct: function() {
          this.__construct.super.call(this);
          this.animal.push('X-man');
        },
        weasel: function() {
          return 'snikt';
        },
        quack: function() {
          return 'sonic boom';
        },
        toString: function() {
          return this.animal.join(' ');
        }
      });

      var mutant = new Mutant();

      expect(mutant.toString()).to.equal('duck weasel X-man');
      expect(mutant.weasel()).to.equal('snikt');
      expect(mutant.quack()).to.equal('sonic boom');

    });

  });

});