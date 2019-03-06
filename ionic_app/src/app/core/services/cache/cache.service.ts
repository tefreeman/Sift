import { Injectable } from "@angular/core";
import { log } from "../../logger.service";
import { UnifiedStorageService } from "../storage/unified-storage.service";
import { IDataDoc } from "../../../models/user/userProfile.interface";
import { MetaService } from "./meta.service";

@Injectable({ providedIn: "root" })
export class CacheService {

   private collection: Collection<any>;


   constructor(private unifiedStorageService: UnifiedStorageService) {
      // dbName should be user id
      this.collection = this.unifiedStorageService.getSertCollection("cache", ["cachedId"]);
   }

   private static isValidVersion<T extends IDataDoc>(userMetaDoc: IDataDoc, cachedDoc: T): boolean {
      return cachedDoc.meta.lastUpdate === userMetaDoc.meta.lastUpdate;
   }

   private static stripMetaData(doc) {
      if (!doc) {
         return;
      }
      const cleanedDoc = Object.assign({}, doc);
      delete cleanedDoc["$loki"];
      return cleanedDoc;
   }

   public delete(id: string, propPath: string) {
      const ifCacheDoc = this.getFromCollection(id, propPath);
      if (ifCacheDoc) {
         this.removeDoc(ifCacheDoc);
      } else {
         log("Cannot delete doc that does not exists", "cacheService");
      }
   }

   public get<T>(metaDoc: IDataDoc, propPath): T | void {
      let ifCachedObj = this.getFromCollection<T>(metaDoc.id, propPath);
      if (ifCachedObj) {
         if (CacheService.isValidVersion<any>(metaDoc, ifCachedObj)) {
            // editing cached objects will not make changes to the db. changes must go through set method.
            return CacheService.stripMetaData(ifCachedObj);
         } else {
            log("invalid version getting newest version");
            this.removeDoc<T>(ifCachedObj);
            return null;
         }
      } else {
         return null;
      }
   }

   public set<T>(doc: T, id: string, lastUpdate: number, propPath: string): void {
      if (doc["$loki"]) {
         new Error("Trying to set doc with $loki ");
      }
      doc = MetaService.initMeta<any>(doc, id, lastUpdate, propPath);
      this.insertDoc(doc);
      return;
   }

   public update(id: string, propPath: string, changedDoc) {
      this.updateDoc(id, propPath, changedDoc);
   }

   private getFromCollection<T>(id: string, propPath: string): T | null {
      const searchPath = propPath + id;
      return <T>this.collection.findOne({ cacheId: { $eq: searchPath } });
   }

   private insertDoc<T>(doc: T) {
      this.collection.insert(doc);
      this.unifiedStorageService.saveChanges();
      return;
   }

   private removeDoc<T>(doc: T) {
      log("removingDoc");
      this.collection.remove(doc);
      this.unifiedStorageService.saveChanges();
      return;
   }

   private updateDoc<T>(id: string, propPath: string, updateDoc: T) {
      const searchPath = propPath + id;
      this.collection.findAndUpdate({ cacheId: { $eq: searchPath } }, (doc) => {
         Object.assign(doc, updateDoc);
         return doc;
      });
      this.unifiedStorageService.saveChanges();
   }

}