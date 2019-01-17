import { database } from 'firebase';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { merge, Observable, pipe } from 'rxjs';
import {
    catchError, concat, concatMap, filter, flatMap, map, mapTo, switchMap, tap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { RequestFileCacheService } from './cache/request-file-cache.service';
import { DataService } from './data.service';
import { GpsService } from './gps.service';

@Injectable({ providedIn: "root" })
export class LocalDbService {
  private db: Loki;
  private adapter;
  private readyObservable;
  private cols = { restaurants: null, items: null };
  private gridKey: Observable<any>;

  constructor(
    private fileCache: RequestFileCacheService,
    private dataService: DataService,
    private gpsService: GpsService
  ) {
    this.gridKey = this.gpsService.getGridKey().pipe(filter((val) => val !== null  ));
    this.adapter = new LokiIndexedAdapter();
    this.db = new Loki("localData", {
      verbose: true,
      destructureDelimiter: "="
    });
  }

  public getCollection(name: string) {
    this.gridKey.subscribe((key) => {
      console.log(key);
      this.loadDb(key).subscribe((r) => console.log('db done!'))
      console.log(this.db);
    });
  }

  public saveDB(fileName: string) {
    return this.fileCache.writeFile(fileName, this.db.seralize());
  }

  private loadDb(key: string) {

    const fileNotCached$ = this.getFromServer(key).pipe(
      tap(() => console.log('file not cached')),
      // write data to file storage
      tap(db => {
        this.fileCache.writeFile(key, db);
      })
    );

    const tryFileCached$ = this.getFromFile(key).pipe(
      catchError((err) => {
        console.log(err);
        return fileNotCached$;
      }),
      tap(() => console.log('file is cached')),
    );

    return tryFileCached$.pipe(
      concatMap((data) => {
        return this.loadJsonIntoCollection(data)
      })
    )
  }


  
  private getFromFile(colName: string) {
    console.log(colName);
    console.log('getting from file')
    return this.fileCache.readAsText(colName);
  }

  private getFromServer(key) {
    console.log('getting from server')
    return this.dataService.getGridByKey(key);
  }

  private loadJsonIntoCollection(jsonData) {
    return Observable.create(observer => {
      observer.next(this.db.loadJSON(jsonData));
    });
  }

  private checkVersion() {}

  testFunc() {
    console.log("fire");
  }

  // Check Cache and File, Load if exists
  // If don't exist download file from server and open into collection

  // TODO integrate file cache

  //TODO verify local db against version from firestore. If outdated download update and reload collections
  // TODO any fileRead errors should
}
