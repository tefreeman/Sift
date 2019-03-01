import { BehaviorSubject, Observable, zip } from "rxjs";
import { concatMap, filter, map, take, tap } from "rxjs/operators";
import { log } from "../../logger.service";
import { sort } from "timsort";
import { CacheDbService } from "./../cache/cache-db.service";

import { Injectable } from "@angular/core";

import {
  IFilter,
  IFilterObj,
  IIngredientFilter,
  IItemsFilter,
  INutrientFilter,
  IRestaurantsFilter
} from "../../../models/filters/filters.interface";
import { DataService } from "../data.service";
import { GpsService } from "../gps.service";
import { LocalDbService } from "../local-db.service";
import { NormalizeService } from "./normalize.service";

@Injectable({ providedIn: "root" })
export class FiltersService {

  private activeFilterResultSet$$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private activeFilterResultSet$: Observable<any>;
  private activeSift$$: BehaviorSubject<IFilterObj> = new BehaviorSubject<IFilterObj>(null);
  private activeSift$: Observable<IFilterObj>;
  private : BehaviorSubject<IFilterObj[]> = new BehaviorSubject<IFilterObj[]>(null);
  private allSifts$: Observable<IFilterObj[]>;

  constructor(
    private localDbService: LocalDbService,
    private normalizeService: NormalizeService,
    private gpsService: GpsService,
    private cacheDB: CacheDbService,
    private dataService: DataService
  ) {
    this.activeFilterResultSet$ = this.activeFilterResultSet$$.pipe(filter(val => val !== null));
    this.activeSift$ = this.activeSift$$.pipe(filter(val => val !== null));
    this.allSifts$ = this.allSifts$$.pipe(filter(val => val !== null));
    this.updateAllSifts$().pipe(take(1)).subscribe();

  this.activeSift$.subscribe(( (activeSift) => {
    let copiedSift = JSON.parse(JSON.stringify(activeSift));
       this.loadItemResultSet$(copiedSift).pipe(
        tap(views => {
          this.activeFilterResultSet$$.next(views);
        })).subscribe();
    }))
  }

  /**
   * Returns all filters as a live observable
   * @return {Observable<IFilterObj[]>} filters - returns private Behavior Subject with null filter
   *
   */
  public getAllSifts$(): Observable<IFilterObj[]> {
    return this.allSifts$;
  }

  /**
   * gets all Sifts from DataService as an array, sorts by lastActive property, and then
   *  updates allFilters$$  and activeFilter$$
   */
  private updateAllSifts$(): Observable<void> {
    return this.dataService.getAll("filters").pipe(map((filters) => {
      filters = this.sortByLastActive(filters);
      log("updateAllSifts$", "", filters);
      this.activeSift$$.next(filters[0]);
      this.allSifts$$.next(filters);
      return;
    }));
  }

  public getItemResultSet$() {
    return this.activeFilterResultSet$;
  }

  public getActiveSift$() {
    return this.activeSift$;
  }


  /**
   * Sets the active Filter which adds the filter's item result set
   * to the result set behavior subject (observable)
   * @param {IFilterObj}filter
   */
  public setActiveSift(filter: IFilterObj): Observable<any> {
    filter.lastActive = new Date().getTime();
    return this.cacheDB.cache("filters", filter).pipe(tap(
      () => {
        log('setActiveSiftFired!!!!!!', '', filter);
        this.activeSift$$.next(filter);
      }
    ))
  }
  public createSift(siftName: string, filterRestaurants: IRestaurantsFilter[], filterNutrients: INutrientFilter[],
                      filterItems: IItemsFilter[]) {
    const date = new Date().getTime();
    const sift: IFilterObj = {
      name: siftName,
      public: false,
      timestamp: date,
      lastActive: date,
      lastUpdate: date,
      active: false,
      filterRestaurants: filterRestaurants,
      filterNutrients: filterNutrients,
      filterItems: filterItems,
      // Create your own diet?
      diet: {}
    };

     return this.dataService.addOrUpdate$("filters", sift).pipe(
       concatMap( () => {
         return this.updateAllSifts$();
       })
     )
  }

  public updateSift(siftObj: IFilterObj, siftName: string, filterRestaurants: IRestaurantsFilter[], filterNutrients: INutrientFilter[],
                      filterItems: IItemsFilter[]) {
    const date = new Date().getTime();
    siftObj.name = siftName;
    siftObj.lastActive = date;
    siftObj.lastUpdate = date;
    siftObj.filterRestaurants = filterRestaurants;
    siftObj.filterNutrients = filterNutrients;
    siftObj.filterItems = filterItems;

   return this.dataService.addOrUpdate$("filters", siftObj).pipe(
      concatMap( () => {
        return this.updateAllSifts$();
      })
    )
  }

  public deleteSift(sift: IFilterObj): Observable<any> {
    return this.dataService.delete("filters", sift).pipe(concatMap(() => {
        return this.updateAllSifts$();
    }));


  }


  private loadItemResultSet$(activeFilterObj: IFilterObj) {
    return this.prepareSift(activeFilterObj).pipe(
      tap(val => log("FIRSTFILTER", "", val)),
      concatMap(preparedActiveFilter => {
        return this.processSift(preparedActiveFilter);
      }),
      tap((val) => {
        console.log("LASTFILTER", val);
      })
    );
  }

  private sortByLastActive(filterObjs: IFilterObj[]) {
    if (filterObjs.length === 0) {
      return [];
    }
    sort(filterObjs, (a: IFilterObj, b: IFilterObj) => {
      return b.lastActive - a.lastActive;
    });
    return filterObjs;
  }

  /**
   * normalizes the sifts filters and then efficiently sorts them based
   * on a normal probability distribution. Remember the items and restaurants
   * data is stored already normalized between 0 and 1.
   * @param  {IFilterObj}sift
   */
  private prepareSift(sift: IFilterObj): Observable<IFilterObj> {
    return this.normalizeService.normalizeFilterObj(sift).pipe(
      concatMap(normalizedFilter => {
        return this.efficientFilterSort(normalizedFilter);
      })
    );
  }

  /**
   * Takes the sift and applies restaurant, nutrients, and items filters to create
   * a filtered item result set
   * @param {IFilterObj} sift
   * @return {Observable<Resultset, Resultset>} ObservableResultSets - returns itemView and restaurantView
   */
  private processSift(sift: IFilterObj): Observable<{ itemView: Resultset<any>; restaurantView: Resultset<any> }> {
    log("sift", "", sift);
    const restaurantTransform = this.genTransformArr(sift.filterRestaurants);
    const nutrientTransform = this.genTransformArr(sift.filterNutrients);
    const itemTransform = this.genTransformArr(sift.filterItems);

    const seperateFilteredItems = zip(
      this.applyFilter$(restaurantTransform, "restaurants"),
      this.applyFilter$(itemTransform, "items"),
      this.applyFilter$(nutrientTransform, "nutrients")
    ).pipe(
      tap(sets => {
        log("EndSeperateFilters", "", sets);
      }),
      map(sets => {
        log("start");
        // restaurants 0, items 1, nutrients 2
        sets[1].find({ $loki: { $in: sets[2].filteredrows } });
        sets[1].find({ restaurant_id: { $in: sets[0].filteredrows } });
        log("end");
        return { itemView: sets[1], restaurantView: sets[0] };
      })
    );

    return seperateFilteredItems;
  }

  private efficientFilterSort(sift: IFilterObj): Observable<IFilterObj> {
    return this.localDbService.getCollection$("tags").pipe(
      tap((col) => {
        console.log("EFFICIENTFILTERSORT", "", col);
      }),
      map(col => {
        for (const r of sift.filterRestaurants) {
          if (r.key === "tag_ids") {
            r.prob = col.findOne({ $loki: { $eq: r.hasVal } })["prob"];
          }
        }

        for (const i of sift.filterItems) {
          if (i.key === "tag_ids") {
            i.prob = col.findOne({ $loki: { $eq: i.hasVal } })["prob"];
          }
        }

        sort(sift.filterRestaurants, (a: IFilter, b: IFilter) => {
          return a.prob - b.prob;
        });

        sort(sift.filterItems, (a: IFilter, b: IFilter) => {
          return a.prob - b.prob;
        });

        sort(sift.filterNutrients, (a: IFilter, b: IFilter) => {
          return a.prob - b.prob;
        });
        return sift;
      })
    );
  }

  /**
   * Applies a loki filter transformation array by chaining onto the collection
   * @param  {Array} transformations - An array of valid LokiJs transformations
   * @param {string} colName - LokiJs collection name
   * @return {Observable<Resultset>} resultSet - LokiJs resultSet containing filtered items
   */
  private applyFilter$(transformations: any[], colName: string): Observable<Resultset<any>> {
    return this.localDbService.getCollection$(colName).pipe(
      map(col => {
        return col.chain(transformations);
      })
    );
  }

  /**
   * Transforms filter Arrays into LokiJs formatted filter arrays
   * @param {IRestaurantsFilter[] | IItemsFilter[] | IIngredientFilter[] | INutrientFilter[]} filters - an array of filters that
   * aren't formatted in Lokijs style yet
   * @return {any[]} filterArr - returns properly formatted LokiJs filter Arrays
   */
  private genTransformArr(filters: IRestaurantsFilter[] | IItemsFilter[] | IIngredientFilter[] | INutrientFilter[]): any[] {
    const filterArr = [];
    for (const filter of filters) {
      if (filter.min && filter.max) {
        filterArr.push({
          type: "find",
          value: { [filter.key]: { $between: [filter.min, filter.max] } }
        });
      } else if (filter.max && !filter.max) {
        filterArr.push({
          type: "find",
          value: { [filter.key]: { $lte: filter.max } }
        });
      } else if (filter.min && !filter.max) {
        filterArr.push({
          type: "find",
          value: { [filter.key]: { $gte: filter.min } }
        });
      } else if (filter.has && !filter.hasVal) {
        filterArr.push({ type: "find", value: { [filter.key]: filter.has } });
      } else if (filter.hasVal && !filter.has) {
        filterArr.push({
          type: "find",
          value: { [filter.key]: { $contains: filter.hasVal } }
        });
      }
    }
    if (filterArr.length === 0) {
      filterArr.push({ type: "find", value: { $loki: { $gte: 0 } } });
    }
    return filterArr;
  }
}

interface IMinMax {
  prop: string;
  min: number;
  max: number;
}
