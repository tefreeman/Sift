import { Injectable } from '@angular/core';

import { LocalDbService } from './local-db.service';
import { MockData } from './mock/mockData';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    
    private resturantsCol;
    private itemsCol;

    constructor(private mockData: MockData,
                private localDbService: LocalDbService) {
    }

}
