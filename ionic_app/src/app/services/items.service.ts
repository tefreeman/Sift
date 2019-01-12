import { MockData } from './mock/mockData';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    constructor(private mockData: MockData) {

    }
    getItems(filter, limit = 100) {
        return this.mockData.getItemsByFilter('todo');
    }
}
