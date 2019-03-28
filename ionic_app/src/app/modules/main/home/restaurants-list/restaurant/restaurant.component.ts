import { Component, Input, OnInit } from "@angular/core";
import { DenormalizeService } from "../../../../../core/services/data/transformations/denormalize.service";
import { IRestaurant } from "../../../../../models/restaurant/restaurant.interface";
import { take, tap } from "rxjs/operators";
import { ModalController } from "@ionic/angular";
import { ItemModalComponent } from "../../item-modal/item-modal.component";
import "hammerjs";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { ISortedView, ISortViewStats } from "../../../../../models/sort/sort.interface";

@Component({
   selector: "sg-home-restaurant",
   templateUrl: "./restaurant.component.html",
   styleUrls: ["./restaurant.component.scss"],
   animations: [
      trigger("slideState", [
         state("active", style({ marginLeft: "-70%" })),
         state("inactive", style({ marginLeft: "0" })),
         transition("inactive => active", [
            animate("0.2s 50ms ease-out")
         ]),
         transition("active => inactive", [
            animate("0.1s 50ms ease-in")
         ])
      ])
   ]
})

export class RestaurantComponent implements OnInit {
   restaurant: IRestaurant = {
      items: [],
      name: "",
      phone: "",
      address: "",
      distance: 0,
      type: "",
      price: 0,
      reviewCount: 0,
      reviewScore: 0,
      lastUpdated: 0,
      isApproved: false,
      coords: { lat: 0, lon: 0 },
      tag_ids: []
   };
   @Input() restaurantView: ISortedView;
   slideState: boolean = false;
   @Input() stats: ISortViewStats;

   constructor(private deNormalizeService: DenormalizeService, private modalController: ModalController) {
   }

   get stateSlide() {
      return this.slideState ? "active" : "inactive";
   }

   arrayFromInt(n: number): any[] {
      return Array(n);
   }

   getFloatPart = x => (x - Math.trunc(x));

   getIntPart = x => Math.trunc(x);

   metersToMiles(x: number) {
      let mtmFactor = 0.000621371;
      return mtmFactor * x;
   }

   //TODO this is trash coding with inner subscribes and possible memory leaks. Needs to be optimized
   ngOnInit() {
      this.deNormalizeService.deNormalizeObj$(this.restaurantView.restaurant, "restaurants")
         .pipe(take(1), tap((normalizedRestaurant) => {
            this.restaurant = <IRestaurant>normalizedRestaurant;
         })).subscribe();
   }


   async presentModal() {
      const modal = await this.modalController.create({
            component: ItemModalComponent,
            componentProps: {
               controller: this.modalController,
               restaurantView: this.restaurantView,
               restaurant: this.restaurant
            }
         })
      ;
      return await modal.present();
   }

   roundInt = x => Math.round(x);

   toggleState(forceState?: boolean) {
      if (forceState)
         this.slideState = forceState;
      else
         this.slideState = !this.slideState;

   }

}
