import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, take, tap } from "rxjs/operators";
import { log } from "../../logger.service";


@Injectable({ providedIn: "root" })
export class UnifiedStorageService {

   private adapter: LokiIndexedAdapter;
   private db: Observable<Loki>;
   private db$$: BehaviorSubject<Loki> = new BehaviorSubject(null);

   constructor() {
      this.db = this.db$$.pipe(filter(value => value !== null && value !== undefined));
      this.adapter = new LokiIndexedAdapter();
      this.loadDb("cache.db");

      // just logging can remove later
      this.db.subscribe((db) => log("cacheDb", "", db));
   }

   public getSertCollection<T extends Object>(colName: string, binaryIndices: any[], uniqueIndices: any[]): Observable<Collection<T>> {
      return this.db.pipe(map(db => {
         let col = db.getCollection<T>(colName);
         if (col === null || col === undefined) {
            col = db.addCollection<T>(colName, { indices: binaryIndices, unique: uniqueIndices, disableMeta: true });
         }
         return col;
      }));
   }

   public saveChanges() {
      this.db.pipe(take(1), tap(db => {
         db.save();
      })).subscribe();
   }

   private loadDb(name: string) {
      this.adapter.getDatabaseList(result => {
         let match = false;
         for (const dbName of result) {
            if (dbName === name) {
               match = true;
            }
         }
         log("loadDbInner");
         this.adapter.loadDatabase(name, (serializedDb: string) => {
            let localDb = new Loki("cache.db", {
               adapter: this.adapter,
               verbose: true,
               destructureDelimiter: "=",
               autosave: true,
               autoload: false
            });
            if (match) {
               localDb.loadJSON(serializedDb);
               this.db$$.next(localDb);
            } else {
               this.adapter.saveDatabase(name, serializedDb, result => {
                  this.db$$.next(localDb);
               });
            }
         });

      });
   }

}