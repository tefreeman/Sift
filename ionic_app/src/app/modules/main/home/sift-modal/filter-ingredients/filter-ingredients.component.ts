import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { IFilter } from "../../../../../models/filters/filters.interface";
import { LocalDbService } from "../../../../../core/services/storage/local-db.service";
import { IIngredient } from "../../../../../models/food/ingredients.interface";
import { Trie } from "../../../../../core/services/radix-trie.service";

interface ingredientPayload {
   filter: IFilter
   type: string;
}

@Component({
   selector: "sg-modal-filter-ingredients",
   templateUrl: "./filter-ingredients.component.html",
   styleUrls: ["./filter-ingredients.component.scss"]
})

//TODO add search bar for ingredient search
export class FilterIngredientsComponent implements OnInit {
   @Output() readonly addIngredientEvent = new EventEmitter<any>();
   ingredientMatches: string[];
   ingredientsSearch;


   constructor(private localDService: LocalDbService) {
      this.localDService.getCollection$<IIngredient>("ingredients").subscribe(
         (col) => {
            this.ingredientsSearch = new Trie();
            for (let ingredient of col.data) {
               this.ingredientsSearch.insert(ingredient.name);
            }
         }
      );
   }

   addIngredient(key: string) {
      this.localDService.getCollection$<IIngredient>("ingredients").subscribe((col) => {
         let id = col.findOne({ name: { $eq: key } }).$loki;
         this.addIngredientEvent.emit({
            filter: { key: key, has: false, hasVal: id },
            type: "ingredient"
         });
      });
   }

   inputChanged(userInput: string) {
      console.log(userInput);
      this.ingredientMatches = this.ingredientsSearch.find(userInput);
   }

   ngOnInit() {
   }

}
