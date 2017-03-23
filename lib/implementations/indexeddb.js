import { executeCallback } from './../utils';
import IDBKeyRange from './idbKeyRange';

export function startsWith(prefix, callback) {
    var localforageInstance = this;
    var promise = new Promise(function(resolve, reject) {
        localforageInstance.ready().then(function() {
            // Thanks https://hacks.mozilla.org/2014/06/breaking-the-borders-of-indexeddb/
            var dbInfo = localforageInstance._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                        .objectStore(dbInfo.storeName);

            var keyRangeValue = IDBKeyRange.bound(prefix, prefix + 'uffff', false, false);

            var result = {};
            var req = store.openCursor(keyRangeValue);
            req.onsuccess = function(/*event*/) {
                var cursor = req.result; // event.target.result;

                if (cursor) {
                    var value = cursor.value;
                    if (value === undefined) {
                        value = null;
                    }

                    result[cursor.key] = value;

                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            req.onerror = function(/*event*/) {
                reject(req.error);
            };
        }).catch(reject);
    });
    executeCallback(promise, callback);
    return promise;
}

export function keysStartingWith(prefix, callback) {
    var localforageInstance = this;
    var promise = new Promise(function(resolve, reject) {
        localforageInstance.ready().then(function() {
            // Thanks https://hacks.mozilla.org/2014/06/breaking-the-borders-of-indexeddb/
            var dbInfo = localforageInstance._dbInfo;
            var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                        .objectStore(dbInfo.storeName);

            var keyRangeValue = IDBKeyRange.bound(prefix, prefix + 'uffff', false, false);

            var result = [];

            if (typeof store.getAllKeys === 'function') {
                let req = store.getAllKeys(keyRangeValue);
                req.onsuccess = function(/*event*/) {
                    resolve(req.result);
                };

                req.onerror = function(/*event*/) {
                    reject(req.error);
                };
            } else {
                let req = store.openCursor(keyRangeValue);
                req.onsuccess = function(/*event*/) {
                    var cursor = req.result; // event.target.result;

                    if (cursor) {
                        result.push(cursor.key);

                        cursor.continue();
                    } else {
                        resolve(result);
                    }
                };

                req.onerror = function(/*event*/) {
                    reject(req.error);
                };
            }
        }).catch(reject);
    });
    executeCallback(promise, callback);
    return promise;
}
