import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class MockService {
    constructor(){}
    public generateObject(object) {
        return object;
    }
}


