import * as Lokijs from 'lokijs';
import { forkJoin, Observable, of, pipe, Subject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { log } from 'src/app/core/logger.service';

import { Injectable, Query } from '@angular/core';

import {
    IFilter, IFilterObj, IIngredientFilter, INutrientFilter, IRestaurantsFilter
} from '../../models/filters/filters.interface';
import { LocalDbService } from './local-db.service';

@Injectable({ providedIn: 'root' })
export class FiltersService {

    private filters: IFilterObj[];
    private activeFilter$: Subject<IFilterObj> = new Subject();
    private activeFilterItems$: Subject<any> = new Subject();

    constructor(private localDbService: LocalDbService) {

        this.activeFilter$.subscribe( (filterObj) => {
            log('activeFilter$', '', filterObj);
             this.processFilters(filterObj).subscribe((result) => {
                log('result$', '', result);
                this.activeFilterItems$.next(of(result));
            });
        });

        const filter: IFilterObj = {
            uid: '120',
            name: 'trevor',
            public: true,
            timestamp: 12313123,
            lastActive: 14124142,
            filterIngredients: [],
            filterNutrients: [],
            filterRestaurants: [{key : 'price', min: 2, max: 4}, {key: 'reviewScore', min: 4.6}],
            // Create your own diet?
            diet: {},
        };

        this.setActiveFilter(filter);

    }

    // TODO add filter to userlist, upload to server, and cache
    public addFilter(filter: IFilterObj): void {
       const foundId = this.findFilter(filter);
            if (foundId) { this.filters[foundId] = filter; } else { this.filters.push(filter); }
    }

    public deleteFilter(name: string): void | Error {
        const foundId = this.findFilter(name);
        if (foundId) {this.filters.splice(foundId, 1); return; }
        return new Error('Cannot find name to delete filter');
    }


    public getFilter(name: string): IFilterObj | void {
        const foundId = this.findFilter(name);
        if (foundId) { return this.filters[foundId]; } else { return; }
    }

    public getAllFilters(): IFilterObj[] {
        return this.filters;
    }


    public setActiveFilter(filterObj: IFilterObj) {
        this.activeFilter$.next(filterObj);
    }

    public getActiveFilter() {
        return this.activeFilter$;
    }

    public getActiveItems() {
        return this.activeFilterItems$;
    }

    private processFilters(filterObj: IFilterObj): Observable<any[]> {
        const restaurantTransform = this.genRestaurantTransformArr(filterObj.filterRestaurants);
        const nutrientTransform = this.genNutrientTransformArr(filterObj.filterNutrients);
        const ingredientTransform = this.genIngredientTransformArr(filterObj.filterIngredients);

        const seperateFilteredItems = forkJoin(
        this.getRestaurantsByFilter$(restaurantTransform),
      //  this.getNutrientsByFilter$(nutrientTransform),
      //  this.getIngredientsByFilter$(ingredientTransform) 
      ).pipe(
           map( (filteredItems) =>  {
               log('filteredItems', '', filteredItems);
               return filteredItems[0];
           })
        );

        return seperateFilteredItems;




    }

    private getRestaurantsByFilter$(transformations: any[]): Observable<any[]> {
        return this.localDbService.getCollection$('restaurants')
        .pipe(
            map((col) => {
                let test = col.chain(transformations).data();
                log('test', '', test);
                return test;
                }
            )
        );
    }
    private getNutrientsByFilter$(transformations: any[]): Observable<any[]> {
        return this.localDbService.getCollection$('nutrients')
        .pipe(
            map((col) => {
                return col.chain(transformations).data();
                }
            )
        );
    }
    private getIngredientsByFilter$(transformations: any[]): Observable<any[]> {
        return this.localDbService.getCollection$('ingredients')
        .pipe(
            map((col) => {
                return col.chain(transformations).data();
                }
            )
        );
    }



    private genRestaurantTransformArr(filters: IRestaurantsFilter[]): any[] {
            const filterArr = [];
            for (const filter of filters) {
            if (filter.min && filter.max) {
                filterArr.push([[filter.key], {'find': { [filter.key]: {'$between': [filter.min, filter.max]}}}]);
            } else if (filter.max && !filter.max) {
                filterArr.push([[filter.key], {'find': { [filter.key]: {'$lte': filter.max}}}]);
            } else if (filter.min && !filter.max) {
                filterArr.push([[filter.key], {'find': { [filter.key]: {'$gte': filter.min}}}]);
            } else if (filter.has && !filter.hasVal) {
                filterArr.push([[filter.key], {'find': { [filter.key]: filter.has}}]);
            } else if (filter.hasVal && !filter.has) {
                filterArr.push([[filter.key], {'find':{  [filter.key]: filter.hasVal}}]);
            }
        }
        return filterArr;

    }

    private genNutrientTransformArr(filters: INutrientFilter[]): any[] {
        const filterArr = [];
            for (const filter of filters) {
            if (filter.hasVal) {
                filterArr.push([[filter.key], {'find': { [filter.key]: {'$eq': filter.hasVal}}}]);
            }
        }
        return filterArr;

    }

    private genIngredientTransformArr(filters: IIngredientFilter[]): any[] {
        const filterArr = [];
            for (const filter of filters) {
            if (filter.min && filter.max) {
                filterArr.push([[filter.key], {'find': { [filter.key]: {'$between': [filter.min, filter.max]}}}]);
            }
        }
        return filterArr;
    }


    private findFilter(filter: object | string): number | void {
        const name = typeof filter === 'object' ? filter['name'] : filter;
        for (let i = 0; i < this.filters.length; i++) {
            if (this.filters[i]['name'] === name) {
                return i;
            }
        }
        return;
    }

    private initFilters() {

    }

    private getCachedFilters(filterObj) {

    }

    private uploadToServer(filterObj) {

    }

    private cacheFilter(filterObj) {

    }

    private isCached(filterObj) {

    }


}
