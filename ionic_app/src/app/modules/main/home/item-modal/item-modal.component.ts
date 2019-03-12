import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IItem } from "../../../../models/item/item.interface";
import { IRestaurant } from "../../../../models/restaurant/restaurant.interface";

@Component({
   selector: "sg-home-item-modal",
   templateUrl: "./item-modal.component.html",
   styleUrls: ["./item-modal.component.scss"]
})
export class ItemModalComponent implements OnInit {

   public item: IItem;
   public restaurant: IRestaurant;
   private modalController: ModalController;

   constructor(private navParams: NavParams) {
      this.modalController = navParams.get("controller");
      this.item = navParams.get("item");
      this.restaurant = navParams.get("restaurant");
   }

   exitModal() {
      this.modalController.dismiss();
   }

   ngOnInit() {
   }


}
