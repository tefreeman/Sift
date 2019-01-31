import { ItemsService } from './../../core/services/items/items.service';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/authentication/auth.service';
import { log } from '../../core/logger.service';
import { RequestFileCacheService } from '../../core/services/cache/request-file-cache.service';
import { GpsService } from '../../core/services/gps.service';
import { FiltersService } from '../../core/services/items/filters.service';
import { LocalDbService } from '../../core/services/local-db.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(private auth: AuthService, private filtersService: FiltersService, private itemsService: ItemsService) {}

    ngOnInit() {
        //this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
    }

    testLogout() {
        const ISort = {
            name: 'test',
            restaurants: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }],
            items: [{ key: 'reviewScore', weight: 0.9 }, { key: 'reviewCount', weight: 0.1 }]
        };
        this.itemsService.getItems$(ISort).subscribe(vals => {
            log('vals!', '', vals);
        });
    }

    // this.requestFileCacheService.removeFile('long-87.50lat33.25').subscribe((e) => console.log(e));
}
