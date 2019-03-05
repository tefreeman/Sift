import { Component, OnInit } from '@angular/core';
import { SortItemsService } from "../../../../core/services/data/items/sort-items.service";
@Component({
  selector: 'sg-home-sort-bar',
  templateUrl: './sort-bar.component.html',
  styleUrls: ['./sort-bar.component.scss']
})
export class SortBarComponent implements OnInit {

  constructor(private sortItemsService: SortItemsService) { }

  ngOnInit() {
  }
  sortReviews(){
    console.log('fired');
    this.sortItemsService.setActiveSort({name: 'distance', nutrients: [], items: [{key: 'reviewScore', weight: 1}],restaurants: []})
  }

  sortReviewCount(){
    console.log('fired');
    this.sortItemsService.setActiveSort({name: 'tedt1', nutrients: [], items: [{key: 'reviewCount', weight: 1}],restaurants: []})
  }
}
