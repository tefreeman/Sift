import { filter, timestamp } from 'rxjs/operators';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FiltersService {

    private activeFilter;

    constructor() {
        // TODO load in data from cache or request from server
        // TODO Set Active filter
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
