import type { PropertyType, PropertyStatus } from "./api";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface BookingResponse {
    id: number;
    // Property Details
    propertyId: number;
    propertyName: string;
    propertyAddress: string;
    propertyCity: string;
    propertyState: string;
    propertyType: PropertyType;
    propertyStatus: PropertyStatus;
    // Tenant Details
    tenantId: number;
    tenantName: string;
    tenantEmail: string;
    tenantPhoneNumber: string;
    // Owner Details
    ownerId: number;
    ownerName: string;
    ownerEmail: string;
    ownerPhoneNumber: string;
    // Booking Terms
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    message?: string;
    status: BookingStatus;
    // Lease link if approved
    leaseId?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingRequest {
    propertyId: number;
    startDate: string;
    endDate: string;
    monthlyRent?: number;
    securityDeposit?: number;
    message?: string;
}
