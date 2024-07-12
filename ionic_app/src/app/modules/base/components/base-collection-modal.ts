import { ModalController, NavParams } from "@ionic/angular";
import { IFilter } from "../../../models/filters/filters.interface";
import { FiltersService } from "../../../core/services/data/sync-collection/collections/filters.service";


interface IFilterPayload {
   filter: IFilter
   type: string;
}


export abstract class SiftModalComponent<T> {

   public activeDoc$;
   public editMode;
   itemFilters: Map<string, IFilter> = new Map();
   public modalController: ModalController;
   nutrientFilters: Map<string, IFilter> = new Map();
   restaurantFilters: Map<string, IFilter> = new Map();

   protected constructor(private navParams: NavParams, private filterService: FiltersService) {
      this.modalController = navParams.get("controller");
      this.activeDoc$ = navParams.get("sift");
      this.editMode = navParams.get("editMode");
   }

   abstract add(...any);

   abstract create() ;

   abstract loadActiveObj();

   abstract update();

   private exitModal() {
      this.modalController.dismiss();
   }
}


