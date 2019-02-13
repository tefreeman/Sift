import { IMetaIdDoc } from './../../models/user/userProfile.interface';
import { CacheDbService } from './cache/cache-db.service';
import { auth, firestore } from 'firebase/app';
import { from, Observable, of, zip, forkJoin } from 'rxjs';
import {
    concat,
    concatMap,
    distinctUntilChanged,
    filter,
    first,
    flatMap,
    map,
    switchMap,
    tap,
    timeInterval,
    mergeMap
} from 'rxjs/operators';

// tslint:disable-next-line: no-submodule-imports
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { AngularFireStorage, StorageBucket } from '@angular/fire/storage';
import { Router } from '@angular/router';

import { IFilter, IFilterObj } from '../../models/filters/filters.interface';
import { IProfile } from '../../models/user/userProfile.interface';
import { log } from '../logger.service';
import { LocalStorageCacheService } from './cache/local-storage-cache.service';
import { GpsService } from './gps.service';

@Injectable({ providedIn: 'root' })
export class DataService {
    user: Observable<IProfile>;

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private storage: AngularFireStorage,
        private cacheService: CacheDbService,
        private router: Router,
        private http: HttpClient,
        private gpsService: GpsService
    ) {
        //// Get auth data, then get firestore user document || null
        this.user = this.afAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    return this.afs.doc<IProfile>(`users/${user.uid}`).valueChanges();
                } else {
                    return of(null);
                }
            })
        );

        this.user
            .pipe(
                first(),
                tap(user => {
                    this.cacheService.loadUserCacheDb(user);
                }),
                // testing add method
                tap(() => {
                    let filter: IFilterObj = {
                        name: 'trevor',
                        public: true,
                        timestamp: new Date().getTime(),
                        lastActive: 0,
                        diet: {},
                        filterItems: [{ key: 'reviewCount', min: 40, max: 300 }],
                        filterRestaurants: [{ key: 'reviewCount', min: 20, max: 100 }],
                        filterNutrients: [{ key: 'protein', min: 24, max: 50 }]
                    };
                    // this.add('filters', filter);
                })
            )
            .subscribe();
    }
    updateUserData(data) {
        this.user
            .pipe(
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.set(data, { merge: true }).then();
                })
            )
            .subscribe();
    }

    private updateMergeUserArray(data, field: string) {
        this.user
            .pipe(
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.update({ [field]: firebase.firestore.FieldValue.arrayUnion(data) }).then();
                })
            )
            .subscribe();
    }

    private removeMergeUserArray(data, field: string) {
        this.user
            .pipe(
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.update({ [field]: firebase.firestore.FieldValue.arrayRemove(data) }).then();
                })
            )
            .subscribe();
    }

    public remove(colName: string, id: string) {
        this.afs
            .collection(colName)
            .doc(id)
            .delete();
    }

    getDataByGridKey$(key): Observable<any> {
        log('getDataByGridKey$', '', key);

        return this.afs
            .collection('grid')
            .doc(key)
            .get()
            .pipe(
                concatMap(doc => {
                    console.log(doc.get('url'));
                    return from(this.storage.storage.refFromURL(doc.get('url')).getDownloadURL());
                }),
                concatMap(url => {
                    console.log(url);
                    return this.http.get(url).pipe(
                        // TODO remove stringify and add compression to google file storage
                        map(data => JSON.stringify(data))
                    );
                })
            );
    }

    getAll(colName: string): Observable<any> {
        return Observable.create(observer => {
            let count = 0;
            const dataArr = [];
            this.user
                .pipe(
                    tap(user => {
                        const arr: IMetaIdDoc[] = user[colName];
                        for (const doc of arr) {
                            this.get(colName, doc).subscribe(res => {
                                dataArr.push(res);
                                count++;
                                if (count === arr.length) {

                                    observer.next(dataArr);
                                    observer.complete();
                                }
                            });
                        }
                    })
                )
                .subscribe();
        });
    }

    get(colName: string, metaDoc: IMetaIdDoc) {
        return this.cacheService.getCached(colName, metaDoc).pipe(
            concatMap(result => {
                if (result) {
                    log('get', 'cached', result);
                    return of(result);
                } else {
                    return this.afs
                        .collection(colName)
                        .doc(metaDoc.id)
                        .get()
                        .pipe(
                            map(res => res.data()),
                            tap(data => {
                                log('get', 'server', data);
                                data['lastUpdate'] = metaDoc.lastUpdate;
                                data['id'] = metaDoc.id;
                                this.cacheService.cache(colName, data);
                            })
                        );
                }
            })
        );
    }

    addOrUpdate(colName: string, doc: any) {
        let getTime = new Date().getTime();
        from(this.afs.collection(colName).add(doc))
            .pipe(
                tap(docRef => {
                    const metaDoc: IMetaIdDoc = doc;
                    metaDoc['id'] = docRef.id;
                    metaDoc['lastUpdate'] = getTime;
                    this.cacheService.cache(colName, metaDoc);
                }),
                tap(docRef => {
                    const metaDoc: IMetaIdDoc = { id: docRef.id, lastUpdate: getTime };
                    this.updateMergeUserArray(metaDoc, colName);
                })
            )
            .subscribe();
    }

    delete(colName: string, doc: IMetaIdDoc) {
        this.cacheService.deleteCached(colName, doc.id);
        this.remove(colName, doc.id);

        const metaDoc: IMetaIdDoc = { id: doc.id, lastUpdate: doc.lastUpdate };
        this.removeMergeUserArray(metaDoc, colName);
    }

    getCurrentUser(): Observable<IProfile> {
        return this.user;
    }
}
