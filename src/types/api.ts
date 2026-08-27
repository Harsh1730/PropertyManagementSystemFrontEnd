export type UserRole = "OWNER" | "TENANT";

export type PropertyType = "HOUSE" | "FLAT" | "ROOM" | "PG";

export type PropertyStatus =
    | "AVAILABLE"
    | "OCCUPIED"
    | "UNDER_MAINTENANCE"
    | "INACTIVE";

export type LeaseStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export type PaymentMethod =
    | "CASH"
    | "UPI"
    | "CARD"
    | "BANK_TRANSFER";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type MaintenanceStatus =
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "REJECTED";

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role?: UserRole;
}

export interface RegisterResponse {
    msg: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    name: string;
    role: UserRole;
    msg: string;
}

export interface CreatePropertyRequest {
    propertyName: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    propertyType: PropertyType;
    rentAmount: number;
    securityDeposit: number;
    totalUnits: number;
    images?: File[];
}

export interface PropertyResponse {
    id: number;
    propertyName: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    propertyType: PropertyType;
    status: PropertyStatus;
    rentAmount: number;
    securityDeposit: number;
    totalUnits: number;
    ownerId?: number;
    ownerName?: string;
    ownerRating?: number | null;
    averageRating?: number | null;
    totalReviews?: number;
    imageUrls?: string[];
    createdAt?: string;
}

export interface CreateLeaseRequest {
    propertyId: number;
    tenantId: number;
    leaseStartDate: string;
    leaseEndDate: string;
    monthlyRent: number;
    securityDeposit: number;
    rentDueDay: number;
}

export interface LeaseResponse {
    id: number;
    propertyId: number;
    propertyName: string;
    tenantId: number;
    tenantName: string;
    leaseStartDate: string;
    leaseEndDate: string;
    monthlyRent: number;
    securityDeposit: number;
    rentDueDay: number;
    status: LeaseStatus;
    createdAt?: string;
}

export interface CreatePaymentRequest {
    leaseId: number;
    amount: number;
    paymentDate: string;
    dueDate?: string;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
}

export interface PaymentResponse {
    id: number;
    leaseId: number;
    amount: number;
    paymentDate: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    createdAt?: string;
}

export interface RentStatusResponse {
    leaseId: number;
    monthlyRent: number;
    rentDueDay: number;
    status: "PAID" | "DUE" | "OVERDUE" | string;
}

export interface CreateMaintenanceRequest {
    propertyId: number;
    title: string;
    description: string;
}

export interface MaintenanceResponse {
    id: number;
    propertyId: number;
    tenantId: number;
    title: string;
    description: string;
    status: MaintenanceStatus;
    createdAt?: string;
    updatedAt?: string;
}

// Detailed responses from Dashboard Controller
export interface OwnerRentedPropertyResponse {
    propertyId: number;
    propertyName: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    propertyType: PropertyType;
    status: PropertyStatus;
    propertyRentAmount: number;
    propertySecurityDeposit: number;
    totalUnits: number;
    propertyCreatedAt?: string;

    leaseId?: number | null;
    leaseStartDate?: string | null;
    leaseEndDate?: string | null;
    monthlyRent?: number | null;
    leaseSecurityDeposit?: number | null;
    rentDueDay?: number | null;
    leaseStatus?: LeaseStatus | null;

    tenantId?: number | null;
    tenantName?: string | null;
    tenantEmail?: string | null;
    tenantPhoneNumber?: string | null;

    rentStatus?: string;
    totalRentCollected?: number;
    openMaintenanceRequestsCount?: number;
}

export interface TenantLeaseDetailResponse {
    leaseId: number;
    leaseStartDate: string;
    leaseEndDate: string;
    monthlyRent: number;
    securityDeposit: number;
    rentDueDay: number;
    status: LeaseStatus;
    createdAt?: string;

    propertyId?: number;
    propertyName?: string;
    propertyDescription?: string;
    propertyAddress?: string;
    propertyCity?: string;
    propertyState?: string;
    propertyCountry?: string;
    propertyPostalCode?: string;
    propertyType?: PropertyType;

    ownerId?: number;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhoneNumber?: string;

    rentStatus?: string;
    totalRentPaid?: number;
    openMaintenanceRequestsCount?: number;
}

export interface TenantLeaseOverviewResponse {
    currentLease?: TenantLeaseDetailResponse | null;
    previousLeases: TenantLeaseDetailResponse[];
    totalLeases: number;
}
