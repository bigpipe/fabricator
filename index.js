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
 *  - name:      {String}   Force a name for a given constructor.
 *
 * @param {Mixed} stack String, array or object that contains constructible entities
 * @param {Object} options Optional options.
 * @returns {Array} collection of constructors.
 * @api public
 */
function fabricator(stack, options) {
  options = options || {};

  //
  // Empty strings, arrays or objects should not be processed, return early.
  //
  if (empty(stack)) return [];

  switch (is(stack)) {
    case 'string':
      stack = read(stack, options);
    break;

    case 'object':
      stack = Object.keys(stack).reduce(iterator(read, stack, options), []);
    break;

    case 'array':
      stack = stack.reduce(iterator(read, null, options), []);
    break;

    default:
      if ('function' !== typeof stack) {
        throw new Error('Unsupported type, cannot fabricate an: '+ is(stack));
      }

      stack = [init(stack, undefined, options)];
  }

  return (stack || []).filter(Boolean);
}

/**
 * Read directory and initialize JavaScript files.
 *
 * @param {String} filepath Full directory path.
 * @param {Object} options Additional configuration.
 * @return {Array} collection of constructor
 * @api private
 */
function read(filepath, options) {
  if ('string' !== is(filepath)) return fabricator(filepath, options);
  if (options.source) filepath = path.resolve(options.source, filepath);

  //
  // Check if the provided string is a JS file or when recursion is not allowed.
  //
  if (js(filepath) || options.recursive === false) return [
    init(filepath, path.basename(filepath, '.js'), options)
  ];

  //
  // Read the directory, only process files.
  //
  if (!fs.existsSync(filepath)) return false;
  return fs.readdirSync(filepath).map(function locate(file) {
    file = path.resolve(filepath, file);

    var stat = fs.statSync(file);

    if (stat.isDirectory() && fs.existsSync(path.join(file, 'index.js'))) {
      //
      // Use the directory name instead of `index` for name as it probably has
      // more meaning then just `index` as a name.
      //
      return init(path.join(file, 'index.js'), path.basename(file, '.js'), options);
    }

    //
    // Only allow JS files, init determines if it is a constructible instance.
    //
    if (!stat.isFile() || !js(file)) return;

    return init(file, path.basename(file, '.js'), options);
  });
}

/**
 * Return iterator for array or object.
 *
 * @param {Function} traverse Recursive iterator, called on directories.
 * @param {Object} obj Original object, if set values are fetched by entity.
 * @param {Object} options Configuration.
 * @return {Function} iterator
 * @api private
 */
function iterator(traverse, obj, options) {
  return function reduce(stack, entity) {
    var base = obj ? obj[entity] : entity
      , name = options.name || entity;

    //
    // Fabricated objects should provide each constructor with the name
    // of its property on the original object.
    //
    if (obj) options.name = entity;

    //
    // Run the functions, traverse will handle init.
    //
    if (js(base)) {
      return stack.concat(init(
        base,
        'string' === is(name) ? name : '',
        options
      ));
    }

    //
    // When we've been supplied with an array as base assume we want to keep it
    // as array and do not want it to be merged.
    //
    if (Array.isArray(base)) {
      options.name = name; // Force the name of the entry for all items in array.
      stack.push(traverse(base, options));

      return stack;
    }

    return stack.concat(traverse(base, options));
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
  var type = is(file);

  return 'function' === type
  || 'string' === type && path.extname(file) === '.js';
}

/**
 * A better alternative to `typeof` checks by trying to figure out the root
 * class of things. This eliminates the needs for Array.is checks when the type
 * is an object etc.
 *
 * @param {Mixed} obj Unknown thing we need to know.
 * @returns {String}
 * @api private
 */
function is(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

/**
 * Simple check to see if the provided stack is empty or falsy.
 *
 * @param {Mixed} value Entity to check
 * @return {Boolean} result of check
 * @api private
 */
function empty(value) {
  if (!value) return true;
  switch (is(value)) {
    case "object": return !Object.keys(value).length;
    case "array": return !value.length;
    default: return !value;
  }
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
function init(constructor, name, options) {
  constructor = ('string' === is(constructor)) ? require(constructor) : constructor;

  //
  // We really want to have a function/class here. Make sure that we can
  // construct it using `new constructor`
  //
  if (!constructor.prototype) return;

  name = constructor.prototype.name || name || constructor.name;
  if (options.name) name = options.name;

  //
  // Sets the name on the prototype to a string.
  //
  if ('name' in constructor.prototype) {
    constructor.prototype.name = name.toString();
  }

  return constructor;
}

//
// Expose the module.
//
module.exports = fabricator;
