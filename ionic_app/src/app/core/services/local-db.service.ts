import { Observer } from 'firebase';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { BehaviorSubject, combineLatest, merge, Observable, observable, of, pipe } from 'rxjs';
import { catchError, concat, concatMap, debounceTime, filter, flatMap, map, mapTo, switchMap, tap, throttleTime } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { DomAdapter } from '@angular/platform-browser/src/dom/dom_adapter';

import { IItemStats } from '../../models/normalization/normalization.interface';
import { distance } from '../../shared/functions/helpers.functions';
import { log } from '../logger.service';
import { RequestFileCacheService } from './cache/request-file-cache.service';
import { DataService } from './data.service';
import { GpsService } from './gps.service';
import { NormalizeService } from './items/normalize.service';

@Injectable({ providedIn: 'root' })
export class LocalDbService {
    private gridDbSubject$: BehaviorSubject<Loki> = new BehaviorSubject(null);
    private gridDb$: Observable<Loki> = this.gridDbSubject$.asObservable().pipe(filter(db => db !== null));

    private userDbSubject$: BehaviorSubject<Loki> = new BehaviorSubject(null);
    private userDb$: Observable<Loki> = this.gridDbSubject$.asObservable().pipe(filter(db => db !== null));

    constructor(private fileCache: RequestFileCacheService, private dataService: DataService, private gpsService: GpsService) {
        this.loadGridDb();

        // Todo decouple this from local-db service. And add in updates only when user has moved x amount of meters.
        this.setUpdateDistance().subscribe();
    }

    public deleteDatabase(fileName) {
        this.fileCache.removeFile(fileName).subscribe();
    }

    public getCollection$(collectionName: string): Observable<Collection<any>> {
        return this.gridDb$.pipe(map(db => db.getCollection(collectionName)));
    }

    public getCollectionCache$(): Observable<Collection<any>> {
        return this.gridDb$.pipe(map(db => db.getCollection('cache')));
    }

    public setUpdateDistance() {
        const getRestaurants$ = this.gridDb$.pipe(
            tap(userPos => {
                log('', '', userPos);
            }),
            concatMap(db => {
                return this.getCollection$('restaurants');
            })
        );

        const getUserPos$ = this.gpsService.getLiveGpsCoords$().pipe(
            tap(userPos => {
                log('', '', userPos);
            }),
            filter(userPos => userPos !== null),
            map(userPos => userPos.coords)
        );

        return combineLatest(getUserPos$, getRestaurants$).pipe(
            map(valArr => {
                valArr[1].findAndUpdate({}, obj => {
                    obj['distance'] = distance(
                        { lat: valArr[0].latitude, lon: valArr[0].longitude },
                        { lat: obj['coords']['lat'], lon: obj['coords']['lat'] }
                    );
                });
                return valArr[1];
            })
        );
    }

    private loadGridDb() {
        const lokiAdapter = new LokiIndexedAdapter();

        let localKey;

        const db = new Loki(localKey, {
            adapter: lokiAdapter,
            verbose: true,
            destructureDelimiter: '=',
            autosave: false,
            autoload: false
        });

        this.gpsService
            .getGridKey$()
            .pipe(
                // TODO checked for previous cached gps data (if its faster than waiting for gps to init)
                filter(val => val !== null),
                map(key => {
                    localKey = key;
                }),
                concatMap(key => this.loadDbFromAdapter(localKey, lokiAdapter)),
                catchError(err =>
                    this.loadGridDbFromServer(localKey).pipe(
                        tap(dbData => {
                            this.saveDbAdapter(localKey, dbData, lokiAdapter);
                        })
                    )
                )
            )
            .pipe(
                map(dbData => {
                    db.loadJSON(dbData);
                    return db;
                })
            )
            .subscribe(newDb => {
                this.gridDbSubject$.next(newDb);
                log('this.db$.next', '', newDb);
            });
    }

    private loadUserDb(profileName) {
        /*
      const lokiAdapter = new LokiIndexedAdapter();

      const db = new Loki(name, {
          adapter: lokiAdapter,
          verbose: true,
          destructureDelimiter: '=',
          autosave: true,
          autoload: false
      });

        
      this.loadDbFromAdapter(profileName, lokiAdapter).pipe(
              catchError(err =>
                  this.loadUserDbFromServer(profileName).pipe(
                      tap(dbData => {
                          this.saveDbAdapter(profileName, dbData, lokiAdapter);
                      })
                  )
              )
          )
          .pipe(
              map(dbData => {
                  db.loadJSON(dbData);
                  return db;
              })
          )
          .subscribe(newDb => {
              this.gridDbSubject$.next(newDb);
              log('this.db$.next', '', newDb);
          });
          */
    }

    private loadDbFromAdapter(name: string, adapter) {
        return Observable.create((observer: Observer<string>) => {
            adapter.getDatabaseList(result => {
                let match = false;
                for (const dbName of result) {
                    if (dbName === name) {
                        match = true;
                    }
                }
                if (match) {
                    adapter.loadDatabase(name, (serializedDb: string) => {
                        observer.next(serializedDb);
                    });
                } else {
                    observer.error(new Error('cannot find indexed db'));
                }
            });
        });
    }

    private loadGridDbFromServer(key: string) {
        return this.dataService.getDataByGridKey$(key);
    }

    private loadUserDbFromServer(userId: string) {
        // TODO
    }

    private saveDbAdapter(name, dbData, adapter) {
        adapter.saveDatabase(name, dbData, result => {});
    }

    private checkVersion() {}

    // Check Cache and File, Load if exists
    // If don't exist download file from server and open into collection

    // TODO integrate file cache

    // TODO verify local db against version from firestore. If outdated download update and reload collections
    // TODO any fileRead errors should
}
