import { log } from "src/app/core/logger.service";
import { ISort } from "./../../../models/sort/sort.interface";
import { FiltersService } from "./filters.service";
import { SortItemsService } from "./sort-items.service";
import { Injectable } from "@angular/core";

import { LocalDbService } from "../local-db.service";
import { map, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { IRestaurant } from "../../../models/restaurant/restaurant.interface";

@Injectable({ providedIn: 'root' })
export class ItemsService {
    constructor(private sortService: SortItemsService, private filtersService: FiltersService, private localDbService: LocalDbService) {
    }

    public getRestaurant$(id: number): Observable<IRestaurant> {
        return this.localDbService.getCollection$('restaurants').pipe(
          map((col) => {
              return col.findOne({$loki: {$eq: id}})
          })
        )
    }

    public getItems$(activeSort: ISort): Observable<any[]> {
        return this.filtersService.getItemResultSet$().pipe(
          tap(val => log("VALLLLL", "", val)),
            map(views => {
                return this.sortService.sortItems(activeSort, views);
            })
        );
    }

}
