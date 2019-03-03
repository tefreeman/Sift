import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { BehaviorSubject, Observable, of, zip } from "rxjs";
import { IMetaIdDoc, IProfile } from "../../../models/user/userProfile.interface";
import { CacheService } from "./cache.service";
import { concatMap, filter, map, take, tap } from "rxjs/operators";
import { DataCollectionServerService } from "./data-collection-server.service";
import { DataService } from "../data.service";

interface IMetaDoc {
  id?: string;
  lastUpdate?: number;
}
interface IUserPropMetaDoc {
  [id: string]: number
}

@Injectable({providedIn: 'root'})
export class CollectionDataService {

  private user: Observable<IProfile>;
  private propPath: string;

  private liveColView$$: BehaviorSubject<any> = new BehaviorSubject(null);
  private liveColView$ = this.liveColView$$.pipe(filter((val)=> val !== null));
  constructor(private cacheService: CacheService, private dataService: DataCollectionServerService, private tempUser: DataService){
    this.user = tempUser.user;
  }

  public setColAndInit(propPath: string) {
    this.propPath = propPath;
    this.getAll().pipe(take(1)).subscribe( (viewArr) => {
      this.liveColView$$.next(viewArr);
    })
  }

  public upsert<T extends IMetaDoc>(doc: T) {
    doc.lastUpdate = new Date().getTime();

    if(doc['id']) {
      return this.dataService.updateByDoc(doc, this.propPath).pipe(take(1)).pipe( map(() => {
          this.cacheService.delete(doc.id, this.propPath);
          this.cacheService.set(doc, this.propPath);
          this.updateView();
          return;
        }
      ));
    } else {
    return this.dataService.addDoc(doc, this.propPath).pipe(map(() => {
      this.cacheService.set(doc, this.propPath);
      this.updateView();
      return;
    }))
    }

  }

  public get(metaDoc: IMetaDoc){
    const ifCachedDoc = this.cacheService.get(metaDoc, this.propPath)
        if (ifCachedDoc) {
          return  of(ifCachedDoc);
        } else {
          return this.dataService.getById(metaDoc.id, this.propPath);
        }
  }

  public getAll() {
    return this.user.pipe(concatMap((currentUser) => {
        let returnDocArr: Observable<any>[] = [];
        const propMap = currentUser[this.propPath];
        for (let key in propMap) {
          log('ran!');
          if (propMap.hasOwnProperty(key)) {
            returnDocArr.push(this.get({id: key, lastUpdate: propMap[key]}));
          }
        }
        return zip(returnDocArr);
      }
    ));
  }

  public delete<T extends IMetaDoc> (doc: T) {
    return this.dataService.deleteByDoc(doc, this.propPath).pipe(take(1)).pipe(map(() => {
       this.cacheService.delete(doc.id, this.propPath);
       this.updateView();
       return;
    }));
  }

  public getLiveView$() {
    return this.liveColView$;
  }

  private updateView() {
    this.getAll().pipe(take(1)).subscribe( (viewArr) => {
      this.liveColView$$.next(viewArr);
    })
  }

}