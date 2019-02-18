import { log } from "src/app/core/logger.service";
import { IMetaIdDoc, IProfile } from "./../../../models/user/userProfile.interface";
import { Observer } from "firebase";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, filter, map, tap } from "rxjs/operators";

import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CacheDbService {
    private userDb$$: BehaviorSubject<Loki> = new BehaviorSubject<Loki>(null);
    private userDb$: Observable<Loki> = this.userDb$$.pipe(filter(val => val !== null));
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
                catchError(err => {
                       const newDb = this.createUserCacheDb(user, db);
                      this.saveCacheDbAdapter(user.email, newDb, lokiAdapter);
                      return of(newDb);
                  }
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
               this.userDb$$.next(userCacheDb);
            });
    }

    public getCollection(colName: string): Observable<Collection<any>> | null {
            return this.userDb$.pipe(map(db => {
                return db.getCollection(colName);
            }),
              catchError(err => {
                  console.log("GETCOLLECTION ERROR", err);
                  return of(null);
              }));
        }

    public cache(colName: string, cacheDoc: IMetaIdDoc) {
        log('cacheing', '', cacheDoc);
            return this.getCollection(colName).pipe(tap(col => {
                let doc = col.findOne({id: {$eq: cacheDoc.id}});
                if (cacheDoc.$loki) {
                    col.update(cacheDoc);
                    } else if (doc) {
                    col.findAndUpdate({id: {$eq: cacheDoc.id}}, () => cacheDoc);
                }
                else {
                        col.insert(cacheDoc);
                    }
            }))
    }

    public getCached(colName: string, metaDoc: IMetaIdDoc): Observable<object | null>{
        return this.getCollection(colName).pipe(map(col => {
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
        }));

    }

    public deleteCached(colName: string, id: string) {
        return this.getCollection(colName).pipe(map(col => {
           return  col.findAndRemove({ id: { $eq: id } });
        }))
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

        return newDb.serialize();
    }

    private saveCacheDbAdapter(name, dbData, adapter) {
        adapter.saveDatabase(name, dbData, result => {});
    }
}
