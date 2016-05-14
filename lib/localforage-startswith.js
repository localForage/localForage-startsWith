import localforage from 'localforage';
import { executeCallback, getItemKeyValue } from './utils';
import { startsWithIndexedDB } from './startswith-indexeddb';
import { startsWithWebsql } from './startswith-websql';

export function startsWithGeneric(prefix, callback) {
    var localforageInstance = this;
    var promise = new Promise(function(resolve, reject) {
        localforageInstance.keys().then(function(keys) {

            var itemPromises = [];

            var prefixLength = prefix.length;
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];

                if (key.slice(0, prefixLength) === prefix) {
                    itemPromises.push(getItemKeyValue.call(localforageInstance, key));
                }
            }

            Promise.all(itemPromises).then(function(keyValuePairs) {
                var result = {};
                for (var i = 0, len = keyValuePairs.length; i < len; i++) {
                    var keyValuePair = keyValuePairs[i];

                    result[keyValuePair.key] = keyValuePair.value;
                }
                resolve(result);
            }).catch(reject);
        }).catch(reject);
    });
    executeCallback(promise, callback);
    return promise;
}

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

export function extendPrototype(localforage) {
    var localforagePrototype = Object.getPrototypeOf(localforage);
    if (localforagePrototype) {
        localforagePrototype.startsWith = localforageStartsWith;
    }
}

export var extendPrototypeResult = extendPrototype(localforage);
