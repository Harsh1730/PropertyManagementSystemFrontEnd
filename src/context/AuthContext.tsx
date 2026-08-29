import { useState, useMemo, useEffect, type ReactNode } from "react";
import { AuthContext, type PortalMode, type UserInfo } from "./authTypes";
import type { LoginResponse, UserRole } from "../types/api";
import { deleteCurrentUserAccount } from "../api/Authapi";
import { getValidToken, clearAuthStorage, isTokenExpired, parseJwt } from "../utils/token";

interface AuthProviderProps {
    children: ReactNode;
}

function parseEmailFromToken(token: string | null): string | null {
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.sub || payload?.username || payload?.email || null;
}

function getStoredUser(): UserInfo | null {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: AuthProviderProps) {
    // Only initialize with a token if it exists AND is not expired
    const [token, setToken] = useState<string | null>(() => getValidToken());
    const [user, setUser] = useState<UserInfo | null>(() => {
        const validToken = getValidToken();
        if (!validToken) {
            clearAuthStorage();
            return null;
        }
        return getStoredUser();
    });

    const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
        const saved = localStorage.getItem("portalMode");
        if (saved === "tenant" || saved === "owner") return saved;
        const storedUser = getStoredUser();
        if (storedUser?.role === "TENANT") return "tenant";
        return "owner";
    });

    // Handle token expiry events and periodic checks
    useEffect(() => {
        const handleAuthExpired = () => {
            clearAuthStorage();
            setToken(null);
            setUser(null);
            setPortalModeState("owner");
        };

        window.addEventListener("auth:expired", handleAuthExpired);

        // Periodic check every 30 seconds to catch expired tokens in open tabs
        const intervalId = setInterval(() => {
            const currentToken = localStorage.getItem("token");
            if (currentToken && isTokenExpired(currentToken)) {
                handleAuthExpired();
            }
        }, 30000);

        return () => {
            window.removeEventListener("auth:expired", handleAuthExpired);
            clearInterval(intervalId);
        };
    }, []);

    const userEmail = useMemo(() => {
        if (user?.email) return user.email;
        return parseEmailFromToken(token);
    }, [user, token]);

    const userName = useMemo(() => user?.name || null, [user]);
    const userRole = useMemo(() => user?.role || null, [user]);

    const setPortalMode = (mode: PortalMode) => {
        localStorage.setItem("portalMode", mode);
        setPortalModeState(mode);
    };

    const login = (authData: LoginResponse | string) => {
        if (typeof authData === "string") {
            localStorage.setItem("token", authData);
            setToken(authData);
            const email = parseEmailFromToken(authData);
            if (email) {
                const fallbackUser: UserInfo = { email };
                localStorage.setItem("user", JSON.stringify(fallbackUser));
                setUser(fallbackUser);
            }
        } else {
            const rawToken = authData.token;
            localStorage.setItem("token", rawToken);
            setToken(rawToken);

            const userInfo: UserInfo = {
                userId: authData.userId,
                email: authData.email,
                name: authData.name,
                role: authData.role,
            };
            localStorage.setItem("user", JSON.stringify(userInfo));
            setUser(userInfo);

            if (authData.role === "TENANT") {
                setPortalMode("tenant");
            } else if (authData.role === "OWNER") {
                setPortalMode("owner");
            }
        }
    };

    const logout = () => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
        setPortalModeState("owner");
    };

    const deleteAccount = async () => {
        try {
            await deleteCurrentUserAccount();
        } finally {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                userEmail,
                userName,
                userRole: userRole as UserRole | null,
                isAuthenticated: !isTokenExpired(token),
                portalMode,
                setPortalMode,
                login,
                logout,
                deleteAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;