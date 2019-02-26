import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ItemsService } from "../../../../core/services/items/items.service";
import { SortItemsService } from "../../../../core/services/items/sort-items.service";
import { concatMap, mergeMap, switchMap } from "rxjs/operators";
import {VirtualScrollerComponent} from "ngx-virtual-scroller";
import { IonContent } from "@ionic/angular";

@Component({
  selector: 'sg-home-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})

export class ItemsListComponent implements OnInit {
  myItems: any[] = [];
  @Input() ionContent: IonContent;
  @ViewChild(VirtualScrollerComponent) private virtualScroller: VirtualScrollerComponent;

  constructor(private itemsService: ItemsService, private sortItemsService: SortItemsService ) {
    this.sortItemsService.activeSort$$.pipe(switchMap(activeSort => {
      return this.itemsService.getItems$(activeSort);
    })).subscribe(items => {
      this.myItems = items;
    });
  }

  ngOnInit() {
    this.ionContent.getScrollElement().then(ele => {
      this.virtualScroller.parentScroll = ele;
    })
  }

}
