import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { Observable } from "rxjs";


@Injectable({ providedIn: 'root' })
export class UnifiedStorageService{

  private db: Loki;
  private adapter: LokiIndexedAdapter;

  constructor(){
    this.adapter = new LokiIndexedAdapter();
    this.db = new Loki('test', {
      adapter: this.adapter,
      verbose: true,
      destructureDelimiter: '=',
      autosave: true,
      autoload: false
    });
    this.loadDb('test');
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
            log('seralizedDb', '', serializedDb);
            this.db.loadJSON(serializedDb);
          } else {
            log('db not found', '', match);
            this.adapter.saveDatabase(name, serializedDb, result=>{})
          }
        })

      });
  }

 public getSertCollection<T extends Object>(colName: string): Collection<T> {
   let col = this.db.getCollection<T>(colName);
   if (col === null) {
     col = this.db.addCollection<T>(colName);
   }
   return col;
 }

 public saveChanges() {
   this.db.save();
 }

}