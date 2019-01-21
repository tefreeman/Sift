export interface IIngredients {
    ingredients: Array<{ id: number; name: string; val: number }>;
  }

export interface IIngredient {
    id: number;
    name: string;
    val: number;
    per: number;
}
