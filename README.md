localForage-startsWith
======================
[![npm](https://img.shields.io/npm/dm/localforage-startswith.svg)](https://www.npmjs.com/package/localforage-startswith)  
Adds startsWith method to [localForage](https://github.com/mozilla/localForage).


## Requirements

* [localForage](https://github.com/mozilla/localForage) v1.4.0+
  * for earlier versions of localforage, please use the v1.1.x releases

## Installation
`npm i localforage-startswith`

## Importing

Adding a `<script>` reference to your page will extend the localforage object to also include the `.startsWith()`.

### TypeScript

[Include `localforage` with an import statement appropriate for your configuration](https://github.com/localForage/localForage/blob/master/README.md#typescript) and import `localforage-startswith` right after it.

Normally, `localforage-startswith` will extend the prototype of `locaforage` to include the `startsWith()` method, but unfortunately the typings can't be updated. As a result you should use the exported `extendPrototype()` method, which returns the provided localforage instance but with inherited typings that also include the `startsWith()` method.

```javascript
import localForage from 'localforage';
// OR based on your configuration:
// import * as localForage from 'localforage';

import { extendPrototype } from 'localforage-startswith';

extendPrototype(localforage);

// Keep using localForage as usual.
```

### Known issues with module bundlers

In some ES6 module bundlers `.startsWith()` might not automatically be made available to the `localforage` object on import.
In this case, import the provided `extendPrototype()` method and extend `localforage` manually, as shown in the Typescript section.


## API

### startsWith(keyPrefix)

Retrieves an object with all the items that have keys starting with the provided parameter.
```js
localforage.startsWith('user-1').then(function(results) {
  console.log(results);
  // prints:
  // {
  //   'user-1-todo-1': "11aa1111bbcc",
  //   'user-1-todo-2': "22aa2222bbcc",
  //   'user-1-todo-3': "33aa3333bbcc",
  //   'user-1-todo-4': "44aa4444bbcc"
  // }
});
```

### keysStartingWith(keyPrefix)

Retrieves an array with all the keys starting with the provided parameter.
```js
localforage.keysStartingWith('user-1').then(function(results) {
  console.log(results);
  // prints:
  // [
  //   'user-1-todo-1',
  //   'user-1-todo-2',
  //   'user-1-todo-3',
  //   'user-1-todo-4'
  // ]
});
```

