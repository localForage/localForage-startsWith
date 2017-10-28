import { extendPrototype } from 'localforage-startswith';

declare let localforage: LocalForage;

namespace LocalForageStartsWithTest {

    {
        let localforage2: LocalForageWithStartsWith = extendPrototype(localforage);
    }

    {
        let itemsPromise: Promise<LocalForageStartsWithResult> = localforage.startsWith('a');

        itemsPromise.then(promiseResults => {
          let results: LocalForageStartsWithResult = promiseResults;
          Object.keys(results).forEach(key => {
            let itemKey: string = key;
            let itemValue: any = results[key];
            console.log(itemKey, itemValue)
          })
        });
    }

    {
        let itemsPromise: Promise<string[]> = localforage.keysStartingWith('a');

        itemsPromise.then(promiseResults => {
          let results: string[] = promiseResults;
          results.forEach(key => {
            let itemKey: string = key;
            console.log(itemKey)
          })
        });
    }
}
