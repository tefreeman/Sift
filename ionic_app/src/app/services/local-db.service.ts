import * as Loki from 'lokijs';
import { BehaviorSubject, merge, Observable, of, pipe } from 'rxjs';
import {
    catchError, concat, concatMap, filter, flatMap, map, mapTo, switchMap, tap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { RequestFileCacheService } from './cache/request-file-cache.service';
import { DataService } from './data.service';
import { GpsService } from './gps.service';
import { log } from './logger.service';

@Injectable({ providedIn: 'root' })
export class LocalDbService {
  private db$: BehaviorSubject<Loki> = new BehaviorSubject(null);
  constructor(
    private fileCache: RequestFileCacheService,
    private dataService: DataService,
    private gpsService: GpsService
  ) {
    this.gpsService
      .getGridKey$()
      .pipe(
        // TODO checked for previous cached gps data (if its faster than waiting for gps to init)
        filter(val => val !== null),
        concatMap(val => this.loadDb(val))
      )
      .subscribe(newDb => {
        log('this.db$.next', '', newDb);
        this.db$.next(newDb);
      });
  }

  public deleteDatabase(fileName) {
    this.fileCache.removeFile(fileName).subscribe();
  }
  public getCollection$(collectionName: string): Observable<Collection<any>> {
    return this.db$.pipe(
      filter(db => db !== null),
      map(db => {return db.getCollection(collectionName)}),
      tap(db => {
        log('getCollection$', '', db);
      }),
    );
  }

  private loadDb(key: string) {
    const localKey = key;
    const db = new Loki('localData', {
      verbose: true,
      destructureDelimiter: '='
    });

    const fileNotCached$ = this.getFromServer$(localKey).pipe(
      // write data to file storage
      tap( (dbData) => {
        log('getFromServer$', 'then filecache.writeFile', {'key': localKey, 'db': dbData});
        this.fileCache.writeFile(localKey, dbData);
      }),
      catchError(err => {
        log('filenotCached$', 'error after filecache.writeFile', err);
        return of(null); // TODO error handeling
      })
    );

    const tryFileCached$ = this.getFromFile$(localKey).pipe(
      catchError(err => {
        log('tryFileCached$', 'catchError', err);
        return fileNotCached$;
      })
    );

    return tryFileCached$.pipe(
      concatMap(data => {
        return of(db.loadJSON(data));
      }),
      map(() => db)
    );
  }

  private getFromFile$(colName: string) {
    log('getFromFile', '', colName);
    return this.fileCache.readAsText(colName);
  }

  private getFromServer$(key) {
    log('getFromServer', '', key);
    return this.dataService.getDataByGridKey$(key);
  }
  private checkVersion() {}

  // Check Cache and File, Load if exists
  // If don't exist download file from server and open into collection

  // TODO integrate file cache

  // TODO verify local db against version from firestore. If outdated download update and reload collections
  // TODO any fileRead errors should
}
