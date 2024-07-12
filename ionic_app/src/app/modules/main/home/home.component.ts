import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { FiltersService } from "../../../core/services/data/sync-collection/collections/filters.service";
import { concatMap, take } from "rxjs/operators";
import { from, Observable } from "rxjs";
import { SiftModalComponent } from "./sift-modal/sift-modal.component";
import { IFilterObj } from "../../../models/filters/filters.interface";

@Component({
   selector: "sg-home",
   templateUrl: "./home.component.html",
   styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {

   activeDoc$: Observable<IFilterObj>;

   constructor(public modalController: ModalController, public filterService: FiltersService,
               private alertController: AlertController, public toastController: ToastController) {
      this.activeDoc$ = this.filterService.getActiveObj$();
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
                     let siftName = "";
                     this.activeDoc$.pipe(concatMap((activeSift) => {
                        siftName = activeSift.name;
                        return this.filterService.deleteObj(activeSift);
                     })).subscribe(() => {
                        this.deletedToast(siftName).then();
                     });
                  }
               }
            ]
         }));
      })).pipe(take(1)).subscribe((modal) => {
         modal.present();
      });
   }


   async deletedToast(siftName: string) {
      const toast = await this.toastController.create({
         message: `${siftName} Sift deleted!`,
         duration: 2000
      });
      toast.present();
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
