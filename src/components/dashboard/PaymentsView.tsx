import { useState, type FormEvent } from "react";
import {
    CreditCard,
    Search,
    Send,
    X,
    Filter
} from "lucide-react";
import type {
    CreatePaymentRequest,
    PaymentMethod,
    PaymentResponse,
    RentStatusResponse,
    LeaseResponse
} from "../../types/api";
import { createPayment, getLeaseRentStatus } from "../../api/paymentApi";
import { getApiErrorMessage } from "../../api/error";

const paymentMethods: PaymentMethod[] = ["UPI", "CARD", "BANK_TRANSFER", "CASH"];

interface PaymentsViewProps {
    payments: PaymentResponse[];
    leases?: LeaseResponse[];
    activeLeaseId?: number | null;
    defaultMonthlyRent?: number;
    propertyName?: string;
    isOwnerMode: boolean;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

function generateTxnRef() {
    return `UPI-${Date.now().toString().slice(-6)}`;
}

export function PaymentsView({
    payments,
    leases = [],
    activeLeaseId,
    defaultMonthlyRent = 15000,
    propertyName,
    isOwnerMode,
    onRefresh,
    onSetAlert,
    onSetError,
}: PaymentsViewProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedFilterLease, setSelectedFilterLease] = useState<string>("ALL");

    const [form, setForm] = useState<CreatePaymentRequest>(() => {
        const todayStr = new Date().toISOString().split("T")[0];
        return {
            leaseId: activeLeaseId || (leases.length > 0 ? leases[0].id : 1),
            amount: defaultMonthlyRent,
            paymentDate: todayStr,
            dueDate: todayStr,
            paymentMethod: "UPI",
            transactionReference: generateTxnRef(),
        };
    });

    const [saving, setSaving] = useState(false);

    // Live Status Checker state
    const [statusLeaseId, setStatusLeaseId] = useState<number>(() => {
        return activeLeaseId || (leases.length > 0 ? leases[0].id : 1);
    });
    const [rentStatus, setRentStatus] = useState<RentStatusResponse | null>(null);
    const [statusBusy, setStatusBusy] = useState(false);

    const handleCreatePayment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const created = await createPayment({
                ...form,
                leaseId: Number(form.leaseId),
                amount: Number(form.amount),
            });

            onSetAlert(`Payment of ₹${Number(created.amount).toLocaleString("en-IN")} recorded successfully! Receipt #${created.id}.`);
            setIsCreating(false);
            setForm((prev) => ({
                ...prev,
                transactionReference: generateTxnRef(),
            }));
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Failed to record payment. Verify that your lease is currently active."));
        } finally {
            setSaving(false);
        }
    };

    const handleCheckRentStatus = async (leaseIdToCheck: number) => {
        setStatusBusy(true);
        onSetError("");
        setRentStatus(null);

        try {
            const res = await getLeaseRentStatus(leaseIdToCheck);
            setRentStatus(res);
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Could not check rent status for selected lease."));
        } finally {
            setStatusBusy(false);
        }
    };

    const totalCollected = payments
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const filteredPayments = selectedFilterLease === "ALL"
        ? payments
        : payments.filter((p) => String(p.leaseId) === selectedFilterLease);

    return (
        <div className="panel-grid-stack">
            {/* Top Collections / Receipts Header */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>{isOwnerMode ? "Rent Collections & Financials" : "My Rent Payments & Receipts"}</h3>
                        <p>{isOwnerMode ? "Complete log of verified rental collections across all properties" : "Pay monthly rent online and view official transaction receipts"}</p>
                    </div>

                    {!isOwnerMode && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                setForm((prev) => ({
                                    ...prev,
                                    leaseId: activeLeaseId || prev.leaseId,
                                    amount: defaultMonthlyRent,
                                    transactionReference: generateTxnRef(),
                                }));
                                setIsCreating(true);
                            }}
                        >
                            <CreditCard size={16} />
                            <span>Pay Rent Online</span>
                        </button>
                    )}
                </div>

                {/* Summary KPI Cards */}
                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginTop: "12px" }}>
                    <div className="stat-card" style={{ padding: "16px" }}>
                        <span className="stat-label">{isOwnerMode ? "Total Revenue Collected" : "Total Rent Paid"}</span>
                        <h4 className="stat-value" style={{ fontSize: "22px", color: "var(--success)" }}>
                            ₹{totalCollected.toLocaleString("en-IN")}
                        </h4>
                        <span className="stat-footer-text">
                            {payments.filter((p) => p.status === "PAID").length} verified payments
                        </span>
                    </div>

                    <div className="stat-card" style={{ padding: "16px" }}>
                        <span className="stat-label">Total Transactions</span>
                        <h4 className="stat-value" style={{ fontSize: "22px" }}>
                            {payments.length}
                        </h4>
                        <span className="stat-footer-text">Completed & recorded</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            {leases.length > 0 && (
                <div className="card-panel" style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Filter size={16} color="var(--primary)" />
                            <span style={{ fontSize: "13px", fontWeight: 600 }}>Filter by Property:</span>
                            <select
                                className="form-select"
                                style={{ padding: "6px 28px 6px 10px", fontSize: "13px", maxWidth: "280px" }}
                                value={selectedFilterLease}
                                onChange={(e) => setSelectedFilterLease(e.target.value)}
                            >
                                <option value="ALL">All Properties ({payments.length} payments)</option>
                                {leases.map((l) => (
                                    <option key={`opt-l-${l.id}`} value={String(l.id)}>
                                        {l.propertyName} ({l.tenantName})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Payments Ledger Table */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Transaction History ({filteredPayments.length})</h3>
                        <p>Complete record of rent payments</p>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Receipt #</th>
                                <th>Contract / Property</th>
                                <th>Amount Paid</th>
                                <th>Method</th>
                                <th>UTR / Reference</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">
                                        <CreditCard size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                                        <p style={{ marginTop: "8px" }}>No payment records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((p) => {
                                    const linkedLease = leases.find((l) => l.id === p.leaseId);
                                    return (
                                        <tr key={`payment-${p.id}`}>
                                            <td><strong>#{p.id}</strong></td>
                                            <td>
                                                <div><strong>{linkedLease?.propertyName || propertyName || `Contract #${p.leaseId}`}</strong></div>
                                                {linkedLease?.tenantName && (
                                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                        Tenant: {linkedLease.tenantName}
                                                    </div>
                                                )}
                                            </td>
                                            <td><strong>₹{Number(p.amount).toLocaleString("en-IN")}</strong></td>
                                            <td><span className="info-chip">{p.paymentMethod}</span></td>
                                            <td>
                                                <code style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                                    {p.transactionReference || "N/A"}
                                                </code>
                                            </td>
                                            <td>{p.paymentDate}</td>
                                            <td>
                                                <span className={`status-pill ${p.status.toLowerCase()}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Live Rent Status Checker with Property Dropdown */}
            {leases.length > 0 && (
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Live Monthly Rent Status Tracker</h3>
                            <p>Instantly check whether current month rent is settled or pending for a property</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <select
                            className="form-select"
                            style={{ maxWidth: "340px" }}
                            value={statusLeaseId}
                            onChange={(e) => setStatusLeaseId(Number(e.target.value))}
                        >
                            {leases.map((l) => (
                                <option key={`stat-l-${l.id}`} value={l.id}>
                                    {l.propertyName} — {l.tenantName} (Due Day {l.rentDueDay})
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={statusBusy}
                            onClick={() => handleCheckRentStatus(statusLeaseId)}
                        >
                            <Search size={15} />
                            <span>{statusBusy ? "Checking..." : "Verify Rent Status"}</span>
                        </button>
                    </div>

                    {rentStatus && (
                        <div className="result-card" style={{ marginTop: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <h4>Rent Status: {rentStatus.status}</h4>
                                <span className={`status-pill ${rentStatus.status.toLowerCase()}`}>
                                    {rentStatus.status}
                                </span>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                Monthly Rent: <strong>₹{Number(rentStatus.monthlyRent).toLocaleString("en-IN")}</strong> • Due Day: <strong>Day {rentStatus.rentDueDay} of month</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pay Rent Modal */}
            {isCreating && !isOwnerMode && (
                <div className="modal-backdrop" onClick={() => setIsCreating(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: "18px" }}>Pay Monthly Rent</h3>
                                <span className="modal-subtitle">Direct rent transfer to landlord</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsCreating(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePayment}>
                            <div className="modal-body form-grid two-col">
                                <div className="form-group full-width">
                                    <label className="form-label">Rental Contract</label>
                                    <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                        <strong>{propertyName || "Active Rental Home"}</strong>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-amt">Rent Amount (₹) *</label>
                                    <input
                                        id="pay-amt"
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-method">Payment Method *</label>
                                    <select
                                        id="pay-method"
                                        className="form-select"
                                        value={form.paymentMethod}
                                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                                        required
                                    >
                                        {paymentMethods.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-dt">Payment Date *</label>
                                    <input
                                        id="pay-dt"
                                        type="date"
                                        className="form-input"
                                        value={form.paymentDate}
                                        onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-ref">Transaction Reference / UTR</label>
                                    <input
                                        id="pay-ref"
                                        className="form-input"
                                        placeholder="e.g. UPI-987654"
                                        value={form.transactionReference || ""}
                                        onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
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
                                    <span>{saving ? "Submitting..." : `Submit Payment of ₹${Number(form.amount).toLocaleString("en-IN")}`}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentsView;
