import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./authTypes";

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
}

export default useAuth;
