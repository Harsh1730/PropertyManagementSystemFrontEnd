import api from "./axios";
import type {
    CreateReviewRequest,
    ReviewResponse,
    PropertyReviewSummaryResponse,
    OwnerReviewSummaryResponse,
} from "../types/review";

export const addPropertyReview = async (
    propertyId: number,
    payload: CreateReviewRequest
): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(
        `/properties/${propertyId}/reviews`,
        payload
    );
    return response.data;
};

export const getPropertyReviews = async (
    propertyId: number
): Promise<PropertyReviewSummaryResponse> => {
    const response = await api.get<PropertyReviewSummaryResponse>(
        `/properties/${propertyId}/reviews`
    );
    return response.data;
};

export const addOwnerReview = async (
    ownerId: number,
    payload: CreateReviewRequest
): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(
        `/owners/${ownerId}/reviews`,
        payload
    );
    return response.data;
};

export const getOwnerReviews = async (
    ownerId: number
): Promise<OwnerReviewSummaryResponse> => {
    const response = await api.get<OwnerReviewSummaryResponse>(
        `/owners/${ownerId}/reviews`
    );
    return response.data;
};
