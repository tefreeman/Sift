export interface Review {
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

export interface ReviewHidden extends Review {
    timeSpent: number;
}