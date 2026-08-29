import axios from "axios";
import { getValidToken, clearAuthStorage } from "../utils/token";

const DEFAULT_PROD_API_URL = "https://propertymanagementsystem-production.up.railway.app";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API_URL : ""),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        // Automatically check if token is valid and not expired
        const token = getValidToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            // Remove any stale authorization header
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
        const currentPath = window.location.pathname;

        // If 401 unauthorized (token expired / invalid) and not a direct login credential failure
        if (status === 401 && !isAuthEndpoint) {
            clearAuthStorage();

            // Notify auth context / other listeners
            window.dispatchEvent(new Event("auth:expired"));

            if (currentPath !== "/login" && currentPath !== "/register") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;