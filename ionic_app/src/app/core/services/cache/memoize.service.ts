import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import memoize from "fast-memoize";

@Injectable({ providedIn: "root" })
export class MemoizeService {

   cache: Map<string, string> = new Map();

   constructor() {
   }

   memoizeFunc<T>(func): any | T {

   }

   memoizeObs<T>(func: Observable<any>): Observable<T> {
      return of(null);
   }

}
