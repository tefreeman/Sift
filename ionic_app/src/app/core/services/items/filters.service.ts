import { Observable, Subject, zip, BehaviorSubject } from 'rxjs';
import { concat, concatMap, filter, map, switchMap, tap } from 'rxjs/operators';
import { log } from '../../logger.service';
import { sort } from 'timsort';
import { CacheDbService } from './../cache/cache-db.service';

import { Injectable } from '@angular/core';

import {
    IFilter,
    IFilterObj,
    IIngredientFilter,
    IItemsFilter,
    INutrientFilter,
    IRestaurantsFilter
} from '../../../models/filters/filters.interface';
import { DataService } from '../data.service';
import { GpsService } from '../gps.service';
import { LocalDbService } from '../local-db.service';
import { NormalizeService } from './normalize.service';

@Injectable({ providedIn: 'root' })
export class FiltersService {
    private activeFilter$$: BehaviorSubject<IFilterObj> = new BehaviorSubject<IFilterObj>(null);
    private activeFilter$: Observable<IFilterObj> = this.activeFilter$$.pipe(filter(val => val !== null));

    constructor(
        private localDbService: LocalDbService,
        private normalizeService: NormalizeService,
        private gpsService: GpsService,
        private cacheDB: CacheDbService,
        private dataService: DataService
    ) {
        this.getActiveFilter().subscribe(initActive => {
            this.activeFilter$$.next(initActive);
        });
    }

    public isValidName(filterName) {
        this.cacheDB.getCollection$('filters').pipe(
            map(col => {
                if (col.findOne({ name: { $eq: filterName } }) === null) {
                    return true;
                } else {
                    return false;
                }
            })
        );
    }

    public updateFilter(filterObj: IFilterObj) {
        this.dataService.addOrUpdate('filters', filterObj);
    }

    public addFilter(filterObj: IFilterObj): void {
        this.dataService.addOrUpdate('filters', filterObj);
    }

    public deleteFilter(filterObj: IFilterObj): void | Error {
        this.dataService.delete('filters', filterObj);
    }

    public getAllFilters$(): Observable<IFilterObj[]> {
        return this.dataService.getAll('filters');
    }

    public setActiveFilter(filterId: string) {
        this.getFilter$(filterId).subscribe(filterObj => {
            filterObj.lastActive = new Date().getTime();
            this.cacheDB.cache('filters', filterObj);
            this.activeFilter$$.next(filterObj);
        });
    }

    public getActiveFilter() {
        return this.getAllFilters$().pipe(
            map(filterObjs => {
                filterObjs = this.sortByLastActive(filterObjs);
                return filterObjs[0];
            })
        );
    }
    public getItemResultSet$() {
        return this.activeFilter$.pipe(
            concatMap(activeFilter => {
                return this.prepareFilter$(activeFilter);
            }),
            concatMap(preparedActiveFilter => {
                return this.processFilters(preparedActiveFilter);
            })
        );
    }

    private sortByLastActive(filterObjs: IFilterObj[]) {
        if (filterObjs.length === 0) {
            return [];
        }
        sort(filterObjs, (a: IFilterObj, b: IFilterObj) => {
            return a.lastActive - b.lastActive;
        });
        return filterObjs;
    }

    private getFilter$(filterId: string): Observable<IFilterObj> {
        return this.cacheDB.getCollection$('filters').pipe(
            map(col => {
                return col.findOne({ id: { $eq: filterId } });
            })
        );
    }

    private prepareFilter$(filterObj: IFilterObj): Observable<IFilterObj> {
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
        return filterArr;
    }
}

interface IMinMax {
    prop: string;
    min: number;
    max: number;
}
