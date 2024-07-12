import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { IFilter } from '../../../../../models/filters/filters.interface';

interface pricePayload {
  filter: IFilter
  type: string;
}

@Component({
  selector: 'sg-modal-filter-price',
  templateUrl: './filter-price.component.html',
  styleUrls: ['./filter-price.component.scss']
})

export class FilterPriceComponent implements OnInit {

  @Output() readonly addPriceEvent = new EventEmitter<pricePayload>();

  constructor() { }

  ngOnInit() {
  }

  addPrice(key: string, min: number, max: number){
    if (key === 'priceItem') {
      this.addPriceEvent.emit({filter: {key: 'price', min: min, max: max}, type: 'item'});
    } else if (key === 'priceRestaurant') {
      this.addPriceEvent.emit({filter: {key: 'price', min: min, max: max}, type: 'item'});
    }
  }

}
