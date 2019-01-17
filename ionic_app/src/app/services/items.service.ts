import { LocalDbService } from './local-db.service';
import { MockData } from './mock/mockData';
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ItemsService {
    
    private resturantsCol;
    private itemsCol;

    constructor(private mockData: MockData,
                private localDbService: LocalDbService) {
        this.resturantsCol = localDbService.getCollection('restaurants');
        this.itemsCol = localDbService.getCollection('items');
    }

    getRestaurants() {
        return this.mockData.getItemsByFilter('todo');
    }
}
