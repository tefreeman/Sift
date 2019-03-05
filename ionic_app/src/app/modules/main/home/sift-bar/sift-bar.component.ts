import { FiltersService } from "./../../../../core/services/items/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit, ViewChild } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { log } from "../../../../core/logger.service";
import "hammerjs";
import { concatMap, filter, map, take, tap } from "rxjs/operators";
import { IFilter, IFilterObj } from "../../../../models/filters/filters.interface";
import { DataService } from "../../../../core/services/data.service";
import {NgModel} from "@angular/forms";
import { BehaviorSubject, Observable, Subject } from "rxjs";

@Component({
  selector: 'sg-sift-bar',
  templateUrl: './sift-bar.component.html',
  styleUrls: ['./sift-bar.component.scss']
})
export class SiftBarComponent implements OnInit {
  userSifts$: Observable<Map<string, IFilterObj>>;
  activeSift: IFilterObj;
  notTapped: boolean = true;

  constructor(public modalController: ModalController, private filterService: FiltersService, private alertController: AlertController, private dataService: DataService) {
  }

  ngOnInit() {
    this.filterService.getActiveSift$().subscribe((sift) => {
      log('@@@thisActiveSift', '', sift);
      this.activeSift = sift;
    });
    this.userSifts$ = this.filterService.getAllSifts$().pipe(
      tap( (sifts) => log('userSifts$ UPDATED', '', sifts)),
      map( (sifts) => {
        return this.arrToMap(sifts);
      })
    )
  }

  async openManageSifts(edit: boolean = false) {
    const modal = await this.modalController.create({
      animated: true,
      component: SiftModalComponent,
      componentProps: {
        sift: this.activeSift,
        controller: this.modalController,
        editMode: edit
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {

    });
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: "Confirm",
      message: "Please confirm that you would like to delete <strong>" + this.activeSift.name + "</strong>!",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {

          }
        }, {
          text: "Confirm",
          handler: () => {
          this.filterService.deleteSift(this.activeSift).subscribe( () => {

          })
          }
        }
      ]
    });

    await alert.present();
  }

  changeStatus() {
    this.notTapped = !this.notTapped;
  }

  setActiveSift(event)  {
       const siftName = event.detail.value;
    log('eventSift','', siftName);
    this.userSifts$.pipe(take(1),map((sifts) => {
      return this.filterService.setActiveSift(sifts.get(siftName));
    })).subscribe();
  }

  private arrToMap(arr: IFilterObj[]): Map<string, IFilterObj> {
    let tempMap = new Map();
    for(let obj of arr) {
      tempMap.set(obj.name, obj);
    }
    return tempMap;
  }
}
