import * as Lokijs from 'lokijs';
import { combineLatest, forkJoin, Observable, of, pipe, Subject, zip } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { log } from 'src/app/core/logger.service';
import { sort } from 'timsort';

import { Injectable, Query } from '@angular/core';

import {
    IFilter, IFilterObj, IIngredientFilter, IItemsFilter, INutrientFilter, IRestaurantsFilter
} from '../../../models/filters/filters.interface';
import { ISort } from '../../../models/sort/sort.interface';
import { distance } from '../../../shared/functions/helpers.functions';
import { GpsService } from '../gps.service';
import { LocalDbService } from '../local-db.service';
import { NormalizeService } from './normalize.service';
import { SortItemsService } from './sort-items.service';

@Injectable({ providedIn: 'root' })
export class FiltersService {
  private filters: IFilterObj[];
  private activeFilter$: Subject<IFilterObj> = new Subject();
  private activeFilterItemsResult$: Subject<{itemView: Resultset<any>, restaurantView: Resultset<any>}> = new Subject();

  constructor(
    private localDbService: LocalDbService,
    private normalizeService: NormalizeService,
    private gpsService: GpsService,
    private sortItemsService: SortItemsService
  ) {
    this.activeFilter$.subscribe(filterObj => {
      log('startSeperateFilters');
      this.processFilters(filterObj).subscribe(result => {
        log('result$', '', result);
        this.activeFilterItemsResult$.next(result);
        log('sort start');
        const testObj: ISort = {
          items: [
            { key: 'reviewScore', weight: 1.0 },
            { key: 'reviewCount', weight: 0.2 },
          ],
          restaurants: [
          { key: 'reviewScore', weight: 0.1 },
          { key: 'reviewCount', weight: 0.1 }]
        };

        this.localDbService.getCollection$('restaurants').subscribe(col => {
          const sorted = this.sortItemsService.sortItems(testObj, result);
          log('sort end', '', sorted);
        });
      });
    });

    const filter: IFilterObj = {
      uid: '120',
      name: 'trevor',
      public: true,
      timestamp: 12313123,
      lastActive: 14124142,
      filterItems: [{ key: 'reviewCount', min: 10, max: 500 }, {key: 'reviewScore', min: 1, max: 5.0}, {key: 'tag_ids', hasVal: 433}],
      filterNutrients: [{ key: 'protein', min: 78, max: 100 }],
      filterRestaurants: [{ key: 'reviewScore', min: 1.5, max: 5.0 }],
      // Create your own diet?
      diet: {}
    };

    normalizeService.normalizeFilterObj(filter).subscribe(res => {
      log('normalizedService', 'result', res);
      this.setActiveFilter(res);
    });
  }

  // TODO add filter to userlist, upload to server, and cache
  public addFilter(filter: IFilterObj): void {
    const foundId = this.findFilter(filter);
    if (foundId) {
      this.filters[foundId] = filter;
    } else {
      this.filters.push(filter);
    }
  }

  public deleteFilter(name: string): void | Error {
    const foundId = this.findFilter(name);
    if (foundId) {
      this.filters.splice(foundId, 1);
      return;
    }
    return new Error('Cannot find name to delete filter');
  }

  public getFilter(name: string): IFilterObj | void {
    const foundId = this.findFilter(name);
    if (foundId) {
      return this.filters[foundId];
    } else {
      return;
    }
  }

  public getAllFilters(): IFilterObj[] {
    return this.filters;
  }

  public setActiveFilter(filterObj: IFilterObj) {
    this.efficientFilterSort(filterObj).subscribe( (sortedFilter) => {
      log('sortedFilter!', '', sortedFilter);
      this.activeFilter$.next(sortedFilter);
   }

    );
  }

  public getActiveFilter() {
    return this.activeFilter$;
  }

  public getActiveItemsResultset$(): Subject<{itemView: Resultset<any>, restaurantView: Resultset<any>}> {
    return this.activeFilterItemsResult$;
  }

  private processFilters(filterObj: IFilterObj): Observable<{itemView: Resultset<any>, restaurantView: Resultset<any>}> {
    const restaurantTransform = this.genRestaurantTransformArr(
      filterObj.filterRestaurants
    );
    const nutrientTransform = this.genNutrientTransformArr(
      filterObj.filterNutrients
    );
    const itemTransform = this.genItemsTransformArr(filterObj.filterItems);

    const seperateFilteredItems = zip(
      this.getRestaurantsByFilter$(restaurantTransform),
      this.getItemsByFilter$(itemTransform),
      this.getNutrientsByFilter$(nutrientTransform)
    ).pipe(
      tap((sets) => {log('EndSeperateFilters','',sets)}),
      map(sets => {
        log('start');
        // restaurants 0, items 1, nutrients 2
        sets[1].find({ '$loki': {'$in': sets[2].filteredrows}});
        sets[1].find({'restaurant_id' : {'$in': sets[0].filteredrows}});
        log('end');
        return {itemView: sets[1], restaurantView: sets[0]};
      })
    );

    return seperateFilteredItems;
  }

  private efficientFilterSort(filterObj: IFilterObj): Observable<IFilterObj>{

   return this.localDbService.getCollection$('tags').pipe(
      map( (col) => {

      for (const r of filterObj.filterRestaurants) {
        if (r.key === 'tag_ids') {
            r.prob = col.findOne({'$loki': {'$eq': r.hasVal }})['prob'];
        }
      }

      for (const i of filterObj.filterItems) {
        if (i.key === 'tag_ids') {
          i.prob = col.findOne({'$loki': {'$eq': i.hasVal }})['prob'];
      }
      }

      sort(filterObj.filterRestaurants, (a: IFilter, b: IFilter) => {
        return  a.prob - b.prob;
      })

      sort(filterObj.filterItems, (a: IFilter, b: IFilter) => {
        return  a.prob - b.prob;
      })

      sort(filterObj.filterNutrients, (a: IFilter, b: IFilter) => {
        return   a.prob - b.prob;
      })
      return filterObj;
    }));

  }

  private getRestaurantsByFilter$(
    transformations: any[]
  ): Observable<Resultset<any>> {
    return this.localDbService.getCollection$('restaurants').pipe(
      map(col => {
        return col.chain(transformations);
      })
    );
  }

  // TODO add Item Filter
  private getItemsByFilter$(
    transformations: any[]
  ): Observable<Resultset<any>> {
    return this.localDbService.getCollection$('items').pipe(
      map(col => {
       return col.chain(transformations);
      }),
    );
  }

  private getNutrientsByFilter$(
    transformations: any[]
  ): Observable<Resultset<any>> {
    return this.localDbService.getCollection$('nutrients').pipe(
      map(col => {
        return col.chain(transformations);
      })
    );
  }

  private getIngredientsByFilter$(
    transformations: any[]
  ): Observable<Resultset<any>> {
    return this.localDbService.getCollection$('ingredients').pipe(
      map(col => {
        return col.chain(transformations);
      })
    );
  }

  private genRestaurantTransformArr(filters: IRestaurantsFilter[]): any[] {
    const filterArr = [];
    for (const filter of filters) {
      if (filter.min && filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$between': [filter.min, filter.max] } }
        });
      } else if (filter.max && !filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$lte': filter.max } }
        });
      } else if (filter.min && !filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$gte': filter.min } }
        });
      } else if (filter.has && !filter.hasVal) {
        filterArr.push({ type: 'find', value: { [filter.key]: filter.has } });
      } else if (filter.hasVal && !filter.has) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: {'$contains': filter.hasVal} }
        });
      }
    }
    return filterArr;
  }

  private genItemsTransformArr(filters: IItemsFilter[]) {
    const filterArr = [];
    for (const filter of filters) {
      if (filter.min && filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$between': [filter.min, filter.max] } }
        });
      } else if (filter.max && !filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$lte': filter.max } }
        });
      } else if (filter.min && !filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$gte': filter.min } }
        });
      } else if (filter.has && !filter.hasVal) {
        filterArr.push({ type: 'find', value: { [filter.key]: filter.has } });
      } else if (filter.hasVal && !filter.has) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: {'$contains': filter.hasVal} }
        });
      }
    }
    return filterArr;
  }

  private genNutrientTransformArr(filters: INutrientFilter[]): any[] {
    const filterArr = [];
    for (const filter of filters) {
      if (filter.min && filter.max) {
        filterArr.push({
          type: 'find',
          value: { [filter.key]: { '$between': [filter.min, filter.max] } }
        });
      }
    }
    return filterArr;
  }

  private genIngredientTransformArr(filters: IIngredientFilter[]): any[] {
    const filterArr = [];
    for (const filter of filters) {
      if (filter.hasVal) {
        filterArr.push([
          [filter.key],
          { find: { [filter.key]: { '$eq': filter.hasVal } } }
        ]);
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

  private initFilters() {}

  private getCachedFilters(filterObj) {}

  private uploadToServer(filterObj) {}

  private cacheFilter(filterObj) {}

  private isCached(filterObj) {}
}

interface IMinMax {
  prop: string;
  min: number;
  max: number;
}
