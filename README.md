# Fabricator

[![Version npm][version]](http://browsenpm.org/package/fabricator)[![Build Status][build]](https://travis-ci.org/bigpipe/fabricator)[![Dependencies][david]](https://david-dm.org/bigpipe/fabricator)[![Coverage Status][cover]](https://coveralls.io/r/bigpipe/fabricator?branch=master)

[version]: http://img.shields.io/npm/v/fabricator.svg?style=flat-square
[build]: http://img.shields.io/travis/bigpipe/fabricator/master.svg?style=flat-square
[david]: https://img.shields.io/david/bigpipe/fabricator.svg?style=flat-square
[cover]: http://img.shields.io/coveralls/bigpipe/fabricator/master.svg?style=flat-square

Discover collections of constructible instances from strings (filepaths),
arrays or objects. Fabricator is a small helper module which does nothing
else but detecting constructible JS entities. Strings are resolved as filepaths.

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
// Discover constructors.
//
var stack = fabricator(obj);
```

### Tests

Make sure devDependencies are installed, after run the tests via:

```js
npm test
```

[BigPipe]: http://bigpipe.io/