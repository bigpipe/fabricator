'use strict';

var path = require('path')
  , fs = require('fs');

/**
 * Expose small fabrication helper. Provide an optional callback to run the method
 * asynchronously.
 *
 * @param {Mixed} stack String, array or object that contains constructable entities
 * @param {Function} done Completion callback.
 * @return {Array} collection of constructors, if called synchronously.
 * @api public
 */
module.exports = function fabricator(stack, done) {
  var type = typeof stack;
  if ('object' === type && Array.isArray(stack)) type = 'array';

  if ('function' !== typeof done) return fabricateSync(type, stack);
  fabricate(type, stack, done);
};

/**
 * Synchronous discover constructable entities.
 *
 * @param {String} type Typeof stack.
 * @param {Mixed} stack
 * @return {Array} filtered collection of constructable entities.
 * @api private
 */
function fabricateSync(type, stack) {
  switch (type) {
    case 'string':
      stack = readSync(stack);
    break;

    case 'object':
      stack = Object.keys(stack).reduce(iterator(readSync, stack), []);
    break;

    case 'array':
      stack = stack.reduce(iterator(readSync), []);
    break;
  }

  return stack.filter(Boolean);
}

/**
 * Asynchronously discover constructable entities.
 *
 * @param {String} type Typeof stack.
 * @param {Mixed} stack
 * @param {Function} done Completion callback.
 * @api private
 */
function fabricate(type, stack, done) {
  var result = [];

  switch (type) {
    case 'string':
      read(stack, done);
    break;

    case 'object':
      Object.keys(stack).reduce(iterator(
        read,
        stack,
        recur(Object.keys(stack).length, result, done)
      ), result);
    break;

    case 'array':
      stack.reduce(iterator(
        read,
        null,
        recur(stack.length, result, done)
      ), result);
    break;
  }
}

/**
 * Read directory and initialize javascript files.
 *
 * @param {String} filepath Full directory path.
 * @return {Array} collection of constructors
 * @api private
 */
function readSync(filepath) {
  //
  // Check if the provided string is a JS file.
  //
  if (js(filepath)) return [
    init(filepath, path.basename(filepath, '.js'))
  ];

  //
  // Read the directory synchronous, only process files.
  //
  return fs.readdirSync(filepath).map(function locate(file) {
    file = path.resolve(filepath, file);

    //
    // Only allow JS files, init determines if it is a constructable instance.
    //
    if (!fs.statSync(file).isFile() || !js(file)) return;
    return init(file, path.basename(file, '.js'));
  });
}

/**
 * Asynchronous read directory and initialize javascript files.
 *
 * @param {String} filepath Full directory path.
 * @param {done}
 * @api privat
 */
function read(filepath, done) {
  var iterate;

  //
  // Check if the provided string is a JS file.
  //
  if (js(filepath)) return done(null, [
    init(filepath, path.basename(filepath, '.js'))
  ]);

  //
  // Read the directory asynchronous, only process files.
  //
  fs.readdir(filepath, function readfilepath(error, files) {
    if (error) return done(error);

    iterate = recur(files.length, [], done);
    files.forEach(function map(file) {
      file = path.resolve(filepath, file);

      if (!js(file)) return iterate();
      fs.stat(file, function details(error, stat) {
        if (error || !stat.isFile()) return iterate();
        iterate(null, init(file, path.basename(file, '.js')));
      });
    });
  });
}

/**
 * Return iterator for array or object.
 *
 * @param {Function} traverse Recursive iterator, called on directories.
 * @param {Object} obj Original object, if set values are fetched by entity.
 * @param {Function} done Optional completion callback.
 * @return {Function} iterator
 * @api private
 */
function iterator(traverse, obj, done) {
  return function reduce(stack, entity) {
    var base = obj ? obj[entity] : entity
      , nojs = !js(base);

    //
    // Run traverse function async, callback was provided, traverse will init.
    //
    if ('function' === typeof done) {
      if (nojs) return traverse(base, done);
      return done(null, init(base, entity));
    }

    //
    // Run the sync functions, traverse will handle init.
    //
    if (nojs) return stack.concat(traverse(base));
    return stack.concat(init(base, entity));
  };
}

/**
 * Result mapper, returns when all callbacks finished.
 *
 * @param {Number} n Number of execution before done is called.
 * @param {Array} results Stack to push results into.
 * @param {Function} done Completion callback.
 * @returns {Fuction} handler to process files after finished iteration.
 * @api private
 */
function recur(n, results, done) {
  return function iterate(error, files) {
    if (!error && files) results = results.concat(files);

    //
    // Check if the base stack is completely processed.
    //
    if (!--n) return done(error, results.filter(Boolean));
  };
}

/**
 * Make sure only valid JavaScript files are used as source. Ignore other files,
 * like .log files. Also allow constructors.
 *
 * @param {String|Function} file Path or constructor function.
 * @returns {Boolean} allow entity to be used or not.
 * @api private
 */
function js(file) {
  var extname = path.extname(file)
    , type = typeof file;

  return 'function' === type || 'string' === type && extname === '.js';
}

/**
 * It's not required to supply resolve with instances, we can just
 * automatically require them if they are using the:
 *
 *   module.exports = function Constructor() {};
 *
 * @param {String} constructor
 * @param {String} name Optional identifier for the constructor.
 * @returns {Object} initialized object
 * @api private
 */
function init(constructor, name) {
  constructor = ('string' === typeof constructor) ? require(constructor) : constructor;
  if (!constructor.prototype) return false;

  //
  // Sets the lowercase name on the prototype if required.
  //
  if ('name' in constructor.prototype) {
    constructor.prototype.name = (
      constructor.prototype.name || name || constructor.name
    ).toLowerCase();
  }

  return constructor;
}