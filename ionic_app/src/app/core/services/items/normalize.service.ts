import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { IFilter, IFilterObj } from '../../../models/filters/filters.interface';
import { IItemStats } from '../../../models/normalization/normalization.interface';
import { zScore } from '../../../shared/functions/helpers.functions';
import { log } from '../../logger.service';
import { LocalDbService } from '../local-db.service';

@Injectable({ providedIn: 'root' })
export class NormalizeService {
    private dataStats$: Observable<Collection<any>>;

    constructor(private localDbService: LocalDbService) {
        this.dataStats$ = localDbService.getCollectionCache$();
    }

    public normalizeFilterObj(filterObj: IFilterObj) {
        return this.dataStats$.pipe(
            map(cacheCol => {
                filterObj.filterRestaurants = this.normalizeCollection('restaurants', filterObj.filterRestaurants, cacheCol);
                filterObj.filterItems = this.normalizeCollection('items', filterObj.filterItems, cacheCol);
                filterObj.filterNutrients = this.normalizeCollection('nutrients', filterObj.filterNutrients, cacheCol);
                return filterObj;
            })
        );
    }

    public deNormalizeItems(results: object[], filters) {
        return this.dataStats$.pipe(map(cacheCol => {
        }));
    }

    public normalize(x: number, min: number, max: number) {
        return (x - min) / (max - min);
    }

    public normalizeDistance(col: Collection<any>) {
        const fieldFrom = 'distance';
        const fieldTo = 'normDistance';

        const min = col.min(fieldFrom);
        const max = col.max(fieldFrom);
        const mode = col.mode(fieldFrom);
        const stdDev = col.stdDev(fieldFrom);
        const median = col.median(fieldFrom);
        const avg = col.avg(fieldFrom);

        if (isNaN(min) || isNaN(max) || isNaN(stdDev) || isNaN(median) || isNaN(avg) || avg <= 1) {
            return;
        }

        col.findAndUpdate({}, obj => {
            obj[fieldTo] = Number(this.normalize(obj[fieldFrom], min, max));
            return obj;
        });

        const dataCache = {
            name: col.name + '.' + fieldTo,
            type: 'dataCache',
            collection: col.name,
            field: fieldTo,
            min,
            max,
            mode,
            stdDev,
            median,
            avg
        };

        this.localDbService.getCollectionCache$().subscribe(col => {
            if (col.find({ name: dataCache.name }).length > 0) {
                col.findAndUpdate({ name: dataCache.name }, obj => dataCache);
            } else {
                col.insert(dataCache);
            }
        });
        return;
    }

    private normalizeCollection(name: string, filters: any[], cacheCol: Collection<IItemStats>) {
        if (filters.length <= 0) {
            return filters;
        } // if no filters  instantly return it
        for (let filter of filters) {
            const normalizeStatObj = cacheCol.findOne({
                name: name + '.' + filter.key
            });
            filter = this.normalizeFilterProps(filter, normalizeStatObj);
        }
        return filters;
    }

    /**
     *
     *
     * @private
     * @param {number} x - item value
     * @param {number} u - the mean of the set
     * @param {number} o -  the std dev of the set
     * @returns {number}
     * @memberof NormalizeService
     */
    private calculateZScore(x: number, u: number, o: number): number {
        return (x - u) / o;
    }

    private normalizeFilterProps(filter: IFilter, stats: IItemStats) {
        const numArr = [];
        if (filter.max) {
            numArr.push(this.calculateZScore(filter.max, stats.avg, stats.stdDev));
            filter.max = this.normalize(filter.max, stats.min, stats.max);
        }
        if (filter.min) {
            numArr.push(this.calculateZScore(filter.min, stats.avg, stats.stdDev));
            filter.min = this.normalize(filter.min, stats.min, stats.max);
        }
        if (filter.hasVal) {
            if (typeof filter.has === 'number') {
                numArr.push(this.calculateZScore(filter.has, stats.avg, stats.stdDev));
                filter.has = this.normalize(filter.has, stats.min, stats.max);
            }
        }
        if (numArr.length === 1) {
            filter.prob = zScore(numArr[0]);
            return filter;
        } else if (numArr.length === 2) {
            filter.prob = Math.abs(zScore(numArr[1]) - zScore(numArr[0]));
        }
    }
}
