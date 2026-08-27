import api from "./axios";
import type {
    CreateLeaseRequest,
    LeaseResponse,
    TenantLeaseDetailResponse,
    TenantLeaseOverviewResponse,
} from "../types/api";

export const getMyLeases = async (): Promise<LeaseResponse[]> => {
    const response = await api.get<LeaseResponse[]>("/leases");
    return response.data;
};

export const createLease = async (
    payload: CreateLeaseRequest
): Promise<LeaseResponse> => {
    const response = await api.post<LeaseResponse>(
        "/leases",
        payload
    );
    return response.data;
};

export const getCurrentLease = async (): Promise<TenantLeaseDetailResponse> => {
    const response = await api.get<TenantLeaseDetailResponse>("/leases/current");
    return response.data;
};

export const getPreviousLeases = async (): Promise<TenantLeaseDetailResponse[]> => {
    const response = await api.get<TenantLeaseDetailResponse[]>("/leases/previous");
    return response.data;
};

export const getLeaseHistory = async (): Promise<TenantLeaseOverviewResponse> => {
    const response = await api.get<TenantLeaseOverviewResponse>("/leases/history");
    return response.data;
};

export const getLeaseById = async (
    leaseId: number
): Promise<LeaseResponse> => {
    const response = await api.get<LeaseResponse>(
        `/leases/${leaseId}`
    );
    return response.data;
};

export const terminateLease = async (
    leaseId: number
): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
        `/leases/${leaseId}`
    );
    return response.data;
};
