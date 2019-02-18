import { Observable, pipe } from 'rxjs';
import { map, tap } from "rxjs/operators";

import { Injectable } from '@angular/core';

import { IFilter, IFilterObj } from '../../../models/filters/filters.interface';
import { IItemStats } from '../../../models/normalization/normalization.interface';
import { zScore } from '../../../shared/functions/helpers.functions';
import { log } from '../../logger.service';
import { LocalDbService } from '../local-db.service';

@Injectable({ providedIn: 'root' })
export class DenormalizeService {
  private dataStats$: Observable<Collection<any>>;

  constructor(private localDbService: LocalDbService) {
    this.dataStats$ = localDbService.getCollectionCache$();
  }

  public normalizeFilterObj(filterObj: IFilterObj) {
    return this.dataStats$.pipe(
      tap(val => log('DENORMALIZE', '' , val )),
      map(cacheCol => {

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

  private denormalizeItem(item: object, cacheCol: Collection<IItemStats>) {
    item
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
