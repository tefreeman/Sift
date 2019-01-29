import { FiltersService } from './filters.service';
import { SortItemsService } from './sort-items.service';
import { Injectable } from '@angular/core';

import { LocalDbService } from '../local-db.service';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    private itemLimit;
    private currentItems;

    constructor(private sortService: SortItemsService, private filtersService: FiltersService) {
        this.filtersService.getActiveItemsResultset$();
    }

    public getItems$(start: number, amt: number) {}
}
