import { useState } from "react";
import {
    Home,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Wrench,
    Copy,
    Check,
    Search
} from "lucide-react";
import type { OwnerRentedPropertyResponse } from "../../types/api";

interface RentedPropertiesViewProps {
    rentedProperties: OwnerRentedPropertyResponse[];
    onNavigateToLeases: () => void;
    onNavigateToMaintenance: () => void;
}

export function RentedPropertiesView({
    rentedProperties,
    onNavigateToLeases,
    onNavigateToMaintenance,
}: RentedPropertiesViewProps) {
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1800);
    };

    const filtered = rentedProperties.filter((item) => {
        const query = search.toLowerCase();
        return (
            item.propertyName?.toLowerCase().includes(query) ||
            item.tenantName?.toLowerCase().includes(query) ||
            item.tenantEmail?.toLowerCase().includes(query) ||
            item.city?.toLowerCase().includes(query) ||
            String(item.propertyId).includes(query) ||
            (item.leaseId && String(item.leaseId).includes(query))
        );
    });

    const getRentStatusClass = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "PAID": return "paid";
            case "DUE": return "pending";
            case "OVERDUE": return "failed";
            default: return "pending";
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Header Card */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Rented Units & Tenancy Directory</h3>
                        <p>Occupied properties, active leases, tenant contact details, and rental health</p>
                    </div>

                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Search property, tenant, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid of Rented Property Cards */}
            {filtered.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Home size={40} className="empty-state-icon" />
                        <h3>No Rented Properties Found</h3>
                        <p style={{ marginTop: "6px" }}>
                            {search
                                ? "No occupied properties match your search criteria."
                                : "You do not have any properties with active leases currently."}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "20px" }}>
                    {filtered.map((item) => (
                        <div key={`rented-prop-${item.propertyId}`} className="rented-property-card">
                            {/* Card Header */}
                            <div className="rented-card-header">
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <h4 className="rented-prop-name">{item.propertyName}</h4>
                                        <span className="type-badge">{item.propertyType}</span>
                                    </div>
                                    <div className="rented-prop-location">
                                        <MapPin size={13} />
                                        <span>{item.address}, {item.city}, {item.state}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="copy-id-btn"
                                    onClick={() => handleCopy(String(item.propertyId), `prop-${item.propertyId}`)}
                                    title="Copy Property ID"
                                >
                                    {copiedId === `prop-${item.propertyId}` ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                                    <span>ID #{item.propertyId}</span>
                                </button>
                            </div>

                            {/* Tenant Section */}
                            <div className="rented-tenant-section">
                                <div className="section-mini-title">Active Tenant</div>
                                {item.tenantName ? (
                                    <div className="tenant-detail-box">
                                        <div className="tenant-name-row">
                                            <User size={15} className="tenant-icon" />
                                            <strong>{item.tenantName}</strong>
                                            <span className="tenant-id-pill">ID #{item.tenantId}</span>
                                        </div>
                                        {item.tenantEmail && (
                                            <div className="tenant-contact-row">
                                                <Mail size={13} />
                                                <span>{item.tenantEmail}</span>
                                            </div>
                                        )}
                                        {item.tenantPhoneNumber && (
                                            <div className="tenant-contact-row">
                                                <Phone size={13} />
                                                <span>{item.tenantPhoneNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "8px 0" }}>
                                        No tenant profile linked
                                    </div>
                                )}
                            </div>

                            {/* Lease & Financials Row */}
                            <div className="rented-financials-grid">
                                <div className="fin-item">
                                    <span className="fin-label">Monthly Rent</span>
                                    <span className="fin-val">
                                        ₹{Number(item.monthlyRent || item.propertyRentAmount || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Current Rent Status</span>
                                    <span className={`status-pill ${getRentStatusClass(item.rentStatus)}`}>
                                        {item.rentStatus || "N/A"}
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Total Collected</span>
                                    <span className="fin-val" style={{ color: "var(--success)" }}>
                                        ₹{Number(item.totalRentCollected || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Open Tickets</span>
                                    <span className={`fin-val ${(item.openMaintenanceRequestsCount || 0) > 0 ? "warning-text" : ""}`}>
                                        {item.openMaintenanceRequestsCount || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Card Footer / Lease Timeline */}
                            <div className="rented-card-footer">
                                {item.leaseId ? (
                                    <div className="lease-info-row">
                                        <Calendar size={13} />
                                        <span>
                                            Lease #{item.leaseId}: {item.leaseStartDate || "N/A"} → {item.leaseEndDate || "N/A"} (Due Day {item.rentDueDay || "N/A"})
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No lease contract active</span>
                                )}

                                <div className="action-buttons-row">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={onNavigateToLeases}
                                    >
                                        Manage Lease
                                    </button>
                                    {(item.openMaintenanceRequestsCount || 0) > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={onNavigateToMaintenance}
                                        >
                                            <Wrench size={12} />
                                            <span>{item.openMaintenanceRequestsCount} Tickets</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RentedPropertiesView;
