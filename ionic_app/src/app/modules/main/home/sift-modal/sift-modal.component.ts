import { log } from "src/app/core/logger.service";
import { Component, OnInit, Input } from "@angular/core";
import { NavParams, ModalController } from "@ionic/angular";
import {
  IFilterObj,
  IFilter,
  IRestaurantsFilter,
  INutrientFilter,
  IItemsFilter
} from "../../../../models/filters/filters.interface";
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

  nutrientFilters: Map<string, IFilter> = new Map();
  itemFilters: Map<string, IFilter> = new Map();
  restaurantFilters: Map<string, IFilter> = new Map();

  constructor(private navParams: NavParams, private dataService: DataService) {
    this.modalController = navParams.get("controller");
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

  createFilter(filterName: string){
    const filterObj: IFilterObj = {
      name: filterName,
      public: false,
      timestamp: new Date().getTime(),
      lastActive: 0,
      lastUpdate: new Date().getTime(),
      active: false,
      filterRestaurants: Array.from(this.restaurantFilters.values()),
      filterNutrients: Array.from(this.nutrientFilters.values()),
      filterItems: Array.from(this.itemFilters.values()),
    // Create your own diet?
    diet: {},

    }

    this.dataService.addOrUpdate('filters', filterObj);

  }
  exitModal() {
    this.modalController.dismiss();
  }


}
