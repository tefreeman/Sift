import { log } from 'src/app/core/logger.service';
import { ISort } from './../../../models/sort/sort.interface';
import { FiltersService } from './filters.service';
import { SortItemsService } from './sort-items.service';
import { Injectable } from '@angular/core';

import { LocalDbService } from '../local-db.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    private itemLimit;
    private currentItems;
    constructor(private sortService: SortItemsService, private filtersService: FiltersService) {
        /*
        this.filtersService.getItemResultSet$().subscribe(views => {
            log('views', '', views);
            const sortObj: ISort = {
                restaurants: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }],
                items: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }]
            };
            this.sortService.sortItems(sortObj, views);
        });
        */
    }
    public getItems$(activeSort: ISort): Observable<any[]> {
        return this.filtersService.getItemResultSet$().pipe(
            map(views => {
                return this.sortService.sortItems(activeSort, views);
            })
        );
    }
}
