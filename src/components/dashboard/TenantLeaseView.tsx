import { useState } from "react";
import {
    FileText,
    MapPin,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Wrench,
    Clock,
    CheckCircle2
} from "lucide-react";
import type { TenantLeaseOverviewResponse } from "../../types/api";

interface TenantLeaseViewProps {
    leaseOverview: TenantLeaseOverviewResponse | null;
    onNavigateToPayments: () => void;
    onNavigateToMaintenance: () => void;
}

export function TenantLeaseView({
    leaseOverview,
    onNavigateToPayments,
    onNavigateToMaintenance,
}: TenantLeaseViewProps) {
    const [tab, setTab] = useState<"current" | "history">("current");

    const current = leaseOverview?.currentLease;
    const previous = leaseOverview?.previousLeases || [];

    const getRentStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "PAID": return "paid";
            case "DUE": return "pending";
            case "OVERDUE": return "failed";
            default: return "pending";
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Header & Tabs Switcher */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>My Tenancy Agreement & History</h3>
                        <p>Complete agreement terms, landlord details, and past lease records</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            type="button"
                            className={`btn btn-sm ${tab === "current" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setTab("current")}
                        >
                            <CheckCircle2 size={14} />
                            <span>Active Lease</span>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${tab === "history" ? "btn-primary" : "btn-secondary"}`}
                            onClick={() => setTab("history")}
                        >
                            <Clock size={14} />
                            <span>Previous Leases ({previous.length})</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Lease View */}
            {tab === "current" && (
                <>
                    {!current ? (
                        <div className="card-panel">
                            <div className="empty-state" style={{ padding: "48px 24px" }}>
                                <FileText size={40} className="empty-state-icon" />
                                <h3>No Active Lease Agreement</h3>
                                <p style={{ marginTop: "6px" }}>
                                    You do not currently have an active lease contract linked to your account.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="panel-grid-stack">
                            {/* Main Active Lease Spotlight */}
                            <div className="card-panel" style={{ borderColor: "var(--primary)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <h3 style={{ fontSize: "20px" }}>{current.propertyName || `Property #${current.propertyId}`}</h3>
                                            <span className="type-badge">{current.propertyType || "RESIDENTIAL"}</span>
                                            <span className="status-pill active">ACTIVE LEASE</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                                            <MapPin size={14} />
                                            <span>
                                                {current.propertyAddress ? `${current.propertyAddress}, ${current.propertyCity}, ${current.propertyState} - ${current.propertyPostalCode}` : "Address registered in system"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="tag-cluster">
                                        <span className="info-chip">Lease ID #{current.leaseId}</span>
                                        <span className="info-chip">Property ID #{current.propertyId}</span>
                                    </div>
                                </div>

                                {current.propertyDescription && (
                                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                                        {current.propertyDescription}
                                    </p>
                                )}

                                {/* Key Terms Grid */}
                                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "16px" }}>
                                    <div className="stat-card" style={{ padding: "16px" }}>
                                        <span className="stat-label">Monthly Rent</span>
                                        <h4 className="stat-value" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
                                            ₹{Number(current.monthlyRent || 0).toLocaleString("en-IN")}
                                        </h4>
                                        <span className="stat-footer-text">Due on Day {current.rentDueDay} of month</span>
                                    </div>

                                    <div className="stat-card" style={{ padding: "16px" }}>
                                        <span className="stat-label">Security Deposit</span>
                                        <h4 className="stat-value" style={{ fontSize: "18px", color: "var(--purple)" }}>
                                            ₹{Number(current.securityDeposit || 0).toLocaleString("en-IN")}
                                        </h4>
                                        <span className="stat-footer-text">Refundable upon exit</span>
                                    </div>

                                    <div className="stat-card" style={{ padding: "16px" }}>
                                        <span className="stat-label">Current Rent Status</span>
                                        <div style={{ marginTop: "4px" }}>
                                            <span className={`status-pill ${getRentStatusColor(current.rentStatus)}`} style={{ fontSize: "13px" }}>
                                                {current.rentStatus || "DUE"}
                                            </span>
                                        </div>
                                        <span className="stat-footer-text">Current month verification</span>
                                    </div>

                                    <div className="stat-card" style={{ padding: "16px" }}>
                                        <span className="stat-label">Total Rent Paid</span>
                                        <h4 className="stat-value" style={{ fontSize: "18px", color: "var(--success)" }}>
                                            ₹{Number(current.totalRentPaid || 0).toLocaleString("en-IN")}
                                        </h4>
                                        <span className="stat-footer-text">Lifetime payments for lease</span>
                                    </div>
                                </div>

                                {/* Lease Timeline */}
                                <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <Calendar size={18} color="var(--primary)" />
                                        <div>
                                            <strong>Lease Duration:</strong> {current.leaseStartDate} → {current.leaseEndDate}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                        Contract Created: {current.createdAt ? new Date(current.createdAt).toLocaleDateString() : "N/A"}
                                    </div>
                                </div>

                                {/* Landlord Contact Information */}
                                <div style={{ background: "rgba(30, 41, 59, 0.5)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-card)" }}>
                                    <h4 style={{ fontSize: "14px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <User size={16} color="var(--info)" />
                                        <span>Property Owner / Landlord Contact</span>
                                    </h4>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "13px" }}>
                                        <div>
                                            <span style={{ color: "var(--text-muted)" }}>Owner Name:</span>{" "}
                                            <strong>{current.ownerName || "Property Landlord"}</strong> (ID #{current.ownerId || "N/A"})
                                        </div>
                                        {current.ownerEmail && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Mail size={14} color="var(--text-muted)" />
                                                <span>{current.ownerEmail}</span>
                                            </div>
                                        )}
                                        {current.ownerPhoneNumber && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Phone size={14} color="var(--text-muted)" />
                                                <span>{current.ownerPhoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={onNavigateToPayments}
                                    >
                                        <CreditCard size={16} />
                                        <span>Pay Rent Online</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onNavigateToMaintenance}
                                    >
                                        <Wrench size={16} />
                                        <span>Request Maintenance ({current.openMaintenanceRequestsCount || 0} Open)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Previous Leases View */}
            {tab === "history" && (
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Previous Tenancy Contracts ({previous.length})</h3>
                            <p>Archive of expired and terminated tenancy agreements</p>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Lease ID</th>
                                    <th>Property</th>
                                    <th>Duration</th>
                                    <th>Monthly Rent</th>
                                    <th>Deposit</th>
                                    <th>Owner</th>
                                    <th>Total Paid</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previous.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="empty-state">
                                            <Clock size={36} className="empty-state-icon" />
                                            <p>No previous lease records in history.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    previous.map((item) => (
                                        <tr key={`prev-lease-${item.leaseId}`}>
                                            <td><strong>#{item.leaseId}</strong></td>
                                            <td>
                                                <div><strong>{item.propertyName || `Property #${item.propertyId}`}</strong></div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                    {item.propertyCity}, {item.propertyState}
                                                </div>
                                            </td>
                                            <td>{item.leaseStartDate} → {item.leaseEndDate}</td>
                                            <td>₹{Number(item.monthlyRent).toLocaleString("en-IN")}</td>
                                            <td>₹{Number(item.securityDeposit).toLocaleString("en-IN")}</td>
                                            <td>{item.ownerName || `Owner #${item.ownerId}`}</td>
                                            <td>₹{Number(item.totalRentPaid || 0).toLocaleString("en-IN")}</td>
                                            <td>
                                                <span className={`status-pill ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TenantLeaseView;
