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
      this.userSifts = [];
      this.userSifts = sifts;
      this.activeSift = sifts[0];
    })
  }

  ngOnInit() {
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

  setActiveSift(event: any)  {
    console.log(event.detail.value);
    this.filterService.setActiveFilter(event.detail.value).subscribe(
      () => {console.log('setActiveSift')}
    );
  }

  customActionSheetOptions: any = {
    header: 'My Sifts',
  };

}
