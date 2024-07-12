import { Component, OnInit } from "@angular/core";
import { CollectionDataService } from "../../../core/services/data/sync-collection/collection-data.service";

interface ITest {
   age: number;
   name: string;
}

@Component({
   selector: "app-health",
   templateUrl: "./health.page.html",
   styleUrls: ["./health.page.scss"],
   providers: [CollectionDataService]
})
export class HealthPage implements OnInit {

   constructor(private collectionDataService: CollectionDataService) {
      // this.collectionDataService.('filters');
   }

   ngOnInit() {
   }

   test() {

   }

}
