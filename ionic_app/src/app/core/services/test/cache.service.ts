import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { UnifiedStorageService } from "./unified-storage.service";


interface metaDoc {
    id?: string;
    lastUpdate?: number;
}

@Injectable({providedIn: 'root'})
export class CacheService {

  private collection: Collection<any>;


  constructor(private unifiedStorageService: UnifiedStorageService){
    // dbName should be user id
    this.unifiedStorageService.initalize('test');
  this.collection = this.unifiedStorageService.getSertCollection('cache');
  }

  private getFromCollection<T>(id: string, propPath: string): T | null  {
    const searchPath = propPath + id;
    return this.collection.findOne({ cacheId: { $eq: searchPath} });
  }

  private static isValidVersion<T>(userMetaDoc: metaDoc, cachedDoc: T): boolean {
    return cachedDoc['lastUpdate'] === userMetaDoc.lastUpdate;
  }

  private removeDoc<T>(doc: T) {
    this.collection.remove(doc);
  }

  public delete(id: string, propPath: string) {
    const ifCacheDoc = this.getFromCollection(id, propPath);
    if (ifCacheDoc) {
      this.removeDoc(ifCacheDoc);
    } else {
      log('Cannot delete doc that does not exists', 'cacheService');
    }
  }

  public get<T>(metaDoc: metaDoc, propPath): T | void {
    let ifCachedObj = this.getFromCollection<T>(metaDoc.id, propPath);

    if (ifCachedObj) {
      if (CacheService.isValidVersion<T>(metaDoc, ifCachedObj))  {
        // editing cached objects will not make changes to the db. changes must go through set method.
        return JSON.parse(JSON.stringify(ifCachedObj));
      } else {
        this.removeDoc<T>(ifCachedObj);
        return;
      }
    } else {
      return;
    }
  }

  public set<T>(doc: T, propPath): void {
    doc['cacheId'] = propPath + doc['id'];
    this.collection.insert(doc);
    return;
  }
}