import { Component, OnInit } from '@angular/core';
import { ItemsService } from "../../../../core/services/items/items.service";

@Component({
  selector: 'sg-home-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsListComponent implements OnInit {
items = [];
  constructor(private itemsService: ItemsService) {
    this.itemsService.getItems$({ name: 'defaultSort', items: [], restaurants: [] }).subscribe(items => {
      console.log(this.items);
      this.items = items;
    });
  }

  ngOnInit() {
  }

}
