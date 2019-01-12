import { ItemsService } from './../../services/items.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private itemsService: ItemsService) { }

  ngOnInit() {
    this.itemsService.getItems('TODO_filterObj')
    .subscribe(function(data) {console.log(data); });
  }

}
