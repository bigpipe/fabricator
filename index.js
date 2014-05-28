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


function fabricateSync(type, stack) {
  switch (type) {
    case 'string':
      stack = fs.readdirSync(stack).map(function locate(file) {
        file = path.resolve(stack, file);

        //
        // Only read current directory and no subdirectories.
        //
        if (fs.statSync(file).isFile() && allowed(file)) {
          return init(file, path.basename(file, '.js'));
        }
      });
    break;

    case 'object':
      stack = Object.keys(stack).map(function map(entity) {
        if (!allowed(stack[entity])) return;
        return init(stack[entity], entity);
      });
    break;

    case 'array':
      stack = stack.map(function map(entity) {
        if (!allowed(entity)) return;
        return init(entity);
      });
    break;
  }

  return stack.filter(Boolean);
}

function fabricate() {
  // TODO implement
}

//
// Make sure we only use valid JavaScript files as sources. We want to
// ignore stuff like potential .log files. Also allow constructors.
// If there's no extension name we assume that it's a folder with an
// `index.js` file.
//
function allowed(file) {
  var extname = path.extname(file)
    , type = typeof file;

  return 'string' === type && (!extname || extname === '.js') || 'function' === type;
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
  // Set the provided name on the prototype if required.
  //
  if ('name' in constructor.prototype) {
    constructor.prototype.name = constructor.prototype.name || name || constructor.name;
  }

  return constructor;
}