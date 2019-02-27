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

@Injectable({ providedIn: 'root' })
export class FiltersService {

    private activeFilterResultSet$$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private activeFilterResultSet$: Observable<any>;
    private activeFilter$$: BehaviorSubject<IFilterObj> = new BehaviorSubject<IFilterObj>(null);
    private activeFilter$: Observable<IFilterObj>;
    constructor(
        private localDbService: LocalDbService,
        private normalizeService: NormalizeService,
        private gpsService: GpsService,
        private cacheDB: CacheDbService,
        private dataService: DataService
    ) {
        this.activeFilterResultSet$ = this.activeFilterResultSet$$.pipe(filter(val => val !== null));
        this.activeFilter$ = this.activeFilter$$.pipe(filter(val => val !== null));
        this.getAllFilters$().pipe(take(1), concatMap(filters=>{
            return this.setActiveFilter(filters[0]);
        })).subscribe();

    }

    public getAllFilters$(): Observable<IFilterObj[]> {
        return this.dataService.getAll('filters').pipe(map( (filters) => {
            filters = this.sortByLastActive(filters);
            log('getAllFilters$', '', filters);
            return filters;
        }))
    }

    public getItemResultSet$() {
        return this.activeFilterResultSet$;
    }

    public getActiveFilter$() {
        return this.activeFilter$;
    }
    public createFilter(siftName: string, filterRestaurants: IRestaurantsFilter[], filterNutrients: INutrientFilter[],
    filterItems: IItemsFilter[]) {
        const date = new Date().getTime();
        const filterObj: IFilterObj = {
            name: siftName,
            public: false,
            timestamp: date,
            lastActive: date,
            lastUpdate: date,
            active: false,
            filterRestaurants: filterRestaurants,
            filterNutrients:filterNutrients,
            filterItems: filterItems,
            // Create your own diet?
            diet: {}
        };

        return this.dataService.addOrUpdate$("filters", filterObj);
    }

    public updateFilter(siftObj: IFilterObj, siftName: string, filterRestaurants: IRestaurantsFilter[], filterNutrients: INutrientFilter[],
                        filterItems: IItemsFilter[]) {
        const date = new Date().getTime();
            siftObj.name = siftName;
            siftObj.lastActive =  date;
            siftObj.lastUpdate = date;
            siftObj.filterRestaurants = filterRestaurants;
            siftObj.filterNutrients =filterNutrients;
            siftObj.filterItems = filterItems;

        return this.dataService.addOrUpdate$("filters", siftObj);
    }

    public setActiveFilter(filter: IFilterObj) {
        filter.lastActive = new Date().getTime();
        this.cacheDB.cache('filters', filter).subscribe();
        this.activeFilter$$.next(filter);
        let copiedFilter = JSON.parse(JSON.stringify(filter));
        return this.loadItemResultSet$(copiedFilter).pipe(take(1), tap(views => {
            this.activeFilterResultSet$$.next(views);
        }))
    }

    private loadItemResultSet$(activeFilterObj: IFilterObj) {
        return this.prepareFilter(activeFilterObj).pipe(
          tap(val => log('FIRSTFILTER', '',  val)),
            concatMap(preparedActiveFilter => {
                return this.processFilters(preparedActiveFilter);
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


    private prepareFilter(filterObj: IFilterObj): Observable<IFilterObj> {
        return this.normalizeService.normalizeFilterObj(filterObj).pipe(
            concatMap(normalizedFilter => {
                return this.efficientFilterSort(normalizedFilter);
            })
        );
    }
    private processFilters(filterObj: IFilterObj): Observable<{ itemView: Resultset<any>; restaurantView: Resultset<any> }> {
        log('filterObj', '', filterObj);
        const restaurantTransform = this.genTransformArr(filterObj.filterRestaurants);
        const nutrientTransform = this.genTransformArr(filterObj.filterNutrients);
        const itemTransform = this.genTransformArr(filterObj.filterItems);

        const seperateFilteredItems = zip(
            this.applyFilter$(restaurantTransform, 'restaurants'),
            this.applyFilter$(itemTransform, 'items'),
            this.applyFilter$(nutrientTransform, 'nutrients')
        ).pipe(
            tap(sets => {
                log('EndSeperateFilters', '', sets);
            }),
            map(sets => {
                log('start');
                // restaurants 0, items 1, nutrients 2
                sets[1].find({ $loki: { $in: sets[2].filteredrows } });
                sets[1].find({ restaurant_id: { $in: sets[0].filteredrows } });
                log('end');
                return { itemView: sets[1], restaurantView: sets[0] };
            })
        );

        return seperateFilteredItems;
    }

    private efficientFilterSort(filterObj: IFilterObj): Observable<IFilterObj> {
        return this.localDbService.getCollection$('tags').pipe(
          tap((col) => {console.log('EFFICIENTFILTERSORT', '', col)}),
            map(col => {
                for (const r of filterObj.filterRestaurants) {
                    if (r.key === 'tag_ids') {
                        r.prob = col.findOne({ $loki: { $eq: r.hasVal } })['prob'];
                    }
                }

                for (const i of filterObj.filterItems) {
                    if (i.key === 'tag_ids') {
                        i.prob = col.findOne({ $loki: { $eq: i.hasVal } })['prob'];
                    }
                }

                sort(filterObj.filterRestaurants, (a: IFilter, b: IFilter) => {
                    return a.prob - b.prob;
                });

                sort(filterObj.filterItems, (a: IFilter, b: IFilter) => {
                    return a.prob - b.prob;
                });

                sort(filterObj.filterNutrients, (a: IFilter, b: IFilter) => {
                    return a.prob - b.prob;
                });
                return filterObj;
            })
        );
    }

    private applyFilter$(transformations: any[], colName: string): Observable<Resultset<any>> {
        return this.localDbService.getCollection$(colName).pipe(
            map(col => {
                return col.chain(transformations);
            })
        );
    }

    private genTransformArr(filters: IRestaurantsFilter[] | IItemsFilter[] | IIngredientFilter[] | INutrientFilter[]): any[] {
        const filterArr = [];
        for (const filter of filters) {
            if (filter.min && filter.max) {
                filterArr.push({
                    type: 'find',
                    value: { [filter.key]: { $between: [filter.min, filter.max] } }
                });
            } else if (filter.max && !filter.max) {
                filterArr.push({
                    type: 'find',
                    value: { [filter.key]: { $lte: filter.max } }
                });
            } else if (filter.min && !filter.max) {
                filterArr.push({
                    type: 'find',
                    value: { [filter.key]: { $gte: filter.min } }
                });
            } else if (filter.has && !filter.hasVal) {
                filterArr.push({ type: 'find', value: { [filter.key]: filter.has } });
            } else if (filter.hasVal && !filter.has) {
                filterArr.push({
                    type: 'find',
                    value: { [filter.key]: { $contains: filter.hasVal } }
                });
            }
        }
        if (filterArr.length === 0) {
            filterArr.push({type: 'find', value: {$loki: {$gte: 0}}});
        }
        return filterArr;
    }
}

interface IMinMax {
    prop: string;
    min: number;
    max: number;
}
