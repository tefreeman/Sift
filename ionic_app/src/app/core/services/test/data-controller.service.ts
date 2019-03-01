import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { Observable, of, zip } from "rxjs";
import { IMetaIdDoc, IProfile } from "../../../models/user/userProfile.interface";
import { CacheService } from "./cache.service";
import { concatMap, take } from "rxjs/operators";
import { DataService } from "./data.service";

interface IMetaDoc {
  id: string;
  lastUpdate: number;
}
interface IUserPropMetaDoc {
  [id: string]: number
}
@Injectable({ providedIn: 'root' })

export class DataControllerService {

  user: Observable<IProfile>;

  constructor(private cacheService: CacheService, private dataService: DataService){

  }
  public upsert<T extends IMetaDoc>(doc: T, propPath: string) {
    doc.lastUpdate = new Date().getTime();

    if(doc['id']) {
      this.dataService.updateByDoc(doc, propPath).pipe(take(1)).subscribe(() => {
          this.cacheService.delete(doc.id, propPath);
          this.cacheService.set(doc, propPath);
        }
      )
    } else {
    this.dataService.addDoc(doc, propPath).subscribe(() => {
      this.cacheService.set(doc, propPath);
    })
    }

  }

  public get(metaDoc: IMetaDoc , propPath: string){
    const ifCachedDoc = this.cacheService.get(metaDoc, propPath)
        if (ifCachedDoc) {
          return  of(ifCachedDoc);
        } else {
          return this.dataService.getById(metaDoc.id, propPath);
        }
  }

  public getAll(propPath: string) {
    return this.user.pipe(concatMap((currentUser) => {
        let returnDocArr: Observable<any>[] = [];
        const propMap = currentUser[propPath];
        for (let key in propMap) {
          if (propMap.hasOwnProperty(key)) {
            returnDocArr.push(this.get({id: key, lastUpdate: propMap[key]}, propPath));
          }
        }
        return zip(returnDocArr);
      }
    ));
  }

  public delete<T extends IMetaDoc> (doc: T, propPath: string) {
    this.dataService.deleteByDoc(doc, propPath).pipe(take(1)).subscribe(() => {
      this.cacheService.delete(doc.id, propPath);
    })
  }

}