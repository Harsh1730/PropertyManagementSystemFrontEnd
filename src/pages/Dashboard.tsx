import { useState, useEffect, useCallback } from "react";
import { LoaderCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";
import {
    getOwnerDashboard,
    getTenantDashboard,
    getOwnerRentedProperties,
    getTenantLeaseOverview,
} from "../api/dashboardApi";
import { getMyProperties, getAllProperties } from "../api/propertyApi";
import { getMyLeases } from "../api/leaseApi";
import { getOwnerPayments, getMyPayments } from "../api/paymentApi";
import { getOwnerMaintenanceRequests, getMyMaintenanceRequests } from "../api/maintenanceApi";
import { getMyBookings, getOwnerBookings } from "../api/bookingApi";
import { getApiErrorMessage } from "../api/error";
import type {
    OwnerDashboardResponse,
    TenantDashboardResponse,
    OwnerRentedPropertyResponse,
    TenantLeaseOverviewResponse,
} from "../types/dashboard";
import type {
    LeaseResponse,
    PaymentResponse,
    MaintenanceResponse,
    PropertyResponse,
} from "../types/api";
import type { BookingResponse } from "../types/booking";

import { Sidebar, type DashboardSection } from "../components/dashboard/Sidebar";
import { Topbar } from "../components/dashboard/Topbar";
import { OwnerDashboard } from "../components/dashboard/OwnerDashboard";
import { TenantDashboard } from "../components/dashboard/TenantDashboard";
import { PropertiesView } from "../components/dashboard/PropertiesView";
import { RentedPropertiesView } from "../components/dashboard/RentedPropertiesView";
import { LeasesView } from "../components/dashboard/LeasesView";
import { TenantLeaseView } from "../components/dashboard/TenantLeaseView";
import { PaymentsView } from "../components/dashboard/PaymentsView";
import { MaintenanceView } from "../components/dashboard/MaintenanceView";
import { ExplorePropertiesView } from "../components/dashboard/ExplorePropertiesView";
import { TenantBookingsView } from "../components/dashboard/TenantBookingsView";
import { OwnerBookingsView } from "../components/dashboard/OwnerBookingsView";
import { InboxView } from "../components/dashboard/InboxView";
import { ChatDrawer } from "../components/dashboard/ChatDrawer";

import "../styles/dashboard.css";

interface ActiveChatState {
    otherUserId: number;
    otherUserName: string;
    otherUserRole?: string;
    propertyId?: number;
    propertyName?: string;
    bookingId?: number;
}

export function Dashboard() {
    const { portalMode } = useAuth();

    const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
    const [preSelectedPropertyId, setPreSelectedPropertyId] = useState<number | null>(null);

    // Active floating chat drawer state
    const [activeChat, setActiveChat] = useState<ActiveChatState | null>(null);

    // Server state
    const [ownerDashboard, setOwnerDashboard] = useState<OwnerDashboardResponse | null>(null);
    const [tenantDashboard, setTenantDashboard] = useState<TenantDashboardResponse | null>(null);
    const [rentedProperties, setRentedProperties] = useState<OwnerRentedPropertyResponse[]>([]);
    const [tenantLeaseOverview, setTenantLeaseOverview] = useState<TenantLeaseOverviewResponse | null>(null);

    const [myProperties, setMyProperties] = useState<PropertyResponse[]>([]);
    const [allProperties, setAllProperties] = useState<PropertyResponse[]>([]);
    const [leases, setLeases] = useState<LeaseResponse[]>([]);
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [maintenance, setMaintenance] = useState<MaintenanceResponse[]>([]);
    const [bookings, setBookings] = useState<BookingResponse[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        let isCurrent = true;

        const fetchData = async () => {
            try {
                if (portalMode === "owner") {
                    const [
                        ownerData,
                        rentedProps,
                        myProps,
                        allProps,
                        leaseItems,
                        paymentItems,
                        maintenanceItems,
                        bookingItems,
                    ] = await Promise.all([
                        getOwnerDashboard().catch(() => null),
                        getOwnerRentedProperties().catch(() => []),
                        getMyProperties().catch(() => []),
                        getAllProperties().catch(() => []),
                        getMyLeases().catch(() => []),
                        getOwnerPayments().catch(() => []),
                        getOwnerMaintenanceRequests().catch(() => []),
                        getOwnerBookings().catch(() => []),
                    ]);

                    if (!isCurrent) return;
                    if (ownerData) setOwnerDashboard(ownerData);
                    setRentedProperties(rentedProps);
                    setMyProperties(myProps);
                    setAllProperties(allProps);
                    setLeases(leaseItems);
                    setPayments(paymentItems);
                    setMaintenance(maintenanceItems);
                    setBookings(bookingItems);
                } else {
                    const [
                        tenantData,
                        leaseOverview,
                        leaseItems,
                        paymentItems,
                        maintenanceItems,
                        bookingItems,
                    ] = await Promise.all([
                        getTenantDashboard().catch(() => null),
                        getTenantLeaseOverview().catch(() => null),
                        getMyLeases().catch(() => []),
                        getMyPayments().catch(() => []),
                        getMyMaintenanceRequests().catch(() => []),
                        getMyBookings().catch(() => []),
                    ]);

                    if (!isCurrent) return;
                    if (tenantData) setTenantDashboard(tenantData);
                    if (leaseOverview) setTenantLeaseOverview(leaseOverview);
                    setLeases(leaseItems);
                    setPayments(paymentItems);
                    setMaintenance(maintenanceItems);
                    setBookings(bookingItems);
                }
            } catch (err) {
                if (!isCurrent) return;
                setErrorMessage(getApiErrorMessage(err, "Failed to synchronize data with server."));
            } finally {
                if (isCurrent) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        void fetchData();

        return () => {
            isCurrent = false;
        };
    }, [portalMode, refreshKey]);

    const handlePropertyCreated = (newProp: PropertyResponse) => {
        setMyProperties((prev) => [newProp, ...prev.filter((p) => p.id !== newProp.id)]);
        setAllProperties((prev) => [newProp, ...prev.filter((p) => p.id !== newProp.id)]);
        triggerRefresh();
    };

    const handleStartLeaseForProperty = (propId: number) => {
        setPreSelectedPropertyId(propId);
        setActiveSection("leases");
    };

    const handleOpenChat = (
        otherUserId: number,
        otherUserName: string,
        propertyId?: number,
        propertyName?: string,
        bookingId?: number
    ) => {
        setActiveChat({
            otherUserId,
            otherUserName,
            propertyId,
            propertyName,
            bookingId,
        });
    };

    // Calculate badge counts
    const pendingBookingsCount = bookings.filter((b) => b.status === "PENDING").length;

    const badgeCounts = {
        properties: myProperties.length,
        rented: rentedProperties.length,
        leases: leases.filter((l) => l.status === "ACTIVE").length,
        payments: payments.length,
        maintenance: maintenance.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS").length,
        bookings: pendingBookingsCount,
    };

    // Title resolution
    const getSectionTitle = () => {
        switch (activeSection) {
            case "overview":
                return portalMode === "owner" ? "Portfolio Overview" : "My Rental Overview";
            case "explore":
                return "Explore & Book Properties";
            case "bookings":
                return portalMode === "owner" ? "Tenant Booking Applications" : "My Rental Applications";
            case "properties":
                return "My Property Portfolio";
            case "rented":
                return "Rented Units & Tenants Directory";
            case "leases":
                return portalMode === "owner" ? "Lease Contracts" : "Tenancy Agreement & History";
            case "payments":
                return portalMode === "owner" ? "Collections & Rent Payments" : "Rent Payments & Receipts";
            case "maintenance":
                return "Maintenance & Repair Tickets";
            case "messages":
                return "Messages & Direct Chat";
            default:
                return "Dashboard";
        }
    };

    if (loading) {
        return (
            <div className="auth-page">
                <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                    <LoaderCircle size={40} className="spinning" style={{ color: "var(--primary)", margin: "0 auto 16px" }} />
                    <h2 style={{ fontSize: "20px", color: "var(--text-primary)" }}>Loading EstateFlow Workspace...</h2>
                    <p style={{ marginTop: "8px", fontSize: "14px" }}>Synchronizing portfolio data from server</p>
                </div>
            </div>
        );
    }

    const currentTenantLease = tenantLeaseOverview?.currentLease;
    const tenantActiveLeaseId = tenantDashboard?.activeLeaseId || currentTenantLease?.leaseId;
    const tenantPropertyId = tenantDashboard?.propertyId || currentTenantLease?.propertyId;
    const tenantPropertyName = tenantDashboard?.propertyName || currentTenantLease?.propertyName;
    const tenantMonthlyRent = tenantDashboard?.monthlyRent || currentTenantLease?.monthlyRent;

    return (
        <div className="app-layout">
            {/* Modular Sidebar with Portal Switcher */}
            <Sidebar
                activeSection={activeSection}
                onSectionChange={(sec) => {
                    setActiveSection(sec);
                    setAlertMessage("");
                }}
                badgeCounts={badgeCounts}
            />

            {/* Main Content Column */}
            <div className="main-content">
                <Topbar
                    title={getSectionTitle()}
                    onRefresh={triggerRefresh}
                    isRefreshing={refreshing}
                />

                <main className="content-area">
                    {/* Alerts & Messages */}
                    {alertMessage && (
                        <div className="alert-banner success">
                            <span>{alertMessage}</span>
                            <button
                                type="button"
                                className="alert-close-btn"
                                onClick={() => setAlertMessage("")}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="alert-banner error">
                            <AlertCircle size={18} style={{ flexShrink: 0 }} />
                            <span>{errorMessage}</span>
                            <button
                                type="button"
                                className="alert-close-btn"
                                onClick={() => setErrorMessage("")}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Section Renderers */}
                    {activeSection === "overview" && portalMode === "owner" && (
                        <OwnerDashboard
                            data={
                                ownerDashboard || {
                                    totalProperties: myProperties.length,
                                    occupiedProperties: myProperties.filter((p) => p.status === "OCCUPIED").length,
                                    availableProperties: myProperties.filter((p) => p.status === "AVAILABLE").length,
                                    activeLeases: leases.filter((l) => l.status === "ACTIVE").length,
                                    totalRentCollected: payments
                                        .filter((p) => p.status === "PAID")
                                        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
                                    pendingMaintenanceRequests: maintenance.filter(
                                        (m) => m.status === "OPEN" || m.status === "IN_PROGRESS"
                                    ).length,
                                }
                            }
                            leases={leases}
                            payments={payments}
                            rentedProperties={rentedProperties}
                            onNavigate={(sec) => setActiveSection(sec)}
                        />
                    )}

                    {activeSection === "overview" && portalMode === "tenant" && (
                        <TenantDashboard
                            data={
                                tenantDashboard || {
                                    activeLeaseId: leases.find((l) => l.status === "ACTIVE")?.id || null,
                                    propertyId: currentTenantLease?.propertyId,
                                    propertyName: currentTenantLease?.propertyName,
                                    propertyAddress: currentTenantLease?.propertyAddress,
                                    monthlyRent: currentTenantLease?.monthlyRent || 0,
                                    rentStatus: currentTenantLease?.rentStatus || "NO_ACTIVE_LEASE",
                                    rentDueDay: currentTenantLease?.rentDueDay,
                                    leaseStartDate: currentTenantLease?.leaseStartDate,
                                    leaseEndDate: currentTenantLease?.leaseEndDate,
                                    totalPayments: payments
                                        .filter((p) => p.status === "PAID")
                                        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
                                    openMaintenanceRequests: maintenance.filter(
                                        (m) => m.status === "OPEN" || m.status === "IN_PROGRESS"
                                    ).length,
                                }
                            }
                            currentLease={currentTenantLease}
                            payments={payments}
                            maintenance={maintenance}
                            onNavigate={(sec) => setActiveSection(sec)}
                            onRefresh={triggerRefresh}
                            onSetAlert={setAlertMessage}
                            onSetError={setErrorMessage}
                        />
                    )}

                    {activeSection === "explore" && (
                        <ExplorePropertiesView
                            onOpenChat={handleOpenChat}
                            onNavigateToBookings={() => setActiveSection("bookings")}
                            onSetAlert={setAlertMessage}
                            onSetError={setErrorMessage}
                        />
                    )}

                    {activeSection === "bookings" && (
                        portalMode === "owner" ? (
                            <OwnerBookingsView
                                bookings={bookings}
                                onOpenChat={handleOpenChat}
                                onNavigateToLeases={() => setActiveSection("leases")}
                                onRefresh={triggerRefresh}
                                onSetAlert={setAlertMessage}
                                onSetError={setErrorMessage}
                            />
                        ) : (
                            <TenantBookingsView
                                bookings={bookings}
                                onOpenChat={handleOpenChat}
                                onNavigateToExplore={() => setActiveSection("explore")}
                                onNavigateToLeases={() => setActiveSection("leases")}
                                onRefresh={triggerRefresh}
                                onSetAlert={setAlertMessage}
                                onSetError={setErrorMessage}
                            />
                        )
                    )}

                    {activeSection === "properties" && (
                        <PropertiesView
                            myProperties={myProperties}
                            allProperties={allProperties}
                            onPropertyCreated={handlePropertyCreated}
                            onStartLeaseForProperty={handleStartLeaseForProperty}
                            onRefresh={triggerRefresh}
                            onSetAlert={setAlertMessage}
                            onSetError={setErrorMessage}
                        />
                    )}

                    {activeSection === "rented" && (
                        <RentedPropertiesView
                            rentedProperties={rentedProperties}
                            onNavigateToLeases={() => setActiveSection("leases")}
                            onNavigateToMaintenance={() => setActiveSection("maintenance")}
                        />
                    )}

                    {activeSection === "leases" && (
                        portalMode === "owner" ? (
                            <LeasesView
                                leases={leases}
                                properties={myProperties}
                                preSelectedPropertyId={preSelectedPropertyId}
                                isOwnerMode={true}
                                onClearPreSelectedProperty={() => setPreSelectedPropertyId(null)}
                                onNavigateToPayments={() => setActiveSection("payments")}
                                onRefresh={triggerRefresh}
                                onSetAlert={setAlertMessage}
                                onSetError={setErrorMessage}
                            />
                        ) : (
                            <TenantLeaseView
                                leaseOverview={tenantLeaseOverview}
                                onNavigateToPayments={() => setActiveSection("payments")}
                                onNavigateToMaintenance={() => setActiveSection("maintenance")}
                            />
                        )
                    )}

                    {activeSection === "payments" && (
                        <PaymentsView
                            payments={payments}
                            leases={leases}
                            activeLeaseId={tenantActiveLeaseId}
                            defaultMonthlyRent={tenantMonthlyRent}
                            propertyName={tenantPropertyName}
                            isOwnerMode={portalMode === "owner"}
                            onRefresh={triggerRefresh}
                            onSetAlert={setAlertMessage}
                            onSetError={setErrorMessage}
                        />
                    )}

                    {activeSection === "maintenance" && (
                        <MaintenanceView
                            maintenance={maintenance}
                            properties={myProperties}
                            activePropertyId={tenantPropertyId}
                            activePropertyName={tenantPropertyName}
                            isOwnerMode={portalMode === "owner"}
                            onRefresh={triggerRefresh}
                            onSetAlert={setAlertMessage}
                            onSetError={setErrorMessage}
                        />
                    )}

                    {activeSection === "messages" && (
                        <InboxView
                            onOpenChat={handleOpenChat}
                            onSetError={setErrorMessage}
                        />
                    )}
                </main>
            </div>

            {/* Real-time Floating Chat Drawer */}
            {activeChat && (
                <ChatDrawer
                    otherUserId={activeChat.otherUserId}
                    otherUserName={activeChat.otherUserName}
                    otherUserRole={activeChat.otherUserRole}
                    propertyId={activeChat.propertyId}
                    propertyName={activeChat.propertyName}
                    bookingId={activeChat.bookingId}
                    onClose={() => setActiveChat(null)}
                />
            )}
        </div>
    );
}

export default Dashboard;
