export type TRestaurantKeys = "price" | "reviewCount" | "reviewScore";

export const RestaurantTypeList = [["price", "price"], ["review count", "reviewCount"], ["review score", "reviewScore"], ["distance", "distance"], ["type", "type"]];


export interface IRestaurant {
   address: string;
   coords: ICoords;
   distance?: number;
   isApproved: boolean;
   items: number[];
   lastUpdated: number;
   name: string;
   phone: string;
   price: number;
   reviewCount: number;
   reviewScore: number;
   tag_ids: number[];
   type: string;
}

interface ICoords {
   lat: number;
   lon: number;
}
