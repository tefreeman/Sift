import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ItemsService } from "../../../../core/services/data/items/items.service";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";
import { IonContent } from "@ionic/angular";

@Component({
   selector: "sg-home-items-list",
   templateUrl: "./items-list.component.html",
   styleUrls: ["./items-list.component.scss"]
})

export class ItemsListComponent implements OnInit {
   @Input() ionContent: IonContent;
   myItems: any[] = [];
   @ViewChild(VirtualScrollerComponent) private virtualScroller: VirtualScrollerComponent;

   constructor(private itemsService: ItemsService) {
      this.itemsService.getItems$().subscribe(items => {
         this.myItems = items;
      });
   }

   ngOnInit() {
      this.ionContent.getScrollElement().then(ele => {
         this.virtualScroller.parentScroll = ele;
      });
   }


}
