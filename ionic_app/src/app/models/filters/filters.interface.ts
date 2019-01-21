import { ICuisines } from '../food/cuisines.interface';
import { IIngredients } from '../food/ingredients.interface';
import { INutrition } from '../nutrition/nutrition.interface';

export interface IFilterObject {
    uid: string;
    name: string;
    public: boolean;
    timestamp: number;
    lastActive: number;
    filterArray: [];
    // Create your own diet?
    diet: {};
    // Need to add preset diets to automatically set health and food filters
  }

