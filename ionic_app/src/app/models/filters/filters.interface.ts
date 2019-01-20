import { Cuisines } from '../food/cuisines.interface';
import { Ingredients } from '../food/ingredients.interface';
import { Nutrition } from '../nutrition/nutrition.interface';

export interface Filter {
    uid: string;
    name: string;
    public: boolean;
    timestamp: number;
    isActive: boolean;
    restaurantFilters: {
      distance: number;
      price: number;
      ethnicityTags: string[];
      tags: string[];
      takeOut: boolean;
      fullBar: boolean;
      outDoorSeating: boolean;
      orderDelivery: boolean;
    };
    // Create your own diet?
    diet: {};
    // Need to add preset diets to automatically set health and food filters
    advFilters: {
      tasteVsHealth: number; // can override user default settings
      nutrition: string // stringify Nutrition Object
      ingredients: string; // stringify  Ingredients Object
    };
  }