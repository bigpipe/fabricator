'use strict';

/**
 * Return a constructor with a name field.
 *
 * @returns {Function} created constructor;
 * @api private
 */
function fn() {
  function Y(x, y) { x = y; }
  Y.prototype.name = '';

  return Y;
}

//
// Constructor inside JS file.
//
exports.string = __dirname + '/constructor.js';

//
// Constructors inside directory.
//
exports.directory = __dirname + '/sub';

//
// Constructors in a nested/sub directory.
//
exports.nested = __dirname + '/nested';

//
// Relative file path with can be resolved.
//
exports.relative = 'sub';

//
// Just a simple function.
//
exports.fn = fn();

//
// Mix of types on array.
//
exports.array = [
  fn(),
  exports.directory
];

//
// Mix of types on object.
//
exports.object = {
  1: fn(),
  another: fn(),
  latest: exports.string
};

//
// Mix of multiple things.
//
exports.objectarray = {
  placeholder: [fn(), fn(), exports.directory],
  another: [exports.string, fn()],
  last: [fn()],
  latest: exports.string
};
