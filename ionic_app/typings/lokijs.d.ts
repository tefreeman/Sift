declare module 'lokijs' {
    class Loki extends LokiEventEmiter {
    constructor(
        filename:string,
        options?: optionsLokiConfig
    );


    configureOptions(options: optionsLokiConfig, initialConfig: boolean): void
    copy(options: {removeNonSerializable: boolean}): Loki
    addCollection(name:string, Options?: optionsAddCollection): CollectionTest
    getCollection(collectionName: string): CollectionTest
    renameCollection(oldName:string, newName:string): CollectionTest
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

class LokiEventEmiter {
    events: object;
    asyncListeners: boolean;

    addListener: (eventName: string | Array<string>, listener: Function): Number
    on(eventName: string | string[], listener: Function): Number
    emit(eventName: string, data: object): void
    removeListener(eventName: string, listener: Function): void
}
   export interface CollectionTest extends Collection {}

 class LokiMemoryAdapter {
    constructor(options?: {asyncResponses?: boolean, asyncTimeout?: number})
    loadDatabase(dbName: string, callback: Function): void
    saveDatabase(dbName: string, callback: Function): void
    deleteDatabase(dbName: string, callback: Function): void

}
    class LokiPartitioningAdapter {
        constructor(adapter: any, options?: optionsPartitionAdapter) 
         //TODO change adapter to adapter type
         loadDatabase(dbName: string, callback: Function): void
         loadNextPartition(partition: number, callback: Function): void
         saveNextPage(callback: Function): void
         saveNextPartition(callback: Function): void
         loadNextPage(callback: Function): void
         exportDatabase(dbName: string, dbref: object, callback: Function): void
    }

    class LokiFsAdapter {
        loadDatabase(dbName: string, callback: Function): void
        saveDatabase(dbName: string, callback: Function): void
        deleteDatabase(dbName: string, callback: Function): void
    }

    class LokiLocalStorageAdapter {
        loadDatabase(dbName: string, callback: Function): void
        saveDatabase(dbName: string, callback: Function): void
        deleteDatabase(dbName: string, callback: Function): void
        throttledSaveDrain(callback: Function, options?: optionsThrottleSaves )
    }

    interface optionsThrottleSaves {
        recursiveWait?: boolean
        recursiveWaitLimit?: boolean
        recursiveWaitLimitDelay?: number
    }

   class DynamicView extends LokiEventEmiter  {
    constructor(collection: Collection, name: string, options?: optionsDynamicView  )
    rematerialize(options?: any): DynamicView
    branchResultset(transform: string | Array<any>, options?: any ): Resultset
    removeFilters(options?: {queueSortPhase?: boolean}): void
    applySort(comparefun: Function): DynamicView
    applySimpleSort(propname: string, options: boolean | optionsApplySimpleSort ): DynamicView
    applySortCriteria(...array: any[]): DynamicView
    startTransaction(): DynamicView
    commit(): DynamicView
    rollback(): DynamicView
    reapplyFilters(): DynamicView
    applyFilter(filter: dynamicViewFilterObj): DynamicView
    applyFind(query: queryObject, uid?: string | number): DynamicView
    applyWhere(fun: Function, uid?: string | number): DynamicView
    removeFilter(uid: string | number): DynamicView
    count(): number
    data(options?: optionsClone): Array<object>
    mapReduce(mapFunction: TypeMapFunction, reduceFunction: TypeReduceFunction): Array<object> | object




}


  export class Collection extends LokiEventEmiter  {
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
    chain(transform: string | Array<string>, parameters?: object): Resultset
    find(query: queryObject | object): Array<object>
    where(fun: Function): Array<object>
    mapReduce(mapFunction: TypeMapFunction, reduceFunction: TypeReduceFunction): any //todo
    eqJoin(leftJoinProp: string, rightJoinProp: string, mapFun?: Function, dataOptions?: optionsClone ): Resultset

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

    class Resultset {
        branch: () => Resultset
        constructor(collection: Collection)
        reset(): Resultset
        limit(qty: number): Resultset
        offset(pos: number): Resultset
        copy(): Resultset
        transform(transform: string | Array<any>, parameters?: object): Resultset
        sort(comparefun: Function): Resultset
        simplesort(propName: string, options?: optionsResultSetSort ): Resultset
        compoundsort(properties: Array<any>): Resultset
        findOr(expressionArray: Array<any>): Resultset
        findAnd(expressionArray: Array<any>): Resultset
        find(query: queryObject, firstOnly?: boolean): Resultset
        count(): number
        data(options?: optionsClone): Array<object>
        update(updateFunction: (obj: object)=>object): Resultset
        remove(): Resultset
        mapReduce(mapFunction: TypeMapFunction, reduceFunction: TypeReduceFunction ): any
        eqJoin(leftJoinProp: string, rightJoinProp: string, mapFun?: Function, dataOptions?: optionsClone ): Resultset
        map(mapFun: TypeMapFunction, dataOptions?: optionsClone): Resultset

    }
    interface optionsResultSetSort{
        desc?: boolean
        disableIndexIntersect?: boolean
        forceIndexIntersect?: boolean
        useJavascriptSorting?: boolean
    }
interface optionsPartitionAdapter {
    paging?: boolean
    pageSize?: number
    delimiter?: string
}

interface dynamicViewFilterObj {
    'type': any
    'val': any
    'uid':string | number
}
interface optionsApplySimpleSort {
    desc?: boolean
    disableIndexIntersect?: boolean
    forceIndexIntersect?: boolean
    useJavascriptSorting?: boolean
}

 interface optionsClone {
    removeMeta?: boolean
    forceClones?: boolean
    forceCloneMethod?: CloneType
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
    cloneMethod?: CloneType
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
    cloneMethod?: CloneType
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
    destructureDelimiter?: string,
    throttledSaves?: boolean
}

type queryObject = object
type TypeMapFunction = (doc: object) => object;
type TypeReduceFunction = (docs: Array<object>) => any;
type oneOrMany = object | Array<object>
type serialmethod = 'normal' | 'pretty' | 'destructured';
type CloneType = 'parse-stringify'| 'jquery-extend-deep' | 'shallow' | 'shallow-assign'
type optenv = 'NODEJS' | 'BROWSER' | 'CORDOVA';
namespace Loki{}
export = Loki;
}