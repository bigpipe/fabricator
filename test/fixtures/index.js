//
// Constructor inside JS file.
//
exports.string = __dirname + '/constructor.js';

//
// Constructors inside directory.
//
exports.directory = __dirname + '/sub';

//
// Mix of types on array.
//
exports.array = [
  function Test() { /* noop */ },
  exports.directory
];

//
// Mix of types on object.
//
exports.object = {
  Status: function Status() { /* noop */ },
  another: function Another() { /* noop */ },
  latest: exports.string
};