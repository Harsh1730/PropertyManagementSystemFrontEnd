import { useState, useEffect, type FormEvent } from "react";
import {
    X,
    Building2,
    MapPin,
    Star,
    MessageSquare,
    Sparkles,
    User,
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    Send,
    MessageCircle,
    Trash2,
    LoaderCircle
} from "lucide-react";
import type { PropertyResponse } from "../../types/api";
import type { PropertyReviewSummaryResponse } from "../../types/review";
import { getPropertyReviews, addPropertyReview } from "../../api/reviewApi";
import { deletePropertyImage } from "../../api/propertyApi";
import { getApiErrorMessage } from "../../api/error";
import { useAuth } from "../../context/useAuth";
import { getImageUrl } from "../../utils/imageUrl";

interface PropertyDetailModalProps {
    property: PropertyResponse;
    onClose: () => void;
    onBookOnline?: (property: PropertyResponse) => void;
    onOpenChat: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string) => void;
    onOpenManagePhotos?: (property: PropertyResponse) => void;
    onOpenRateLandlord?: (ownerId: number, ownerName: string) => void;
    onDeleteProperty?: (property: PropertyResponse) => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function PropertyDetailModal({
    property,
    onClose,
    onBookOnline,
    onOpenChat,
    onOpenManagePhotos,
    onOpenRateLandlord,
    onDeleteProperty,
    onSetAlert,
    onSetError,
}: PropertyDetailModalProps) {
    const { portalMode, user } = useAuth();
    const currentUserId = user?.userId;
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Reviews State
    const [reviewSummary, setReviewSummary] = useState<PropertyReviewSummaryResponse | null>(null);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [ratingInput, setRatingInput] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [commentInput, setCommentInput] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const [localImages, setLocalImages] = useState<string[]>(property.imageUrls || []);
    const [deletingPhoto, setDeletingPhoto] = useState(false);

    useEffect(() => {
        setLocalImages(property.imageUrls || []);
    }, [property.imageUrls]);

    const images = localImages;

    const handleDeleteActivePhoto = async () => {
        if (images.length === 0) return;
        const currentUrl = images[activeImageIndex];
        const parts = currentUrl.split("/");
        const imageId = Number(parts[parts.length - 1]);
        if (!imageId) return;

        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        setDeletingPhoto(true);
        onSetError("");
        onSetAlert("");
        try {
            await deletePropertyImage(imageId);
            const remaining = images.filter((_, idx) => idx !== activeImageIndex);
            setLocalImages(remaining);
            setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : 0));
            onSetAlert("Photo deleted successfully.");
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to delete photo."));
        } finally {
            setDeletingPhoto(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const data = await getPropertyReviews(property.id);
            setReviewSummary(data);
        } catch {
            // non-blocking
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        void fetchReviews();
    }, [property.id]);

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleSubmitReview = async (e: FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) return;

        setSubmittingReview(true);
        onSetError("");
        onSetAlert("");

        try {
            await addPropertyReview(property.id, {
                rating: ratingInput,
                comment: commentInput.trim(),
            });
            onSetAlert("Your review has been submitted successfully!");
            setCommentInput("");
            void fetchReviews();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to submit property review."));
        } finally {
            setSubmittingReview(false);
        }
    };

    const ownerId = property.ownerId || 1;
    const ownerName = property.ownerName || "Property Landlord";
    const isOwnerOfThis = portalMode === "owner" && currentUserId && property.ownerId === currentUserId;

    const displayRating = reviewSummary?.averageRating ?? property.averageRating;
    const totalReviews = reviewSummary?.totalReviews ?? property.totalReviews ?? 0;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}>
                {/* Header */}
                <div className="modal-header" style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(8px)" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h3 style={{ fontSize: "20px" }}>{property.propertyName}</h3>
                            <span className="type-badge">{property.propertyType}</span>
                            <span className={`status-pill ${property.status === "AVAILABLE" ? "paid" : "due"}`}>
                                {property.status}
                            </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                            <MapPin size={13} color="var(--primary)" />
                            <span>{property.address}, {property.city}, {property.state}, {property.country} - {property.postalCode}</span>
                        </div>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Image Gallery Hero */}
                    {images.length > 0 ? (
                        <div className="property-gallery-container">
                            <div className="gallery-main-viewer" style={{ position: "relative" }}>
                                <img
                                    src={getImageUrl(images[activeImageIndex])}
                                    alt={`${property.propertyName} view ${activeImageIndex + 1}`}
                                    className="gallery-main-img"
                                />

                                {isOwnerOfThis && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteActivePhoto}
                                        disabled={deletingPhoto}
                                        style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            background: "rgba(239, 68, 68, 0.88)",
                                            border: "none",
                                            color: "#fff",
                                            borderRadius: "var(--radius-sm)",
                                            padding: "5px 10px",
                                            fontSize: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            cursor: "pointer",
                                            backdropFilter: "blur(4px)",
                                            zIndex: 5
                                        }}
                                        title="Delete this photo"
                                    >
                                        {deletingPhoto ? <LoaderCircle size={13} className="spinning" /> : <Trash2 size={13} />}
                                        <span>Delete Photo</span>
                                    </button>
                                )}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            className="gallery-nav-btn prev"
                                            onClick={handlePrevImage}
                                            title="Previous Photo"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            className="gallery-nav-btn next"
                                            onClick={handleNextImage}
                                            title="Next Photo"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <span className="gallery-counter">
                                            {activeImageIndex + 1} / {images.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Strip */}
                            {images.length > 1 && (
                                <div className="gallery-thumb-strip">
                                    {images.map((url, idx) => (
                                        <div
                                            key={`thumb-${idx}`}
                                            className={`gallery-thumb-box ${idx === activeImageIndex ? "active" : ""}`}
                                            onClick={() => setActiveImageIndex(idx)}
                                        >
                                            <img src={getImageUrl(url)} alt={`Thumb ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="gallery-placeholder-hero">
                            <Building2 size={54} color="var(--primary)" style={{ opacity: 0.8 }} />
                            <h4 style={{ marginTop: "8px", color: "var(--text-primary)" }}>{property.propertyName}</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                No photos uploaded yet for this property listing
                            </span>
                            {isOwnerOfThis && onOpenManagePhotos && (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ marginTop: "12px" }}
                                    onClick={() => onOpenManagePhotos(property)}
                                >
                                    <ImagePlus size={14} />
                                    <span>Upload Photos</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Financials & Overview Banner */}
                    <div className="rented-financials-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
                        <div className="fin-item">
                            <span className="fin-label">Monthly Rent</span>
                            <span className="fin-val" style={{ fontSize: "18px", color: "var(--text-primary)" }}>
                                ₹{Number(property.rentAmount).toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="fin-item">
                            <span className="fin-label">Security Deposit</span>
                            <span className="fin-val" style={{ fontSize: "18px", color: "var(--purple)" }}>
                                ₹{Number(property.securityDeposit).toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div className="fin-item">
                            <span className="fin-label">Total Units</span>
                            <span className="fin-val">{property.totalUnits || 1} Unit(s)</span>
                        </div>
                        <div className="fin-item">
                            <span className="fin-label">Property Rating</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "15px" }}>
                                    {displayRating ? `${displayRating} / 5` : "New (No reviews)"}
                                </span>
                                {totalReviews > 0 && (
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        ({totalReviews})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div>
                            <h4 style={{ fontSize: "14px", marginBottom: "6px", color: "var(--text-primary)" }}>
                                About this Property
                            </h4>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, background: "rgba(15, 23, 42, 0.4)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                                {property.description}
                            </p>
                        </div>
                    )}

                    {/* Landlord Profile Card */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(30, 41, 59, 0.6)", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="chat-avatar" style={{ width: "42px", height: "42px" }}>
                                <User size={20} />
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{ownerName}</strong>
                                    <span className="type-badge" style={{ fontSize: "10px" }}>Verified Landlord</span>
                                </div>
                                {property.ownerRating && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#fbbf24", marginTop: "2px" }}>
                                        <Star size={12} fill="#fbbf24" />
                                        <span>{property.ownerRating} Landlord Rating</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {portalMode === "tenant" && onOpenRateLandlord && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => onOpenRateLandlord(ownerId, ownerName)}
                                >
                                    <Star size={13} />
                                    <span>Rate Landlord</span>
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => onOpenChat(ownerId, ownerName, property.id, property.propertyName)}
                            >
                                <MessageSquare size={14} />
                                <span>Chat with Landlord</span>
                            </button>
                        </div>
                    </div>

                    {/* Ratings & Comments Section */}
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <MessageCircle size={18} color="var(--primary)" />
                                <h4 style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                                    Tenant Reviews & Ratings ({totalReviews})
                                </h4>
                            </div>
                            {displayRating && (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(251, 191, 36, 0.15)", padding: "4px 10px", borderRadius: "var(--radius-full)", color: "#fbbf24", fontWeight: 700, fontSize: "13px" }}>
                                    <Star size={14} fill="#fbbf24" />
                                    <span>{displayRating} / 5.0</span>
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        {loadingReviews ? (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading reviews...</p>
                        ) : reviewSummary?.reviews && reviewSummary.reviews.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                                {reviewSummary.reviews.map((rev) => (
                                    <div key={`rev-${rev.id}`} className="review-comment-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                                                    {rev.reviewerName || "Verified Tenant"}
                                                </strong>
                                                <div style={{ display: "flex", gap: "2px" }}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star
                                                            key={s}
                                                            size={12}
                                                            fill={s <= rev.rating ? "#fbbf24" : "transparent"}
                                                            color={s <= rev.rating ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                                {formatDate(rev.createdAt)}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "16px" }}>
                                No reviews yet. Be the first to review this property!
                            </p>
                        )}

                        {/* Leave a Review Form (for Tenants) */}
                        {portalMode === "tenant" && (
                            <form onSubmit={handleSubmitReview} style={{ background: "rgba(15, 23, 42, 0.6)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                                <h5 style={{ fontSize: "13px", marginBottom: "8px", color: "var(--text-primary)" }}>
                                    Leave a Review for this Property
                                </h5>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Your Rating:</span>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const active = (hoverRating || ratingInput) >= star;
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRatingInput(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                                                >
                                                    <Star
                                                        size={18}
                                                        fill={active ? "#fbbf24" : "transparent"}
                                                        color={active ? "#fbbf24" : "rgba(255,255,255,0.3)"}
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#fbbf24", marginLeft: "4px" }}>
                                        {ratingInput} / 5
                                    </span>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Write your review / feedback about this property..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm"
                                        disabled={submittingReview || !commentInput.trim()}
                                    >
                                        <Send size={13} />
                                        <span>{submittingReview ? "Posting..." : "Post Review"}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="modal-footer" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {isOwnerOfThis && onOpenManagePhotos && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    onClose();
                                    onOpenManagePhotos(property);
                                }}
                            >
                                <ImagePlus size={15} />
                                <span>Upload / Manage Photos</span>
                            </button>
                        )}

                        {isOwnerOfThis && onDeleteProperty && (
                            <button
                                type="button"
                                className="btn btn-sm"
                                style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                                onClick={() => {
                                    onClose();
                                    onDeleteProperty(property);
                                }}
                            >
                                <Trash2 size={14} />
                                <span>Delete Property</span>
                            </button>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Close
                        </button>

                        {portalMode === "tenant" && property.status === "AVAILABLE" && onBookOnline && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    onClose();
                                    onBookOnline(property);
                                }}
                            >
                                <Sparkles size={15} />
                                <span>Book / Apply Online</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDate(isoStr: string) {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch {
        return "";
    }
}

export default PropertyDetailModal;
