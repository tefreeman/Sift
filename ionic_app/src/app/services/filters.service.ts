import { timestamp } from 'rxjs/operators';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FiltersService {

    private defaultFilters = [];
    private userFilters = [];
    constructor() {
        // TODO load in data from cache or request from server
    }

    public addFilter() {

    }

    public deleteFilter() {

    }

    public editFilter() {

    }


}
