import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import { log } from '../logger.service';
import { LocalDbService } from './local-db.service';

Injectable({providedIn: 'root'})

export class SortService {

    constructor (private localDbService: LocalDbService) {}

    private sortItems(set: Resultset<any>) {
        return  this.localDbService.getMinMaxDbInfo$().pipe(
              map ( (minMaxObj) => {
                  log('sortItems', '', minMaxObj);
                set = set.update((doc) => { doc['tasteScore'] = this.normalizeSet(doc, minMaxObj); return doc});
                  log('SET', '', set);
                  return set;
              }
          )
          );
      }

      private normalizeSet(item: object, minMaxArr: object[]): any {
              let normalizedItem = {};
              for (const minMax of minMaxArr) {
              normalizedItem[minMax['prop']] = this.normalize(item[minMax['prop']], minMax['min'], minMax['max']);
              }
              normalizedItem['$loki'] = item['$loki'];
          return normalizedItem;
      }

      private normalize(x: number, min: number, max: number) {
          return (x - min) / (max - min);
      }
}
