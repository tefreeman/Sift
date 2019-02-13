import { log } from "src/app/core/logger.service";
import { IMetaIdDoc, IProfile } from "./../../../models/user/userProfile.interface";
import { Observer } from "firebase";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CacheDbService {
    private userDb: Loki;

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
               this.userDb = userCacheDb;
            });
    }

    public getCollection(colName: string): Collection<any> | null {
        try {
            return this.userDb.getCollection(colName);
        } catch (e) {
            console.log("GETCOLLECTION ERROR", e);
            return null;
        }
    }

    public cache(colName: string, cacheDoc: IMetaIdDoc) {
        log('cacheing', '', cacheDoc);
            const col = this.userDb.getCollection(colName);
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
    }

    public getCached(colName: string, metaDoc: IMetaIdDoc) {

                const col = this.userDb.getCollection(colName);
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

    }

    public deleteCached(colName: string, id: string) {
        this.getCollection(colName).findAndRemove({ id: { $eq: id } });
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
