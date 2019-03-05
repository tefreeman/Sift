import { Component, OnInit } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { IFilter, IFilterObj } from "../../../../models/filters/filters.interface";
import { DataService } from "../../../../core/services/user/data.service";
import { FiltersService } from "../../../../core/services/data/sync-collection/collections/filters.service";


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

  constructor(private navParams: NavParams, private filterService: FiltersService) {
    this.modalController = navParams.get("controller");
  }

  ngOnInit() {
    this.filterService.getActiveSift$().subscribe( (activeSift) => {
      this.activeSift = activeSift;
      if (this.navParams.get("editMode")) {
        this.isEditMode = true;
        this.siftName = this.activeSift.name;
        this.loadActiveSift();
      }
    })
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

  createSift() {
   this.filterService.createSift(this.siftName, Array.from(this.restaurantFilters.values()),
     Array.from(this.nutrientFilters.values()),  Array.from(this.itemFilters.values()))
     .subscribe(()=> {
       this.exitModal();
     });
  }

  updateSift() {
    this.filterService.updateSift(this.activeSift, this.siftName, Array.from(this.restaurantFilters.values()),
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
