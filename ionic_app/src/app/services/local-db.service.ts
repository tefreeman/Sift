
import { RequestFileCacheService } from './cache/request-file-cache.service';
import { Injectable } from '@angular/core';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { Observable, pipe, merge} from 'rxjs';
import { map, mapTo, filter, concatMap, switchMap, flatMap, tap} from 'rxjs/operators'
import { DataService } from './data.service';
import { database } from 'firebase';

@Injectable({providedIn: 'root'})
export class LocalDbService {
 
 private db: Loki;
 private adapter;
 private readyObservable;
 private cols = {'restaurants': null, 'items': null};


   constructor(private fileCache: RequestFileCacheService, private dataService: DataService) {
    this.adapter = new LokiIndexedAdapter();
    this.db = new Loki('localData', {
      verbose: true,
      destructureDelimiter: '='
    });
  }


  public getCollection(name: string) {
    this.initDb(name).subscribe(() => {
      // After restaurants Db has been loaded
      console.log(this.db);
      return this.db.getCollection(name);
    });
  }

  public saveDB(fileName: string) {
    return this.fileCache.writeFile(fileName, this.db.seralize());
  }

  private initDb(fileName: string) {

     const fileCacheCheck = this.fileCache.checkIfFileCached(fileName);
     const fileNotCached = fileCacheCheck.pipe(
       filter((res) => res.code === 1),
       concatMap( () => {
        return this.getFromServer();
       }),
     );
     const fileIsCached = fileCacheCheck.pipe(
       filter((res) => res === true),
       concatMap( () => {
        return this.getFromFile(fileName);
       })
     );

    return merge(fileNotCached, fileIsCached).pipe(
    concatMap((jsonData) => {
      return this.loadJsonIntoCollection(jsonData);
    })
    );
   }

  private getFromFile(colName: string) {
    return this.fileCache.readAsText(colName);
  }

  private getFromServer() {
    return this.dataService.getGridById();
  }

  private loadJsonIntoCollection(jsonData) {
    console.log(jsonData);
    return Observable.create((observer) => {
      observer.next(this.db.loadJSON((jsonData))); 
    });
  }


  private checkVersion() {

  }

  testFunc() {
    console.log('fire');
  }
  




  // Check Cache and File, Load if exists
  // If don't exist download file from server and open into collection

// TODO integrate file cache

//TODO verify local db against version from firestore. If outdated download update and reload collections
// TODO any fileRead errors should


}
