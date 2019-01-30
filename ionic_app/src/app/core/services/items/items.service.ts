import { ISort } from './../../../models/sort/sort.interface';
import { FiltersService } from './filters.service';
import { SortItemsService } from './sort-items.service';
import { Injectable } from '@angular/core';

import { LocalDbService } from '../local-db.service';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    private itemLimit;
    private currentItems;

    constructor(private sortService: SortItemsService, private filtersService: FiltersService) {
        this.filtersService.getActiveItemsResultset$().subscribe(views => {
            let sortObj: ISort = {
                restaurants: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }],
                items: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }]
            };
            this.sortService.sortItems(sortObj, views);
        });
    }

    public getItems$(start: number, amt: number) {}
}
