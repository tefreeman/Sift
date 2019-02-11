import { log } from 'src/app/core/logger.service';
import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { IFilterObj, IFilter } from '../../../../models/filters/filters.interface';

@Component({
  selector: 'sg-sift-modal',
  templateUrl: './sift-modal.component.html',
  styleUrls: ['./sift-modal.component.scss']
})
 
export class SiftModalComponent implements OnInit {

  modalController: ModalController

  nutrientFilters: Map<string, IFilter> = new Map();
  itemFilters:  Map<string, IFilter>  = new Map();
  restaurantFilters:  Map<string, IFilter>  = new Map();

  constructor(private navParams: NavParams) {
    this.modalController = navParams.get('controller')
  }

  ngOnInit() {
  }

  addNutrient(key: string, min: number, max: number) {
    console.log(key, min, max);
    this.nutrientFilters.set(key, {key: key, min: min, max: max});
  }
  
  exitModal() {
    this.modalController.dismiss();
  }


}
