import { RefreshCcw, Sun, Moon, ArrowLeftRight, User } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";

interface TopbarProps {
    title: string;
    subtitle?: string;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function Topbar({
    title,
    subtitle,
    onRefresh,
    isRefreshing,
}: TopbarProps) {
    const { portalMode, setPortalMode, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const togglePortal = () => {
        setPortalMode(portalMode === "owner" ? "tenant" : "owner");
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div>
                    <h2 className="view-title">{title}</h2>
                    {subtitle && (
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            <div className="topbar-right">
                {/* Workspace Switcher */}
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={togglePortal}
                    title="Switch Workspace Mode"
                >
                    <ArrowLeftRight size={13} />
                    <span>{portalMode === "owner" ? "Switch to Tenant" : "Switch to Owner"}</span>
                </button>

                {/* Theme Mode Toggle */}
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === "light" ? "Charcoal Dark" : "Clean Light"} Theme`}
                >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>

                {/* Sync Server */}
                <button
                    type="button"
                    className="icon-action-btn"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    title="Sync with server"
                >
                    <RefreshCcw size={15} className={isRefreshing ? "spinning" : ""} />
                </button>

                {/* User Avatar */}
                <div className="user-profile-chip">
                    <div className="user-avatar-circle">
                        <User size={14} />
                    </div>
                    <div className="user-meta">
                        <span className="user-name">{user?.name || "User"}</span>
                        <span className="user-role-label">{portalMode} portal</span>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Topbar;