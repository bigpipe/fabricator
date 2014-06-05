'use strict';

var path = require('path')
  , fs = require('fs');

/**
 * Expose small fabrication helper. Provide an optional callback to run the method
 * asynchronously.
 *
 * @param {Mixed} stack String, array or object that contains constructible entities
 * @param {String} source Optional absolute path to be used to resolve filepaths
 * @return {Array} collection of constructors, if called synchronously.
 * @api public
 */
module.exports = function fabricator(stack, source) {
  var type = typeof stack;
  if ('object' === type && Array.isArray(stack)) type = 'array';

  //
  // Call the fabricate function (a)synchronously.
  //
  return fabricate(type, stack, source);
};

/**
 * Synchronous discover constructible entities.
 *
 * @param {String} type Typeof stack.
 * @param {Mixed} stack
 * @param {String} source Optional absolute path to be used to resolve filepaths
 * @return {Array} filtered collection of constructible entities.
 * @api private
 */
function fabricate(type, stack, source) {
  switch (type) {
    case 'string':
      stack = readSync(stack, source);
    break;

    case 'object':
      stack = Object.keys(stack).reduce(iterator(readSync, stack, source), []);
    break;

    case 'array':
      stack = stack.reduce(iterator(readSync, source), []);
    break;
  }

  return stack.filter(Boolean);
}

/**
 * Read directory and initialize javascript files.
 *
 * @param {String} filepath Full directory path.
 * @return {Array} collection of constructors
 * @api private
 */
function readSync(filepath, source) {
  if (source) filepath = path.resolve(source, filepath);

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
    // Only allow JS files, init determines if it is a constructible instance.
    //
    if (!fs.statSync(file).isFile() || !js(file)) return;
    return init(file, path.basename(file, '.js'));
  });
}

/**
 * Return iterator for array or object.
 *
 * @param {Function} traverse Recursive iterator, called on directories.
 * @param {Object} obj Original object, if set values are fetched by entity.
 * @param {String} source Optional absolute path to be used to resolve filepaths
 * @return {Function} iterator
 * @api private
 */
function iterator(traverse, obj, source) {
  return function reduce(stack, entity) {
    var base = obj ? obj[entity] : entity
      , nojs = !js(base);

    //
    // Run the sync functions, traverse will handle init.
    //
    if (nojs) return stack.concat(traverse(base, source));
    return stack.concat(init(base, entity));
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