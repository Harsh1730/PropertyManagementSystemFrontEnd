import { createContext } from "react";
import type { UserRole, LoginResponse } from "../types/api";

export type PortalMode = "owner" | "tenant";

export interface UserInfo {
    userId?: number | null;
    email: string;
    name?: string | null;
    role?: UserRole | null;
}

export interface AuthContextType {
    token: string | null;
    user: UserInfo | null;
    userEmail: string | null;
    userName: string | null;
    userRole: UserRole | null;
    isAuthenticated: boolean;
    portalMode: PortalMode;
    setPortalMode: (mode: PortalMode) => void;
    login: (authData: LoginResponse | string) => void;
    logout: () => void;
    deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
