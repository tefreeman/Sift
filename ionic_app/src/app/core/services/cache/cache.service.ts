import { Injectable } from "@angular/core";
import { log } from "../../logger.service";
import { UnifiedStorageService } from "../storage/unified-storage.service";
import { IDataDoc } from "../../../models/user/userProfile.interface";
import { MetaService } from "./meta.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { concatMap, filter, map, tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class CacheService {

   private collection$$: BehaviorSubject<Collection<any>> = new BehaviorSubject(null);
   private collection: Observable<Collection<any>> = this.collection$$.pipe(filter(value => value !== null));

   constructor(private unifiedStorageService: UnifiedStorageService) {
      // dbName should be user id
      this.unifiedStorageService.getSertCollection("cache", ["cacheId"], ["cacheId", "name"])
         .subscribe(
            (collection) => {
               log("unfiedStorage Collection", "", collection);
               this.collection$$.next(collection);
            }
         )
      ;
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

   public delete(id: string, propPath: string): Observable<null> {
      return this.getFromCollection(id, propPath).pipe(
         concatMap(ifCacheDoc => {
            if (ifCacheDoc) {
               return this.removeDoc(ifCacheDoc);
            } else {
               log("Cannot delete doc that does not exists", "cacheService");
               return of(null);
            }
         })
      );
   }

   public get<T>(metaDoc: IDataDoc, propPath): Observable<T | void | null> {
      return this.getFromCollection<T>(metaDoc.id, propPath).pipe(concatMap(ifCachedObj => {
         if (ifCachedObj) {
            if (CacheService.isValidVersion<any>(metaDoc, ifCachedObj)) {
               // editing cached objects will not make changes to the db. changes must go through set method.
               log("cacheServiceGet Strip meta");
               return of(CacheService.stripMetaData(ifCachedObj));
            } else {
               log("invalid version getting newest version");
               return this.removeDoc<T>(ifCachedObj);
            }
         } else {
            log("cache service returning null");
            return of(null);
         }
      }));
   }

   public set<T>(doc: T, id: string, lastUpdate: number, propPath: string): Observable<void> {
      log("settings doc!!!!", "", doc);
      // TODO add error checking system. Shouldn't be adding a new doc with any of these properties
      if (doc["$loki"] || doc["cacheId"] || doc["id"]) {
         return of(null);
      } else {
         doc = MetaService.initMeta<any>(doc, id, lastUpdate, propPath);
         return this.insertDoc(doc);
      }
   }

   public update<T>(id: string, propPath: string, changedDoc): Observable<T | void> {
      return this.updateDoc(id, propPath, changedDoc);
   }

   private getFromCollection<T>(id: string, propPath: string): Observable<T | null> {
      const searchPath = propPath + id;
      return this.collection.pipe(map(collection => {
         return <T>collection.findOne({ cacheId: { $eq: searchPath } });
      }));
   }

   private insertDoc<T>(doc: T): Observable<void> {
      return this.collection
         .pipe(
            map(collection => {
               collection.insert(doc);
               return;
            }),
            tap(() => this.unifiedStorageService.saveChanges())
         );
   }

   private removeDoc<T>(doc: T): Observable<null> {
      log("removingDoc");
      return this.collection.pipe(map(collection => {
            collection.remove(doc);
            return null;
         }),
         tap(() => this.unifiedStorageService.saveChanges())
      );
   }

   private updateDoc<T>(id: string, propPath: string, updateDoc: T): Observable<T | void> {
      const searchPath = propPath + id;
      return this.collection.pipe(map(collection => {
            collection.findAndUpdate({ cacheId: { $eq: searchPath } }, (doc) => {
               Object.assign(doc, updateDoc);
               return doc;
            });
         }),
         tap(() => this.unifiedStorageService.saveChanges())
      );

   }

}