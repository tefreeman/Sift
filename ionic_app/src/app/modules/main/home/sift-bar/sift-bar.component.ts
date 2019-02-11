import { FiltersService } from './../../../../core/services/items/filters.service';
import { SiftModalComponent } from './../sift-modal/sift-modal.component';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { log } from '../../../../core/logger.service';
import 'hammerjs';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IFilterObj } from '../../../../models/filters/filters.interface';

@Component({
  selector: 'sg-sift-bar',
  templateUrl: './sift-bar.component.html',
  styleUrls: ['./sift-bar.component.scss']
})
export class SiftBarComponent implements OnInit {
  userSifts: IFilterObj[];
  activeSift: IFilterObj;
  
  notTapped: boolean = true;

  constructor(public modalController: ModalController, private filterService: FiltersService) {
    this.filterService.getAllFilters$().subscribe( (sifts) => {
      this.userSifts = sifts;
      this.activeSift = sifts[0];
    })
  }

  async presentModal() {
    const modal = await this.modalController.create({
      animated: true,
      component: SiftModalComponent,
      componentProps: { 
        sift: this.activeSift,
        controller: this.modalController
      }
    });
    return await modal.present();
  }

  changeStatus() {
    this.notTapped = !this.notTapped;
  }

  customActionSheetOptions: any = {
    header: 'My Sifts',
  };

  ngOnInit() {
  }
}
