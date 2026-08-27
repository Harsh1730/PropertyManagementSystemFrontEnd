/**
 * Resolves an image URL from backend response or relative path.
 * If the path is relative (e.g. "/properties/images/1"), it prepends VITE_API_URL when available.
 * If the path is already a full URL (http://, https://, blob:, data:), it returns it unchanged.
 */
export const getImageUrl = (path?: string | null): string => {
    if (!path) return "";

    // Already an absolute URL, data URL, or blob URL
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("blob:") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://propertymanagementsystem-production.up.railway.app" : "");
    if (apiUrl) {
        const baseUrl = apiUrl.replace(/\/+$/, "");
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    }

    return path;
};
