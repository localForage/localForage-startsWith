/// <reference types="localforage" />

interface LocalForageStartsWithResult {
    [key: string]: any;
}

interface ILocalForageWithStartsWith {
    startsWith(key: string): Promise<LocalForageStartsWithResult>;
    keysStartingWith(key: string): Promise<string[]>;
}

interface LocalForage extends ILocalForageWithStartsWith { }

interface LocalForageWithStartsWith extends LocalForage { }

declare module "localforage-startswith" {
    export function extendPrototype(localforage: LocalForage)
        : LocalForageWithStartsWith;

    export var extendPrototypeResult: boolean;
}
