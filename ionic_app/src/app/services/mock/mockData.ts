import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockData {
    userDoc = {};
    itemDoc = {};
    reviewDoc = {};
    constructor() {}

    private mockFunction(amt, obj = {'name': 'test'}, delay = 100): Observable<any> {
        return Observable.create(function (observer) {
            for (let i = 0; i < amt; i++) {
                observer.next(obj);
            }
            observer.complete();
        });
    }

    getItemsByFilter(filter) {
        return this.mockFunction(100);
    }

    getReviewsByItemId(itemId) {
        return this.mockFunction(10);
    }

    getCurrentUser() {
        return this.userDoc;
    }

}
