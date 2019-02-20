
export interface IItem {
    name: string;
    price: number;
    reviewCount: number;
    reviewScore: number;
    mQty: number;
    mUnit: 'string';
    servingQty: number;
    servingUnit: string;
    isApproved: boolean;
    tag_ids: number[];
    nutrition_id: number;
    restaurant_id: number;
    ingredient_ids: number[];
}