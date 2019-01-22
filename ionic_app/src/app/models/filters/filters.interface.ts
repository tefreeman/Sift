import { ICuisines } from '../food/cuisines.interface';
import { IIngredients } from '../food/ingredients.interface';
import { INutrients } from '../nutrition/nutrition.interface';

export interface IFilterObj {
    uid: string;
    name: string;
    public: boolean;
    timestamp: number;
    lastActive: number;
    filterArray: TFilter[];
    // Create your own diet?
    diet: {};
    // Need to add preset diets to automatically set health and food filters
  }

type TFilter = INutrientFilter | IIngredientFilter | IPriceFilter | IDistanceFilter | ITagFilter;

interface INutrientFilter {
  type: 'nutrient';
  prop: string;
  max: number;
  min: number;
}

interface  IIngredientFilter {
  type: 'ingredient';
  name: string;
  has: boolean;
}

interface IPriceFilter {
  type: 'price';
  $: boolean;
  $$: boolean;
  $$$: boolean;
  $$$$: boolean;
}

interface IDistanceFilter {
  type: 'distance';
  max: number;
}

interface ITagFilter {
  type: 'tag';
  name: 'string';
}
