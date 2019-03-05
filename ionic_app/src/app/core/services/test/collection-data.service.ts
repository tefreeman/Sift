import { Injectable } from "@angular/core";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { log } from "../../logger.service";
import { BehaviorSubject, forkJoin, Observable, of, zip } from "rxjs";
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
  private liveColView$: Observable<any>;
  constructor(private cacheService: CacheService, private dataCollectionServerService: DataCollectionServerService, private tempUser: DataService){
    this.liveColView$ = this.liveColView$$.pipe(filter((val)=> val !== null));
    this.user = tempUser.user;
  }

  public setColAndInit(propPath: string) {
    this.propPath = propPath;
    return this.getAll().pipe(take(1)).pipe(map( (viewArr) => {
      log('getAll', '', viewArr);
      this.liveColView$$.next(viewArr);
    }));
  }
  public updateActive<T extends IMetaDoc>(doc: T) {
    log('updating active');
    doc['lastActive'] = new Date().getTime();
    this.cacheService.update(doc.id, this.propPath, doc);
    this.updateView().subscribe();
  }

  public upsert<T extends IMetaDoc>(doc: T) {
    doc.lastUpdate = new Date().getTime();
    // if no id it needs to be added to respective collection to get id to added to user doc
    if(doc['id']) {
      log('upsert has an Id');
       return this.dataCollectionServerService.updateByDoc(doc, this.propPath).pipe(take(1)).pipe(map(() => {
          this.cacheService.update(doc.id, this.propPath, doc);
          this.updateView().subscribe();
        }
      ));
    } else {
      log('upsert has no Id');
     return this.dataCollectionServerService.addDoc(doc, this.propPath).pipe(take(1)).pipe(map((metaDoc) => {
       doc.id = metaDoc.id;
       doc.lastUpdate = metaDoc.lastUpdate;
       this.cacheService.set(doc, doc.id, doc.lastUpdate, this.propPath);
       this.updateView().subscribe();
    }));
    }

  }

  public get(metaDoc: IMetaDoc){
    const ifCachedDoc = this.cacheService.get(metaDoc, this.propPath);
        if (ifCachedDoc) {
          log('getCached', '', ifCachedDoc);
          return  of(ifCachedDoc);
        } else {
          return this.dataCollectionServerService.getById(metaDoc.id, this.propPath).pipe(tap((item)=> {
            log('getServer', '', item)
            this.cacheService.set(item, metaDoc.id, metaDoc.lastUpdate, this.propPath);

          }));
        }
  }

  public getAll() {
    return this.user.pipe(concatMap((currentUser) => {
        let returnDocArr: Observable<any>[] = [];
        const propMap = currentUser[this.propPath];
        for (let key in propMap) {
          if (propMap.hasOwnProperty(key)) {
            returnDocArr.push(this.get({id: key, lastUpdate: propMap[key]}));
          }
        }
        log('getAllReturnDocArr', '', returnDocArr);
      return forkJoin(returnDocArr);
      }
    ),
      tap((result)=> {
        log('resultOfGetAll', '', result);
      }));
  }

  public delete<T extends IMetaDoc> (doc: T) {
    return this.dataCollectionServerService.deleteByDoc(doc, this.propPath).pipe(take(1)).pipe(map(() => {
       this.cacheService.delete(doc.id, this.propPath);
      this.updateView().subscribe();
       return;
    }));
  }

  public getLiveView$() {
    return this.liveColView$.pipe(tap((view) => {
      log('getLiveView$', '', view);
    }))
  }

  private updateView() {
    return this.getAll().pipe(take(1)).pipe( tap((viewArr) => {
      log('updateLiveView$', '', viewArr);
      this.liveColView$$.next(viewArr);
    }));
  }

}