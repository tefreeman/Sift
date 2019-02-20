import { Observable, pipe } from 'rxjs';
import { map, tap } from "rxjs/operators";

import { Injectable } from '@angular/core';

import { IFilter, IFilterObj } from '../../../models/filters/filters.interface';
import { IItemStats } from '../../../models/normalization/normalization.interface';
import { zScore } from '../../../shared/functions/helpers.functions';
import { log } from '../../logger.service';
import { LocalDbService } from '../local-db.service';
import { IItem } from "../../../models/item/item.interface";

@Injectable({ providedIn: 'root' })
export class DenormalizeService {
  private dataStats$: Observable<Collection<any>>;

  constructor(private localDbService: LocalDbService) {
    this.dataStats$ = localDbService.getCollectionCache$();
  }

  public deNormalizeObj$(obj: IItem, name: string): Observable<IItem> {
     let newItem = JSON.parse(JSON.stringify(obj));
    return this.dataStats$.pipe(map(cacheCol => {
      return this.denormalizeByType(newItem, name, cacheCol);
      }));
  }


  private denormalizeByType(objType: IItem, name: string, cacheCol: Collection<IItemStats>) {
    for (let key in objType) {
      if (objType.hasOwnProperty(key)) {
        const isNormalizedObj = cacheCol.findOne({
          name: {$eq: name + '.' + key}
        });
        if(isNormalizedObj) {
          objType[key] = this.deNormalize(objType[key], isNormalizedObj['max'])
        }
      }
      }
    return objType;
  }

  private deNormalize(x: number, max: number){
    return x*max;
  }

}
