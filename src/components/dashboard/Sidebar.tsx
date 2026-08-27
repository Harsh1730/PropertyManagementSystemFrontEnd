import {
    LayoutDashboard,
    Building2,
    Home,
    FileText,
    CreditCard,
    Wrench,
    LogOut,
    Sparkles,
    CalendarCheck,
    MessageSquare,
    Briefcase,
    UserCheck
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

export type DashboardSection =
    | "overview"
    | "explore"
    | "bookings"
    | "properties"
    | "rented"
    | "leases"
    | "payments"
    | "maintenance"
    | "messages";

interface SidebarProps {
    activeSection: DashboardSection;
    onSectionChange: (section: DashboardSection) => void;
    badgeCounts?: {
        properties?: number;
        rented?: number;
        leases?: number;
        payments?: number;
        maintenance?: number;
        bookings?: number;
        unreadMessages?: number;
    };
}

export function Sidebar({
    activeSection,
    onSectionChange,
    badgeCounts,
}: SidebarProps) {
    const { logout, userEmail, userName, portalMode, setPortalMode } = useAuth();

    const ownerMenuItems = [
        { key: "overview" as DashboardSection, name: "Overview", icon: LayoutDashboard },
        { key: "properties" as DashboardSection, name: "Properties", icon: Building2, badge: badgeCounts?.properties },
        { key: "bookings" as DashboardSection, name: "Bookings", icon: CalendarCheck, badge: badgeCounts?.bookings },
        { key: "rented" as DashboardSection, name: "Rented Units", icon: Home, badge: badgeCounts?.rented },
        { key: "leases" as DashboardSection, name: "Leases", icon: FileText, badge: badgeCounts?.leases },
        { key: "payments" as DashboardSection, name: "Rent Collections", icon: CreditCard, badge: badgeCounts?.payments },
        { key: "maintenance" as DashboardSection, name: "Maintenance", icon: Wrench, badge: badgeCounts?.maintenance },
        { key: "messages" as DashboardSection, name: "Messages", icon: MessageSquare, badge: badgeCounts?.unreadMessages },
    ];

    const tenantMenuItems = [
        { key: "overview" as DashboardSection, name: "Overview", icon: LayoutDashboard },
        { key: "explore" as DashboardSection, name: "Explore & Book", icon: Sparkles },
        { key: "bookings" as DashboardSection, name: "Applications", icon: CalendarCheck, badge: badgeCounts?.bookings },
        { key: "leases" as DashboardSection, name: "My Lease", icon: FileText, badge: badgeCounts?.leases },
        { key: "payments" as DashboardSection, name: "Rent & Receipts", icon: CreditCard, badge: badgeCounts?.payments },
        { key: "maintenance" as DashboardSection, name: "Maintenance", icon: Wrench, badge: badgeCounts?.maintenance },
        { key: "messages" as DashboardSection, name: "Messages", icon: MessageSquare, badge: badgeCounts?.unreadMessages },
    ];

    const menuItems = portalMode === "owner" ? ownerMenuItems : tenantMenuItems;

    const displayName = userName || (userEmail ? userEmail.split("@")[0] : "User");

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon-box">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <div className="brand-title">EstateFlow</div>
                        <div className="brand-tagline">Property SaaS</div>
                    </div>
                </div>
            </div>

            {/* Portal Switcher Tabs */}
            <div className="sidebar-role-indicator">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "var(--bg-subtle)", padding: "3px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                    <button
                        type="button"
                        onClick={() => {
                            setPortalMode("owner");
                            onSectionChange("overview");
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "5px",
                            fontSize: "12px",
                            fontWeight: portalMode === "owner" ? 600 : 500,
                            borderRadius: "var(--radius-xs)",
                            background: portalMode === "owner" ? "var(--bg-surface)" : "transparent",
                            color: portalMode === "owner" ? "var(--text-primary)" : "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: portalMode === "owner" ? "var(--shadow-xs)" : "none",
                            transition: "all var(--transition-fast)"
                        }}
                    >
                        <Briefcase size={13} />
                        <span>Owner</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setPortalMode("tenant");
                            onSectionChange("overview");
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px",
                            padding: "5px",
                            fontSize: "12px",
                            fontWeight: portalMode === "tenant" ? 600 : 500,
                            borderRadius: "var(--radius-xs)",
                            background: portalMode === "tenant" ? "var(--bg-surface)" : "transparent",
                            color: portalMode === "tenant" ? "var(--text-primary)" : "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: portalMode === "tenant" ? "var(--shadow-xs)" : "none",
                            transition: "all var(--transition-fast)"
                        }}
                    >
                        <UserCheck size={13} />
                        <span>Tenant</span>
                    </button>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={`nav-item ${isActive ? "active" : ""}`}
                            onClick={() => onSectionChange(item.key)}
                        >
                            <Icon size={16} className="nav-icon" />
                            <span>{item.name}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="nav-badge">{item.badge}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 4px" }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userEmail || "Signed In"}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        title="Sign Out"
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text-muted)",
                            padding: "6px",
                            borderRadius: "var(--radius-xs)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;