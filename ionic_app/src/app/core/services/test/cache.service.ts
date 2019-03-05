import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { UnifiedStorageService } from "./unified-storage.service";


interface metaDoc {
    id?: string;
    lastUpdate?: number;
}

@Injectable({ providedIn: "root" })
export class CacheService {

  private collection: Collection<any>;


  constructor(private unifiedStorageService: UnifiedStorageService) {
    // dbName should be user id
    this.collection = this.unifiedStorageService.getSertCollection("cache");
  }

  private static stripMetaData(doc) {
    if (!doc) {
      return;
    }
    const cleanedDoc = Object.assign({}, doc);
    delete cleanedDoc["meta"];
    delete cleanedDoc["$loki"];
    return cleanedDoc;
  }


  private getFromCollection<T>(id: string, propPath: string): T | null {
    const searchPath = propPath + id;
    return this.collection.findOne({ cacheId: { $eq: searchPath } });
  }

  private static isValidVersion<T>(userMetaDoc: metaDoc, cachedDoc: T): boolean {
    return cachedDoc["lastUpdate"] === userMetaDoc.lastUpdate;
  }

  private removeDoc<T>(doc: T) {
    log('removingDoc');
    this.collection.remove(doc);
    this.unifiedStorageService.saveChanges();
  }


  public delete(id: string, propPath: string) {
    const ifCacheDoc = this.getFromCollection(id, propPath);
    if (ifCacheDoc) {
      this.removeDoc(ifCacheDoc);
    } else {
      log("Cannot delete doc that does not exists", "cacheService");
    }
  }

  private updateDoc<T>(id: string, propPath: string, updateDoc: T) {
    const searchPath = propPath + id;
    this.collection.findAndUpdate({ cacheId: { $eq: searchPath } }, (doc) => {
      Object.assign(doc, updateDoc);
      return doc;
    });
    this.unifiedStorageService.saveChanges();
  }

  public update(id: string, propPath: string, changedDoc) {
    this.updateDoc(id, propPath, changedDoc);
  }

  public get<T>(metaDoc: metaDoc, propPath): T | void {
    let ifCachedObj = this.getFromCollection<T>(metaDoc.id, propPath);
    if (ifCachedObj) {
      if (CacheService.isValidVersion<T>(metaDoc, ifCachedObj)) {
        // editing cached objects will not make changes to the db. changes must go through set method.
        return CacheService.stripMetaData(ifCachedObj);
      } else {
        log("invalid version getting newest version");
        this.removeDoc<T>(ifCachedObj);
        return;
      }
    } else {
      return;
    }
  }
  private insertDoc<T>(doc: T) {
    this.collection.insert(doc);
    this.unifiedStorageService.saveChanges();
  }

  public set<T>(doc: T, id: string, lastUpdate: number, propPath): void {
    if(doc["$loki"]) {new Error("Trying to set doc with $loki ")}
    doc["id"] = id;
    doc["lastUpdate"] = lastUpdate;
    doc["cacheId"] = propPath + doc["id"];
    this.insertDoc(doc);
    return;
  }
}