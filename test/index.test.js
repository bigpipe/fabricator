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
  });

  it('can init constructors from file paths', function () {
    var result = fabricator(fixtures.string);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);
  });

  it('will discover constructors in subdirectories and ignore other JS files', function () {
    var result = fabricator(fixtures.directory);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);
  });

  it('can be provided with a absolute source path to resolve filepaths', function () {
    var path = __dirname + '/fixtures'
      , result = fabricator(fixtures.relative, { source: path });

    assume(result).to.be.an('array');
    assume(result.length).to.equal(2);
  });

  it('can be prevented from recursing a directory', function () {
    var path = __dirname + '/fixtures'
      , result = fabricator(fixtures.directory, { recursive: false });

    assume(result).to.be.an('array');
    assume(result.length).to.equal(1);
  });

  it('will discover constructors from objects', function () {
    var result = fabricator(fixtures.object);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);
  });

  it('will discover constructors from arrays', function () {
    var result = fabricator(fixtures.array);

    assume(result).to.be.an('array');
    assume(result.length).to.equal(3);
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