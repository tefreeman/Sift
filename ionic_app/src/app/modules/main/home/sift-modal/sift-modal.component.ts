import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IFilter, IFilterObj } from "../../../../models/filters/filters.interface";
import { DataService } from "../../../../core/services/data.service";


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

  constructor(private navParams: NavParams, private dataService: DataService) {
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
    const filterObj: IFilterObj = {
      name: this.siftName,
      public: false,
      timestamp: new Date().getTime(),
      lastActive: 0,
      lastUpdate: new Date().getTime(),
      active: false,
      filterRestaurants: Array.from(this.restaurantFilters.values()),
      filterNutrients: Array.from(this.nutrientFilters.values()),
      filterItems: Array.from(this.itemFilters.values()),
      // Create your own diet?
      diet: {}
    };

    this.dataService.addOrUpdate$("filters", filterObj).subscribe(() => {
      this.exitModal();
    });

  }

  updateFilter() {
    this.activeSift.name = this.siftName;
    this.activeSift.lastUpdate = new Date().getTime();
    this.activeSift.filterRestaurants = Array.from(this.restaurantFilters.values());
    this.activeSift.filterNutrients = Array.from(this.nutrientFilters.values());
    this.activeSift.filterItems = Array.from(this.itemFilters.values());
    this.dataService.addOrUpdate$("filters", this.activeSift).subscribe(() => {
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
