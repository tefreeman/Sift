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
    filterIngredients: IIngredientFilter [];
    filterNutrients:  INutrientFilter[];
    // Create your own diet?
    diet: {};
    // Need to add preset diets to automatically set health and food filters
  }

export interface IFilter {
  key?: any;
  max?: number;
  min?: number;
  has?: boolean;
  hasVal?: string | number;
}
type TRestaurantFilter = 'distance' | 'price' | 'tag' | 'reviewScore' | 'reviewCount';
export interface IRestaurantsFilter extends IFilter {
  key: TRestaurantFilter;
}

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