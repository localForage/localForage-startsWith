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
            return Promise.reject(new Error('localforage.getSerializer() was not available! ' + 'localforage v1.4+ is required!'));
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

    function startsWith(prefix, callback) {
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

    function keysStartingWith(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.ready().then(function () {
                // Thanks https://hacks.mozilla.org/2014/06/breaking-the-borders-of-indexeddb/
                var dbInfo = localforageInstance._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

                var keyRangeValue = idbKeyRange.bound(prefix, prefix + 'uffff', false, false);

                var result = [];

                if (typeof store.getAllKeys === 'function') {
                    (function () {
                        var req = store.getAllKeys(keyRangeValue);
                        req.onsuccess = function () /*event*/{
                            resolve(req.result);
                        };

                        req.onerror = function () /*event*/{
                            reject(req.error);
                        };
                    })();
                } else {
                    (function () {
                        var req = store.openCursor(keyRangeValue);
                        req.onsuccess = function () /*event*/{
                            var cursor = req.result; // event.target.result;

                            if (cursor) {
                                result.push(cursor.key);

                                cursor.continue();
                            } else {
                                resolve(result);
                            }
                        };

                        req.onerror = function () /*event*/{
                            reject(req.error);
                        };
                    })();
                }
            }).catch(reject);
        });
        executeCallback(promise, callback);
        return promise;
    }

    function startsWith$1(prefix, callback) {
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

    function keysStartingWith$1(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.ready().then(function () {
                var dbInfo = localforageInstance._dbInfo;
                dbInfo.db.transaction(function (t) {
                    t.executeSql('SELECT key FROM ' + dbInfo.storeName + ' WHERE (key LIKE ?)', [prefix + '%'], function (t, results) {

                        var result = [];

                        var rows = results.rows;
                        for (var i = 0, len = rows.length; i < len; i++) {
                            var item = rows.item(i);

                            result.push(item.key);
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

    function startsWith$2(prefix, callback) {
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

    function keysStartingWith$2(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function (resolve, reject) {
            localforageInstance.keys().then(function (keys) {

                var result = [];

                var prefixLength = prefix.length;
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];

                    if (key.slice(0, prefixLength) === prefix) {
                        result.push(key);
                    }
                }

                resolve(result);
            }).catch(reject);
        });
        executeCallback(promise, callback);
        return promise;
    }

    function localforageStartsWith(prefix, callback) {
        var localforageInstance = this;
        var currentDriver = localforageInstance.driver();

        if (currentDriver === localforageInstance.INDEXEDDB) {
            return startsWith.call(localforageInstance, prefix, callback);
        } else if (currentDriver === localforageInstance.WEBSQL) {
            return startsWith$1.call(localforageInstance, prefix, callback);
        } else {
            return startsWith$2.call(localforageInstance, prefix, callback);
        }
    }

    function localforageKeysStartingWith(prefix, callback) {
        var localforageInstance = this;
        var currentDriver = localforageInstance.driver();

        if (currentDriver === localforageInstance.INDEXEDDB) {
            return keysStartingWith.call(localforageInstance, prefix, callback);
        } else if (currentDriver === localforageInstance.WEBSQL) {
            return keysStartingWith$1.call(localforageInstance, prefix, callback);
        } else {
            return keysStartingWith$2.call(localforageInstance, prefix, callback);
        }
    }

    function extendPrototype(localforage) {
        var localforagePrototype = Object.getPrototypeOf(localforage);
        if (localforagePrototype) {
            localforagePrototype.startsWith = localforageStartsWith;
            localforagePrototype.keysStartingWith = localforageKeysStartingWith;
        }
    }

    var extendPrototypeResult = extendPrototype(localforage);

    exports.localforageStartsWith = localforageStartsWith;
    exports.localforageKeysStartingWith = localforageKeysStartingWith;
    exports.extendPrototype = extendPrototype;
    exports.extendPrototypeResult = extendPrototypeResult;
    exports.startsWithGeneric = startsWith$2;
    exports.keysStartingWithGeneric = keysStartingWith$2;

}));