import { useState, useMemo, type ReactNode } from "react";
import { AuthContext, type PortalMode, type UserInfo } from "./authTypes";
import type { LoginResponse, UserRole } from "../types/api";

interface AuthProviderProps {
    children: ReactNode;
}

function parseEmailFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payloadJson = atob(parts[1]);
        const payload = JSON.parse(payloadJson);
        return payload.sub || payload.username || payload.email || null;
    } catch {
        return null;
    }
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
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<UserInfo | null>(getStoredUser);
    
    const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
        const saved = localStorage.getItem("portalMode");
        if (saved === "tenant" || saved === "owner") return saved;
        const storedUser = getStoredUser();
        if (storedUser?.role === "TENANT") return "tenant";
        return "owner";
    });

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
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("portalMode");
        setToken(null);
        setUser(null);
        setPortalModeState("owner");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                userEmail,
                userName,
                userRole: userRole as UserRole | null,
                isAuthenticated: !!token,
                portalMode,
                setPortalMode,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;