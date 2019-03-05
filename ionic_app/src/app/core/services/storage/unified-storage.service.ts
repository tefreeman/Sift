import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";


@Injectable({ providedIn: "root" })
export class UnifiedStorageService {

   private adapter: LokiIndexedAdapter;
   private db: Loki;

   constructor() {
      this.adapter = new LokiIndexedAdapter();
      this.db = new Loki("test", {
         adapter: this.adapter,
         verbose: true,
         destructureDelimiter: "=",
         autosave: true,
         autoload: false
      });
      this.loadDb("test");
   }

   public getSertCollection<T extends Object>(colName: string, binaryIndices: any[]): Collection<T> {
      let col = this.db.getCollection<T>(colName);
      if (col === null) {
         col = this.db.addCollection<T>(colName, { indices: binaryIndices, disableMeta: true });
      }
      return col;
   }

   public saveChanges() {
      this.db.save();
   }

   private loadDb(name: string) {
      this.adapter.getDatabaseList(result => {
         let match = false;
         for (const dbName of result) {
            if (dbName === name) {
               match = true;
            }
         }
         this.adapter.loadDatabase(name, (serializedDb: string) => {
            if (match) {
               log("seralizedDb", "", serializedDb);
               this.db.loadJSON(serializedDb);
            } else {
               log("db not found", "", match);
               this.adapter.saveDatabase(name, serializedDb, result => {
               });
            }
         });

      });
   }

}