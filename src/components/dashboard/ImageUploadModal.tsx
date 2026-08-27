import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { X, Upload, Trash2, ImagePlus, LoaderCircle } from "lucide-react";
import type { PropertyResponse } from "../../types/api";
import { uploadPropertyImages, deletePropertyImage } from "../../api/propertyApi";
import { getApiErrorMessage } from "../../api/error";

interface ImageUploadModalProps {
    property: PropertyResponse;
    onClose: () => void;
    onUpdated: (updatedProp: PropertyResponse) => void;
    onSetAlert: (msg: string) => void;
    onSetError: (msg: string) => void;
}

export function ImageUploadModal({
    property,
    onClose,
    onUpdated,
    onSetAlert,
    onSetError,
}: ImageUploadModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setSelectedFiles((prev) => [...prev, ...files]);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const handleRemovePreview = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);
        onSetError("");
        onSetAlert("");

        try {
            const updated = await uploadPropertyImages(property.id, selectedFiles);
            onSetAlert(`Successfully uploaded ${selectedFiles.length} photo(s) to "${property.propertyName}".`);
            setSelectedFiles([]);
            setPreviews([]);
            onUpdated(updated);
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to upload property images."));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteExisting = async (imageUrl: string) => {
        const parts = imageUrl.split("/");
        const imageIdStr = parts[parts.length - 1];
        const imageId = Number(imageIdStr);
        if (!imageId) return;

        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        setDeletingId(imageUrl);
        onSetError("");
        onSetAlert("");

        try {
            await deletePropertyImage(imageId);
            const remainingUrls = (property.imageUrls || []).filter((u) => u !== imageUrl);
            const updated: PropertyResponse = {
                ...property,
                imageUrls: remainingUrls,
            };
            onSetAlert("Photo deleted successfully.");
            onUpdated(updated);
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to delete photo."));
        } finally {
            setDeletingId(null);
        }
    };

    const existingImages = property.imageUrls || [];

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                <div className="modal-header">
                    <div>
                        <h3 style={{ fontSize: "18px" }}>Manage Property Photos</h3>
                        <span className="modal-subtitle">Upload and manage photos for {property.propertyName}</span>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Existing Photos */}
                    <div>
                        <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                            Current Photos ({existingImages.length})
                        </label>
                        {existingImages.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
                                No photos uploaded for this property yet.
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                                {existingImages.map((url, idx) => (
                                    <div key={`existing-img-${idx}`} className="gallery-thumb-item" style={{ position: "relative", height: "85px" }}>
                                        <img
                                            src={url}
                                            alt={`Property ${idx + 1}`}
                                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExisting(url)}
                                            disabled={deletingId === url}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                background: "rgba(239, 68, 68, 0.85)",
                                                border: "none",
                                                color: "#fff",
                                                borderRadius: "50%",
                                                width: "24px",
                                                height: "24px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                            title="Delete photo"
                                        >
                                            {deletingId === url ? <LoaderCircle size={12} className="spinning" /> : <Trash2 size={12} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload New Photos Area */}
                    <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                        <label className="form-label">Upload New Photos</label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: "2px dashed var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                padding: "24px",
                                textAlign: "center",
                                cursor: "pointer",
                                background: "rgba(15, 23, 42, 0.4)",
                                transition: "all var(--transition-fast)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                        >
                            <ImagePlus size={32} style={{ color: "var(--primary)", margin: "0 auto 8px" }} />
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                                Click to select property images
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                Supports JPEG, PNG, WEBP (multiple files allowed)
                            </p>
                        </div>

                        {/* Previews of newly selected files */}
                        {previews.length > 0 && (
                            <div>
                                <label className="form-label" style={{ fontSize: "12px", marginBottom: "6px", display: "block" }}>
                                    Selected for Upload ({previews.length})
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                                    {previews.map((src, i) => (
                                        <div key={`prev-${i}`} style={{ position: "relative", height: "65px" }}>
                                            <img
                                                src={src}
                                                alt="Preview"
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
                            </div>
                        )}

                        <div className="modal-footer" style={{ marginTop: "12px", padding: 0 }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading || selectedFiles.length === 0}
                            >
                                <Upload size={15} />
                                <span>{uploading ? "Uploading Photos..." : `Upload ${selectedFiles.length} Photo(s)`}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ImageUploadModal;
