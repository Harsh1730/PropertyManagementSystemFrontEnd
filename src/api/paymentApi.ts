import api from "./axios";
import type {
    CreatePaymentRequest,
    PaymentResponse,
    RentStatusResponse,
} from "../types/api";

export const createPayment = async (
    payload: CreatePaymentRequest
): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>(
        "/payments",
        payload
    );

    return response.data;
};

export const getMyPayments = async (): Promise<PaymentResponse[]> => {
    const response = await api.get<PaymentResponse[]>(
        "/payments/my"
    );

    return response.data;
};

export const getOwnerPayments = async (): Promise<PaymentResponse[]> => {
    const response = await api.get<PaymentResponse[]>(
        "/payments/owner"
    );

    return response.data;
};

export const getLeasePayments = async (
    leaseId: number
): Promise<PaymentResponse[]> => {
    const response = await api.get<PaymentResponse[]>(
        `/payments/lease/${leaseId}`
    );

    return response.data;
};

export const getLeaseRentStatus = async (
    leaseId: number
): Promise<RentStatusResponse> => {
    const response = await api.get<RentStatusResponse>(
        `/payments/lease/${leaseId}/status`
    );

    return response.data;
};
