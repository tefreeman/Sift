import { BehaviorSubject, Observable } from 'rxjs';
import { concatMap, filter, map } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { ISort, ISortable } from '../../models/sort/sort.interface';
import { FiltersService } from './filters.service';
import { NormalizeService } from './normalize.service';

Injectable({providedIn: 'root'})
export class SortItemsService {
    private activeSort$: BehaviorSubject<ISort> = new BehaviorSubject(null);
    private activeSortItems$: BehaviorSubject<object[]> = new BehaviorSubject(null);

    constructor(private filterService: FiltersService, private normalizeService: NormalizeService) {
        this.activeSort$.pipe(
            concatMap( (actSort) => {
                return this.sortItems$(actSort);
            })
        )
    }

    public setActiveSort(sortObj: ISort) {
        this.activeSort$.next(sortObj);
    }

    public sortItems$(sortObj: ISort) {
        return this.filterService.getActiveItemsResultset$().pipe(
            map ( (itemSet) => {
            
            } )
        )
    }




}