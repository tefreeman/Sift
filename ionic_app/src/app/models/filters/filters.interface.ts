import { IDataDoc } from "../user/userProfile.interface";
import { IPreviewSort, ISortable } from "../sort/sort.interface";

export interface IFilterObj extends IDataDoc {
   filterIngredients: IIngredientFilter[];
   filterItems: IItemsFilter[];
   filterNutrients: INutrientFilter[];
   filterRestaurants: IRestaurantsFilter[];
   name: string;
   previewSorts?: IPreviewSort[];
   public: boolean;
   sortItems: ISortable[];
   sortNutrients: ISortable[];
   sortRestaurants: ISortable[];
}

export interface IFilter {
   has?: string | number | boolean;
   hasVal?: any[];
   key: any;
   max?: number;
   min?: number;
   prob?: number;
}

type TRestaurantFilterKey = "distance" | "price" | "tag_ids" | "reviewScore" | "reviewCount" | "name";

export interface IRestaurantsFilter extends IFilter {
   key: TRestaurantFilterKey;
}

type TItemsFilterKey = "price" | "tag_ids" | "reviewScore" | "reviewCount" | "name";

export interface IItemsFilter extends IFilter {
   key: TItemsFilterKey;
}

type TNutrientFilterKey =
   | "calories"
   | "fat"
   | "fatTrans"
   | "fatSat"
   | "monoUnsaturated"
   | "polyUnsaturated"
   | "carb"
   | "protein"
   | "fiber"
   | "cholesterol"
   | "vitaminA"
   | "vitaminB6"
   | "vitaminB12"
   | "vitaminC"
   | "vitaminD"
   | "vitaminE"
   | "vitaminK"
   | "thiamin"
   | "riboflavin"
   | "niacin"
   | "pantothenicAcid"
   | "folate"
   | "calcium"
   | "iron"
   | "magnesium"
   | "phosphorus"
   | "potassium"
   | "sodium"
   | "zinc";

export interface INutrientFilter extends IFilter {
   key: TNutrientFilterKey;
}


export interface IIngredientFilter extends IFilter {
   key: string;
}

