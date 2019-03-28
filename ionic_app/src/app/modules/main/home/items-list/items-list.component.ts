import { Component, Input, OnInit } from "@angular/core";
import { IItem } from "../../../../models/item/item.interface";
import { ISortViewStats } from "../../../../models/sort/sort.interface";
import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";
import { IFilterObj } from "../../../../models/filters/filters.interface";

@Component({
   selector: "sg--home-items-list",
   templateUrl: "./items-list.component.html",
   styleUrls: ["./items-list.component.scss"]
})
//TODO optimize the loading of  preview items
export class ItemsListComponent implements OnInit {
   activeFilter: IFilterObj = null;
   @Input() itemScores: number[];
   @Input() itemsArr: IItem[];
   @Input() stats: ISortViewStats;

   constructor(private filtersService: FiltersService) {
      this.filtersService.getActiveObj$<IFilterObj>().subscribe((currentFilter) => {
         this.activeFilter = currentFilter;
      });
   }

   ngOnInit() {
   }

   public normalize(x: number) {
      return (((x - this.stats.min) / (this.stats.max - this.stats.min)) * 100).toFixed(1);
   }

}
