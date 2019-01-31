export interface ISort {
    name: string;
    restaurants: ISortable[];
    items: ISortable[];
}

export interface ISortable {
    key: string;
    weight: number;
}
