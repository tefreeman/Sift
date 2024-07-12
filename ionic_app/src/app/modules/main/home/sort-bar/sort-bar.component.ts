import { Component, OnInit } from "@angular/core";
import { IFilterObj } from "../../../../models/filters/filters.interface";
import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";
import { BaseCollection } from "../../../base/components/base-collection";

@Component({
   selector: "sg-home-sort-bar",
   templateUrl: "./sort-bar.component.html",
   styleUrls: ["./sort-bar.component.scss"]
})
export class SortBarComponent extends BaseCollection<IFilterObj> implements OnInit {

   constructor(private filterService: FiltersService) {
      super(filterService);
   }

   ngOnInit() {
   }

}
