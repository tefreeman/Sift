import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { IProfile } from "../../../models/user/userProfile.interface";
import { concatMap, map, take, tap } from "rxjs/operators";
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from "@angular/fire/firestore";
import * as firebase from "firebase";
import { DataService } from "../data.service";
import { log } from "../../logger.service";

interface IMetaDoc {
  id?: string;
  lastUpdate?: number;
}

@Injectable({ providedIn: 'root' })
export class DataCollectionServerService {

  user: Observable<IProfile>;
  constructor( private afs: AngularFirestore, dataService: DataService) {
    this.user = dataService.user;
  }
  private updateUserMetaDoc(id: string, lastUpdate: number, propPath: string) {
    return this.user
      .pipe(
        take(1),
        concatMap(user => {
          log('updateUserRef', '', user);
          const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
          let docString = propPath + '.' + id;
          return from(userRef.update({[docString]: lastUpdate}).then(function() {console.log('sucesss updateMergeUserMap')}));
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
      .pipe(
        map((res) => {
         log('GetByIdData', '', res.data());
         return res.data();
        }),
      );
  }

  public updateByDoc<T extends IMetaDoc>(doc: T, propPath: string) {
    if(!doc.id){throw new Error('Cannot update doc without ID called by UpdateByDoc in DataCollectionServerService')}
    return this.updateUserMetaDoc(doc.id, doc.lastUpdate, propPath).pipe(
      concatMap( ()=> {
        return this.afs.collection(propPath).doc(doc.id).update(doc)
      }))
  }

  public addDoc<T extends IMetaDoc>(doc: T, propPath: string) {
    if(doc["$loki"]) {new Error("cannot add doc containing $loki property")}
    let serverMetaRef: DocumentReference;
    return from(this.afs.collection(propPath).add(doc)).pipe(
      concatMap( (addedDoc) => {
        serverMetaRef = addedDoc;
      return this.updateUserMetaDoc(addedDoc.id, doc.lastUpdate, propPath);
    }), map(()=>{
      doc.id = serverMetaRef.id;
      return doc;
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