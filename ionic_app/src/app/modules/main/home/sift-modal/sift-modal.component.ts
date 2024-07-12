import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IFilter, IFilterObj } from "../../../../models/filters/filters.interface";
import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";
import { IPreviewSort, ISortable } from "../../../../models/sort/sort.interface";


interface IFilterPayload {
   filter: IFilter
   type: string;
}

interface ISortPayload {
   isPreview: boolean;
   sort: ISortable
   type: string;
}

@Component({
   selector: "sg-sift-modal",
   templateUrl: "./sift-modal.component.html",
   styleUrls: ["./sift-modal.component.scss"]
})

export class SiftModalComponent implements OnInit {

   activeSift: IFilterObj;
   ingredientFilters: Map<string, IFilter> = new Map();
   isEditMode: boolean = false;
   itemFilters: Map<string, IFilter> = new Map();
   itemSorts: Map<string, ISortable> = new Map();
   modalController: ModalController;
   nutrientFilters: Map<string, IFilter> = new Map();
   nutrientSorts: Map<string, ISortable> = new Map();
   previewSorts: Map<string, IPreviewSort> = new Map();
   restaurantFilters: Map<string, IFilter> = new Map();
   restaurantSorts: Map<string, ISortable> = new Map();
   siftName: string;

   constructor(private navParams: NavParams, private filterService: FiltersService) {
      this.modalController = navParams.get("controller");
   }

   addFilter(filterPayload: IFilterPayload) {
      const filter = filterPayload.filter;
      if (filterPayload.type === "nutrient") {
         this.nutrientFilters.set(filter.key, filter);
      } else if (filterPayload.type === "item") {
         this.itemFilters.set(filter.key, filter);
      } else if (filterPayload.type === "restaurant") {
         this.restaurantFilters.set(filter.key, filter);
      } else if (filterPayload.type === "ingredient") {
         this.ingredientFilters.set(filter.key, filter);
      }
   }

   addSort(sortPayload: ISortPayload) {
      console.log(sortPayload);
      const sort = sortPayload.sort;
      if (sortPayload.type === "nutrient") {
         // previewSort
         if (sortPayload.isPreview) {
            this.previewSorts.set(sortPayload.sort.key, { key: sortPayload.sort.key, type: "nutrient" });
         }
         this.nutrientSorts.set(sort.key, sort);
      } else if (sortPayload.type === "item") {
         //preview Sort
         if (sortPayload.isPreview) {
            this.previewSorts.set(sortPayload.sort.key, { key: sortPayload.sort.key, type: "item" });
         }
         this.itemSorts.set(sort.key, sort);
      } else if (sortPayload.type === "restaurant") {
         this.restaurantSorts.set(sort.key, sort);
      }
   }

   createSift() {
      this.filterService.createSift(this.siftName, Array.from(this.restaurantFilters.values()),
         Array.from(this.nutrientFilters.values()), Array.from(this.itemFilters.values()),
         Array.from(this.ingredientFilters.values()), Array.from(this.restaurantSorts.values()), Array.from(this.nutrientSorts.values()),
         Array.from(this.itemSorts.values()), Array.from(this.previewSorts.values())
      )
         .subscribe(() => {
            this.exitModal();
         });
   }

   exitModal() {
      this.modalController.dismiss();
   }

   ngOnInit() {
      this.filterService.getActiveObj$<IFilterObj>().subscribe((activeSift) => {
         this.activeSift = activeSift;
         if (this.navParams.get("editMode")) {
            this.isEditMode = true;
            this.siftName = this.activeSift.name;
            this.loadActiveSift();
         }
      });
   }

   updateSift() {
      this.filterService.updateSift(this.activeSift, this.siftName, Array.from(this.restaurantFilters.values()),
         Array.from(this.nutrientFilters.values()), Array.from(this.itemFilters.values()),
         Array.from(this.ingredientFilters.values()), Array.from(this.restaurantSorts.values()), Array.from(this.nutrientSorts.values()),
         Array.from(this.itemSorts.values()), Array.from(this.previewSorts.values()))
         .subscribe(() => {
            this.exitModal();
         });

   }

   private loadActiveSift() {
      // for filters
      for (let filter of this.activeSift.filterRestaurants) {
         this.restaurantFilters.set(filter.key, filter);
      }
      for (let filter of this.activeSift.filterItems) {
         this.itemFilters.set(filter.key, filter);
      }
      for (let filter of this.activeSift.filterNutrients) {
         this.nutrientFilters.set(filter.key, filter);
      }
      for (let filter of this.activeSift.filterIngredients) {
         this.ingredientFilters.set(filter.key, filter);
      }

      // for sorts
      for (let filter of this.activeSift.sortRestaurants) {
         this.restaurantSorts.set(filter.key, filter);
      }
      for (let filter of this.activeSift.sortItems) {
         this.itemSorts.set(filter.key, filter);
      }
      for (let filter of this.activeSift.sortNutrients) {
         this.nutrientSorts.set(filter.key, filter);
      }

      for (let prop of this.activeSift.previewSorts) {
         this.previewSorts.set(prop.key, prop);
      }
   }

}
