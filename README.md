# Fabricator

Create collections of constructable instances from strings, arrays or objects.
Fabricator is a small helper module which does nothing else but detecting
constructable JS entities. Strings are resolved as file paths.

The module exposes a factory function which can be provided with an optional
completion callback. Providing the callback will make the discovery asynchronous.

The [BigPipe] project is using the fabricator to find Pages and/or Pagelets

### Installation

```bash
npm install fabricator --save
```

### Usage

```js
var fabricator = require('fabricator')
  , path = './path/to/pagelet/directory';
  , obj = { status: require('./npm-status-pagelet') }

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

Make sure devDependencies are installed and run the tests via:

```js
npm test
```

[BigPipe]: http://bigpipe.io/