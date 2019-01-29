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
    private minItems = 100;
    constructor() {}

    public sortItems(sortObj: ISort, viewSet: {itemView: Resultset<any>, restaurantView: Resultset<any>}) {
        this.sortAll(sortObj, viewSet.restaurantView, viewSet.itemView.data());
    }

    private sortAll(arrSorts: ISort, rView: Resultset<any>, itemArr: any[]) {
        const restaurantsWeight = this.calcTotalWeight(arrSorts.restaurants);
        const itemsWeight = this.calcTotalWeight(arrSorts.items);
        const itemTree = new AVLTree();
        log('itemArrSortingStart');
        for (let item of itemArr) {
            try {
            const restaurantObj = rView.collection.findOne({'$loki': {'$eq': item['restaurant_id']}});
            if (restaurantObj === null) {
                log('null restaurant', '', item);
            }
            const rTotal = this.calcTotal(restaurantObj, arrSorts.restaurants);
            const key = rTotal + this.calcTotal(item, arrSorts.items);
            itemTree.insert(key, item);
            } catch(e) {
                log('error', '', {e: e, data: item});
            }
        }
        log('itemArrSortingEnd', '', itemTree);

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
