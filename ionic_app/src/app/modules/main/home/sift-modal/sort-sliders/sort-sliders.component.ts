import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { ItemsTypeList } from "../../../../../models/item/item.interface";
import { RestaurantTypeList } from "../../../../../models/restaurant/restaurant.interface";
import { NutritionTypeList } from "../../../../../models/nutrition/nutrition.interface";
import { ISortable } from "../../../../../models/sort/sort.interface";

interface ISortPayload {
   isPreview: boolean
   sort: ISortable
   type: string;
}


@Component({
   selector: "sg-sort-sliders",
   templateUrl: "./sort-sliders.component.html",
   styleUrls: ["./sort-sliders.component.scss"]
})
export class SortSlidersComponent implements OnInit {
   public activeKey = "";
   @Output() readonly addSort = new EventEmitter<ISortPayload>();
   private itemSortsTypes = ItemsTypeList;
   private nutritionSortTypes = NutritionTypeList;
   private restaurantSortTypes = RestaurantTypeList;

   constructor() {
   }

   FireAddSortEvent(sortType: string, weight: number, isPreview: boolean) {
      console.log("ispreview: ", isPreview);
      const sortPayload = {
         sort: {
            key: this.activeKey,
            weight: weight
         },
         type: sortType,
         isPreview: isPreview
      };
      this.addSort.emit(sortPayload);
      this.activeKey = "";
   }

   ngOnInit() {
   }

   setActiveKey(active: string) {
      this.activeKey = active;
   }

}
