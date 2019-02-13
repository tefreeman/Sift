import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { IFilter } from '../../../../../models/filters/filters.interface';

interface filterPayload {
  filter: IFilter
  type: string;
}

@Component({
  selector: 'sg-modal-filter-reviews',
  templateUrl: './filter-reviews.component.html',
  styleUrls: ['./filter-reviews.component.scss']
})
export class FilterReviewsComponent implements OnInit {

  @Output() readonly addReviewEvent = new EventEmitter<filterPayload>();

  constructor() { }

  ngOnInit() {
  }

  addReview(key: string, min: number, max: number){
    if (key === 'reviewScoreItem') {
      this.addReviewEvent.emit({filter: {key: 'reviewScore', min: min, max: max}, type: 'item'});
    } else if (key === 'reviewCountItem') {
      this.addReviewEvent.emit({filter: {key: 'reviewCount', min: min, max: max}, type: 'item'});
    } else if (key === 'reviewScoreRestaurant') {
      this.addReviewEvent.emit({filter: {key: 'reviewScore', min: min, max: max}, type: 'restaurant'});
    } else if (key === 'reviewCountRestaurant') {
      this.addReviewEvent.emit({filter: {key: 'reviewCount', min: min, max: max}, type: 'restaurant'});
    }
  }

}
