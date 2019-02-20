import AVLTree, * as AVL from 'avl';
import { BehaviorSubject, Observable } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import * as timSort from 'timsort';

import { Injectable } from '@angular/core';
import { empty, set } from '@collectable/red-black-tree';
import { ISort, ISortable } from '../../../models/sort/sort.interface';
import { log } from '../../logger.service';

@Injectable({ providedIn: 'root' })
export class SortItemsService {

    public activeSort$$: BehaviorSubject<ISort> = new BehaviorSubject({name: 'default', items: [], restaurants: [], nutrients: []});
    constructor() {}


    public setActiveSort(sort: ISort) {
        this.activeSort$$.next(sort);
    }

    public sortItems(sortObj: ISort, viewSet: { itemView: Resultset<any>; restaurantView: Resultset<any> }) {
        return this.sortAll(sortObj, viewSet.restaurantView, viewSet.itemView.data()).values();
    }

    private sortAll(arrSorts: ISort, rView: Resultset<any>, itemArr: any[]) {
        const itemTree = new AVLTree((a: number, b: number) => b - a);
        log('itemArrSortingStart', '', itemArr);
        for (let item of itemArr) {
            const restaurantObj = rView.collection.findOne({ $loki: { $eq: item['restaurant_id'] } });
            const nutrientObj = rView.collection.findOne({ $loki: { $eq: item['nutrient_id'] } });
            const key = this.calcTotal(item, arrSorts.items) + this.calcTotal(restaurantObj, arrSorts.restaurants) + this.calcTotal(nutrientObj, arrSorts.nutrients);
            itemTree.insert(key, item);
        }
        log('TREE', '', itemTree);
        return itemTree;
    }

    private calcTotal(doc: object, sortObj: ISortable[]) {
        let total = 0;
        for (const sort of sortObj) {
            total += doc[sort.key] * sort.weight;
        }
        return total;
    }

    private calcTotalWeight(sortArr: ISortable[]): number {
        let total = 0;
        for (const sort of sortArr) {
            total = total + sort.weight;
        }
        return total;
    }
}
