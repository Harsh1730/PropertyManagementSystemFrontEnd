import type { AxiosError } from "axios";

interface BackendErrorMap {
    error?: string;
    message?: string;
    [key: string]: unknown;
}

export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong"
): string {
    const axiosError = error as AxiosError<BackendErrorMap>;
    const responseData = axiosError.response?.data;

    if (!responseData) {
        return fallback;
    }

    if (typeof responseData === "string") {
        return responseData;
    }

    if (responseData.error && typeof responseData.error === "string") {
        return responseData.error;
    }

    if (responseData.message && typeof responseData.message === "string") {
        return responseData.message;
    }

    const validationEntries = Object.entries(responseData).filter(([, value]) =>
        typeof value === "string"
    );

    if (validationEntries.length > 0) {
        return validationEntries
            .map(([key, value]) => `${key}: ${String(value)}`)
            .join(" | ");
    }

    return fallback;
}
