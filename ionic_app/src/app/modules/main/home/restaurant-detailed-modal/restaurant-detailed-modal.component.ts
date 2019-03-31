import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IItem } from "../../../../models/item/item.interface";
import { INutrients } from "../../../../models/nutrition/nutrition.interface";
import { ISortedView } from "../../../../models/sort/sort.interface";
import { LocalDbService } from "../../../../core/services/storage/local-db.service";
import { IRestaurant } from "../../../../models/restaurant/restaurant.interface";
import { DenormalizeService } from "../../../../core/services/data/transformations/denormalize.service";
import { switchMap } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
   selector: "sg-home-restaurant-modal",
   templateUrl: "./restaurant-detailed-modal.component.html",
   styleUrls: ["./restaurant-detailed-modal.component.scss"]
})
export class RestaurantDetailedModalComponent implements OnInit {

   calorieGraph: any;
   public items: Observable<IItem[]> = null;
   public nutrients: Observable<INutrients[]>;
   public restaurant: IRestaurant;
   public restaurantView: ISortedView;
   public scores: number[];
   private modalController: ModalController;

   constructor(private navParams: NavParams, private localDbService: LocalDbService, private denormalizeService: DenormalizeService) {
      this.modalController = navParams.get("controller");
      this.restaurantView = navParams.get("restaurantView");
      this.restaurant = navParams.get("restaurant");
      this.scores = this.restaurantView.itemScores;

      this.items = this.denormalizeService.deNormalizeArrObj$<IItem>(this.restaurantView.items, "items");
      this.nutrients = this.localDbService.getDocsByArr<INutrients>("nutrients", this.restaurantView.items, "nutrition_id").pipe(
         switchMap((nutrientsNormalized) => {
            return this.denormalizeService.deNormalizeArrObj$<INutrients>(nutrientsNormalized, "nutrients");
         })
      );


      /*
      this.calorieGraph = {
         values: [
            {
               "name": "Protein",
               "value": this.nutrients.protein * 4
            },
            {
               "name": "Carbs",
               "value": this.nutrients.carb * 4
            },
            {
               "name": "Fat",
               "value": this.nutrients.fat * 9
            }
         ],
         colorScheme: {
            domain: ["#652D92", "#09B3CD", "#EA1E21", "#AAAAAA"]
         },
         gradient: false,
         view: [window.innerWidth, 200],
         label: "Total Calories"
      };
      */
   }

   public arrayFromInt(n: number): any[] {
      return Array(n);
   }

   public exitModal() {
      this.modalController.dismiss();
   }

   public getFloatPart = x => (x - Math.trunc(x));

   public getIntPart = x => Math.trunc(x);

   metersToMiles(x: number) {
      let mtmFactor = 0.000621371;
      return mtmFactor * x;
   }

   ngOnInit() {
   }

   public roundFloat = (x: number, frac: number) => x.toFixed(frac);
   public roundInt = x => Math.round(x);

   test() {
      this.items.subscribe((items) => {
         console.log(items);
      });
   }
}
