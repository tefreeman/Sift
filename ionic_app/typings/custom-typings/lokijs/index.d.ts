

export as namespace loki;
export = Loki;

declare class Loki {
    constructor(
        filename:string,
        options?: optionsLokiConfig
    );

    configureOptions(options: optionsLokiConfig, initialConfig: boolean): void
    copy(options: {removeNonSerializable: boolean}): Loki
    addCollection(name:string, Options?: optionsAddCollection): Collection
    getCollection(collectionName: string): Collection
    renameCollection(oldName:string, newName:string): Collection
    listCollections(): Array<{name: string, type: string, count: number}>
    removeCollection(collectionName: string): void
    serialize(): string
    serializeDestructured(options?: optionsCustomSerialize): string | Array<string>
    serializeCollection(options?: {delimited: number, delimiter?: string, collectionIndex: number}): string | Array<string>
    deserializeDestructured(destructuredSource: string | Array<string>, options?: optionsCustomSerialize ): any //TODO
    deserializeCollection(destructuredSource: string, options?: {delimited?: boolean, delimiter?: string}): any
    loadJSON(serializedDb: string, options?: {retainDirtyFlags: Boolean}): void
    loadJSONObject(dbObject: object, options?: {retainDirtyFlags: Boolean}): void
    loadDatabase(options?:{recursiveWait?: boolean, recursiveWaitLimit?: boolean,recursiveWaitLimitDelay?: number }, callback?: (d: any)=> {}): void
    saveDatabase(callback?: (d?:any)=> {}): void
    deleteDatabase(callback?: (d?:any)=>{}): void
    close(callback?: ()=>{}): void
    generateChangesNotification(optional?: Array<string>): Array<any>
    serializeChanges(collectionNamesArray: Array<string>): string
    clearChanges(): void

}

declare class LokiMemoryAdapter {
    constructor(options: {asyncResponses: boolean, asyncTimeout: number})
}

declare class DynamicView {

}

declare class Collection {
    constructor(
        name: string,
        options?: optionsCollection
        )

    addTransform(name: string, transform: Array<object>): void
    getTransform (name:string): any // TODO
    removeTransform(name: string): void
    setTTL(age: number, interval: number): void
    configureOptions(options?: {adaptiveBinaryIndices?: boolean}): void
    ensureIndex(property: string, force?: boolean): void
    checkAllIndexes(options?: optionsCollectionIndex): Array<string>
    checkIndex(property: string, options?: optionsCollectionIndex): boolean
    ensureAllIndexes(force?: boolean): void
    count(query?: queryObject | object): number
    addDynamicView(name: string, options?: optionsDynamicView): DynamicView
    removeDynamicView(name: string): void
    getDynamicView(name: string): DynamicView
    findAndUpdate(filterObject: queryObject | object, updateFunction: (data:any)=>{}): void
    findAndRemove(filterObject: queryObject | object): void
    insert(doc: oneOrMany): oneOrMany
    clear(options: {removeIndices: boolean}): void
    update(doc: object): void
    updateWhere(filterFunction: Function, updateFunction: Function): void
    removeWhere(query: Function | object ): void
    remove(doc: object): void
    get(id: number, returnPosition?: boolean): object | Array<object> | null
    by(field: string, value: any ): object
    findOne(query: queryObject | object): object | null
    chain(transform: string | Array<string>, parameters?: object): object
    find(query: queryObject | object): Array<object>
    where(fun: Function): Array<object>
    mapReduce(mapFunction: Function, reduceFunction: Function): any //todo
    eqJoin(leftJoinProp: string, rightJoinProp: string, mapFun?: Function, dataOptions?: optionsEqJoin ): any

    // stages api
    getStage(name: string): object
    stage(stageName: string, obj: object): object
    commitStage(stageName: string, message: string): void
    extract(field: string): Array<object>
    max(field: string): number
    min(field: string): number
    maxRecord(field: string): number
    minRecord(field: string): number
    extractNumerical(field: string): number
    avg(field: string): number
    stdDev(field: string): number
    mode(field: string): number
    median(field: string): number
}

interface queryObject {
}

interface optionsEqJoin {
    removeMeta?: boolean
    forceClones?: boolean
    forceCloneMethod?: 'parse-stringify'| 'jquery-extend-deep' | 'shallow' | 'shallow-assign'
}
interface optionsDynamicView {
    persistent?: boolean,
    sortPriority?:  'passive' | 'active',
    minRebuildInterval?: number
}
interface optionsCollectionIndex {
    randomSampling?: boolean,
    randomSamplingFactor?: number,
    repair?: boolean
}
interface optionsCollection {
    unique?: Array<string>
    exact?: Array<string>
    indices?: Array<string>
    adaptiveBinaryIndices?: boolean,
    asyncListeners?: boolean,
    disableMeta?: boolean,
    disableChangesApi?: boolean,
    disableDeltaChangesApi?: boolean,
    autoupdate?: boolean,
    clone?: boolean,
    serializableIndices?: boolean,
    cloneMethod?: 'parse-stringify'| 'jquery-extend-deep' | 'shallow' | 'shallow-assign'
    ttl?: number,
    ttlInterval?: number
}
interface optionsCustomSerialize {
    partitioned?: boolean,
    partition?: number,
    delimited?: boolean,
    delimiter?: string 
}
interface optionsAddCollection {
    unique?: Array<string>
    exact?: Array<string>
    indices?: Array<string>
    asyncListeners?: boolean,
    disableMeta?: boolean,
    disableChangesApi?: boolean,
    disableDeltaChangesApi?: boolean,
    autoupdate?: boolean,
    clone?: boolean
    cloneMethod?: 'parse-stringify'| 'jquery-extend-deep' | 'shallow' | 'shallow-assign'
    ttl?: number,
    ttlInterval?: number

}
interface optionsLokiConfig {
    env?:optenv,
    verbose?: boolean,
    autosave?: boolean,
    autosaveInterval?: number,
    autoload?: boolean,
    autoloadCallback?: () => void,
    adapter?: any, //TODO
    serializationMethod?: serialmethod,
    destructureDelimter?: string,
    throttledSaves?: boolean
}

type oneOrMany = object | Array<object>
type serialmethod = 'normal' | 'pretty' | 'destructured';

type optenv = 'NODEJS' | 'BROWSER' | 'CORDOVA';

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 */
declare namespace Loki {
    export interface MyClassMethodOptions {
        width?: number;
        height?: number;
    }
    
}