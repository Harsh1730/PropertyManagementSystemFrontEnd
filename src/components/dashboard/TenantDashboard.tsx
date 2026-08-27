import { useState } from "react";
import {
    Home,
    MapPin,
    User,
    Mail,
    Phone,
    IndianRupee,
    CreditCard,
    Wrench,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Send,
    Sparkles,
    ShieldCheck,
    X
} from "lucide-react";
import type { TenantDashboardResponse } from "../../types/dashboard";
import type {
    PaymentResponse,
    MaintenanceResponse,
    TenantLeaseDetailResponse,
    CreatePaymentRequest,
    CreateMaintenanceRequest,
    PaymentMethod
} from "../../types/api";
import { createPayment } from "../../api/paymentApi";
import { createMaintenanceRequest } from "../../api/maintenanceApi";
import { getApiErrorMessage } from "../../api/error";
import { StatCard } from "./StatCard";
import type { DashboardSection } from "./Sidebar";

const paymentMethods: PaymentMethod[] = ["UPI", "CARD", "BANK_TRANSFER", "CASH"];

interface TenantDashboardProps {
    data: TenantDashboardResponse;
    currentLease?: TenantLeaseDetailResponse | null;
    payments: PaymentResponse[];
    maintenance: MaintenanceResponse[];
    onNavigate: (section: DashboardSection) => void;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function TenantDashboard({
    data,
    currentLease,
    payments,
    maintenance,
    onNavigate,
    onRefresh,
    onSetAlert,
    onSetError,
}: TenantDashboardProps) {
    // Quick Modals state
    const [showPayModal, setShowPayModal] = useState(false);
    const [showMaintModal, setShowMaintModal] = useState(false);

    // Payment Form state
    const [payMethod, setPayMethod] = useState<PaymentMethod>("UPI");
    const [payAmount, setPayAmount] = useState<number>(() => data.monthlyRent || currentLease?.monthlyRent || 15000);
    const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [payRef, setPayRef] = useState<string>(() => `UPI-${Date.now().toString().slice(-6)}`);
    const [paySaving, setPaySaving] = useState(false);

    // Maintenance Form state
    const [maintTitle, setMaintTitle] = useState("");
    const [maintDesc, setMaintDesc] = useState("");
    const [maintSaving, setMaintSaving] = useState(false);

    const activeLeaseId = data.activeLeaseId || currentLease?.leaseId;
    const propertyId = data.propertyId || currentLease?.propertyId;
    const propertyName = data.propertyName || currentLease?.propertyName || "Your Rental Home";
    const propertyAddress = data.propertyAddress || currentLease?.propertyAddress;
    const monthlyRent = data.monthlyRent || currentLease?.monthlyRent || 0;
    const rentDueDay = data.rentDueDay || currentLease?.rentDueDay || 5;
    const rentStatus = (data.rentStatus || currentLease?.rentStatus || "DUE").toUpperCase();

    const recentPayments = payments.slice(0, 5);
    const openTickets = maintenance.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS");

    const getRentStatusBadge = (status: string) => {
        switch (status) {
            case "PAID":
                return { label: "Rent Paid", class: "paid", icon: CheckCircle2, text: "Current month rent settled" };
            case "DUE":
                return { label: "Rent Due", class: "due", icon: Clock, text: `Due by Day ${rentDueDay} of this month` };
            case "OVERDUE":
                return { label: "Rent Overdue", class: "failed", icon: AlertCircle, text: "Action required: Payment overdue" };
            default:
                return { label: status, class: "due", icon: Clock, text: "Pending verification" };
        }
    };

    const rentBadge = getRentStatusBadge(rentStatus);
    const RentIcon = rentBadge.icon;

    // Handle One-Click Rent Payment
    const handleQuickPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLeaseId) {
            onSetError("No active lease found to pay for.");
            return;
        }

        setPaySaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const payload: CreatePaymentRequest = {
                leaseId: activeLeaseId,
                amount: Number(payAmount),
                paymentDate: payDate,
                dueDate: payDate,
                paymentMethod: payMethod,
                transactionReference: payRef || `PAY-${Date.now().toString().slice(-6)}`,
            };

            const created = await createPayment(payload);
            onSetAlert(`Payment of ₹${Number(created.amount).toLocaleString("en-IN")} processed successfully! (Receipt #${created.id})`);
            setShowPayModal(false);
            onRefresh();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to submit payment. Please verify your lease is active."));
        } finally {
            setPaySaving(false);
        }
    };

    // Handle One-Click Maintenance Request
    const handleQuickMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) {
            onSetError("No active rental property found to submit a ticket for.");
            return;
        }

        setMaintSaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const payload: CreateMaintenanceRequest = {
                propertyId: propertyId,
                title: maintTitle.trim(),
                description: maintDesc.trim(),
            };

            const created = await createMaintenanceRequest(payload);
            onSetAlert(`Maintenance ticket #${created.id} ("${created.title}") filed successfully! Your landlord has been notified.`);
            setShowMaintModal(false);
            setMaintTitle("");
            setMaintDesc("");
            onRefresh();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to file maintenance ticket."));
        } finally {
            setMaintSaving(false);
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Top Stats Overview */}
            <div className="stats-grid">
                <StatCard
                    label="Monthly Rent"
                    value={`₹${Number(monthlyRent).toLocaleString("en-IN")}`}
                    icon={IndianRupee}
                    footerText={rentDueDay ? `Due on Day ${rentDueDay} of month` : "Agreed rental rate"}
                />
                <StatCard
                    label="Current Month Rent"
                    value={rentBadge.label}
                    icon={CreditCard}
                    footerText={rentBadge.text}
                    onClick={() => {
                        if (rentStatus !== "PAID" && activeLeaseId) {
                            setPayAmount(monthlyRent);
                            setShowPayModal(true);
                        } else {
                            onNavigate("payments");
                        }
                    }}
                />
                <StatCard
                    label="Total Paid"
                    value={`₹${Number(data.totalPayments || 0).toLocaleString("en-IN")}`}
                    icon={ShieldCheck}
                    footerText="Lifetime rent payments made"
                    onClick={() => onNavigate("payments")}
                />
                <StatCard
                    label="Open Repair Tickets"
                    value={data.openMaintenanceRequests}
                    icon={Wrench}
                    footerText={data.openMaintenanceRequests > 0 ? "In progress / open with landlord" : "All issues resolved"}
                    onClick={() => onNavigate("maintenance")}
                />
            </div>

            {/* Active Rental Home Spotlight Card */}
            {activeLeaseId ? (
                <div className="card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "var(--bg-subtle)", padding: "3px 8px", borderRadius: "var(--radius-xs)", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", border: "1px solid var(--border-subtle)" }}>
                                <Sparkles size={11} />
                                <span>Active Rental Agreement</span>
                            </div>

                            <h2 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 600 }}>
                                {propertyName}
                            </h2>

                            {propertyAddress && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "12px", marginTop: "3px" }}>
                                    <MapPin size={13} color="var(--text-muted)" />
                                    <span>{propertyAddress}</span>
                                </div>
                            )}

                            {/* Landlord Contact Info */}
                            {currentLease?.ownerName && (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginTop: "12px", background: "var(--bg-subtle)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <User size={13} />
                                        <span>Landlord: <strong>{currentLease.ownerName}</strong></span>
                                    </div>
                                    {currentLease.ownerEmail && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                                            <Mail size={12} />
                                            <span>{currentLease.ownerEmail}</span>
                                        </div>
                                    )}
                                    {currentLease.ownerPhoneNumber && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                                            <Phone size={12} />
                                            <span>{currentLease.ownerPhoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Rent Status & Action CTA */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                            <div className={`status-pill ${rentBadge.class}`}>
                                <RentIcon size={12} />
                                <span>{rentBadge.label}</span>
                            </div>

                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                {rentStatus !== "PAID" && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            setPayAmount(monthlyRent);
                                            setShowPayModal(true);
                                        }}
                                    >
                                        <CreditCard size={14} />
                                        <span>Pay Rent</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowMaintModal(true)}
                                >
                                    <Wrench size={14} />
                                    <span>Report Issue</span>
                                </button>
                            </div>

                            {data.leaseStartDate && data.leaseEndDate && (
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    Agreement: {data.leaseStartDate} to {data.leaseEndDate}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty Lease Onboarding State */
                <div className="card-panel">
                    <div className="empty-state">
                        <Home size={38} className="empty-state-icon" />
                        <h3>No Active Rental Agreement Linked</h3>
                        <p style={{ maxWidth: "440px", margin: "6px auto 0" }}>
                            Your landlord has not yet assigned an active lease to your account. When registered, your home details and rent actions will appear here.
                        </p>
                    </div>
                </div>
            )}

            {/* Split Tables: Payment Receipts & Maintenance Requests */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
                {/* Recent Payments Card */}
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Payment Receipts</h3>
                            <p>Recent transactions recorded for your lease</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onNavigate("payments")}
                        >
                            View All <ArrowUpRight size={13} />
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Receipt #</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                                            No payment records found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentPayments.map((p) => (
                                        <tr key={`p-${p.id}`}>
                                            <td><strong>#{p.id}</strong></td>
                                            <td>₹{Number(p.amount).toLocaleString("en-IN")}</td>
                                            <td><span className="type-badge">{p.paymentMethod}</span></td>
                                            <td>{p.paymentDate}</td>
                                            <td>
                                                <span className={`status-pill ${p.status.toLowerCase()}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Maintenance Tickets Card */}
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Maintenance Tickets</h3>
                            <p>Status of your reported repair issues</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onNavigate("maintenance")}
                        >
                            View All <ArrowUpRight size={13} />
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ticket #</th>
                                    <th>Issue Title</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {openTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                                            No active maintenance tickets in queue.
                                        </td>
                                    </tr>
                                ) : (
                                    openTickets.map((t) => (
                                        <tr key={`t-${t.id}`}>
                                            <td><strong>#{t.id}</strong></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{t.title}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.description}</div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${t.status.toLowerCase()}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick Pay Rent Modal */}
            {showPayModal && (
                <div className="modal-backdrop" onClick={() => setShowPayModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Pay Monthly Rent</h3>
                                <span className="modal-subtitle">Paying for {propertyName}</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowPayModal(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleQuickPayment}>
                            <div className="modal-body form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Rental Home</label>
                                    <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                        <strong>{propertyName}</strong>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{propertyAddress || "Lease Active"}</div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-amt">Rent Amount (₹) *</label>
                                    <input
                                        id="pay-amt"
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-met">Payment Method *</label>
                                    <select
                                        id="pay-met"
                                        className="form-select"
                                        value={payMethod}
                                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
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
                                        value={payDate}
                                        onChange={(e) => setPayDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="pay-reference">UTR / Reference</label>
                                    <input
                                        id="pay-reference"
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. UPI-123456"
                                        value={payRef}
                                        onChange={(e) => setPayRef(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowPayModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={paySaving}
                                >
                                    <Send size={13} />
                                    <span>{paySaving ? "Submitting..." : `Confirm Payment of ₹${Number(payAmount).toLocaleString("en-IN")}`}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Report Issue Modal */}
            {showMaintModal && (
                <div className="modal-backdrop" onClick={() => setShowMaintModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Report a Maintenance Issue</h3>
                                <span className="modal-subtitle">Submitting ticket for {propertyName}</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setShowMaintModal(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleQuickMaintenance}>
                            <div className="modal-body form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="ticket-title">What is the problem? *</label>
                                    <input
                                        id="ticket-title"
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Bathroom pipe leakage, AC cooling not working"
                                        value={maintTitle}
                                        onChange={(e) => setMaintTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="ticket-desc">Detailed Description *</label>
                                    <textarea
                                        id="ticket-desc"
                                        className="form-textarea"
                                        placeholder="Please provide details about the location of the issue..."
                                        value={maintDesc}
                                        onChange={(e) => setMaintDesc(e.target.value)}
                                        required
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowMaintModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={maintSaving}
                                >
                                    <Send size={13} />
                                    <span>{maintSaving ? "Sending..." : "Submit Ticket"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TenantDashboard;