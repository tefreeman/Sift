import * as Lokijs from 'lokijs';
import { filter, timestamp } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { IItem } from '../../models/user/userProfile.interface';
import { LocalDbService } from './local-db.service';

@Injectable({ providedIn: 'root' })
export class FiltersService {
    private itemsCollection$: Collection<>;
    private currentFilters;

    constructor(private localDbService: LocalDbService) {
        this.currentCollection = localDbService.getCollection$('items');
    }

    // TODO add filter to userlist, upload to server, and cache
    public addFilter(filterObj) {

    }
    public updateFilter(filterObj) {

    }

    public deleteFilter(id) {

    }

    public getActiveFilter() {

    }
    public setActiveFilter() {

    }

    public getItemsByFilter(filtersObj) {

    }

    private initFilters() {

    }

    private getCachedFilters(filterObj) {

    }

    private uploadToServer(filterObj) {

    }

    private cacheFilter(filterObj) {

    }

    private isCached(filterObj) {

    }


}
