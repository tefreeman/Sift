import { FiltersService } from "./../../../../core/services/items/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { log } from "../../../../core/logger.service";
import "hammerjs";
import { concatMap, filter, map, take } from "rxjs/operators";
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
  userSifts$$: BehaviorSubject<Map<string, IFilterObj>> = new BehaviorSubject(new Map());
  userSifts$: Observable<Map<string, IFilterObj>> = this.userSifts$$.asObservable().pipe(filter(map =>  map.size > 0));
  activeSift$: Observable<IFilterObj>;
  notTapped: boolean = true;

  constructor(public modalController: ModalController, private filterService: FiltersService, private alertController: AlertController, private dataService: DataService) {
    this.reloadSifts().subscribe();
  }

  ngOnInit() {
  }

  async openManageSifts(edit: boolean = false) {
    const modal = await this.modalController.create({
      animated: true,
      component: SiftModalComponent,
      componentProps: {
        sift: this.activeSift$,
        controller: this.modalController,
        editMode: edit
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.reloadSifts().subscribe();
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
              this.reloadSifts().subscribe(() => {
                this.setActiveSift()
              });
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

  setActiveSift(event)  {
       const siftName = event.detail.value;
    log('eventSift','', siftName);
    this.userSifts$.subscribe(currentSift=> {
        this.filterService.setActiveFilter(currentSift.get(siftName)).subscribe();
      }
    )
  }

  public reloadSifts() {
    return this.filterService.getAllFilters$().pipe(take(1)).pipe(map((sifts) => {
      this.userSifts$$.next(this.arrToMap(sifts));
      log('LoadSifts', '', this.userSifts$$);
      return sifts[0];
    }));
  }

  private arrToMap(arr: IFilterObj[]): Map<string, IFilterObj> {
    let tempMap = new Map();
    for(let obj of arr) {
      tempMap.set(obj.name, obj);
    }
    return tempMap;
  }
}
