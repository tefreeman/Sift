import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { first } from 'rxjs/operators';


interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
  }



@Injectable({ providedIn: 'root' })
export class FireStoreDataService {

user: Observable<User>;

constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
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

        //// Get grided places api db
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

    getPlacesDB(id: number) {
        this.afs.collection('gridPlaces', ref => ref.where('id', '==', id));
    }

    getUser() {
        return this.user;
    }

}
