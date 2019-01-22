import * as Lokijs from 'lokijs';
import { Observable, of, pipe, Subject } from 'rxjs';
import { map, tap, timestamp } from 'rxjs/operators';
import { log } from 'src/app/core/logger.service';

import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';

import { IFilterObj } from '../../models/filters/filters.interface';
import { LocalDbService } from './local-db.service';

@Injectable({ providedIn: 'root' })
export class FiltersService {
    private itemsCollection$: Observable<Collection<any>>;
    private nutrientsCollection$: Observable<Collection<any>>;
    private restaurantsCollection$: Observable<Collection<any>>;
    private filters: IFilterObj[];
    private activeFilter$: Subject<IFilterObj> = new Subject();
    private activeFilterItems$: Subject<any> = new Subject();

    constructor(private localDbService: LocalDbService) {
        this.itemsCollection$ = localDbService.getCollection$('items');
        this.nutrientsCollection$ = localDbService.getCollection$('nutrients');
        this.restaurantsCollection$ = localDbService.getCollection$('restaurants');



        this.activeFilter$.subscribe( (filterObj) => {
            log('activeFilter$', '', filterObj);
            let result = this.processFilter(filterObj);
            this.activeFilterItems$.next(of(result));
        });

        const filter: IFilterObj = {
            uid: '120',
            name: 'trevor',
            public: true,
            timestamp: 12313123,
            lastActive: 14124142,
            filterArray: [{type: 'nutrient', prop: 'protein', max: 41, min: 40, }],
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

    private processFilter(filterObj: IFilterObj): any[] {
        for (const filter of filterObj.filterArray) {
            if (filter.type === 'nutrient') {
                this.nutrientsCollection$.subscribe((col) => {
                    const result = col.find({[filter.prop]: {'$between': [30, 31]}});
                    if (result.length > 0) {
                        log('processFilter', 'greater than 0', result);
                        return result;
                    }
                });
            }
        }
        return [];
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
