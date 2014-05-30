describe('Fabricator', function () {
  'use strict';

  var fabricator = require('../')
    , assume = require('assume')
    , fixtures = require('./fixtures');

  it('exposes factory function', function() {
    assume(fabricator).to.be.a('function');
  });

  it('can be called (a)synchronous and returns an array', function (done) {
    var result = fabricator(fixtures.array);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);

    fabricator(fixtures.array, function (error, result) {
      assume(error).to.equal(null);
      assume(result).to.be.an('array');
      assume(result.length).to.equal(2);

      done();
    });
  });

  it('can init constructors from file paths', function (done) {
    var result = fabricator(fixtures.string);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    fabricator(fixtures.string, function (error, result) {
      assume(error).to.equal(null);
      assume(result).to.be.an('array');
      assume(result.length).to.equal(1);

      done();
    });
  });

  it('will discover constructors in subdirectories and ignore other JS files', function (done) {
    var result = fabricator(fixtures.directory);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);

    fabricator(fixtures.directory, function (error, result) {
      assume(error).to.equal(null);
      assume(result).to.be.an('array');
      assume(result.length).to.equal(1);

      done();
    });
  });

  it('will discover constructors from objects', function (done) {
    var result = fabricator(fixtures.object);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);

    fabricator(fixtures.object, function (error, result) {
      assume(error).to.equal(null);
      assume(result).to.be.an('array');
      assume(result.length).to.equal(3);

      done();
    });
  });

  it('will discover constructors from arrays', function (done) {
    var result = fabricator(fixtures.array);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);

    fabricator(fixtures.array, function (error, result) {
      assume(error).to.equal(null);
      assume(result).to.be.an('array');
      assume(result.length).to.equal(2);

      done();
    });
  });

  it('sets prototype.name to lowercase object key if prototype.name is falsy', function () {
    fixtures.object.Status.prototype.name = '';
    assume(fabricator(fixtures.object)[0].prototype.name).to.equal('status');
  });

  it('sets prototype.name to filename if prototype.name is falsy', function () {
    require(fixtures.string).prototype.name = '';
    assume(fabricator(fixtures.string)[0].prototype.name).to.equal('constructor');
  });
});