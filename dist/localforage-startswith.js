(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('localforage')) :
    typeof define === 'function' && define.amd ? define(['exports', 'localforage'], factory) :
    (factory((global.localforageStartsWith = global.localforageStartsWith || {}),global.localforage));
}(this, function (exports,localforage) { 'use strict';

    localforage = 'default' in localforage ? localforage['default'] : localforage;

    function getSerializerPromise(localForageInstance) {
        if (getSerializerPromise.result) {
            return getSerializerPromise.result;
        }
        if (!localForageInstance || typeof localForageInstance.getSerializer !== 'function') {
            Promise.reject(new Error('localforage.getSerializer() was not available! ' + 'localforage v1.4+ is required!'));
        }
        getSerializerPromise.result = localForageInstance.getSerializer();
        return getSerializerPromise.result;
    }

    function executeCallback(promise, callback) {
        if (callback) {
            promise.then(function (result) {
                callback(null, result);
            }, function (error) {
                callback(error);
            });
        }
    }

    function getItemKeyValue(key, callback) {
        var localforageInstance = this;
        var promise = localforageInstance.getItem(key).then(function (value) {
            return {
                key: key,
                value: value
            };
        });
        executeCallback(promise, callback);
        return promise;
    }

    function getIDBKeyRange() {
        /* global IDBKeyRange, webkitIDBKeyRange, mozIDBKeyRange */
        if (typeof IDBKeyRange !== 'undefined') {
            return IDBKeyRange;
        }
        if (typeof webkitIDBKeyRange !== 'undefined') {
            return webkitIDBKeyRange;
        }
        if (typeof mozIDBKeyRange !== 'undefined') {
            return mozIDBKeyRange;
        }
    }

    var idbKeyRange = getIDBKeyRange();

    function startsWithIndexedDB(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.ready().then(function () {
                // Thanks https://hacks.mozilla.org/2014/06/breaking-the-borders-of-indexeddb/
                var dbInfo = localforageInstance._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

                var keyRangeValue = idbKeyRange.bound(prefix, prefix + 'uffff', false, false);

                var result = {};
                var req = store.openCursor(keyRangeValue);
                req.onsuccess = function () /*event*/{
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

                req.onerror = function () /*event*/{
                    reject(req.error);
                };
            }).catch(reject);
        });
        executeCallback(promise, callback);
        return promise;
    }

    function startsWithWebsql(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.ready().then(function () {
                return getSerializerPromise(localforageInstance);
            }).then(function (serializer) {
                var dbInfo = localforageInstance._dbInfo;
                dbInfo.db.transaction(function (t) {
                    t.executeSql('SELECT * FROM ' + dbInfo.storeName + ' WHERE (key LIKE ?)', [prefix + '%'], function (t, results) {

                        var result = {};

                        var rows = results.rows;
                        for (var i = 0, len = rows.length; i < len; i++) {
                            var item = rows.item(i);
                            var value = item.value;

                            // Check to see if this is serialized content we need to
                            // unpack.
                            if (value) {
                                value = serializer.deserialize(value);
                            }

                            result[item.key] = value;
                        }

                        resolve(result);
                    }, function (t, error) {
                        reject(error);
                    });
                });
            }).catch(reject);
        });
        executeCallback(promise, callback);
        return promise;
    }

    function startsWithGeneric(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.keys().then(function (keys) {

                var itemPromises = [];

                var prefixLength = prefix.length;
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];

                    if (key.slice(0, prefixLength) === prefix) {
                        itemPromises.push(getItemKeyValue.call(localforageInstance, key));
                    }
                }

                Promise.all(itemPromises).then(function (keyValuePairs) {
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

    function localforageStartsWith(prefix, callback) {
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

    function extendPrototype(localforage) {
        var localforagePrototype = Object.getPrototypeOf(localforage);
        if (localforagePrototype) {
            localforagePrototype.startsWith = localforageStartsWith;
        }
    }

    var extendPrototypeResult = extendPrototype(localforage);

    exports.startsWithGeneric = startsWithGeneric;
    exports.localforageStartsWith = localforageStartsWith;
    exports.extendPrototype = extendPrototype;
    exports.extendPrototypeResult = extendPrototypeResult;

}));