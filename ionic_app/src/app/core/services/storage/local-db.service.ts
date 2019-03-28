import { Observer } from "firebase";
import * as Loki from "lokijs";
import * as LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { catchError, concatMap, filter, map, tap } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { distance } from "../../../shared/functions/helpers.functions";
import { log } from "../../logger.service";
import { DataService } from "../user/data.service";
import { GpsService } from "../location/gps.service";

@Injectable({ providedIn: "root" })
export class LocalDbService {
   private gridDbSubject$: BehaviorSubject<Loki> = new BehaviorSubject(null);
   private gridDb$: Observable<Loki> = this.gridDbSubject$.asObservable().pipe(filter(db => db !== null));

   private userDbSubject$: BehaviorSubject<Loki> = new BehaviorSubject(null);
   private userDb$: Observable<Loki> = this.userDbSubject$.asObservable().pipe(filter(db => db !== null));

   constructor(private dataService: DataService, private gpsService: GpsService) {
      this.loadGridDb();

      // Todo decouple this from local-db service. And add in updates only when user has moved x amount of meters.
      this.setUpdateDistance().subscribe();
   }

   public getCollection$(collectionName: string): Observable<Collection<any>> {
      return this.gridDb$.pipe(map(db => db.getCollection(collectionName)));
   }

   public getDocsByArr<T>(collectionName: string, numArr: any[], prop: string) {
      return this.gridDb$.pipe(map((db) => {
         const returnArr: T[] = [];
         for (let obj of numArr) {
            returnArr.push(db.getCollection(collectionName).findOne({ $loki: { $eq: obj[prop] } }));
         }
         return returnArr;
      }));
   }

   public setUpdateDistance() {
      const getRestaurants$ = this.gridDb$.pipe(
         tap(userPos => {
            log("", "", userPos);
         }),
         concatMap(db => {
            return this.getCollection$("restaurants");
         })
      );

      const getUserPos$ = this.gpsService.getLiveGpsCoords$().pipe(
         tap(userPos => {
            log("", "", userPos);
         }),
         filter(userPos => userPos !== null),
         map(userPos => userPos.coords)
      );

      return combineLatest(getUserPos$, getRestaurants$).pipe(
         map(valArr => {
            valArr[1].findAndUpdate({}, obj => {
               obj["distance"] = distance(
                  { lat: valArr[0].latitude, lon: valArr[0].longitude },
                  { lat: obj["coords"]["lat"], lon: obj["coords"]["lon"] }
               );
            });
            return valArr[1];
         })
      );
   }

   private checkVersion() {
   }

   private loadDbFromAdapter(name: string, adapter): Observable<string> {
      return Observable.create((observer: Observer<string>) => {
         adapter.getDatabaseList(result => {
            let match = false;
            for (const dbName of result) {
               if (dbName === name) {
                  match = true;
               }
            }
            if (match) {
               adapter.loadDatabase(name, (serializedDb: string) => {
                  observer.next(serializedDb);
               });
            } else {
               observer.error(new Error("cannot find indexed db"));
            }
         });
      });
   }

   private loadGridDb() {
      const lokiAdapter = new LokiIndexedAdapter();

      let localKey;

      const db = new Loki(localKey, {
         adapter: lokiAdapter,
         verbose: true,
         destructureDelimiter: "=",
         autosave: false,
         autoload: false
      });

      this.gpsService
         .getGridKey$()
         .pipe(
            // TODO checked for previous cached gps data (if its faster than waiting for gps to init)
            filter(val => val !== null),
            map(key => {
               localKey = key;
            }),
            concatMap(key => this.loadDbFromAdapter(localKey, lokiAdapter)),
            catchError(err =>
               this.loadGridDbFromServer(localKey).pipe(
                  tap(dbData => {
                     this.saveDbAdapter(localKey, dbData, lokiAdapter);
                  })
               )
            )
         )
         .pipe(
            map(dbData => {
               db.loadJSON(dbData);
               return db;
            })
         )
         .subscribe(newDb => {
            log("--------------this.db$.next-------------", "", newDb);
            this.gridDbSubject$.next(newDb);
         });
   }

   private loadGridDbFromServer(key: string) {
      return this.dataService.getDataByGridKey$(key);
   }

   private saveDbAdapter(name, dbData, adapter) {
      adapter.saveDatabase(name, dbData, result => {
      });
   }

   // Check Cache and File, Load if exists
   // If don't exist download file from server and open into collection

   // TODO integrate file cache

   // TODO verify local db against version from firestore. If outdated download update and reload collections
   // TODO any fileRead errors should
}
