import { ICuisines } from '../food/cuisines.interface';
import { IIngredients } from '../food/ingredients.interface';
import { INutrients } from '../nutrition/nutrition.interface';

export interface IFilterObj {
    uid: string;
    name: string;
    public: boolean;
    timestamp: number;
    lastActive: number;
    filterRestaurants:  IRestaurantsFilter[];
    filterNutrients: INutrientFilter [];
    filterItems:  IItemsFilter[];
    // Create your own diet?
    diet: {};
    // Need to add preset diets to automatically set health and food filters
  }

export interface IFilter {
  key: any;
  max?: number;
  min?: number;
  has?: boolean;
  hasVal?: string | number;
  zAvg?: number;
}
type TRestaurantFilterKey = 'distance' | 'price' | 'tag' | 'reviewScore' | 'reviewCount' | 'name';

export interface IRestaurantsFilter extends IFilter {
  key: TRestaurantFilterKey;
}

type TItemsFilterKey = 'price' | 'tag' | 'reviewScore' | 'reviewCount' | 'name';
export interface IItemsFilter extends IFilter {
  key: TItemsFilterKey;
}

type TNutrientFilterKey =     'calories'|'fat' | 'fatTrans' | 'fatSat' | 'monoUnsaturated' | 'polyUnsaturated' | 'carb' | 'protein' |
 'fiber' | 'cholesterol' | 'vitaminA' | 'vitaminB6' | 'vitaminB12' | 'vitaminC' | 'vitaminD' | 'vitaminE' | 'vitaminK' | 'thiamin' |
  'riboflavin' | 'niacin' | 'pantothenicAcid' | 'folate' | 'calcium' | 'iron' | 'magnesium' | 'phosphorus' | 'potassium' | 'sodium' | 'zinc'
export interface INutrientFilter extends IFilter {
  key: string;
  min: number;
  max: number;
}

/**
 *
 * Ingredient Filter interface. HasVal is a an ingredient_id
 * @export
 * @interface IIngredientFilter
 * @extends {IFilter}
 */
export interface IIngredientFilter extends IFilter {
  key: string;
  hasVal: number;
}
