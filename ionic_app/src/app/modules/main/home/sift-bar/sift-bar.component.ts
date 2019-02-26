import { FiltersService } from "./../../../../core/services/items/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { log } from "../../../../core/logger.service";
import "hammerjs";
import { concatMap, map, take } from "rxjs/operators";
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
  userSifts: BehaviorSubject<Map<string, IFilterObj>> = new BehaviorSubject(new Map());
  activeSift: IFilterObj;
  notTapped: boolean = true;

  constructor(public modalController: ModalController, private filterService: FiltersService, private alertController: AlertController, private dataService: DataService) {
    this.loadSifts().subscribe();
    this.userSifts.subscribe((map) => {

    })
  }

  ngOnInit() {
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
      this.loadSifts().subscribe();
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
            this.dataService.delete("filters", this.activeSift).subscribe(() => {
              log("FIRED BABY");
              this.loadSifts().subscribe();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  changeStatus() {
    this.notTapped = !this.notTapped;
  }

  setActiveSift(event: any)  {
    log('', '', name);
    this.userSifts.subscribe((siftMap)=>{
      this.activeSift = siftMap.get(event.detail.value);
      this.filterService.setActiveFilter(this.activeSift).subscribe();
    })
    // causes the filter service to send new filtered items to be sorted
    // auto updates the view
  }

  public loadSifts() {
    return this.filterService.getAllFilters$().pipe(take(1)).pipe(map((sifts) => {
      this.activeSift = sifts[0];
      this.userSifts.next(this.arrToMap(sifts));
      log('LoadSifts', '', this.userSifts);
      return;
    }));
  }

  private arrToMap(arr: IFilterObj[]): Map<string, IFilterObj> {
    let tempMap = new Map();
    for(let obj of arr) {
      tempMap.set(obj.name, obj);
    }
    return tempMap;
  }

  trackByFn(index, item) {
    return item.name;
  }
}
