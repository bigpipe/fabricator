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
exports.fn = function nope() { /* noop */};

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

//
// Mix of multiple things.
//
exports.objectarray = {
  placeholder: [function Foo(){ /* noop */ }, function Bar() { /* noop */ }],
  another: [exports.string, function Baz() { /* noop */ }],
  last: [function Last(){ /* noop */ }],
  latest: exports.string
};
