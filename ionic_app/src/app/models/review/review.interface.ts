export interface IReview {
   isApproved: boolean;
   itemId: string;
   pictureUrls: string[];
   placeId: string;
   rating: number;
   tags: string[]
   timeStamp: number;
   userId: string;
}
