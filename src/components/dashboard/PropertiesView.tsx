import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import {
    Building2,
    Plus,
    MapPin,
    Sparkles,
    Search,
    Eye,
    X,
    KeyRound,
    ImagePlus,
    Star,
    Camera
} from "lucide-react";
import type { CreatePropertyRequest, PropertyResponse, PropertyType } from "../../types/api";
import { createProperty } from "../../api/propertyApi";
import { getApiErrorMessage } from "../../api/error";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { ImageUploadModal } from "./ImageUploadModal";

const propertyTypes: PropertyType[] = ["FLAT", "HOUSE", "ROOM", "PG"];

interface PropertiesViewProps {
    myProperties: PropertyResponse[];
    allProperties: PropertyResponse[];
    onPropertyCreated: (property: PropertyResponse) => void;
    onStartLeaseForProperty?: (propertyId: number) => void;
    onOpenChat?: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string) => void;
    onRefresh: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function PropertiesView({
    myProperties,
    onPropertyCreated,
    onStartLeaseForProperty,
    onOpenChat,
    onRefresh,
    onSetAlert,
    onSetError,
}: PropertiesViewProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal states
    const [inspectingProperty, setInspectingProperty] = useState<PropertyResponse | null>(null);
    const [managePhotosProperty, setManagePhotosProperty] = useState<PropertyResponse | null>(null);

    // Create Property Form State with Photos
    const [form, setForm] = useState<CreatePropertyRequest>({
        propertyName: "",
        description: "",
        address: "",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        postalCode: "560001",
        propertyType: "FLAT",
        rentAmount: 18000,
        securityDeposit: 36000,
        totalUnits: 1,
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedImages((prev) => [...prev, ...files]);
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemovePreview = (idx: number) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        onSetError("");
        onSetAlert("");

        try {
            const created = await createProperty({
                ...form,
                rentAmount: Number(form.rentAmount),
                securityDeposit: Number(form.securityDeposit),
                totalUnits: Number(form.totalUnits),
                images: selectedImages,
            });

            onPropertyCreated(created);
            onSetAlert(`Property "${created.propertyName}" added with ${selectedImages.length} photo(s)!`);
            setIsCreating(false);
            setForm({
                propertyName: "",
                description: "",
                address: "",
                city: "Bangalore",
                state: "Karnataka",
                country: "India",
                postalCode: "560001",
                propertyType: "FLAT",
                rentAmount: 18000,
                securityDeposit: 36000,
                totalUnits: 1,
            });
            setSelectedImages([]);
            setImagePreviews([]);
            onRefresh();
        } catch (apiError) {
            onSetError(getApiErrorMessage(apiError, "Failed to create property."));
        } finally {
            setSaving(false);
        }
    };

    const filteredProperties = myProperties.filter((prop) => {
        const query = search.toLowerCase();
        const matchesQuery =
            prop.propertyName?.toLowerCase().includes(query) ||
            prop.city?.toLowerCase().includes(query) ||
            prop.state?.toLowerCase().includes(query) ||
            prop.address?.toLowerCase().includes(query);

        const matchesType = typeFilter === "ALL" || prop.propertyType === typeFilter;
        const matchesStatus = statusFilter === "ALL" || prop.status === statusFilter;

        return matchesQuery && matchesType && matchesStatus;
    });

    const totalAvailable = myProperties.filter((p) => p.status === "AVAILABLE").length;
    const totalOccupied = myProperties.filter((p) => p.status === "OCCUPIED").length;

    return (
        <div className="panel-grid-stack">
            {/* Header & Controls Bar */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>My Property Portfolio ({myProperties.length})</h3>
                        <p>All real estate units owned, photo galleries, ratings, and tenant operations</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus size={16} />
                            <span>Add New Property</span>
                        </button>
                    </div>
                </div>

                {/* Portfolio Summary Stats */}
                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: "8px" }}>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("ALL")}>
                        <span className="stat-label">Total Properties</span>
                        <h4 className="stat-value" style={{ fontSize: "20px" }}>{myProperties.length}</h4>
                        <span className="stat-footer-text">In your portfolio</span>
                    </div>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("AVAILABLE")}>
                        <span className="stat-label">Available to Rent</span>
                        <h4 className="stat-value" style={{ fontSize: "20px", color: "var(--success)" }}>{totalAvailable}</h4>
                        <span className="stat-footer-text">Vacant units ready</span>
                    </div>
                    <div className="stat-card" style={{ padding: "14px" }} onClick={() => setStatusFilter("OCCUPIED")}>
                        <span className="stat-label">Currently Occupied</span>
                        <h4 className="stat-value" style={{ fontSize: "20px", color: "var(--info)" }}>{totalOccupied}</h4>
                        <span className="stat-footer-text">With active leases</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="card-panel" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div className="search-box" style={{ maxWidth: "360px", flex: 1 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Search by property name, city, address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Type:</span>
                            <select
                                className="form-select"
                                style={{ padding: "6px 28px 6px 10px", fontSize: "12px" }}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="ALL">All Types</option>
                                {propertyTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Status:</span>
                            <select
                                className="form-select"
                                style={{ padding: "6px 28px 6px 10px", fontSize: "12px" }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="AVAILABLE">AVAILABLE (Vacant)</option>
                                <option value="OCCUPIED">OCCUPIED (Rented)</option>
                                <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Grid Cards */}
            {filteredProperties.length === 0 ? (
                <div className="card-panel">
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <Building2 size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "18px", marginTop: "8px" }}>No Properties Found</h3>
                        <p style={{ marginTop: "6px", maxWidth: "420px", margin: "6px auto 0" }}>
                            {search || typeFilter !== "ALL" || statusFilter !== "ALL"
                                ? "No properties match your current filter criteria."
                                : "You have not added any properties to your portfolio yet. Click \"Add New Property\" to get started."}
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ marginTop: "16px" }}
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus size={16} />
                            <span>Add Your First Property</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
                    {filteredProperties.map((prop) => {
                        const hasImages = prop.imageUrls && prop.imageUrls.length > 0;
                        const firstImage = hasImages ? prop.imageUrls![0] : null;

                        return (
                            <div key={`prop-card-${prop.id}`} className="rented-property-card">
                                {/* Card Photo Banner */}
                                <div
                                    className="card-media-banner"
                                    onClick={() => setInspectingProperty(prop)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {firstImage ? (
                                        <img src={firstImage} alt={prop.propertyName} className="card-banner-img" />
                                    ) : (
                                        <div className="card-banner-placeholder">
                                            <Building2 size={36} color="var(--primary)" style={{ opacity: 0.8 }} />
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {prop.propertyType}
                                            </span>
                                        </div>
                                    )}

                                    {/* Top Overlay Badges */}
                                    <div className="card-banner-overlay top">
                                        <span className="type-badge">{prop.propertyType}</span>
                                        <span className={`status-pill ${prop.status.toLowerCase()}`}>
                                            {prop.status}
                                        </span>
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

                                {/* Content Details */}
                                <div style={{ padding: "0 4px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <h4
                                            className="rented-prop-name"
                                            onClick={() => setInspectingProperty(prop)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {prop.propertyName}
                                        </h4>
                                    </div>

                                    <div className="rented-prop-location">
                                        <MapPin size={13} color="var(--primary)" />
                                        <span>{prop.address}, {prop.city}</span>
                                    </div>

                                    {prop.description && (
                                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4, margin: "6px 0" }}>
                                            {prop.description}
                                        </p>
                                    )}
                                </div>

                                {/* Financials & Units Grid */}
                                <div className="rented-financials-grid">
                                    <div className="fin-item">
                                        <span className="fin-label">Monthly Rent</span>
                                        <span className="fin-val">
                                            ₹{Number(prop.rentAmount).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="fin-item">
                                        <span className="fin-label">Deposit</span>
                                        <span className="fin-val" style={{ color: "var(--purple)" }}>
                                            ₹{Number(prop.securityDeposit).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="fin-item">
                                        <span className="fin-label">Units</span>
                                        <span className="fin-val">
                                            {prop.totalUnits || 1} Unit(s)
                                        </span>
                                    </div>
                                    <div className="fin-item">
                                        <span className="fin-label">Location</span>
                                        <span className="fin-val" style={{ fontSize: "12px" }}>
                                            {prop.city}, {prop.state}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions Footer */}
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
                                            onClick={() => setManagePhotosProperty(prop)}
                                            title="Upload or Delete Photos"
                                        >
                                            <ImagePlus size={14} />
                                            <span>Photos</span>
                                        </button>
                                    </div>

                                    {prop.status === "AVAILABLE" && onStartLeaseForProperty && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => onStartLeaseForProperty(prop.id)}
                                        >
                                            <KeyRound size={14} />
                                            <span>Create Lease</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Property Modal with Multi-Photo Upload */}
            {isCreating && (
                <div className="modal-backdrop" onClick={() => setIsCreating(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "660px", maxHeight: "90vh", overflowY: "auto" }}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: "18px" }}>Add New Property to Portfolio</h3>
                                <span className="modal-subtitle">Fill in details and upload property photos</span>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() => setIsCreating(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body form-grid two-col">
                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="prop-name">Property Name *</label>
                                    <input
                                        id="prop-name"
                                        className="form-input"
                                        placeholder="e.g. Green Villa Luxury Apartment 3B"
                                        value={form.propertyName}
                                        onChange={(e) => setForm({ ...form, propertyName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-type">Property Type *</label>
                                    <select
                                        id="prop-type"
                                        className="form-select"
                                        value={form.propertyType}
                                        onChange={(e) => setForm({ ...form, propertyType: e.target.value as PropertyType })}
                                        required
                                    >
                                        {propertyTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-units">Total Units *</label>
                                    <input
                                        id="prop-units"
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={form.totalUnits}
                                        onChange={(e) => setForm({ ...form, totalUnits: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="prop-addr">Address Line *</label>
                                    <input
                                        id="prop-addr"
                                        className="form-input"
                                        placeholder="Flat/House No, Street, Landmark"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-city">City *</label>
                                    <input
                                        id="prop-city"
                                        className="form-input"
                                        placeholder="Bangalore"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-state">State *</label>
                                    <input
                                        id="prop-state"
                                        className="form-input"
                                        placeholder="Karnataka"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-rent">Expected Monthly Rent (₹) *</label>
                                    <input
                                        id="prop-rent"
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        placeholder="18000"
                                        value={form.rentAmount}
                                        onChange={(e) => setForm({ ...form, rentAmount: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="prop-deposit">Security Deposit (₹) *</label>
                                    <input
                                        id="prop-deposit"
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        placeholder="36000"
                                        value={form.securityDeposit}
                                        onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label" htmlFor="prop-desc">Description & Amenities</label>
                                    <textarea
                                        id="prop-desc"
                                        className="form-textarea"
                                        placeholder="Furnishings, balcony, parking space, nearby metro..."
                                        value={form.description || ""}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                {/* Multi-Image File Picker */}
                                <div className="form-group full-width">
                                    <label className="form-label">Property Photos</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleImageChange}
                                    />

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: "2px dashed var(--border-subtle)",
                                            borderRadius: "var(--radius-md)",
                                            padding: "20px",
                                            textAlign: "center",
                                            cursor: "pointer",
                                            background: "rgba(15, 23, 42, 0.5)",
                                        }}
                                    >
                                        <ImagePlus size={28} style={{ color: "var(--primary)", margin: "0 auto 6px" }} />
                                        <p style={{ fontSize: "13px", fontWeight: 600 }}>Click to select property photos</p>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Supports JPEG, PNG, WEBP</span>
                                    </div>

                                    {/* Selected Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px", marginTop: "10px" }}>
                                            {imagePreviews.map((src, i) => (
                                                <div key={`form-prev-${i}`} style={{ position: "relative", height: "65px" }}>
                                                    <img
                                                        src={src}
                                                        alt="Selected"
                                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePreview(i)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "2px",
                                                            right: "2px",
                                                            background: "rgba(0,0,0,0.7)",
                                                            border: "none",
                                                            color: "#fff",
                                                            borderRadius: "50%",
                                                            width: "18px",
                                                            height: "18px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    <Sparkles size={16} />
                                    <span>{saving ? "Registering..." : `Save Property (${selectedImages.length} Photos)`}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Property Full Details & Gallery Modal */}
            {inspectingProperty && (
                <PropertyDetailModal
                    property={inspectingProperty}
                    onClose={() => setInspectingProperty(null)}
                    onOpenChat={onOpenChat || (() => {})}
                    onOpenManagePhotos={(p) => {
                        setInspectingProperty(null);
                        setManagePhotosProperty(p);
                    }}
                    onSetAlert={onSetAlert}
                    onSetError={onSetError}
                />
            )}

            {/* Manage Photos Modal */}
            {managePhotosProperty && (
                <ImageUploadModal
                    property={managePhotosProperty}
                    onClose={() => setManagePhotosProperty(null)}
                    onUpdated={(updatedProp) => {
                        setManagePhotosProperty(updatedProp);
                        onRefresh();
                    }}
                    onSetAlert={onSetAlert}
                    onSetError={onSetError}
                />
            )}
        </div>
    );
}

export default PropertiesView;
