import * as Lokijs from 'lokijs';
import { Observable, of, pipe, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
        return this.restaurantFilters$(filterObj.filterRestaurants, filterObj.name)
        .pipe(
            map( (view) => {
                log('processFilters!');
                return view.data();
            })
        );
    }

    private restaurantFilters$(filters: IRestaurantsFilter[], name: string): Observable<DynamicView<any>> {
        return this.localDbService.getCollection$('restaurants').pipe (
            map( (col) => {
            let dView = col.addDynamicView(name);
            for (const filter of filters) {
            if (filter.min && filter.max) {
                dView = dView.applyFind({ [filter.key]: {'$between': [filter.min, filter.max]}});
            } else if (filter.max && !filter.max) {
                dView = dView.applyFind({ [filter.key]: {'$lte': filter.max}});
            } else if (filter.min && !filter.max) {
                dView = dView.applyFind({ [filter.key]: {'$gte': filter.min}});
            } else if (filter.has && !filter.hasVal) {
                dView = dView.applyFind({ [filter.key]: filter.has});
            } else if (filter.hasVal && !filter.has) {
                dView = dView.applyFind({ [filter.key]: filter.hasVal});
            }
        }
        return dView;
        })
        );
    }

    private nutrientFilters$(filters: INutrientFilter[], name: string): Observable<DynamicView<any>> {
        return this.localDbService.getCollection$('nutrients').pipe (
            map( (col) => {
            let dView = col.addDynamicView(name);
            for (const filter of filters) {
            if (filter.hasVal) {
                dView = dView.applyFind({ [filter.key]: {'$eq': filter.hasVal}});
            }
        }
        return dView;
        })
        );
    }

    private ingredientFilters$(filters: IIngredientFilter[], name: string): Observable<DynamicView<any>> {
        return this.localDbService.getCollection$('ingredients').pipe (
            map( (col) => {
            let dView = col.addDynamicView(name);
            for (const filter of filters) {
            if (filter.min && filter.max) {
                dView = dView.applyFind({ [filter.key]: {'$eq': filter.hasVal}});
            }
        }
        return dView;
        })
        );
    }

    private filterNutrient(col: DynamicView<any>, filter: IFilter): DynamicView<any> {
        return col.applyFind({[filter.key]: {'$between': [filter.min, filter.max]}});
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
