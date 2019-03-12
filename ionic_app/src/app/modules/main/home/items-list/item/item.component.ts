import { Component, Input, OnInit } from "@angular/core";
import { DenormalizeService } from "../../../../../core/services/data/transformations/denormalize.service";
import { IRestaurant } from "../../../../../models/restaurant/restaurant.interface";
import { concatMap } from "rxjs/operators";
import { ItemsService } from "../../../../../core/services/data/items/items.service";
import { IItem } from "../../../../../models/item/item.interface";
import { ModalController } from "@ionic/angular";
import { ItemModalComponent } from "../../item-modal/item-modal.component";
import "hammerjs";

@Component({
   selector: "sg-home-item",
   templateUrl: "./item.component.html",
   styleUrls: ["./item.component.scss"]
})
export class ItemComponent implements OnInit {
   item: IItem;
   @Input() normalizedItem: IItem;
   restaurant: IRestaurant;

   constructor(private deNormalizeService: DenormalizeService, private itemsService: ItemsService, private modalController: ModalController) {
   }

   ngOnInit() {
      this.deNormalizeService.deNormalizeObj$(this.normalizedItem, "items").pipe(concatMap((item) => {
            this.item = <IItem>item;
            return this.itemsService.getRestaurant$(item["restaurant_id"]);
         }),
         concatMap((normalRestaurant) => {
            return this.deNormalizeService.deNormalizeObj$(normalRestaurant, "restaurants");
         })).subscribe((restaurant) => {
         this.restaurant = <IRestaurant>restaurant;
      });
   }

   async presentModal() {
      const modal = await this.modalController.create({
         component: ItemModalComponent,
         componentProps: { controller: this.modalController, item: this.item, restaurant: this.restaurant }
      });
      return await modal.present();
   }

   toInt = x => parseInt(x);


}
