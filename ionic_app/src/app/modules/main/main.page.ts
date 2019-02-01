import { ItemsService } from '../../core/services/items/items.service';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/authentication/auth.service';
import { log } from '../../core/logger.service';
import { RequestFileCacheService } from '../../core/services/cache/request-file-cache.service';
import { GpsService } from '../../core/services/gps.service';
import { FiltersService } from '../../core/services/items/filters.service';
import { LocalDbService } from '../../core/services/local-db.service';

@Component({
    selector: 'sg-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss']
})
export class MainPageComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
