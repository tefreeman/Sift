export type TNutrition = "calories" | "fat" | "carbs" | "protein" | "fiber" | "vitaminBMg" | "vitaminCMg" |
   "vitaminCMg" | "vitaminDMg" | "vitaminEMg" | "calciumMg" | "ironMg" | "magnesiumMg" | "PotassiumPMg" | "sodiumMg";

export const NutritionTypeList = [["calories", "calories"], ["fat", "fat"], ["carbs", "carbs"], ["protein", "protein"], ["fiber", "fiber"],
   ["vitamin B", "vitaminBMg"], ["vitamin C", "vitaminCMg"], ["vitamin D", "vitaminDMg"], ["Vitamin E", "vitaminEMg"], ["calcium", "calciumMg"], ["iron", "ironMg"],
   ["magnesium", "magnesiumMg"], ["Potassium", "PotassiumPMg"], ["sodium", "sodiumMg"]
];

export interface INutrients {
   PotassiumPMg: number; //g
   calciumMg: number; //g
   calories: number; //Kcal
   carb: number; //g
   fat: number; //g
   fiber: number; //g
   ironMg: number; //g
   magnesiumMg: number; //g
   protein: number; //g
   sodiumMg: number; //g
   vitaminBMg: number; //g
   vitaminCMg: number; //g
   vitaminDMg: number; //g
   vitaminEMg: number; //g
   water: number; // Liters
}
