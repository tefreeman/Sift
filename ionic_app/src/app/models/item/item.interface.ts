import { IIngredient } from '../food/ingredients.interface';
import { INutrients } from '../nutrition/nutrition.interface';

export interface IItem {
    name: string;
    isApproved?: boolean;
    mUnit: string;
    mQty: number;
    servingQty: number;
    servingUnit: string;
    keys: string[];
    nutrients: INutrients[];
    ingridents: IIngredient

}