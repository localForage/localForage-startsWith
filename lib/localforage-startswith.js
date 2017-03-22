import localforage from 'localforage';
import { startsWith as startsWithIndexedDB } from './implementations/indexeddb';
import { startsWith as startsWithWebsql } from './implementations/websql';
import { startsWith as startsWithGeneric } from './implementations/generic';

export { startsWith as startsWithGeneric } from './implementations/generic';

// export function keysStartingWithGeneric(prefix, callback) {
//     var localforageInstance = this;
//     var promise = new Promise(function(resolve, reject) {
//         localforageInstance.keys().then(function(keys) {

//             var resultKeys = [];

//             var prefixLength = prefix.length;
//             for (var i = 0, len = keys.length; i < len; i++) {
//                 var key = keys[i];

//                 if (key.slice(0, prefixLength) === prefix) {
//                     resultKeys.push(key);
//                 }
//             }

//             resolve(resultKeys);
//         }).catch(reject);
//     });
//     executeCallback(promise, callback);
//     return promise;
// }

export function localforageStartsWith(prefix, callback) {
    var localforageInstance = this;
    var currentDriver = localforageInstance.driver();

    if (currentDriver === localforageInstance.INDEXEDDB) {
        return startsWithIndexedDB.call(localforageInstance, prefix, callback);
    } else if (currentDriver === localforageInstance.WEBSQL) {
        return startsWithWebsql.call(localforageInstance, prefix, callback);
    } else {
        return startsWithGeneric.call(localforageInstance, prefix, callback);
    }
}

// export function localforageKeysStartingWith(prefix, callback) {
//     var localforageInstance = this;
//     var currentDriver = localforageInstance.driver();

//     if (currentDriver === localforageInstance.INDEXEDDB) {
//         return keysStartingWithIndexedDB.call(localforageInstance, prefix, callback);
//     } else if (currentDriver === localforageInstance.WEBSQL) {
//         return keysStartingWithWebsql.call(localforageInstance, prefix, callback);
//     }else {
//         return keysStartingWithGeneric.call(localforageInstance, prefix, callback);
//     }
// }

export function extendPrototype(localforage) {
    var localforagePrototype = Object.getPrototypeOf(localforage);
    if (localforagePrototype) {
        localforagePrototype.startsWith = localforageStartsWith;
        // localforagePrototype.keysStartingWith = localforageKeysStartingWith;
    }
}

export var extendPrototypeResult = extendPrototype(localforage);
