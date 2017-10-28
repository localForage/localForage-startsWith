localForage-startsWith
======================
[![npm](https://img.shields.io/npm/dm/localforage-startswith.svg)](https://www.npmjs.com/package/localforage-startswith)  
Adds startsWith method to [localForage](https://github.com/mozilla/localForage).


## Requirements

* [localForage](https://github.com/mozilla/localForage) v1.4.0+
  * for earlier versions of localforage, please use the v1.1.x releases

## Installation
`npm i localforage-startswith`

### Known issues with module bundlers
In some cases `.startsWith()` might not automatically be made available to the `localforage` object on import. In this case, import the provided `extendPrototype()` method and extend it manually:

```js
import localforage from 'localforage';
import { extendPrototype } from 'localforage-startswith';

extendPrototype(localforage);

// Keep using localForage as usual.
```

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
