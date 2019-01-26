export interface ISort {
    restaurants: ISortable[]
    items: ISortable[]
}

export interface ISortable {
    key: string,
    weight: number;
}