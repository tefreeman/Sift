import { from, Observable, of } from "rxjs";
import { concatMap, map, switchMap, take } from "rxjs/operators";
// tslint:disable-next-line: no-submodule-imports
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { Router } from "@angular/router";
import { IProfile } from "../../../models/user/userProfile.interface";
import { log } from "../../logger.service";

@Injectable({ providedIn: "root" })
export class DataService {
   user: Observable<IProfile>;

   constructor(
      private afAuth: AngularFireAuth,
      private afs: AngularFirestore,
      private storage: AngularFireStorage,
      private router: Router,
      private http: HttpClient
   ) {
      //// Get user data, then get firestore user document || null
      this.user = this.afAuth.authState.pipe(
         switchMap(user => {
            if (user) {
               return this.afs.doc<IProfile>(`users/${user.uid}`).valueChanges();
            } else {
               return of(null);
            }
         })
      );

   }

   getCurrentUser(): Observable<IProfile> {
      return this.user;
   }

   getDataByGridKey$(key): Observable<any> {
      log("getDataByGridKey$", "", key);

      return this.afs
         .collection("grid")
         .doc(key)
         .get()
         .pipe(
            concatMap(doc => {
               console.log(doc.get("url"));
               return from(this.storage.storage.refFromURL(doc.get("url")).getDownloadURL());
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

   updateUserData(data) {
      return this.user
         .pipe(
            take(1),
            map(user => {
               const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
               return userRef.set(data, { merge: true }).then();
            })
         );
   }


}
