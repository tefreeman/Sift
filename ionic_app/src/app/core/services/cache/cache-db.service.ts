import { log } from 'src/app/core/logger.service';
import { IProfile, IMetaIdDoc } from './../../../models/user/userProfile.interface';
import { Observer } from 'firebase';
import * as Loki from 'lokijs';
import * as LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter';
import { BehaviorSubject, combineLatest, merge, Observable, observable, of, pipe } from 'rxjs';
import { catchError, concat, concatMap, debounceTime, filter, flatMap, map, mapTo, switchMap, tap, throttleTime } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { DomAdapter } from '@angular/platform-browser/src/dom/dom_adapter';

@Injectable({ providedIn: 'root' })
export class CacheDbService {
    private userDbSubject$: BehaviorSubject<Loki> = new BehaviorSubject(null);
    private userDb$: Observable<Loki> = this.userDbSubject$.asObservable().pipe(filter(db => db !== null));

    constructor() {}

    public loadUserCacheDb(user: IProfile) {
        const lokiAdapter = new LokiIndexedAdapter();
        const db = new Loki(user.email, {
            adapter: lokiAdapter,
            verbose: true,
            destructureDelimiter: '=',
            autosave: true,
            autoload: false
        });
        log('init UserCacheDb');
        return this.loadCacheDbFromAdapter(user.email, lokiAdapter)
            .pipe(
                catchError(err =>
                    this.createUserCacheDb(user, db).pipe(
                        tap(dbData => {
                            log('creating UserCacheDb', '', err);
                            this.saveCacheDbAdapter(user.email, dbData, lokiAdapter);
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
            .subscribe(userCacheDb => {
                log('userCacheDb', '', userCacheDb);
                this.userDbSubject$.next(userCacheDb);
            });
    }

    public getCollection$(colName: string): Observable<Collection<any>> {
        return this.userDb$.pipe(map(db => db.getCollection(colName)));
    }

    public cache(colName: string, cacheDoc: IMetaIdDoc) {
        log('cacheing', '', cacheDoc);
        this.userDb$.subscribe(db => {
            const col = db.getCollection(colName);
            let foundItem;
            if (col) {
                foundItem = col.findOne({ id: { $eq: cacheDoc.id } });
                if (foundItem) {
                    col.findAndUpdate({ id: { $eq: cacheDoc.id } }, () => cacheDoc);
                } else {
                    col.insert(cacheDoc);
                }
            } else {
                throw Error('collection cannot be found in loadUserCacheDb');
            }
        });
    }

    public getCached(colName: string, metaDoc: IMetaIdDoc) {
        return this.userDb$.pipe(
            map(db => {
                const col = db.getCollection(colName);
                let foundItem;
                if (col) {
                    log('collection found', '', metaDoc);
                    foundItem = col.findOne({ id: { $eq: metaDoc.id } });
                    log('found item', '', foundItem);
                    if (foundItem && foundItem.lastUpdate === metaDoc.lastUpdate) {
                        return foundItem;
                    } else {
                        return null;
                    }
                } else {
                    throw Error('collection cannot be found in loadUserCacheDb');
                }
            })
        );
    }

    public deleteCached(colName: string, id: string) {
        return this.getCollection$(colName)
            .pipe(
                tap(collection => {
                    collection.findAndRemove({ id: { $eq: id } });
                })
            )
            .subscribe();
    }

    private loadCacheDbFromAdapter(name: string, adapter): Observable<string> {
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

    private createUserCacheDb(user: IProfile, db: Loki) {
        const newDb = new Loki(name, {
            verbose: true,
            destructureDelimiter: '=',
            autosave: true,
            autoload: false
        });

        // TODO init Db operations

        newDb.addCollection('filters', { indices: ['id', 'lastUpdate'] });
        newDb.addCollection('cache', { indices: ['id', 'lastUpdate'] });
        newDb.addCollection('sort', { indices: ['id', 'lastUpdate'] });

        return of(newDb.serialize());
    }

    private saveCacheDbAdapter(name, dbData, adapter) {
        adapter.saveDatabase(name, dbData, result => {});
    }
}
