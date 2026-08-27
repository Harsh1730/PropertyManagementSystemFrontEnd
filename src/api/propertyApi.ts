import api from "./axios";
import type {
    CreatePropertyRequest,
    PropertyResponse,
    OwnerRentedPropertyResponse,
} from "../types/api";

export const createProperty = async (
    payload: CreatePropertyRequest
): Promise<PropertyResponse> => {
    const formData = new FormData();
    formData.append("propertyName", payload.propertyName);
    if (payload.description) formData.append("description", payload.description);
    formData.append("address", payload.address);
    formData.append("city", payload.city);
    formData.append("state", payload.state);
    formData.append("country", payload.country);
    formData.append("postalCode", payload.postalCode);
    formData.append("propertyType", payload.propertyType);
    formData.append("rentAmount", String(payload.rentAmount));
    formData.append("securityDeposit", String(payload.securityDeposit));
    formData.append("totalUnits", String(payload.totalUnits));

    if (payload.images && payload.images.length > 0) {
        for (const file of payload.images) {
            formData.append("images", file);
        }
    }

    const response = await api.post<PropertyResponse>(
        "/properties",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

export const getAllProperties = async (): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>("/properties");
    return response.data;
};

export const getMyProperties = async (): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>("/properties/my");
    return response.data;
};

export const getRentedProperties = async (): Promise<OwnerRentedPropertyResponse[]> => {
    const response = await api.get<OwnerRentedPropertyResponse[]>("/properties/rented");
    return response.data;
};

export const getAvailableProperties = async (): Promise<PropertyResponse[]> => {
    const response = await api.get<PropertyResponse[]>("/properties/available");
    return response.data;
};

export const getPropertyById = async (id: number): Promise<PropertyResponse> => {
    const response = await api.get<PropertyResponse>(`/properties/${id}`);
    return response.data;
};

export const uploadPropertyImages = async (
    propertyId: number,
    files: File[]
): Promise<PropertyResponse> => {
    const formData = new FormData();
    for (const file of files) {
        formData.append("images", file);
    }

    const response = await api.post<PropertyResponse>(
        `/properties/${propertyId}/images`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};

export const deletePropertyImage = async (
    imageId: number
): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
        `/properties/images/${imageId}`
    );
    return response.data;
};


