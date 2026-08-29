import api from "./axios";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserRole,
} from "../types/api";

export const registerUser = async (
    payload: RegisterRequest
): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(
        "/auth/register",
        payload
    );

    return response.data;
};

export const loginUser = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        "/auth/login",
        payload
    );

    return response.data;
};

export const checkProtectedEndpoint = async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/auth/protected");
    return response.data;
};

export const deleteCurrentUserAccount = async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>("/auth/me");
    return response.data;
};

export interface OAuthGoogleRequest {
    idToken: string;
    role?: UserRole;
}

export const loginWithGoogle = async (
    payload: OAuthGoogleRequest
): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
        "/auth/oauth/google",
        payload
    );

    return response.data;
};

