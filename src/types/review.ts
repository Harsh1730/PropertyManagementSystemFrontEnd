export interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    reviewerId: number;
    reviewerName: string;
    reviewerEmail?: string;
    targetId: number;
    createdAt: string;
}

export interface PropertyReviewSummaryResponse {
    propertyId: number;
    propertyName: string;
    averageRating: number | null;
    totalReviews: number;
    reviews: ReviewResponse[];
}

export interface OwnerReviewSummaryResponse {
    ownerId: number;
    ownerName: string;
    averageRating: number | null;
    totalReviews: number;
    reviews: ReviewResponse[];
}

export interface CreateReviewRequest {
    rating: number;
    comment: string;
}
