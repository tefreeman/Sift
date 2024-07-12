import { IFilter } from './../../../../../models/filters/filters.interface';
import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { nutrientSkeleton } from '../../../../../shared/skeletons/skeleton';

interface nutrientPayload {
  filter: IFilter
  type: string;
}
@Component({
  selector: 'sg-filter-nutrients',
  templateUrl: './filter-nutrients.component.html',
  styleUrls: ['./filter-nutrients.component.scss']
})
export class FilterNutrientsComponent implements OnInit {

 @Output() readonly addNutrientEvent = new EventEmitter<nutrientPayload>();

  nutrientsArr = nutrientSkeleton;

  constructor() { }

  ngOnInit() {
  }

  addNutrient(key: string, min: number, max: number){
    this.addNutrientEvent.emit({filter: {key: key, min: min, max: max}, type: 'nutrient'});
  }

}
