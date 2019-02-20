export interface IRestaurant {
  name: string;
  phone: string;
  address: string;
  distance?: number;
  type: string;
  price: number;
  reviewCount: number;
  reviewScore: number;
  lastUpdated: number;
  isApproved: boolean;
  coords: ICoords;
  tag_ids: number[];
}

interface ICoords {
  lat: number;
  lon: number;
}