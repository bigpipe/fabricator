describe('Fabricator', function () {
  'use strict';

  var fabricator = require('../')
    , assume = require('assume')
    , fixtures = require('./fixtures');

  it('exposes factory function', function() {
    assume(fabricator).to.be.a('function');
  });

  it('always returns an array', function () {
    var result = fabricator(fixtures.array);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('returns early if the stack is empty or falsy', function () {
    var result = fabricator([false]);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(0);
  });

  it('can init constructors from file paths', function () {
    var result = fabricator(fixtures.string);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
      assume(fn.prototype.name).to.equal('with name');
    });
  });

  it('can force a name on constructors', function () {
    var result = fabricator(fixtures.string, { name: 'foo' });

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
      assume(fn.prototype.name).to.equal('foo');
    });
  });

  it('transforms functions in to arrays', function () {
    var result = fabricator(fixtures.fn);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('will discover constructors in subdirectories and ignore other JS files', function () {
    var result = fabricator(fixtures.directory);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('throws an error when we receive an invalid type', function (next) {
    try { fabricator(Date.now()); }
    catch (e) { next(); }
  });

  it('can be provided with a absolute source path to resolve filepaths', function () {
    var path = __dirname + '/fixtures'
      , result = fabricator(fixtures.relative, { source: path });

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('can be prevented from recursing a directory', function () {
    var result = fabricator(fixtures.directory, { recursive: false });

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('can read out sub directories', function () {
    var result = fabricator(fixtures.nested);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('will discover constructors from objects', function () {
    var result = fabricator(fixtures.object);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('will discover constructors from arrays', function () {
    var result = fabricator(fixtures.array);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);

    result.forEach(function (fn) {
      assume(fn).to.be.a('function');
    });
  });

  it('will discover multiple constructors', function () {
    var result = fabricator(fixtures.objectarray);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(4);

    var last = result.pop();
    assume(last).to.be.a('function');

    result.forEach(function (thing) {
      assume(thing).to.be.a('array');

      thing.forEach(function (fn) {
        assume(fn).to.be.a('function');
      });
    });

    result[0].forEach(function (fn) {
      assume(fn.prototype.name).to.equal('placeholder');
    });
  });

  it('sets prototype.name to the stringified object key if prototype.name is falsy', function () {
    fixtures.object[1].prototype.name = '';
    assume(fabricator(fixtures.object)[0].prototype.name).to.equal('1');
  });

  it('sets prototype.name to filename if prototype.name is falsy', function () {
    require(fixtures.string).prototype.name = '';
    assume(fabricator(fixtures.string)[0].prototype.name).to.equal('constructor');
  });
});
