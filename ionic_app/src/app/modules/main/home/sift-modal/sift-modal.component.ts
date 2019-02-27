import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IFilter, IFilterObj } from "../../../../models/filters/filters.interface";
import { DataService } from "../../../../core/services/data.service";
import { FiltersService } from "../../../../core/services/items/filters.service";


interface IFilterPayload {
  filter: IFilter
  type: string;
}

@Component({
  selector: "sg-sift-modal",
  templateUrl: "./sift-modal.component.html",
  styleUrls: ["./sift-modal.component.scss"]
})

export class SiftModalComponent implements OnInit {

  modalController: ModalController;
  activeSift: IFilterObj;
  siftName: string;
  isEditMode: boolean = false;

  nutrientFilters: Map<string, IFilter> = new Map();
  itemFilters: Map<string, IFilter> = new Map();
  restaurantFilters: Map<string, IFilter> = new Map();

  constructor(private navParams: NavParams, private dataService: DataService, private filterService: FiltersService) {
    this.modalController = navParams.get("controller");
    this.activeSift = navParams.get("sift");
    if (navParams.get("editMode")) {
      this.isEditMode = true;
      this.siftName = this.activeSift.name;
      this.loadActiveSift();
    }
  }

  ngOnInit() {
  }

  addFilter(filterPayload: IFilterPayload) {
    const filter = filterPayload.filter;
    if (filterPayload.type === "nutrient") {
      this.nutrientFilters.set(filter.key, filter);
    } else if (filterPayload.type === "item") {
      this.itemFilters.set(filter.key, filter);
    } else if (filterPayload.type === "restaurant") {
      this.restaurantFilters.set(filter.key, filter);
    }
  }

  createFilter() {
   this.filterService.createFilter(this.siftName, Array.from(this.restaurantFilters.values()),
     Array.from(this.nutrientFilters.values()),  Array.from(this.itemFilters.values()))
     .subscribe(()=> {});
    this.exitModal();
  }

  updateFilter() {
    this.filterService.updateFilter(this.activeSift, this.siftName, Array.from(this.restaurantFilters.values()),
      Array.from(this.nutrientFilters.values()),  Array.from(this.itemFilters.values()))
      .subscribe(() => {
        this.exitModal();
      });

  }

  exitModal() {
    this.modalController.dismiss();
  }

  private loadActiveSift() {
    for (let filter of this.activeSift.filterRestaurants) {
      this.restaurantFilters.set(filter.key, filter);
    }
    for (let filter of this.activeSift.filterItems) {
      this.itemFilters.set(filter.key, filter);
    }
    for (let filter of this.activeSift.filterNutrients) {
      this.nutrientFilters.set(filter.key, filter);
    }
  }

}
