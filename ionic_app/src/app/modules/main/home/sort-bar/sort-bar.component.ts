import { Component, OnInit } from "@angular/core";
import { SortsService } from "../../../../core/services/data/sync-collection/collections/sorts.service";
import { Observable } from "rxjs";
import { ISort } from "../../../../models/sort/sort.interface";

@Component({
   selector: "sg-home-sort-bar",
   templateUrl: "./sort-bar.component.html",
   styleUrls: ["./sort-bar.component.scss"]
})
export class SortBarComponent implements OnInit {

   public sorts$: Observable<ISort[]>;

   constructor(private sortsService: SortsService) {
   }

   ngOnInit() {
      this.sorts$ = this.sortsService.getAllObjs$<ISort>();
   }

   setActiveSort(sortsObj: any) {
      this.sortsService.setActiveObj(sortsObj).subscribe();
   }

}
