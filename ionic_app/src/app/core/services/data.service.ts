import { auth } from 'firebase/app';
import { from, Observable, of, zip } from 'rxjs';
import {
    concatMap, distinctUntilChanged, first, flatMap, map, switchMap, tap
} from 'rxjs/operators';

// tslint:disable-next-line: no-submodule-imports
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
    AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument
} from '@angular/fire/firestore';
import { AngularFireStorage, StorageBucket } from '@angular/fire/storage';
import { Router } from '@angular/router';

import { log } from '../logger.service';
import { GpsService } from './gps.service';

interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
  }



@Injectable({ providedIn: 'root' })
export class DataService {

user: Observable<User>;

constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router,
    private http: HttpClient,
    private gpsService: GpsService
)  {

        //// Get auth data, then get firestore user document || null
        this.user = this.afAuth.authState.pipe(
            switchMap(user => {
            if (user) {
                return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
            } else {
                return of(null);
            }
            })
        );
    }
    updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
    };

    return userRef.set(data, { merge: true });

    }

    getDataByGridKey$(key): Observable<any> {
    log('getDataByGridKey$', '', key);

        return this.afs.collection('grid').doc(key).get().pipe(
            concatMap( (doc) => {
                console.log(doc.get('url'));
                return from(this.storage.storage.refFromURL(doc.get('url')).getDownloadURL());
            }),
            concatMap((url) => {
                console.log(url);
            return this.http.get(url, {responseType: 'json'}).pipe(
                // TODO remove stringify and add compression to google file storage
                map( (data) =>  JSON.stringify(data))
            );
            })
            );
    }

    getReviewById(id: string): Observable<firebase.firestore.DocumentSnapshot> {
        return this.afs.collection('reviews').doc(id).get();
    }



}
