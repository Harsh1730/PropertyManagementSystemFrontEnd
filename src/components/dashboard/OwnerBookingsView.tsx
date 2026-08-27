import { useState } from "react";
import {
    MapPin,
    MessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Mail,
    Phone,
    Check,
    X,
    Building2
} from "lucide-react";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { approveBooking, rejectBooking } from "../../api/bookingApi";
import { getApiErrorMessage } from "../../api/error";

interface OwnerBookingsViewProps {
    bookings: BookingResponse[];
    onOpenChat: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string, bookingId?: number) => void;
    onNavigateToLeases: () => void;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function OwnerBookingsView({
    bookings,
    onOpenChat,
    onNavigateToLeases,
    onRefresh,
    onSetAlert,
    onSetError,
}: OwnerBookingsViewProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [actionId, setActionId] = useState<number | null>(null);

    const handleApprove = async (b: BookingResponse) => {
        if (!window.confirm(`Approve booking for "${b.propertyName}"? This will automatically activate a binding Lease contract for ${b.tenantName} and set the property to OCCUPIED.`)) {
            return;
        }

        setActionId(b.id);
        onSetError("");
        onSetAlert("");

        try {
            await approveBooking(b.id);
            onSetAlert(`Booking #${b.id} approved! Lease contract created & activated for ${b.tenantName}.`);
            onRefresh();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to approve booking application."));
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (b: BookingResponse) => {
        if (!window.confirm(`Decline booking request #${b.id} from ${b.tenantName}?`)) {
            return;
        }

        setActionId(b.id);
        onSetError("");
        onSetAlert("");

        try {
            await rejectBooking(b.id);
            onSetAlert(`Booking application #${b.id} declined.`);
            onRefresh();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to reject booking application."));
        } finally {
            setActionId(null);
        }
    };

    const filtered = statusFilter === "ALL"
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

    const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

    const getStatusInfo = (status: BookingStatus) => {
        switch (status) {
            case "PENDING":
                return { label: "Pending Review", class: "due", icon: Clock };
            case "APPROVED":
                return { label: "Approved & Leased", class: "paid", icon: CheckCircle2 };
            case "REJECTED":
                return { label: "Declined", class: "failed", icon: XCircle };
            case "CANCELLED":
                return { label: "Cancelled by Tenant", class: "expired", icon: XCircle };
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
                        <h3>Tenant Booking Applications ({bookings.length})</h3>
                        <p>Review incoming booking applications, chat with prospective tenants, and approve contracts</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("ALL")}
                    >
                        All Applications ({bookings.length})
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "PENDING" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("PENDING")}
                    >
                        Pending Review ({pendingCount})
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "APPROVED" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("APPROVED")}
                    >
                        Approved
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "REJECTED" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("REJECTED")}
                    >
                        Declined
                    </button>
                </div>
            </div>

            {/* Applications List */}
            {filtered.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Building2 size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3>No Applications in this Category</h3>
                        <p style={{ marginTop: "6px", maxWidth: "420px", margin: "6px auto 0" }}>
                            When tenants search and apply for your available properties online, their requests will appear here for your review and approval.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(370px, 1fr))", gap: "20px" }}>
                    {filtered.map((b) => {
                        const statusInfo = getStatusInfo(b.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={`owner-booking-${b.id}`} className="rented-property-card">
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

                                {/* Applicant Profile Box */}
                                <div className="rented-tenant-section">
                                    <div className="section-mini-title">Prospective Tenant Profile</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <User size={14} color="var(--info)" />
                                            <strong>{b.tenantName || `Tenant #${b.tenantId}`}</strong>
                                            <span className="tenant-id-pill">ID #{b.tenantId}</span>
                                        </div>
                                        {b.tenantEmail && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                                                <Mail size={12} />
                                                <span>{b.tenantEmail}</span>
                                            </div>
                                        )}
                                        {b.tenantPhoneNumber && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px" }}>
                                                <Phone size={12} />
                                                <span>{b.tenantPhoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Financial Terms Grid */}
                                <div className="rented-financials-grid">
                                    <div className="fin-item">
                                        <span className="fin-label">Agreed Rent</span>
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
                                        <span className="fin-label">Requested Lease Period</span>
                                        <span className="fin-val" style={{ fontSize: "12px" }}>
                                            {b.startDate} → {b.endDate}
                                        </span>
                                    </div>
                                </div>

                                {/* Message from Tenant */}
                                {b.message && (
                                    <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "10px", borderRadius: "var(--radius-sm)", fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                                        "{b.message}"
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="rented-card-footer" style={{ flexDirection: "column", gap: "10px" }}>
                                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            style={{ flex: 1 }}
                                            onClick={() => onOpenChat(b.tenantId, b.tenantName || "Tenant", b.propertyId, b.propertyName, b.id)}
                                        >
                                            <MessageSquare size={14} />
                                            <span>Chat with Applicant</span>
                                        </button>

                                        {b.status === "APPROVED" && (
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={onNavigateToLeases}
                                            >
                                                <span>View Lease Contract</span>
                                            </button>
                                        )}
                                    </div>

                                    {b.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                style={{ flex: 1, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "#10b981" }}
                                                disabled={actionId === b.id}
                                                onClick={() => handleApprove(b)}
                                            >
                                                <Check size={14} />
                                                <span>{actionId === b.id ? "Activating..." : "Approve & Activate Lease"}</span>
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                disabled={actionId === b.id}
                                                onClick={() => handleReject(b)}
                                            >
                                                <X size={14} />
                                                <span>Decline</span>
                                            </button>
                                        </div>
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

export default OwnerBookingsView;
