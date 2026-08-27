import api from "./axios";
import type {
    CreateMaintenanceRequest,
    MaintenanceResponse,
    MaintenanceStatus,
} from "../types/api";

export const createMaintenanceRequest = async (
    payload: CreateMaintenanceRequest
): Promise<MaintenanceResponse> => {
    const response = await api.post<MaintenanceResponse>(
        "/maintenance",
        payload
    );

    return response.data;
};

export const getMyMaintenanceRequests =
    async (): Promise<MaintenanceResponse[]> => {
        const response = await api.get<MaintenanceResponse[]>(
            "/maintenance/my"
        );

        return response.data;
    };

export const getOwnerMaintenanceRequests =
    async (): Promise<MaintenanceResponse[]> => {
        const response = await api.get<MaintenanceResponse[]>(
            "/maintenance/owner"
        );

        return response.data;
    };

export const updateMaintenanceStatus = async (
    requestId: number,
    status: MaintenanceStatus
): Promise<MaintenanceResponse> => {
    const response = await api.patch<MaintenanceResponse>(
        `/maintenance/${requestId}/status`,
        null,
        {
            params: {
                status,
            },
        }
    );

    return response.data;
};
