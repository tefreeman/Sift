import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { IProfile } from "../../../models/user/userProfile.interface";
import { concatMap, map, take } from "rxjs/operators";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/firestore";
import * as firebase from "firebase";

interface IMetaDoc {
  id: string;
  lastUpdate: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {

  user: Observable<IProfile>;
  constructor( private afs: AngularFirestore,) {

  }
  private updateUserMetaDoc(id: string, lastUpdate: number, propPath: string) {
    return this.user
      .pipe(
        take(1),
        map(user => {
          const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          let docString = propPath + '.' + id;
          return userRef.update({[docString]: lastUpdate}).then(function() {console.log('sucesss updateMergeUserMap')});
        })
      )
  }

  private removeUserMetaDoc(id: string, propPath: string) {
    return this.user
      .pipe(
        take(1),
        map(user => {
          const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          let docString = propPath + '.' + id;
          return userRef.update({[docString]: firebase.firestore.FieldValue.delete()}).then();
        }),
      )
  }

  public getById(id: string, propName: string ) {
    return this.afs
      .collection(propName)
      .doc(id)
      .get()
      .pipe(map(res => res.data()));
  }

  public updateByDoc<T extends IMetaDoc>(doc: T, propPath: string) {
    return this.updateUserMetaDoc(doc.id, doc.lastUpdate, propPath).pipe(
      concatMap( ()=> {
        return this.afs.collection(propPath).doc(doc.id).update(doc)
      }))
  }

  public addDoc<T extends IMetaDoc>(doc: T, propPath: string) {
    return from(this.afs.collection(propPath).add(doc)).pipe(concatMap( (addedDoc) => {
      return this.updateUserMetaDoc(addedDoc.id, doc.lastUpdate, propPath);
    }))
  }

  public deleteByDoc<T extends IMetaDoc>(doc: T, propPath: string) {
    return this.removeUserMetaDoc(doc.id, propPath).pipe(concatMap(()=> {
      return this.afs
        .collection(propPath)
        .doc(doc.id)
        .delete();
    }))

  }
}