import { useState, type FormEvent } from "react";
import { X, Star, Send, User } from "lucide-react";
import { addOwnerReview } from "../../api/reviewApi";
import { getApiErrorMessage } from "../../api/error";

interface OwnerReviewModalProps {
    ownerId: number;
    ownerName: string;
    onClose: () => void;
    onReviewSubmitted: () => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function OwnerReviewModal({
    ownerId,
    ownerName,
    onClose,
    onReviewSubmitted,
    onSetAlert,
    onSetError,
}: OwnerReviewModalProps) {
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmitting(true);
        onSetError("");
        onSetAlert("");

        try {
            await addOwnerReview(ownerId, {
                rating,
                comment: comment.trim(),
            });
            onSetAlert(`Thank you! Your ${rating}-star review for landlord "${ownerName}" was submitted.`);
            onReviewSubmitted();
            onClose();
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to submit landlord review."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
                <div className="modal-header">
                    <div>
                        <h3 style={{ fontSize: "18px" }}>Rate Landlord</h3>
                        <span className="modal-subtitle">Share your rental experience with {ownerName}</span>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Landlord Profile Mini Card */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(15, 23, 42, 0.6)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                            <div className="chat-avatar" style={{ width: "36px", height: "36px" }}>
                                <User size={18} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: "14px", color: "var(--text-primary)" }}>{ownerName}</h4>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Property Owner / Landlord</span>
                            </div>
                        </div>

                        {/* Interactive Star Rating Selector */}
                        <div className="form-group" style={{ textAlign: "center", margin: "8px 0" }}>
                            <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                                Your Overall Rating
                            </label>
                            <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = (hoverRating || rating) >= star;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "4px",
                                                transition: "transform 0.15s ease",
                                            }}
                                        >
                                            <Star
                                                size={28}
                                                fill={active ? "#fbbf24" : "transparent"}
                                                color={active ? "#fbbf24" : "rgba(255,255,255,0.3)"}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#fbbf24", marginTop: "6px", display: "inline-block" }}>
                                {rating === 5 && "Excellent (5 Stars)"}
                                {rating === 4 && "Very Good (4 Stars)"}
                                {rating === 3 && "Average (3 Stars)"}
                                {rating === 2 && "Poor (2 Stars)"}
                                {rating === 1 && "Terrible (1 Star)"}
                            </span>
                        </div>

                        {/* Comment Textarea */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="owner-review-comment">
                                Feedback / Comment *
                            </label>
                            <textarea
                                id="owner-review-comment"
                                className="form-textarea"
                                rows={4}
                                placeholder="How responsive, accommodating, and fair was the landlord?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !comment.trim()}
                        >
                            <Send size={15} />
                            <span>{submitting ? "Submitting..." : "Submit Landlord Review"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OwnerReviewModal;
