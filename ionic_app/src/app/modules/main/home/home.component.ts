import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemsService } from '../../../core/services/items/items.service';
@Component({
    selector: 'sg-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    items = [];
    maxDisplayItems = 20;

    constructor(private itemsService: ItemsService) {
        this.itemsService.getItems$({ name: 'defaultSort', items: [], restaurants: [] }).subscribe(items => {
            console.log(this.items);
            this.items = items;
        });
    }

    ngOnInit() {}
}
