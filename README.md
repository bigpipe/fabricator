# Fabricator [![Build Status][status]](https://travis-ci.org/bigpipe/fabricator) [![NPM version][npmimgurl]](http://badge.fury.io/js/fabricator) [![Coverage Status][coverage]](http://coveralls.io/r/bigpipe/fabricator?branch=master)

[status]: https://travis-ci.org/bigpipe/fabricator.png
[npmimgurl]: https://badge.fury.io/js/fabricator.png
[coverage]: http://coveralls.io/repos/bigpipe/fabricator/badge.png?branch=master

Discover collections of constructible instances from strings (filepaths),
arrays or objects. Fabricator is a small helper module which does nothing
else but detecting constructible JS entities. Strings are resolved as filepaths.

The module exposes a factory function which can be provided with an optional
completion callback. Providing the callback will make the discovery asynchronous.

The [BigPipe] project is using the fabricator to find Pages and/or Pagelets. This
gives developers using BigPipe more flexibility. For example, you don't have to
worry about adding each Page constructor to BigPipe, simply provide the directory
they reside in.

### Installation

```bash
npm install fabricator --save
```

### Usage

```js
var fabricator = require('fabricator')
  , path = './path/to/directory/with/constructibles';
  , obj = {
      status: require('./npm-status-pagelet'),
      extended: __dirname + '/i/can/be/a/path/to/a/constructor.js'
    }

//
// Discover constructors synchronously.
//
var stack = fabricator(obj);

//
// Similar to above but asynchronously.
//
fabricator(path, function fabricate(error, results) {
  console.log(results);
});
```

### Tests

Make sure devDependencies are installed, after run the tests via:

```js
npm test
```

[BigPipe]: http://bigpipe.io/