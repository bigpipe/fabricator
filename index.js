'use strict';

var path = require('path')
  , fs = require('fs');

/**
 * Expose small fabrication helper.
 *
 * Possible options:
 *
 *  - source:    {String}   Absolute path to be used to resolve file paths.
 *  - recursive: {Boolean}  Should file paths be recursively discovered.
 *
 * @param {Mixed} stack String, array or object that contains constructible entities
 * @param {Object} options Optional options.
 * @returns {Array} collection of constructors.
 * @api public
 */
module.exports = function fabricator(stack, options) {
  var type = Object.prototype.toString.call(stack).slice(8, -1).toLowerCase();

  return fabricate(type, stack, options || {});
};

/**
 * Discover constructible entities.
 *
 * @param {String} type Typeof stack.
 * @param {Mixed} stack
 * @param {Object} options
 * @return {Array} filtered collection of constructible entities.
 * @api private
 */
function fabricate(type, stack, options) {
  switch (type) {
    case 'string':
      stack = read(stack, options);
    break;

    case 'object':
      stack = Object.keys(stack).reduce(iterator(read, stack, options), []);
    break;

    case 'array':
      stack = stack.reduce(iterator(read, null, options), []);
    break;
  }

  return stack.filter(Boolean);
}

/**
 * Read directory and initialize javascript files.
 *
 * @param {String} filepath Full directory path.
 * @param {Object} options
 * @return {Array} collection of constructors
 * @api private
 */
function read(filepath, options) {
  if (options.source) filepath = path.resolve(options.source, filepath);

  //
  // Check if the provided string is a JS file.
  //
  if (js(filepath)) return [
    init(filepath, path.basename(filepath, '.js'))
  ];

  //
  // Recursion on directories not allowed, initialize the index.js file.
  //
  if (options.recursive === false) return [
    init(filepath, path.basename(filepath, '.js'))
  ];

  //
  // Read the directory, only process files.
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
 * @param {Object} options
 * @return {Function} iterator
 * @api private
 */
function iterator(traverse, obj, options) {
  return function reduce(stack, entity) {
    var base = obj ? obj[entity] : entity
      , nojs = !js(base);

    //
    // Run the functions, traverse will handle init.
    //
    if (nojs) return stack.concat(traverse(base, options));
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
  if (!constructor.prototype) return;

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
