import { Injectable } from '@angular/core';

import { LocalDbService } from './local-db.service';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    private resturantsCol;
    private itemsCol;

    constructor(private localDbService: LocalDbService) {
    }

}
