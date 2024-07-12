import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { IFilter } from '../../../../../models/filters/filters.interface';

interface pricePayload {
  filter: IFilter
  type: string;
}

@Component({
  selector: 'sg-modal-filter-distance',
  templateUrl: './filter-distance.component.html',
  styleUrls: ['./filter-distance.component.scss']
})
export class FilterDistanceComponent implements OnInit {
  @Output() readonly addDistanceEvent = new EventEmitter<pricePayload>();

  constructor() { }

  ngOnInit() {
  }

  addDistance(key: string, max: number){
   
      this.addDistanceEvent.emit({filter: {key: key, min: 0, max: max}, type: 'restaurant'});
  }

}
