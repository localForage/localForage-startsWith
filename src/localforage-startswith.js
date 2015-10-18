(function() {
    'use strict';

    // Promises!
    var Promise = (typeof module !== 'undefined' && module.exports) ?
                  require('promise') : this.Promise;

    var globalObject = this;
    var serializer = null;

    var ModuleType = {
        DEFINE: 1,
        EXPORT: 2,
        WINDOW: 3
    };

    // Attaching to window (i.e. no module loader) is the assumed,
    // simple default.
    var moduleType = ModuleType.WINDOW;

    // Find out what kind of module setup we have; if none, we'll just attach
    // localForage to the main window.
    if (typeof define === 'function' && define.amd) {
        moduleType = ModuleType.DEFINE;
    } else if (typeof module !== 'undefined' && module.exports) {
        moduleType = ModuleType.EXPORT;
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

    function startsWithGeneric(prefix, callback) {
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

    function startsWithIndexedDB(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function(resolve, reject) {
            localforageInstance.ready().then(function() {
                // Thanks https://hacks.mozilla.org/2014/06/breaking-the-borders-of-indexeddb/
                var dbInfo = localforageInstance._dbInfo;
                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly')
                            .objectStore(dbInfo.storeName);

                // Initialize IDBKeyRange; fall back to vendor-prefixed versions if needed.
                var IDBKeyRange = IDBKeyRange || globalObject.IDBKeyRange || globalObject.webkitIndexedDB ||
                    globalObject.mozIndexedDB || globalObject.OIndexedDB ||
                    globalObject.msIndexedDB;

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

    function startsWithWebsql(prefix, callback) {
        var localforageInstance = this;
        var promise = new Promise(function(resolve, reject) {
            localforageInstance.ready().then(function() {
                return getSerializer(localforageInstance);
            }).then(function(serializer) {
                var dbInfo = localforageInstance._dbInfo;
                dbInfo.db.transaction(function(t) {
                    t.executeSql('SELECT * FROM ' + dbInfo.storeName +
                        ' WHERE (key LIKE ?)', [prefix + '%'],
                        function(t, results) {

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
                        },
                        function(t, error) {
                            reject(error);
                        });
                });
            }).catch(reject);
        });
        executeCallback(promise, callback);
        return promise;
    }


    function getSerializer(localforageInstance) {
        if (serializer) {
            return Promise.resolve(serializer);
        }

        // add support for localforage v1.3.x
        if (localforageInstance &&
            typeof localforageInstance.getSerializer === 'function') {
            return localforageInstance.getSerializer();
        }

        var serializerPromise = new Promise(function(resolve/*, reject*/) {
            // We allow localForage to be declared as a module or as a
            // library available without AMD/require.js.
            if (moduleType === ModuleType.DEFINE) {
                require(['localforageSerializer'], resolve);
            } else if (moduleType === ModuleType.EXPORT) {
                // Making it browserify friendly
                resolve(require('./../utils/serializer'));
            } else {
                resolve(globalObject.localforageSerializer);
            }
        });

        return serializerPromise.then(function(lib) {
            serializer = lib;
            return Promise.resolve(serializer);
        });
    }

    function getItemKeyValue(key, callback) {
        var localforageInstance = this;
        var promise = localforageInstance.getItem(key).then(function(value) {
            return {
                key: key,
                value: value
            };
        });
        executeCallback(promise, callback);
        return promise;
    }

    function executeCallback(promise, callback) {
        if (callback) {
            promise.then(function(result) {
                callback(null, result);
            }, function(error) {
                callback(error);
            });
        }
    }

    function extendPrototype(localforage) {
        var localforagePrototype = Object.getPrototypeOf(localforage);
        if (localforagePrototype) {
            localforagePrototype.startsWith = localforageStartsWith;
        }
    }

    extendPrototype(localforage);

    if (moduleType === ModuleType.DEFINE) {
        define('localforage-startswith', function() {
            return localforageStartsWith;
        });
    } else if (moduleType === ModuleType.EXPORT) {
        module.exports = localforageStartsWith;
    } else {
        this.localforageStartsWith = localforageStartsWith;
    }
}).call(window);
