import { Component, Input, OnInit } from "@angular/core";
import { IItem } from "../../../../../models/item/item.interface";
import { INutrients } from "../../../../../models/nutrition/nutrition.interface";
import { IPreviewSort } from "../../../../../models/sort/sort.interface";
import { Observable, of } from "rxjs";
import { RestaurantsListService } from "../../../../../core/services/data/items/restaurants-list.service";
import { DenormalizeService } from "../../../../../core/services/data/transformations/denormalize.service";
import { delay, switchMap } from "rxjs/operators";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
   selector: "sg-home-item",
   templateUrl: "./item.component.html",
   styleUrls: ["./item.component.scss"],
   animations: [
      trigger("flip", [
         state("flipped", style({ transform: "rotateY(180deg)" })),
         state("unflipped", style({ transform: "rotateY(0)" })),
         transition("* => *", animate("400ms ease-in-out"))
      ])
   ]
})
export class ItemComponent implements OnInit {
   contentHide: boolean = false;
   deNormalizedItem: IItem;
   @Input() item: IItem;
   nutrientData: Observable<INutrients>;
   @Input() previewSorts: IPreviewSort[];
   @Input() score: number;
   stateFlip: boolean = false;

   constructor(private restaurantListService: RestaurantsListService, private denormalizeService: DenormalizeService) {
      //this.deNormalizedItem = this.item;
   }

   get flipState() {
      return this.stateFlip ? "flipped" : "unflipped";
   }

   ifNumberFix(num: any, digits: number) {
      if (typeof num === "number")
         return num.toFixed(digits);
      else
         return num;
   }

   ngOnInit() {
      this.nutrientData = this.restaurantListService.getNutrition$(this.item.nutrition_id).pipe(switchMap(
         (item) => {
            return this.denormalizeService.deNormalizeObj$<INutrients>(item, "nutrients");
         }
      ));

      this.denormalizeService.deNormalizeObj$<IItem>(this.item, "items").subscribe(
         (val) => {
            this.deNormalizedItem = val;
         }
      );
   }

   toggleState(forceState?: boolean) {
      if (forceState)
         this.stateFlip = forceState;
      else
         this.stateFlip = !this.stateFlip;

      of(null).pipe(delay(200)).subscribe(
         () => {
            console.log(this.contentHide);
            this.contentHide = this.stateFlip;
         }
      );
   }
}
