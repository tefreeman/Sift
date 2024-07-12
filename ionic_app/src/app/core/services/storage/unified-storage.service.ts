import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, map, take, tap } from "rxjs/operators";
import { log } from "../../logger.service";

export class UnifiedStorageService {
   private adapter: LokiIndexedAdapter;
   private db: Observable<Loki>;
   private db$$: BehaviorSubject<Loki> = new BehaviorSubject(null);
   private dbName: string;

   constructor(dbName: string) {
      this.dbName = dbName;
      this.db = this.db$$.pipe(filter(value => value !== null && value !== undefined));
      this.adapter = new LokiIndexedAdapter();

      // universally stores everything
      this.loadDb(this.dbName);

      // just logging can remove later
      this.db.subscribe((db) => log(this.dbName, "", db));
   }

   public getCollection<T extends object>(colName): Observable<Collection<T>> {
      return this.db.pipe(map(db => {
         return db.getCollection<T>(colName);
      }));
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

   private dbExists(name: string, callback) {
      this.adapter.getDatabaseList(result => {
         let match = false;
         for (const dbName of result) {
            if (dbName === name) {
               match = true;
            }
         }
         callback(match);
      });
   }

   private loadDb(name: string) {
      this.dbExists(this.dbName, (match) => {
         log("loadDbInner");
         this.adapter.loadDatabase(name, (serializedDb: string) => {
            let localDb = new Loki(this.dbName, {
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
