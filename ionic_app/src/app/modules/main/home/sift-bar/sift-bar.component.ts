import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";
import { SiftModalComponent } from "./../sift-modal/sift-modal.component";
import { Component, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { log } from "../../../../core/logger.service";
import "hammerjs";
import { concatMap, map, take, tap } from "rxjs/operators";
import { IFilterObj } from "../../../../models/filters/filters.interface";
import { from, Observable } from "rxjs";

@Component({
   selector: "sg-sift-bar",
   templateUrl: "./sift-bar.component.html",
   styleUrls: ["./sift-bar.component.scss"]
})
export class SiftBarComponent implements OnInit {
   activeSift: Observable<IFilterObj>;
   notTapped: boolean = true;
   userSifts$: Observable<Map<string, IFilterObj>>;

   constructor(public modalController: ModalController, private filterService: FiltersService,
               private alertController: AlertController) {
   }


   changeStatus() {
      this.notTapped = !this.notTapped;
   }

   confirmDelete() {
      this.activeSift.pipe(concatMap((activeSift) => {
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
                     this.activeSift.pipe(concatMap((activeSift) => {
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
      this.activeSift = this.filterService.getActiveObj$().pipe(tap((sift) => log("NgOnInit ActiveSift", "", sift)));
      this.userSifts$ = this.filterService.getAllObjs$<any>().pipe(
         tap((sifts) => log("userSifts$ UPDATED", "", sifts)),
         map((sifts) => {
            return this.arrToMap(sifts);
         })
      );
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

   setActiveSift(event) {
      const siftName = event.detail.value;
      log("eventSift", "", siftName);
      this.userSifts$.pipe(take(1), concatMap((sifts) => {
         return this.filterService.setActiveObj(sifts.get(siftName));
      })).subscribe();
   }

   private arrToMap(arr: IFilterObj[]): Map<string, IFilterObj> {
      let tempMap = new Map();
      for (let obj of arr) {
         tempMap.set(obj.name, obj);
      }
      return tempMap;
   }
}
