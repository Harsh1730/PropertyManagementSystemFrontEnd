import { useState, type FormEvent } from "react";
import {
    Wrench,
    Send,
    Plus,
    X
} from "lucide-react";
import type { CreateMaintenanceRequest, MaintenanceResponse, MaintenanceStatus, PropertyResponse } from "../../types/api";
import { createMaintenanceRequest, updateMaintenanceStatus } from "../../api/maintenanceApi";
import { getApiErrorMessage } from "../../api/error";

const statusOptions: MaintenanceStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

interface MaintenanceViewProps {
    maintenance: MaintenanceResponse[];
    properties?: PropertyResponse[];
    activePropertyId?: number | null;
    activePropertyName?: string;
    isOwnerMode: boolean;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function MaintenanceView({
    maintenance,
    properties = [],
    activePropertyId,
    activePropertyName,
    isOwnerMode,
    onRefresh,
    onSetAlert,
    onSetError,
}: MaintenanceViewProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const [form, setForm] = useState<CreateMaintenanceRequest>(() => ({
        propertyId: activePropertyId || 1,
        title: "",
        description: "",
    }));

    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const created = await createMaintenanceRequest({
                ...form,
                propertyId: Number(activePropertyId || form.propertyId),
            });

            onSetAlert(`Maintenance ticket #${created.id} ("${created.title}") filed successfully!`);
            setIsCreating(false);
            setForm({
                propertyId: activePropertyId || 1,
                title: "",
                description: "",
            });
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Failed to submit maintenance request. Verify you are the occupying tenant of an active lease."));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (requestId: number, newStatus: MaintenanceStatus) => {
        setUpdatingId(requestId);
        onSetError("");
        onSetAlert("");

        try {
            const updated = await updateMaintenanceStatus(requestId, newStatus);
            onSetAlert(`Ticket #${updated.id} status updated to ${updated.status}.`);
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, `Could not update ticket.`));
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredList = statusFilter === "ALL"
        ? maintenance
        : maintenance.filter((m) => m.status === statusFilter);

    const countOpen = maintenance.filter((m) => m.status === "OPEN").length;
    const countInProgress = maintenance.filter((m) => m.status === "IN_PROGRESS").length;
    const countResolved = maintenance.filter((m) => m.status === "RESOLVED").length;

    return (
        <div className="panel-grid-stack">
            {/* Header & Quick Action */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Maintenance & Repair Tickets</h3>
                        <p>{isOwnerMode ? "Manage repair requests filed across your rental portfolio" : "Report property repair issues and track real-time resolution"}</p>
                    </div>

                    {!isOwnerMode && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus size={16} />
                            <span>Report Repair Issue</span>
                        </button>
                    )}
                </div>

                {/* Status Stats Grid */}
                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginTop: "12px" }}>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("ALL")}>
                        <span className="stat-label">Total Tickets</span>
                        <h4 className="stat-value" style={{ fontSize: "20px" }}>{maintenance.length}</h4>
                    </div>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("OPEN")}>
                        <span className="stat-label">Open / New</span>
                        <h4 className="stat-value" style={{ fontSize: "20px", color: "var(--warning)" }}>{countOpen}</h4>
                    </div>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("IN_PROGRESS")}>
                        <span className="stat-label">In Progress</span>
                        <h4 className="stat-value" style={{ fontSize: "20px", color: "var(--info)" }}>{countInProgress}</h4>
                    </div>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("RESOLVED")}>
                        <span className="stat-label">Resolved</span>
                        <h4 className="stat-value" style={{ fontSize: "20px", color: "var(--success)" }}>{countResolved}</h4>
                    </div>
                </div>
            </div>

            {/* Maintenance Tickets List */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Tickets Queue ({filteredList.length})</h3>
                        <p>{isOwnerMode ? "Tickets requiring review and assignment" : "Your submitted issues"}</p>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {["ALL", ...statusOptions].map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                className={`btn btn-sm ${statusFilter === opt ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => setStatusFilter(opt)}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ticket #</th>
                                <th>Property</th>
                                <th>Issue Summary</th>
                                <th>Description</th>
                                <th>Current Status</th>
                                {isOwnerMode && <th>Update Status</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={isOwnerMode ? 6 : 5} className="empty-state">
                                        <Wrench size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                                        <p style={{ marginTop: "8px" }}>No maintenance tickets found for filter "{statusFilter}".</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((ticket) => {
                                    const linkedProp = properties.find((p) => p.id === ticket.propertyId);
                                    return (
                                        <tr key={`ticket-${ticket.id}`}>
                                            <td><strong>#{ticket.id}</strong></td>
                                            <td>
                                                <strong>{linkedProp?.propertyName || activePropertyName || `Property #${ticket.propertyId}`}</strong>
                                            </td>
                                            <td><strong>{ticket.title}</strong></td>
                                            <td>
                                                <div style={{ maxWidth: "340px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                                    {ticket.description}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${ticket.status.toLowerCase()}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            {isOwnerMode && (
                                                <td>
                                                    <select
                                                        className="form-select"
                                                        style={{ padding: "6px 28px 6px 10px", fontSize: "12px", width: "auto" }}
                                                        value={ticket.status}
                                                        disabled={updatingId === ticket.id}
                                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value as MaintenanceStatus)}
                                                    >
                                                        {statusOptions.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* File Maintenance Ticket Modal */}
            {isCreating && !isOwnerMode && (
                <div className="modal-backdrop" onClick={() => setIsCreating(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: "18px" }}>Report a Maintenance Issue</h3>
                                <span className="modal-subtitle">Submitting ticket to your landlord</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsCreating(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="modal-body form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Rental Home</label>
                                    <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                        <strong>{activePropertyName || "Active Rental Property"}</strong>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="maint-title-input">What needs repair? *</label>
                                    <input
                                        id="maint-title-input"
                                        className="form-input"
                                        placeholder="e.g. Water heater not working, Broken door lock"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="maint-desc-input">Detailed Description *</label>
                                    <textarea
                                        id="maint-desc-input"
                                        className="form-textarea"
                                        placeholder="Please describe where the issue is located, when it started, and any other relevant details..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        required
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    <Send size={15} />
                                    <span>{saving ? "Submitting..." : "Submit Maintenance Ticket"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MaintenanceView;
