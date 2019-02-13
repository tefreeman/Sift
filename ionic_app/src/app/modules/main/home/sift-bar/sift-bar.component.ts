import { FiltersService } from "./../../../../core/services/items/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { log } from "../../../../core/logger.service";
import "hammerjs";
import { take } from "rxjs/operators";
import { IFilterObj } from "../../../../models/filters/filters.interface";
import { DataService } from "../../../../core/services/data.service";

@Component({
  selector: 'sg-sift-bar',
  templateUrl: './sift-bar.component.html',
  styleUrls: ['./sift-bar.component.scss']
})
export class SiftBarComponent implements OnInit {
  userSifts: IFilterObj[];
  activeSift: IFilterObj;
  
  notTapped: boolean = true;

  constructor(public modalController: ModalController, private filterService: FiltersService, private alertController: AlertController, private dataService: DataService) {
    this.loadSifts();
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
      this.loadSifts();
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
              log("fired");
              this.loadSifts();
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
    console.log(event.detail.value);
    this.filterService.setActiveFilter(event.detail.value);
    this.loadSifts();
  }

  public loadSifts() {
    this.filterService.getAllFilters$().pipe(take(1)).subscribe((sifts) => {
      this.userSifts = [];
      this.userSifts = sifts;
      this.activeSift = sifts[0];

    });
  }

  customActionSheetOptions: any = {
    header: 'My Sifts',
  };

}
