import { useState } from "react";
import {
    MapPin,
    MessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    Building2,
    ArrowUpRight,
    User,
    Mail,
    Phone
} from "lucide-react";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { cancelBooking } from "../../api/bookingApi";
import { getApiErrorMessage } from "../../api/error";

interface TenantBookingsViewProps {
    bookings: BookingResponse[];
    onOpenChat: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string, bookingId?: number) => void;
    onNavigateToExplore: () => void;
    onNavigateToLeases: () => void;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function TenantBookingsView({
    bookings,
    onOpenChat,
    onNavigateToExplore,
    onNavigateToLeases,
    onRefresh,
    onSetAlert,
    onSetError,
}: TenantBookingsViewProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking application?")) {
            return;
        }

        setCancellingId(bookingId);
        onSetError("");
        onSetAlert("");

        try {
            await cancelBooking(bookingId);
            onSetAlert("Booking application cancelled successfully.");
            onRefresh();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to cancel booking application."));
        } finally {
            setCancellingId(null);
        }
    };

    const filtered = statusFilter === "ALL"
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

    const getStatusInfo = (status: BookingStatus) => {
        switch (status) {
            case "PENDING":
                return { label: "Under Review", class: "due", icon: Clock };
            case "APPROVED":
                return { label: "Approved & Leased", class: "paid", icon: CheckCircle2 };
            case "REJECTED":
                return { label: "Declined", class: "failed", icon: XCircle };
            case "CANCELLED":
                return { label: "Cancelled", class: "expired", icon: XCircle };
            default:
                return { label: status, class: "pending", icon: Clock };
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Header */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>My Rental Applications & Bookings</h3>
                        <p>Track the status of your online booking requests and chat with landlords</p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onNavigateToExplore}
                    >
                        <Building2 size={16} />
                        <span>Find More Properties</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`btn btn-sm ${statusFilter === tab ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setStatusFilter(tab)}
                        >
                            {tab === "ALL" ? `All Applications (${bookings.length})` : tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            {filtered.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Building2 size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3>No Applications Found</h3>
                        <p style={{ marginTop: "6px", maxWidth: "420px", margin: "6px auto 0" }}>
                            You have not submitted any rental applications under this filter. Explore available properties to apply online.
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ marginTop: "16px" }}
                            onClick={onNavigateToExplore}
                        >
                            Explore Available Properties
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
                    {filtered.map((b) => {
                        const statusInfo = getStatusInfo(b.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={`booking-card-${b.id}`} className="rented-property-card">
                                {/* Card Header */}
                                <div className="rented-card-header">
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <h4 className="rented-prop-name">{b.propertyName}</h4>
                                            <span className="type-badge">{b.propertyType}</span>
                                        </div>
                                        <div className="rented-prop-location">
                                            <MapPin size={13} />
                                            <span>{b.propertyAddress}, {b.propertyCity}</span>
                                        </div>
                                    </div>

                                    <div className={`status-pill ${statusInfo.class}`} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <StatusIcon size={13} />
                                        <span>{statusInfo.label}</span>
                                    </div>
                                </div>

                                {/* Landlord Contact Section */}
                                <div className="rented-tenant-section">
                                    <div className="section-mini-title">Landlord / Owner</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <User size={14} color="var(--info)" />
                                            <strong>{b.ownerName || "Property Owner"}</strong>
                                        </div>
                                        {b.ownerEmail && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                                                <Mail size={12} />
                                                <span>{b.ownerEmail}</span>
                                            </div>
                                        )}
                                        {b.ownerPhoneNumber && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                                                <Phone size={12} />
                                                <span>{b.ownerPhoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Terms & Message */}
                                <div className="rented-financials-grid">
                                    <div className="fin-item">
                                        <span className="fin-label">Offered Rent</span>
                                        <span className="fin-val">
                                            ₹{Number(b.monthlyRent).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="fin-item">
                                        <span className="fin-label">Deposit</span>
                                        <span className="fin-val" style={{ color: "var(--purple)" }}>
                                            ₹{Number(b.securityDeposit).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="fin-item" style={{ gridColumn: "span 2" }}>
                                        <span className="fin-label">Requested Period</span>
                                        <span className="fin-val" style={{ fontSize: "12px" }}>
                                            {b.startDate} → {b.endDate}
                                        </span>
                                    </div>
                                </div>

                                {b.message && (
                                    <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                        "{b.message}"
                                    </div>
                                )}

                                {/* Card Actions */}
                                <div className="rented-card-footer" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => onOpenChat(b.ownerId, b.ownerName || "Landlord", b.propertyId, b.propertyName, b.id)}
                                    >
                                        <MessageSquare size={14} />
                                        <span>Chat with Landlord</span>
                                    </button>

                                    {b.status === "APPROVED" && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={onNavigateToLeases}
                                        >
                                            <span>View Activated Lease</span>
                                            <ArrowUpRight size={14} />
                                        </button>
                                    )}

                                    {b.status === "PENDING" && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            disabled={cancellingId === b.id}
                                            onClick={() => handleCancel(b.id)}
                                        >
                                            <span>{cancellingId === b.id ? "Cancelling..." : "Cancel Application"}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TenantBookingsView;
