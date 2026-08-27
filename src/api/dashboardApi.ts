import api from "./axios";
import type {
    OwnerDashboardResponse,
    TenantDashboardResponse,
    OwnerRentedPropertyResponse,
    TenantLeaseDetailResponse,
    TenantLeaseOverviewResponse,
} from "../types/dashboard";

export const getRoleBasedDashboard = async (): Promise<
    OwnerDashboardResponse | TenantDashboardResponse
> => {
    const response = await api.get<OwnerDashboardResponse | TenantDashboardResponse>(
        "/dashboard"
    );
    return response.data;
};

export const getOwnerDashboard =
    async (): Promise<OwnerDashboardResponse> => {
        const response = await api.get<OwnerDashboardResponse>(
            "/dashboard/owner"
        );
        return response.data;
    };

export const getTenantDashboard =
    async (): Promise<TenantDashboardResponse> => {
        const response = await api.get<TenantDashboardResponse>(
            "/dashboard/tenant"
        );
        return response.data;
    };

export const getOwnerRentedProperties = async (): Promise<
    OwnerRentedPropertyResponse[]
> => {
    const response = await api.get<OwnerRentedPropertyResponse[]>(
        "/dashboard/owner/rented-properties"
    );
    return response.data;
};

export const getTenantLeaseOverview = async (): Promise<
    TenantLeaseOverviewResponse
> => {
    const response = await api.get<TenantLeaseOverviewResponse>(
        "/dashboard/tenant/leases"
    );
    return response.data;
};

export const getTenantCurrentLease = async (): Promise<
    TenantLeaseDetailResponse
> => {
    const response = await api.get<TenantLeaseDetailResponse>(
        "/dashboard/tenant/current-lease"
    );
    return response.data;
};

export const getTenantPreviousLeases = async (): Promise<
    TenantLeaseDetailResponse[]
> => {
    const response = await api.get<TenantLeaseDetailResponse[]>(
        "/dashboard/tenant/previous-leases"
    );
    return response.data;
};