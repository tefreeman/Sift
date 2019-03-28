import { Observable } from "rxjs";
import { IFilterObj } from "../../../models/filters/filters.interface";
import { map } from "rxjs/operators";
import { log } from "../../../core/logger.service";
import { BaseCollectionsService } from "../../../core/services/data/sync-collection/base-collections.service";
import { IDataDoc } from "../../../models/user/userProfile.interface";


export abstract class BaseCollection<T> {
   public activeDoc$: Observable<T>;
   public docsMap$: Observable<Map<string, IFilterObj>>;

   protected constructor(public baseCollectionsService: BaseCollectionsService) {
      this.activeDoc$ = this.baseCollectionsService.getActiveObj$();
      this.docsMap$ = this.baseCollectionsService.getAllObjs$<any>().pipe(
         map((sifts) => {
            return BaseCollection.arrToMap(sifts);
         })
      );
   }

   private static arrToMap<T extends IDataDoc>(arr: T[]): Map<string, T> {
      let tempMap = new Map();
      for (let obj of arr) {
         //TODO add tpe check to obj['name'] so we can refactor to obj.name safely
         tempMap.set(obj["name"], obj);
      }
      return tempMap;
   }

   public setActiveDoc(event) {
      const sift = event.detail.value.value;
      log("eventSift", "", sift);
      return this.baseCollectionsService.setActiveObj(sift).subscribe();
   }

   public setActiveDocDirect<T extends IDataDoc>(doc: T) {
      log("eventSift", "", doc);
      return this.baseCollectionsService.setActiveObj(doc).subscribe();
   }
}
