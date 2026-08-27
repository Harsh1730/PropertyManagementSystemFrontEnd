import { useState, useEffect, type FormEvent } from "react";
import {
    Building2,
    Search,
    MapPin,
    Sparkles,
    MessageSquare,
    X,
    Send,
    Star,
    Camera,
    Eye
} from "lucide-react";
import type { PropertyResponse, PropertyType } from "../../types/api";
import type { CreateBookingRequest } from "../../types/booking";
import { getAvailableProperties } from "../../api/propertyApi";
import { createBooking } from "../../api/bookingApi";
import { getApiErrorMessage } from "../../api/error";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { OwnerReviewModal } from "./OwnerReviewModal";
import { getImageUrl } from "../../utils/imageUrl";

const propertyTypes: PropertyType[] = ["FLAT", "HOUSE", "ROOM", "PG"];

interface ExplorePropertiesViewProps {
    onOpenChat: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string) => void;
    onNavigateToBookings: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

function getDefaultBookingDates() {
    const start = new Date();
    start.setDate(start.getDate() + 7);
    const startStr = start.toISOString().split("T")[0];

    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const endStr = end.toISOString().split("T")[0];

    return { startStr, endStr };
}

export function ExplorePropertiesView({
    onOpenChat,
    onNavigateToBookings,
    onSetAlert,
    onSetError,
}: ExplorePropertiesViewProps) {
    const [properties, setProperties] = useState<PropertyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [cityFilter, setCityFilter] = useState<string>("ALL");
    const [maxPrice, setMaxPrice] = useState<number>(100000);

    // Modals
    const [inspectingProperty, setInspectingProperty] = useState<PropertyResponse | null>(null);
    const [rateOwnerTarget, setRateOwnerTarget] = useState<{ id: number; name: string } | null>(null);

    // Booking modal state
    const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
    const [bookingForm, setBookingForm] = useState<CreateBookingRequest>(() => {
        const { startStr, endStr } = getDefaultBookingDates();
        return {
            propertyId: 0,
            startDate: startStr,
            endDate: endStr,
            monthlyRent: 15000,
            securityDeposit: 30000,
            message: "Hello, I am interested in renting this property. Please review my booking request!",
        };
    });
    const [submittingBooking, setSubmittingBooking] = useState(false);

    const fetchAvailable = async () => {
        setLoading(true);
        try {
            const data = await getAvailableProperties();
            setProperties(data);
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to load available properties."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchAvailable();
    }, []);

    const cities = Array.from(new Set(properties.map((p) => p.city).filter(Boolean)));

    const filtered = properties.filter((p) => {
        const query = search.toLowerCase();
        const matchesQuery =
            p.propertyName?.toLowerCase().includes(query) ||
            p.address?.toLowerCase().includes(query) ||
            p.city?.toLowerCase().includes(query) ||
            p.state?.toLowerCase().includes(query);

        const matchesType = typeFilter === "ALL" || p.propertyType === typeFilter;
        const matchesCity = cityFilter === "ALL" || p.city === cityFilter;
        const matchesPrice = Number(p.rentAmount) <= maxPrice;

        return matchesQuery && matchesType && matchesCity && matchesPrice;
    });

    const handleOpenBooking = (property: PropertyResponse) => {
        const { startStr, endStr } = getDefaultBookingDates();
        setSelectedProperty(property);
        setBookingForm({
            propertyId: property.id,
            startDate: startStr,
            endDate: endStr,
            monthlyRent: property.rentAmount,
            securityDeposit: property.securityDeposit,
            message: `Hello! I would like to book "${property.propertyName}" starting from ${startStr}. Please review my request.`,
        });
    };

    const handleSubmitBooking = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        setSubmittingBooking(true);
        onSetError("");
        onSetAlert("");

        try {
            const res = await createBooking({
                ...bookingForm,
                propertyId: selectedProperty.id,
                monthlyRent: Number(bookingForm.monthlyRent),
                securityDeposit: Number(bookingForm.securityDeposit),
            });

            onSetAlert(`Booking application for "${res.propertyName}" submitted successfully! The landlord has been notified.`);
            setSelectedProperty(null);
            onNavigateToBookings();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to submit booking request."));
        } finally {
            setSubmittingBooking(false);
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Header Banner */}
            <div className="card-panel" style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)" }}>
                <div className="card-header" style={{ marginBottom: "12px" }}>
                    <div className="card-header-left">
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(99, 102, 241, 0.15)", padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: "11px", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", marginBottom: "6px" }}>
                            <Sparkles size={12} />
                            <span>Real Estate Marketplace</span>
                        </div>
                        <h3>Explore & Book Available Properties</h3>
                        <p>Search verified rental properties, browse photo galleries, read tenant reviews, and book online</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "8px" }}>
                    {/* Search Input */}
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Search by name, locality, city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Property Types</option>
                            {propertyTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* City Filter */}
                    {cities.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <select
                                className="form-select"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                            >
                                <option value="ALL">All Cities ({cities.length})</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Max Price Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(15, 23, 42, 0.6)", padding: "4px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Max Rent:</span>
                        <input
                            type="range"
                            min="5000"
                            max="100000"
                            step="2000"
                            style={{ flex: 1, accentColor: "var(--primary)" }}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                        />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                            ₹{maxPrice.toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>
            </div>

            {/* Properties Marketplace Grid */}
            {loading ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Sparkles size={40} className="spinning" color="var(--primary)" />
                        <h4 style={{ marginTop: "12px" }}>Loading Available Properties...</h4>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Building2 size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3>No Properties Match Your Search</h3>
                        <p style={{ marginTop: "6px", maxWidth: "420px", margin: "6px auto 0" }}>
                            Try adjusting your search keywords, property type, or maximum rent slider.
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                    {filtered.map((prop) => {
                        const hasImages = prop.imageUrls && prop.imageUrls.length > 0;
                        const firstImage = hasImages ? prop.imageUrls![0] : null;
                        const ownerId = prop.ownerId || 1;
                        const ownerName = prop.ownerName || "Landlord";

                        return (
                            <div key={`market-prop-${prop.id}`} className="rented-property-card">
                                {/* Media Banner */}
                                <div
                                    className="card-media-banner"
                                    onClick={() => setInspectingProperty(prop)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {firstImage ? (
                                        <img src={getImageUrl(firstImage)} alt={prop.propertyName} className="card-banner-img" />
                                    ) : (
                                        <div className="card-banner-placeholder">
                                            <Building2 size={38} color="var(--primary)" style={{ opacity: 0.8 }} />
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {prop.propertyType}
                                            </span>
                                        </div>
                                    )}

                                    {/* Top Overlay Badges */}
                                    <div className="card-banner-overlay top">
                                        <span className="type-badge">{prop.propertyType}</span>
                                        <span className="status-pill paid">AVAILABLE</span>
                                    </div>

                                    {/* Rating Overlay */}
                                    {prop.averageRating ? (
                                        <div className="card-banner-overlay bottom">
                                            <div className="card-rating-chip">
                                                <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                                <span>{prop.averageRating}</span>
                                                {prop.totalReviews ? <span className="count">({prop.totalReviews})</span> : null}
                                            </div>
                                        </div>
                                    ) : null}

                                    {hasImages && (
                                        <div className="card-photo-count">
                                            <Camera size={11} />
                                            <span>{prop.imageUrls!.length}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Header & Financials */}
                                <div style={{ padding: "0 4px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <h4
                                                className="rented-prop-name"
                                                onClick={() => setInspectingProperty(prop)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {prop.propertyName}
                                            </h4>
                                            <div className="rented-prop-location">
                                                <MapPin size={13} color="var(--primary)" />
                                                <span>{prop.address}, {prop.city}</span>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                                                ₹{Number(prop.rentAmount).toLocaleString("en-IN")}
                                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}> / mo</span>
                                            </div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                Deposit: ₹{Number(prop.securityDeposit).toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                    </div>

                                    {prop.description && (
                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4, margin: "6px 0" }}>
                                            {prop.description}
                                        </p>
                                    )}
                                </div>

                                {/* Features Row */}
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "12px", margin: "4px 0" }}>
                                    <span className="info-chip">
                                        <Building2 size={12} />
                                        {prop.totalUnits || 1} Total Unit(s)
                                    </span>
                                    {prop.ownerRating && (
                                        <span className="info-chip" style={{ borderColor: "rgba(251, 191, 36, 0.3)", color: "#fbbf24" }}>
                                            <Star size={11} fill="#fbbf24" />
                                            {prop.ownerRating} Landlord Rating
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="rented-card-footer" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setInspectingProperty(prop)}
                                            title="View Full Details, Gallery & Reviews"
                                        >
                                            <Eye size={14} />
                                            <span>Details</span>
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => onOpenChat(ownerId, ownerName, prop.id, prop.propertyName)}
                                            title="Chat with Property Landlord"
                                        >
                                            <MessageSquare size={14} />
                                            <span>Chat</span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleOpenBooking(prop)}
                                    >
                                        <Sparkles size={14} />
                                        <span>Book Online</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Property Full Details & Gallery Modal */}
            {inspectingProperty && (
                <PropertyDetailModal
                    property={inspectingProperty}
                    onClose={() => setInspectingProperty(null)}
                    onBookOnline={(p) => handleOpenBooking(p)}
                    onOpenChat={onOpenChat}
                    onOpenRateLandlord={(oId, oName) => setRateOwnerTarget({ id: oId, name: oName })}
                    onSetAlert={onSetAlert}
                    onSetError={onSetError}
                />
            )}

            {/* Rate Landlord Modal */}
            {rateOwnerTarget && (
                <OwnerReviewModal
                    ownerId={rateOwnerTarget.id}
                    ownerName={rateOwnerTarget.name}
                    onClose={() => setRateOwnerTarget(null)}
                    onReviewSubmitted={() => void fetchAvailable()}
                    onSetAlert={onSetAlert}
                    onSetError={onSetError}
                />
            )}

            {/* Book / Apply Online Modal */}
            {selectedProperty && (
                <div className="modal-backdrop" onClick={() => setSelectedProperty(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: "18px" }}>Book Rental Property</h3>
                                <span className="modal-subtitle">Submit application for {selectedProperty.propertyName}</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setSelectedProperty(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBooking}>
                            <div className="modal-body form-grid two-col">
                                <div className="form-group full-width">
                                    <label className="form-label">Property Summary</label>
                                    <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                                        <strong>{selectedProperty.propertyName}</strong> ({selectedProperty.propertyType})
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                            {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="book-start">Requested Move-in Date *</label>
                                    <input
                                        id="book-start"
                                        type="date"
                                        className="form-input"
                                        value={bookingForm.startDate}
                                        onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="book-end">Agreement End Date *</label>
                                    <input
                                        id="book-end"
                                        type="date"
                                        className="form-input"
                                        value={bookingForm.endDate}
                                        onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="book-rent">Offered Monthly Rent (₹) *</label>
                                    <input
                                        id="book-rent"
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={bookingForm.monthlyRent}
                                        onChange={(e) => setBookingForm({ ...bookingForm, monthlyRent: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="book-deposit">Security Deposit (₹) *</label>
                                    <input
                                        id="book-deposit"
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        value={bookingForm.securityDeposit}
                                        onChange={(e) => setBookingForm({ ...bookingForm, securityDeposit: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="book-msg">Message / Notes to Landlord</label>
                                    <textarea
                                        id="book-msg"
                                        className="form-textarea"
                                        placeholder="Introduce yourself, mention profession, family members, or questions..."
                                        value={bookingForm.message || ""}
                                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setSelectedProperty(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submittingBooking}
                                >
                                    <Send size={15} />
                                    <span>{submittingBooking ? "Submitting Application..." : "Submit Booking Request"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExplorePropertiesView;
