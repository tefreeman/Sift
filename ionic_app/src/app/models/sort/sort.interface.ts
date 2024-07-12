import { IRestaurant } from "../restaurant/restaurant.interface";
import { IItem } from "../item/item.interface";

export interface ISort {
   items: ISortable[];
   nutrients: ISortable[];
   restaurants: ISortable[];
}


export interface ISortable {
   key: string;
   weight: number;
}

export interface IPreviewSort {
   type: string,
   key: string
}
export interface ISortedView {
   itemScores: number[];
   items: IItem[];
   restaurant: IRestaurant;
}

export interface ISortViewStats {
   max: number;
   min: number;
}

export interface ISortReturnedView {
   restaurants: ISortedView[],
   stats: ISortViewStats
}

export interface IViewResultSet {
   itemView: Resultset<any>;
   nutrientView: Resultset<any>;
   restaurantView: Resultset<any>;
}
