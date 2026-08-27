import { useState, useEffect, type FormEvent } from "react";
import {
    KeyRound,
    Plus,
    Trash2,
    Calendar,
    User,
    X,
    Sparkles,
    CreditCard
} from "lucide-react";
import type { CreateLeaseRequest, LeaseResponse, PropertyResponse } from "../../types/api";
import { createLease, terminateLease } from "../../api/leaseApi";
import { getApiErrorMessage } from "../../api/error";

interface LeasesViewProps {
    leases: LeaseResponse[];
    properties: PropertyResponse[];
    preSelectedPropertyId?: number | null;
    isOwnerMode: boolean;
    onClearPreSelectedProperty?: () => void;
    onNavigateToPayments?: () => void;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

function getDefaultDates() {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split("T")[0];
    return { todayStr, nextYearStr };
}

export function LeasesView({
    leases,
    properties,
    preSelectedPropertyId,
    isOwnerMode,
    onClearPreSelectedProperty,
    onNavigateToPayments,
    onRefresh,
    onSetAlert,
    onSetError,
}: LeasesViewProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Automatically open create modal if preSelectedPropertyId is passed!
    useEffect(() => {
        if (preSelectedPropertyId) {
            const match = properties.find((p) => p.id === preSelectedPropertyId);
            if (match) {
                setForm((prev) => ({
                    ...prev,
                    propertyId: match.id,
                    monthlyRent: match.rentAmount,
                    securityDeposit: match.securityDeposit,
                }));
                setIsCreating(true);
            }
        }
    }, [preSelectedPropertyId, properties]);

    const [form, setForm] = useState<CreateLeaseRequest>(() => {
        const { todayStr, nextYearStr } = getDefaultDates();
        const firstAvailable = properties.find((p) => p.status === "AVAILABLE") || properties[0];
        return {
            propertyId: firstAvailable ? firstAvailable.id : 1,
            tenantId: 2,
            leaseStartDate: todayStr,
            leaseEndDate: nextYearStr,
            monthlyRent: firstAvailable ? firstAvailable.rentAmount : 18000,
            securityDeposit: firstAvailable ? firstAvailable.securityDeposit : 36000,
            rentDueDay: 5,
        };
    });

    const [saving, setSaving] = useState(false);
    const [terminatingId, setTerminatingId] = useState<number | null>(null);

    const handlePropertySelect = (propertyId: number) => {
        const p = properties.find((item) => item.id === propertyId);
        setForm((prev) => ({
            ...prev,
            propertyId,
            monthlyRent: p ? p.rentAmount : prev.monthlyRent,
            securityDeposit: p ? p.securityDeposit : prev.securityDeposit,
        }));
    };

    const handleCreateLease = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const created = await createLease({
                ...form,
                propertyId: Number(form.propertyId),
                tenantId: Number(form.tenantId),
                monthlyRent: Number(form.monthlyRent),
                securityDeposit: Number(form.securityDeposit),
                rentDueDay: Number(form.rentDueDay),
            });

            onSetAlert(`Lease contract for "${created.propertyName}" created & activated successfully!`);
            setIsCreating(false);
            if (onClearPreSelectedProperty) onClearPreSelectedProperty();
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Failed to create lease contract. Make sure the property is available and the tenant user ID is valid."));
        } finally {
            setSaving(false);
        }
    };

    const handleTerminate = async (leaseId: number, propName: string) => {
        if (!window.confirm(`Are you sure you want to terminate the lease for "${propName}"? The property will be marked as AVAILABLE for new tenants.`)) {
            return;
        }

        setTerminatingId(leaseId);
        onSetError("");
        onSetAlert("");

        try {
            const res = await terminateLease(leaseId);
            onSetAlert(res?.message || `Lease terminated successfully.`);
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Could not terminate lease."));
        } finally {
            setTerminatingId(null);
        }
    };

    const filteredLeases = statusFilter === "ALL"
        ? leases
        : leases.filter((l) => l.status === statusFilter);

    const activeCount = leases.filter((l) => l.status === "ACTIVE").length;
    const availableProperties = properties.filter((p) => p.status === "AVAILABLE");

    return (
        <div className="panel-grid-stack">
            {/* Header Card */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Lease Agreement Contracts</h3>
                        <p>{isOwnerMode ? "Create, track, and manage active tenant contracts" : "Your active and archived tenancy agreements"}</p>
                    </div>

                    {isOwnerMode && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setIsCreating(true);
                            }}
                        >
                            <Plus size={16} />
                            <span>Create New Lease</span>
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "ALL" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("ALL")}
                    >
                        All Contracts ({leases.length})
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "ACTIVE" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("ACTIVE")}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${statusFilter === "TERMINATED" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setStatusFilter("TERMINATED")}
                    >
                        Terminated / Ended
                    </button>
                </div>
            </div>

            {/* Leases Grid List */}
            {filteredLeases.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <KeyRound size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "18px", marginTop: "8px" }}>No Lease Contracts Found</h3>
                        <p style={{ maxWidth: "420px", margin: "6px auto 0" }}>
                            {isOwnerMode
                                ? "You have no contracts under this filter. Click 'Create New Lease' to assign a tenant to an available property."
                                : "No lease agreements found."}
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
                    {filteredLeases.map((lease) => (
                        <div key={`lease-${lease.id}`} className="rented-property-card">
                            {/* Card Header */}
                            <div className="rented-card-header">
                                <div>
                                    <h4 className="rented-prop-name">{lease.propertyName || `Property #${lease.propertyId}`}</h4>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                                        <Calendar size={13} />
                                        <span>{lease.leaseStartDate} → {lease.leaseEndDate}</span>
                                    </div>
                                </div>

                                <span className={`status-pill ${lease.status.toLowerCase()}`}>
                                    {lease.status}
                                </span>
                            </div>

                            {/* Tenant Detail */}
                            <div className="rented-tenant-section">
                                <div className="section-mini-title">Assigned Tenant</div>
                                <div className="tenant-name-row">
                                    <User size={15} className="tenant-icon" />
                                    <strong>{lease.tenantName || `Tenant ID #${lease.tenantId}`}</strong>
                                </div>
                            </div>

                            {/* Terms Grid */}
                            <div className="rented-financials-grid">
                                <div className="fin-item">
                                    <span className="fin-label">Monthly Rent</span>
                                    <span className="fin-val">
                                        ₹{Number(lease.monthlyRent).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Security Deposit</span>
                                    <span className="fin-val" style={{ color: "var(--purple)" }}>
                                        ₹{Number(lease.securityDeposit).toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Rent Due Day</span>
                                    <span className="fin-val">
                                        Day {lease.rentDueDay} of month
                                    </span>
                                </div>
                                <div className="fin-item">
                                    <span className="fin-label">Contract Status</span>
                                    <span className="fin-val" style={{ fontSize: "13px" }}>
                                        {lease.status}
                                    </span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="rented-card-footer" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                {onNavigateToPayments && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={onNavigateToPayments}
                                    >
                                        <CreditCard size={13} />
                                        <span>View Payments</span>
                                    </button>
                                )}

                                {isOwnerMode && lease.status === "ACTIVE" && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        disabled={terminatingId === lease.id}
                                        onClick={() => handleTerminate(lease.id, lease.propertyName)}
                                    >
                                        <Trash2 size={13} />
                                        <span>{terminatingId === lease.id ? "Terminating..." : "Terminate Lease"}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Lease Modal (Zero ID Guesswork!) */}
            {isCreating && isOwnerMode && (
                <div className="modal-backdrop" onClick={() => {
                    setIsCreating(false);
                    if (onClearPreSelectedProperty) onClearPreSelectedProperty();
                }}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: "18px" }}>Create & Activate Lease</h3>
                                <span className="modal-subtitle">Assign a tenant and generate a binding rental contract</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => {
                                    setIsCreating(false);
                                    if (onClearPreSelectedProperty) onClearPreSelectedProperty();
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLease}>
                            <div className="modal-body form-grid two-col">
                                {/* Property Dropdown Selector */}
                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="lease-prop">Select Property *</label>
                                    {properties.length > 0 ? (
                                        <select
                                            id="lease-prop"
                                            className="form-select"
                                            value={form.propertyId}
                                            onChange={(e) => handlePropertySelect(Number(e.target.value))}
                                            required
                                        >
                                            {availableProperties.length > 0 ? (
                                                <optgroup label="Available Properties (Recommended)">
                                                    {availableProperties.map((p) => (
                                                        <option key={`opt-${p.id}`} value={p.id}>
                                                            {p.propertyName} — ₹{Number(p.rentAmount).toLocaleString("en-IN")}/mo ({p.city})
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ) : null}

                                            <optgroup label="All Properties in Portfolio">
                                                {properties.map((p) => (
                                                    <option key={`opt-all-${p.id}`} value={p.id}>
                                                        {p.propertyName} ({p.status}) — ₹{Number(p.rentAmount).toLocaleString("en-IN")}/mo
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    ) : (
                                        <div style={{ color: "var(--warning)", fontSize: "13px" }}>
                                            No properties registered. Please create a property first.
                                        </div>
                                    )}
                                </div>

                                {/* Tenant User ID with Quick Chips */}
                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="lease-tenant">Tenant Account User ID *</label>
                                    <input
                                        id="lease-tenant"
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        placeholder="Registered Tenant User ID (e.g. 2)"
                                        value={form.tenantId}
                                        onChange={(e) => setForm({ ...form, tenantId: Number(e.target.value) })}
                                        required
                                    />
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                                        Enter the registered tenant's user ID (defaults to 2 for testing).
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="lease-start">Start Date *</label>
                                    <input
                                        id="lease-start"
                                        type="date"
                                        className="form-input"
                                        value={form.leaseStartDate}
                                        onChange={(e) => setForm({ ...form, leaseStartDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="lease-end">End Date *</label>
                                    <input
                                        id="lease-end"
                                        type="date"
                                        className="form-input"
                                        value={form.leaseEndDate}
                                        onChange={(e) => setForm({ ...form, leaseEndDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="lease-rent">Monthly Rent (₹) *</label>
                                    <input
                                        id="lease-rent"
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        value={form.monthlyRent}
                                        onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="lease-deposit">Security Deposit (₹) *</label>
                                    <input
                                        id="lease-deposit"
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        value={form.securityDeposit}
                                        onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="lease-due">Rent Due Day of Month *</label>
                                    <select
                                        id="lease-due"
                                        className="form-select"
                                        value={form.rentDueDay}
                                        onChange={(e) => setForm({ ...form, rentDueDay: Number(e.target.value) })}
                                    >
                                        {[1, 5, 10, 15, 20, 25, 28, 30].map((day) => (
                                            <option key={day} value={day}>
                                                Day {day} of every month
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setIsCreating(false);
                                        if (onClearPreSelectedProperty) onClearPreSelectedProperty();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    <Sparkles size={16} />
                                    <span>{saving ? "Generating Contract..." : "Activate Lease Contract"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeasesView;
