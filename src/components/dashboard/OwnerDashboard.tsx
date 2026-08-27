import {
    Building2,
    Home,
    KeyRound,
    IndianRupee,
    Wrench,
    PlusCircle,
    ArrowUpRight
} from "lucide-react";
import type { OwnerDashboardResponse } from "../../types/dashboard";
import type { LeaseResponse, PaymentResponse, OwnerRentedPropertyResponse } from "../../types/api";
import { StatCard } from "./StatCard";
import type { DashboardSection } from "./Sidebar";

interface OwnerDashboardProps {
    data: OwnerDashboardResponse;
    leases: LeaseResponse[];
    payments: PaymentResponse[];
    rentedProperties: OwnerRentedPropertyResponse[];
    onNavigate: (section: DashboardSection) => void;
}

export function OwnerDashboard({
    data,
    leases,
    payments,
    rentedProperties,
    onNavigate,
}: OwnerDashboardProps) {
    const occupancyRate =
        data.totalProperties > 0
            ? Math.round((data.occupiedProperties / data.totalProperties) * 100)
            : 0;

    const recentLeases = leases.slice(0, 5);
    const recentPayments = payments.slice(0, 5);
    const topRented = rentedProperties.slice(0, 4);

    return (
        <div className="panel-grid-stack">
            {/* KPI Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    label="My Properties"
                    value={data.totalProperties}
                    icon={Building2}
                    color="blue"
                    footerText="Total properties in portfolio"
                    onClick={() => onNavigate("properties")}
                />
                <StatCard
                    label="Occupied Units"
                    value={data.occupiedProperties}
                    icon={Home}
                    color="green"
                    footerText={`${occupancyRate}% portfolio occupancy`}
                    onClick={() => onNavigate("rented")}
                />
                <StatCard
                    label="Vacant / Available"
                    value={data.availableProperties}
                    icon={Building2}
                    color="amber"
                    footerText="Ready for new tenants"
                    onClick={() => onNavigate("properties")}
                />
                <StatCard
                    label="Active Leases"
                    value={data.activeLeases}
                    icon={KeyRound}
                    color="purple"
                    footerText="Running rental contracts"
                    onClick={() => onNavigate("leases")}
                />
                <StatCard
                    label="Total Revenue Collected"
                    value={`₹${Number(data.totalRentCollected || 0).toLocaleString("en-IN")}`}
                    icon={IndianRupee}
                    color="green"
                    footerText="Verified rent collections"
                    onClick={() => onNavigate("payments")}
                />
                <StatCard
                    label="Pending Repairs"
                    value={data.pendingMaintenanceRequests}
                    icon={Wrench}
                    color={data.pendingMaintenanceRequests > 0 ? "rose" : "blue"}
                    footerText="Open & In Progress tickets"
                    onClick={() => onNavigate("maintenance")}
                />
            </div>

            {/* Quick Operations Actions Bar */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Quick Operations</h3>
                        <p>Essential management actions for your real estate portfolio</p>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onNavigate("properties")}
                    >
                        <PlusCircle size={16} />
                        <span>Add New Property</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onNavigate("leases")}
                    >
                        <KeyRound size={16} />
                        <span>Create Lease</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onNavigate("rented")}
                    >
                        <Home size={16} />
                        <span>Rented Units & Tenants ({rentedProperties.length})</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onNavigate("payments")}
                    >
                        <IndianRupee size={16} />
                        <span>Collections Ledger</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onNavigate("maintenance")}
                    >
                        <Wrench size={16} />
                        <span>Maintenance Queue</span>
                    </button>
                </div>
            </div>

            {/* Rented Properties Spotlight */}
            {topRented.length > 0 && (
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Active Rentals & Tenancy Health</h3>
                            <p>Current active occupants and monthly rent status</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onNavigate("rented")}
                        >
                            View All ({rentedProperties.length}) <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                        {topRented.map((prop) => (
                            <div key={`spotlight-${prop.propertyId}`} className="spotlight-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                    <div>
                                        <h4 style={{ fontSize: "15px" }}>{prop.propertyName}</h4>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                            {prop.city}, {prop.state}
                                        </div>
                                    </div>
                                    <span className="type-badge">{prop.propertyType}</span>
                                </div>

                                <div style={{ fontSize: "13px", margin: "10px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <div><strong>Tenant:</strong> {prop.tenantName || "Registered Tenant"}</div>
                                    <div>
                                        <strong>Rent Status:</strong>{" "}
                                        <span className={`status-pill ${prop.rentStatus?.toLowerCase() === "paid" ? "paid" : "pending"}`}>
                                            {prop.rentStatus || "PENDING"}
                                        </span>
                                    </div>
                                    <div><strong>Monthly Rent:</strong> ₹{Number(prop.monthlyRent || prop.propertyRentAmount || 0).toLocaleString("en-IN")}</div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "8px", fontSize: "12px" }}>
                                    <span style={{ color: "var(--success)" }}>Collected: ₹{Number(prop.totalRentCollected || 0).toLocaleString("en-IN")}</span>
                                    {(prop.openMaintenanceRequestsCount || 0) > 0 && (
                                        <span style={{ color: "var(--danger)" }}>{prop.openMaintenanceRequestsCount} Open Tickets</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Split Tables: Active Leases & Recent Collections */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px" }}>
                {/* Active Leases */}
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Active Leases</h3>
                            <p>Overview of current tenant agreements</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onNavigate("leases")}
                        >
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Tenant</th>
                                    <th>Monthly Rent</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeases.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-state">
                                            No active leases yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLeases.map((lease) => (
                                        <tr key={`l-${lease.id}`}>
                                            <td><strong>{lease.propertyName}</strong></td>
                                            <td>{lease.tenantName}</td>
                                            <td>₹{Number(lease.monthlyRent).toLocaleString("en-IN")}</td>
                                            <td>
                                                <span className={`status-pill ${lease.status.toLowerCase()}`}>
                                                    {lease.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Collections */}
                <div className="card-panel">
                    <div className="card-header">
                        <div className="card-header-left">
                            <h3>Recent Collections</h3>
                            <p>Latest payments recorded</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onNavigate("payments")}
                        >
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Receipt #</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-state">
                                            No payment records found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentPayments.map((payment) => (
                                        <tr key={`p-${payment.id}`}>
                                            <td>#{payment.id}</td>
                                            <td><strong>₹{Number(payment.amount).toLocaleString("en-IN")}</strong></td>
                                            <td><span className="info-chip">{payment.paymentMethod}</span></td>
                                            <td>
                                                <span className={`status-pill ${payment.status.toLowerCase()}`}>
                                                    {payment.status}
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
        </div>
    );
}

export default OwnerDashboard;