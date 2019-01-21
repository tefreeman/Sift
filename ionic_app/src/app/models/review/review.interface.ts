export interface IReview {
    isApproved: boolean;
    itemId: string;
    placeId: string;
    userId: string;
    pictureUrls: string[];
    ratings: number;
    tags: string[]
    text: string;
    timeStamp: number;
}

export interface IReviewHidden extends IReview {
    timeSpent: number;
}