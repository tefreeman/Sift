import { Component, Input, OnInit } from "@angular/core";
import { DenormalizeService } from "../../../../../core/services/items/denormalize.service";
import { log } from "../../../../../core/logger.service";
import {Observable} from "rxjs";
import { IRestaurant } from "../../../../../models/restaurant/restaurant.interface";
import { concatMap } from "rxjs/operators";
import { ItemsService } from "../../../../../core/services/items/items.service";
import { IItem } from "../../../../../models/item/item.interface";

@Component({
  selector: 'sg-home-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() normalizedItem: IItem;
  item: IItem;
  restaurant: IRestaurant;
  toInt = x => parseInt(x);
  constructor(private deNormalizeService: DenormalizeService, private itemsService: ItemsService) {
  }

  ngOnInit() {
    this.deNormalizeService.deNormalizeObj$(this.normalizedItem, 'items').pipe(concatMap((item) => {
      this.item = item;
      return this.itemsService.getRestaurant$(item['restaurant_id']);
    })).subscribe((restaurant) => {
      this.restaurant = restaurant;
    })
    }

}
