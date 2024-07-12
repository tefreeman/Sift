import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { RestaurantsListService } from "../../../../core/services/data/items/restaurants-list.service";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";
import { IonContent } from "@ionic/angular";
import { ISortReturnedView } from "../../../../models/sort/sort.interface";

@Component({
   selector: "sg-home-restaurants-list",
   templateUrl: "./restaurants-list.component.html",
   styleUrls: ["./restaurants-list.component.scss"]
})

export class RestaurantsListComponent implements OnInit {
   @Input() ionContent: IonContent;
   restaurantsList: ISortReturnedView = {
      restaurants: undefined,
      stats: { min: 0, max: 0 }
   };
   @ViewChild(VirtualScrollerComponent) private virtualScroller: VirtualScrollerComponent;

   constructor(private itemsService: RestaurantsListService) {

   }

   ngOnInit() {
      this.ionContent.getScrollElement().then(ele => {
         this.virtualScroller.parentScroll = ele;
      });

      this.itemsService.GetRestaurants$().subscribe(resturantView => {
         this.restaurantsList = resturantView;
      });
   }


}
