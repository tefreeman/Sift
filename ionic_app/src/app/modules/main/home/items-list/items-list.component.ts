import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ItemsService } from "../../../../core/services/items/items.service";
import { SortItemsService } from "../../../../core/services/items/sort-items.service";
import { concatMap, mergeMap, switchMap } from "rxjs/operators";
import { IItem } from "../../../../models/item/item.interface";
import { IonContent } from "@ionic/angular";
import {VirtualScrollerComponent} from "ngx-virtual-scroller";

@Component({
  selector: 'sg-home-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit {
  @Input() ionScrollContent: IonContent;
  private ionScrollElement;
  @ViewChild(VirtualScrollerComponent) private virtualScroller: VirtualScrollerComponent;
  myItems = [];
  constructor(private itemsService: ItemsService, private sortItemsService: SortItemsService ) {
    this.sortItemsService.activeSort$$.pipe(switchMap(activeSort => {
      return this.itemsService.getItems$(activeSort);
    })).subscribe(items => {
      console.log(items);
      this.myItems = items;
    });
  }

  ngOnInit() {
    this.ionScrollContent.getScrollElement().then(scrollEle=>{
      this.ionScrollElement = scrollEle;
    });
    this.virtualScroller.bufferAmount = 25;
    this.virtualScroller.modifyOverflowStyleOfParentScroll = false;
    this.virtualScroller.scrollDebounceTime = 0;
    this.virtualScroller.scrollThrottlingTime = 0;
    this.virtualScroller.scrollAnimationTime = 100;
  }

}
