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
    constructor() {}

    public sortItems(sortObj: ISort, viewSet: { itemView: Resultset<any>; restaurantView: Resultset<any> }) {
        return this.sortAll(sortObj, viewSet.restaurantView, viewSet.itemView.data()).values();
    }

    private sortAll(arrSorts: ISort, rView: Resultset<any>, itemArr: any[]) {
        const restaurantsWeight = this.calcTotalWeight(arrSorts.restaurants);
        const itemsWeight = this.calcTotalWeight(arrSorts.items);
        const itemTree = new AVLTree((a: number, b: number) => b - a);
        log('itemArrSortingStart');
        for (let item of itemArr) {
            const restaurantObj = rView.collection.findOne({ $loki: { $eq: item['restaurant_id'] } });
            const rTotal = this.calcTotal(restaurantObj, arrSorts.restaurants);
            const key = rTotal + this.calcTotal(item, arrSorts.items);
            itemTree.insert(key, item);
        }
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
