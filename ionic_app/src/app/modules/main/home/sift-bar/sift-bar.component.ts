import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import "hammerjs";
import { concatMap, take } from "rxjs/operators";
import { IFilterObj } from "../../../../models/filters/filters.interface";
import { from } from "rxjs";
import { BaseCollection } from "../../../base/components/base-collection";

@Component({
   selector: "sg-sift-bar",
   templateUrl: "./sift-bar.component.html",
   styleUrls: ["./sift-bar.component.scss"]
})
export class SiftBarComponent extends BaseCollection<IFilterObj> implements OnInit {
   notTapped: boolean = true;

   constructor(public modalController: ModalController, public filterService: FiltersService,
               private alertController: AlertController) {
      super(filterService);
   }


   changeStatus() {
      this.notTapped = !this.notTapped;
   }

   confirmDelete() {
      this.activeDoc$.pipe(concatMap((activeSift) => {
         return from(this.alertController.create({
            header: "Confirm",
            message: "Please confirm that you would like to delete <strong>" + activeSift.name + "</strong>!",
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
                     this.activeDoc$.pipe(concatMap((activeSift) => {
                        return this.filterService.deleteObj(activeSift);
                     })).subscribe();
                  }
               }
            ]
         }));
      })).pipe(take(1)).subscribe((modal) => {
         modal.present();
      });
   }

   ngOnInit() {
   }

   async openManageSiftsModal(edit: boolean = false) {
      const modal = await this.modalController.create({
         animated: true,
         component: SiftModalComponent,
         componentProps: {
            sift: this.activeDoc$,
            controller: this.modalController,
            editMode: edit
         }
      });
      await modal.present();
      modal.onDidDismiss().then(() => {

      });
   }
}
