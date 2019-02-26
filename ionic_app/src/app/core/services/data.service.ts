import { IMetaIdDoc } from "./../../models/user/userProfile.interface";
import { CacheDbService } from "./cache/cache-db.service";
import { forkJoin, from, merge, Observable, of, zip } from "rxjs";
import { concatMap, first, map, switchMap, take, tap } from "rxjs/operators";
// tslint:disable-next-line: no-submodule-imports
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import * as firebase from "firebase";
import { AngularFireStorage } from "@angular/fire/storage";
import { Router } from "@angular/router";

import { IFilterObj } from "../../models/filters/filters.interface";
import { IProfile } from "../../models/user/userProfile.interface";
import { log } from "../logger.service";
import { GpsService } from "./gps.service";
import FieldValue = firebase.firestore.FieldValue;

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
            )
            .subscribe();
    }
    updateUserData(data) {
        return this.user
            .pipe(
              take(1),
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.set(data, { merge: true }).then();
                })
            )
    }

    private updateMergeUserArray(data, field: string) {
        return this.user
            .pipe(
                take(1),
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.update({ [field]: firebase.firestore.FieldValue.arrayUnion(data),
                                  timestamp: firebase.firestore.FieldValue.serverTimestamp()}).then();
                })
            )
    }
  private updateMergeUserMap(id: string, lastUpdate: number, field: string) {
    return this.user
      .pipe(
        take(1),
        map(user => {
          const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          let docString = field + '.' + id;
          return userRef.update({[docString]: lastUpdate}).then(function() {console.log('sucesss updateMergeUserMap')});
        })
      )
  }
  private removeMergeUserMap(id: string, field: string) {
    return this.user
      .pipe(
        take(1),
        map(user => {
          const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          let docString = field + '.' + id;
          return userRef.update({[docString]: firebase.firestore.FieldValue.delete()}).then();
        }),
      )
  }
    private removeMergeUserArray(data, field: string) {
      return this.user
            .pipe(
              take(1),
                map(user => {
                    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
                    return userRef.update({ [field]: firebase.firestore.FieldValue.arrayRemove(data) }).then();
                }),
            )
    }

  public remove$(colName: string, id: string) {
    return this.afs
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
                        const filtersMap = user[colName];
                      for (let filterKey in filtersMap) {
                        if (filtersMap.hasOwnProperty(filterKey)) {
                          let doc: IMetaIdDoc = {};
                          doc.id = filterKey;
                          doc.lastUpdate = filtersMap[filterKey];
                          log('METADOC', '', doc);
                          this.get(colName, doc).subscribe(res => {
                            dataArr.push(res);
                            count++;
                            if (count === Object.keys(filtersMap).length) {
                              observer.next(dataArr);
                              observer.complete();
                            }
                          });
                        }
                        }
                    })
                )
                .subscribe();
        });
    }

    get(colName: string, metaDoc: IMetaIdDoc) {
      return Observable.create( (observer) => {
        this.cacheService.getCached(colName, metaDoc).pipe(tap(cachedDoc => {
          if (cachedDoc) {
            log('get', 'cached', cachedDoc);
            observer.next(cachedDoc);
          } else {
            this.afs
              .collection(colName)
              .doc(metaDoc.id)
              .get()
              .pipe(
                map(res => res.data()),
                tap(data => {
                  log('get', 'server', data);
                  data['lastUpdate'] = metaDoc.lastUpdate;
                  data['id'] = metaDoc.id;
                  this.cacheService.cache(colName, data).subscribe();
                })
              ).subscribe((serverDoc) => {
              observer.next(serverDoc);
            })
          }
        })).subscribe();

      })
    }

  addOrUpdate$(colName: string, doc: any): Observable<any> {
    let getTime = new Date().getTime();
    const metaDoc: IMetaIdDoc = doc;
    metaDoc['lastUpdate'] = getTime;
    if(doc.id) {
      log('UPDATE!');
      metaDoc.id = doc.id;
      return from(this.afs.collection(colName).doc(metaDoc.id).update(doc)).pipe(tap(() => {
        this.cacheService.cache(colName, metaDoc).subscribe();
        this.updateMergeUserMap(metaDoc.id, metaDoc.lastUpdate, colName).subscribe();
      }));
    } else {
      log('ADD!');
      return from(this.afs.collection(colName).add(doc))
        .pipe(
          tap(docRef => {
            metaDoc['id'] = docRef.id;
            this.cacheService.cache(colName, metaDoc).subscribe();
            this.updateMergeUserMap(metaDoc.id, metaDoc.lastUpdate, colName).subscribe();
          })
        );
    }

    }

  delete(colName: string, doc: IMetaIdDoc): Observable<any> {
        const metaDoc: IMetaIdDoc = { id: doc.id, lastUpdate: doc.lastUpdate };

       return zip(
          this.cacheService.deleteCached(colName, doc.id),
          from(this.remove$(colName, doc.id)),
          this.removeMergeUserMap(metaDoc.id, colName),
          );

    }

    getCurrentUser(): Observable<IProfile> {
        return this.user;
    }

}
