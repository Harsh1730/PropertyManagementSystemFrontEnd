import type {
    OwnerRentedPropertyResponse,
    TenantLeaseDetailResponse,
    TenantLeaseOverviewResponse
} from "./api";

export interface OwnerDashboardResponse {
    totalProperties: number;
    occupiedProperties: number;
    availableProperties: number;
    activeLeases: number;
    totalRentCollected: number;
    pendingMaintenanceRequests: number;
}

export interface TenantDashboardResponse {
    activeLeaseId: number | null;
    propertyId?: number | null;
    propertyName?: string | null;
    propertyAddress?: string | null;
    monthlyRent: number;
    rentStatus: string;
    rentDueDay?: number | null;
    leaseStartDate?: string | null;
    leaseEndDate?: string | null;
    totalPayments: number;
    openMaintenanceRequests: number;
}

export type {
    OwnerRentedPropertyResponse,
    TenantLeaseDetailResponse,
    TenantLeaseOverviewResponse
};