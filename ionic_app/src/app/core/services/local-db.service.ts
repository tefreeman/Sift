import { Observer } from 'firebase';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { BehaviorSubject, merge, Observable, observable, of, pipe } from 'rxjs';
import {
    catchError, concat, concatMap, filter, flatMap, map, mapTo, switchMap, tap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { DomAdapter } from '@angular/platform-browser/src/dom/dom_adapter';

import { log } from '../logger.service';
import { RequestFileCacheService } from './cache/request-file-cache.service';
import { DataService } from './data.service';
import { GpsService } from './gps.service';

@Injectable({ providedIn: 'root' })
export class LocalDbService {
  private db$: BehaviorSubject<Loki> = new BehaviorSubject(null);
  private adapter;
  constructor(
    private fileCache: RequestFileCacheService,
    private dataService: DataService,
    private gpsService: GpsService
  ) {
    this.adapter =  new LokiIndexedAdapter();
    this.gpsService.getGridKey$()
      .pipe(
        // TODO checked for previous cached gps data (if its faster than waiting for gps to init)
        filter(val => val !== null),
        concatMap(val => this.loadDb(val))
      )
      .subscribe(newDb => {
        this.db$.next(newDb);
        log('this.db$.next', '', newDb);
      });
  }

  public deleteDatabase(fileName) {
    this.fileCache.removeFile(fileName).subscribe();
  }


  public getCollection$(collectionName: string): Observable<Collection<any>> {
    return this.db$.pipe(
      filter(db => db !== null),
      map(db => db.getCollection(collectionName)),
    );
  }


  private loadDb(key: string) {
    const localKey = key;
    const db = new Loki('localData', {
      adapter: this.adapter,
      verbose: true,
      destructureDelimiter: '=',
      autosave: false,
      autoload: false
    });

    const fileNotCached$ = this.getFromServer$(localKey).pipe(
      // write data to file storage
      tap( (dbData) => {
        log('getFromServer$', 'then filecache.writeFile', {'key': localKey, 'db': dbData});
        this.adapter.saveDatabase(localKey, dbData, (result) => {
          log('saveDatabase', '', result);
        });
        // this.fileCache.writeFile(localKey, dbData);
      })
    );


    const tryIndexedDb$: Observable<string> = Observable.create( (observer: Observer<string>) => {
      log('getDatabaseList', '', {});
      this.adapter.getDatabaseList((result) => {
        let match = false;
        log('getDatabaseList', '', result);
        for ( const dbName of result) {
          if (dbName === localKey) {
              match = true;
            }
          }
        if (match) {
          this.adapter.loadDatabase(localKey, (serializedDb: string) => {
            log('loadDatabase', `success at ${localKey}`, serializedDb);
            observer.next(serializedDb);
          });
        } else {
          observer.error(new Error('cannot find indexed db'));
        }
      });
    });

    return tryIndexedDb$.pipe(
      catchError( (err) => {
        log('tryIndexedDb$', 'ERROR', err);
        return fileNotCached$;
      }),
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
