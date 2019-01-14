import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from '@angular/fire/firestore';
import { Observable, of, from} from 'rxjs';
import {concatMap, map, tap, distinctUntilChanged} from 'rxjs/operators';
import { switchMap} from 'rxjs/operators';
import { first } from 'rxjs/operators';
import { GpsService } from './gps.service';
import { AngularFireStorage, StorageBucket } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';

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
    //TODO for some reason keeps hitting non stop fixed
    getGridById(): Observable<any> {
       return this.gpsService.getGridId().pipe (
        tap((x) => console.log(x)),
        distinctUntilChanged(),
        concatMap((id) => {
            return this.afs.collection('grid').doc(id.toString()).get();
        }),
        concatMap( (doc) => {
            console.log(doc.get('url'));
            return from(this.storage.storage.refFromURL(doc.get('url')).getDownloadURL());
        }),
        concatMap((url) => {
            console.log(url);
           return this.http.get(url, {responseType: 'json'}).pipe(
               //TODO remove stringify and add compression to google file storage 
               map( (data) =>  JSON.stringify(data))
           )
        })
        );

    }

    getReviewById(id: string): Observable<firebase.firestore.DocumentSnapshot> {
        return this.afs.collection('reviews').doc(id).get();
    }



}
