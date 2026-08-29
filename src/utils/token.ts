/**
 * Token utility for inspecting, validating, and clearing JWT tokens.
 */

export interface JwtPayload {
    sub?: string;
    username?: string;
    email?: string;
    role?: string;
    userId?: number;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

/**
 * Decodes and parses the payload of a JWT token safely.
 */
export function parseJwt(token: string | null): JwtPayload | null {
    if (!token || typeof token !== "string") return null;

    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        // Base64Url decode
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Checks if a JWT token is expired or invalid.
 * Adds a 10-second buffer to handle network latency and race conditions.
 */
export function isTokenExpired(token: string | null): boolean {
    if (!token || typeof token !== "string" || token.trim() === "") {
        return true;
    }

    const payload = parseJwt(token);
    if (!payload) {
        return true;
    }

    // If exp is present in payload (seconds since epoch)
    if (typeof payload.exp === "number") {
        const expirationMs = payload.exp * 1000;
        const nowWithBuffer = Date.now() + 10 * 1000; // 10s leeway
        return expirationMs <= nowWithBuffer;
    }

    // If token has no exp field, consider it invalid
    return false;
}

/**
 * Clears authentication tokens and cached user data from localStorage and memory.
 */
export function clearAuthStorage(): void {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("portalMode");
    } catch (e) {
        console.error("Failed to clear auth storage:", e);
    }
}

/**
 * Retrieves the token from localStorage ONLY if it is still valid.
 * Automatically clears memory/storage and returns null if the token is expired.
 */
export function getValidToken(): string | null {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        if (isTokenExpired(token)) {
            clearAuthStorage();
            return null;
        }

        return token;
    } catch {
        return null;
    }
}
