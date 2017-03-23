import localforage from 'localforage';
import {
    startsWith as startsWithIndexedDB,
    keysStartingWith as keysStartingWithIndexedDB
} from './implementations/indexeddb';
import {
    startsWith as startsWithWebsql,
    keysStartingWith as keysStartingWithWebsql
} from './implementations/websql';
import {
    startsWith as startsWithGeneric,
    keysStartingWith as keysStartingWithGeneric
} from './implementations/generic';

export {
    startsWith as startsWithGeneric,
    keysStartingWith as keysStartingWithGeneric
} from './implementations/generic';


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

export function localforageKeysStartingWith(prefix, callback) {
    var localforageInstance = this;
    var currentDriver = localforageInstance.driver();

    if (currentDriver === localforageInstance.INDEXEDDB) {
        return keysStartingWithIndexedDB.call(localforageInstance, prefix, callback);
    } else if (currentDriver === localforageInstance.WEBSQL) {
        return keysStartingWithWebsql.call(localforageInstance, prefix, callback);
    }else {
        return keysStartingWithGeneric.call(localforageInstance, prefix, callback);
    }
}

export function extendPrototype(localforage) {
    var localforagePrototype = Object.getPrototypeOf(localforage);
    if (localforagePrototype) {
        localforagePrototype.startsWith = localforageStartsWith;
        localforagePrototype.keysStartingWith = localforageKeysStartingWith;
    }
}

export var extendPrototypeResult = extendPrototype(localforage);
