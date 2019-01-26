import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { IFilter, IFilterObj } from '../../models/filters/filters.interface';
import { IItemStats } from '../../models/normalization/normalization.interface';
import { log } from '../logger.service';
import { LocalDbService } from './local-db.service';

@Injectable({providedIn: 'root'})
export class NormalizeService {
    private dataStats$: Observable<Collection<any>>;
    constructor(private localDbService: LocalDbService) {
        this.dataStats$ = localDbService.getCollectionCache$();
        this.localDbService.setUpdateDistance().subscribe( (col) => {
            this.normalizeDistance(col, 'distance');
            log('end distance')
        })
    }

   public normalizeFilterObj(filterObj: IFilterObj) {
       return this.dataStats$.pipe(
          map ((cacheCol) => {
        filterObj.filterRestaurants = this.normalizeCollection('restaurants', filterObj.filterRestaurants, cacheCol);
        filterObj.filterItems = this.normalizeCollection('items', filterObj.filterItems, cacheCol);
        filterObj.filterNutrients = this.normalizeCollection('nutrients', filterObj.filterNutrients, cacheCol);
        return filterObj;
        })
        );
    }

    public deNormalizeResults(results: object[], limit) {
        return this.dataStats$.pipe(
            map ((cacheCol) => {

            })
        )
    }

    public normalize(x: number, min: number, max: number) {
        return (x - min) / (max - min);
    }

    private normalizeCollection(name: string, filters: any[], cacheCol: Collection<IItemStats> ) {
        if (filters.length <= 0) {return filters;} // if no filters  instantly return it
        for (let filter of filters) {
            const normalizeStatObj = cacheCol.findOne({'name': name + '.' + filter.key});
            filter = this.normalizeFilterProps(filter, normalizeStatObj);

        }
        return filters;
    }

    public normalizeDistance(col: Collection<any>, field: string) {

        const min = col.min(field);
        const max = col.max(field);
        const mode = col.mode(field);
        const stdDev = col.stdDev(field);
        const median = col.median(field);
        const avg = col.avg(field);
        
       if (isNaN(min) || isNaN(max) || isNaN(stdDev) || isNaN(median) || isNaN(avg) || avg <= 1) {
           return;
       }
    
        col.findAndUpdate({}, (obj) => { obj[field] = Number(this.normalize(obj[field], min, max)); return obj;});
    
        const dataCache = {name: col.name + '.' + field, type: 'dataCache', collection: col.name,
         field: field, min: min, max: max, mode: mode, stdDev: stdDev, median: median, avg: avg }

        this.localDbService.getCollectionCache$().subscribe( (col) => {
            if (col.find({name: dataCache.name}).length > 0) {
                col.findAndUpdate({name: dataCache.name}, (obj) => dataCache);
            } else {
                col.insert(dataCache);
            }
        })
        return;
    }

    private normalizeFilterProps(filter: IFilter, stats: IItemStats) {
        if (filter.max) {
            filter.max = this.normalize(filter.max, stats.min, stats.max);
        }
        if (filter.max) {
            filter.min = this.normalize(filter.min, stats.min, stats.max);
        }
        if (filter.hasVal) {
            if (typeof(filter.hasVal) === 'number') {
                filter.hasVal = this.normalize(filter.hasVal, stats.min, stats.max);
            }
        }
        return filter;
    }
}