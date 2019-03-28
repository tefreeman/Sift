import { Component, Input, OnInit } from "@angular/core";
import { IItem } from "../../../../../models/item/item.interface";
import { INutrients } from "../../../../../models/nutrition/nutrition.interface";
import { IPreviewSort } from "../../../../../models/sort/sort.interface";
import { Observable } from "rxjs";
import { RestaurantsListService } from "../../../../../core/services/data/items/restaurants-list.service";
import { DenormalizeService } from "../../../../../core/services/data/transformations/denormalize.service";
import { switchMap } from "rxjs/operators";

@Component({
   selector: "sg-home-item",
   templateUrl: "./item.component.html",
   styleUrls: ["./item.component.scss"]
})
export class ItemComponent implements OnInit {
   @Input() item: IItem;
   nutrientData: Observable<INutrients>;
   @Input() previewSorts: IPreviewSort[];
   @Input() score: number;

   constructor(private restaurantListService: RestaurantsListService, private denormalizeService: DenormalizeService) {
   }

   ngOnInit() {
      this.nutrientData = this.restaurantListService.getNutrition$(this.item.nutrition_id).pipe(switchMap(
         (item) => {
            return this.denormalizeService.deNormalizeObj$<INutrients>(item, "nutrients");
         }
      ));
   }

}
