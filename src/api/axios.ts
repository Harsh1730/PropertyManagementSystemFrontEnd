import axios from "axios";

const DEFAULT_PROD_API_URL = "https://propertymanagementsystem-production.up.railway.app";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API_URL : ""),
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        const isAuthUrl = requestUrl.includes("/auth/");
        const currentPath = window.location.pathname;

        if (status === 401 && !isAuthUrl && currentPath !== "/login" && currentPath !== "/register") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;