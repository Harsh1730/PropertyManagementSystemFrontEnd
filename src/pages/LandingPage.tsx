import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    ArrowUpRight,
    Sun,
    Moon,
    MapPin,
    Compass,
    Star,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    LogIn,
    LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import { getAvailableProperties } from "../api/propertyApi";
import type { PropertyResponse } from "../types/api";
import "../styles/landing.css";

// Curated fallback luxury escapes if backend has no active records
const FALLBACK_PROPERTIES = [
    {
        id: 101,
        propertyName: "Villa Serena Retreat",
        propertyType: "HOUSE" as const,
        city: "Rain Town",
        state: "Montana",
        address: "971 Coolidge Street",
        rentAmount: 4200,
        securityDeposit: 8000,
        totalUnits: 1,
        status: "AVAILABLE" as const,
        bedrooms: 4,
        bathrooms: 3,
        imageUrl: "/images/hero-villa.jpg",
        description: "Minimalist Scandinavian timber and stone villa immersed in natural pine forest with heated infinity pool and warm ambient architecture."
    },
    {
        id: 102,
        propertyName: "Nordic Obsidian Haven",
        propertyType: "HOUSE" as const,
        city: "Whitefish",
        state: "Montana",
        address: "142 Alpine Ridge",
        rentAmount: 3800,
        securityDeposit: 7000,
        totalUnits: 1,
        status: "AVAILABLE" as const,
        bedrooms: 3,
        bathrooms: 2,
        imageUrl: "/images/bento-fireplace.jpg",
        description: "High-ceiling open concept living with wood burning stove, panoramic mountain glazing, and sunlit lime plaster interiors."
    },
    {
        id: 103,
        propertyName: "The Slate Sanctuary",
        propertyType: "FLAT" as const,
        city: "Bozeman",
        state: "Montana",
        address: "550 Canyon Vista",
        rentAmount: 3100,
        securityDeposit: 6000,
        totalUnits: 1,
        status: "AVAILABLE" as const,
        bedrooms: 2,
        bathrooms: 2,
        imageUrl: "/images/bento-bedroom.jpg",
        description: "Moody, tactile suite with fluted wood paneling, dark stone textures, and Japanese-inspired platform suite."
    }
];

const GALLERY_IMAGES = [
    { url: "/images/hero-villa.jpg", title: "Villa Exterior at Twilight", subtitle: "Rain Town, Montana" },
    { url: "/images/bento-comfort.jpg", title: "Sculptural Living Gallery", subtitle: "Comfort in Nature" },
    { url: "/images/bento-lookbook.jpg", title: "Architectural Plans & Library", subtitle: "Bespoke Design Study" },
    { url: "/images/bento-bedroom.jpg", title: "Master Suite & Slate Texture", subtitle: "Atmospheric Rest" },
    { url: "/images/bento-fireplace.jpg", title: "Scandinavian Fireplace Lounge", subtitle: "Morning Sun & Serenity" }
];

const REVIEWS = [
    {
        name: "Elena Rostova",
        location: "Zurich, Switzerland",
        rating: 5,
        stay: "August 2025",
        text: "The architectural lines and natural mountain lighting were unmatched. Booking was effortless and the heated pool under the evening stars was unforgettable."
    },
    {
        name: "Marcus Vance",
        location: "Seattle, WA",
        rating: 5,
        stay: "July 2025",
        text: "EstateFlow transformed how we book architectural getaways. The keyless check-in was seamless and the fireplace lounge provided absolute tranquility."
    },
    {
        name: "Sophia Chen",
        location: "San Francisco, CA",
        rating: 5,
        stay: "September 2025",
        text: "One simple booking, endless moments of peace and beauty. It truly feels like living inside an architectural magazine."
    }
];

export function LandingPage() {
    const { isAuthenticated, portalMode } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Hero search inputs
    const [fromDate, setFromDate] = useState("2025-08-03");
    const [toDate, setToDate] = useState("2025-10-03");
    const [phone, setPhone] = useState("+ (380) 50 561 80 69");
    const [activeTag, setActiveTag] = useState("Mountain Retreat");

    // Dynamic properties from backend API
    const [properties, setProperties] = useState<PropertyResponse[]>([]);

    // Modals
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(FALLBACK_PROPERTIES[0]);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const [showReviewsModal, setShowReviewsModal] = useState(false);

    // Interactive booking confirmation message
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Comfort card interactive slider
    const [comfortSlide, setComfortSlide] = useState(0);
    const comfortTexts = [
        { text: "Comfort in the heart of nature", highlight: "heart" },
        { text: "Organic textures crafted for deep rest", highlight: "deep rest" },
        { text: "Warm daylight streaming through timber", highlight: "daylight" }
    ];

    useEffect(() => {
        let isMounted = true;
        const fetchProperties = async () => {
            try {
                const data = await getAvailableProperties();
                if (isMounted && data && data.length > 0) {
                    setProperties(data);
                }
            } catch {
                // Keep fallbacks
            }
        };
        void fetchProperties();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleOpenBooking = (property?: any) => {
        if (property) setSelectedProperty(property);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBookingSuccess(true);
        setTimeout(() => {
            setBookingSuccess(false);
            setShowBookingModal(false);
            if (isAuthenticated) {
                navigate("/dashboard");
            } else {
                navigate("/login");
            }
        }, 1500);
    };

    const handleNextComfort = () => {
        setComfortSlide((prev) => (prev + 1) % comfortTexts.length);
    };

    const handlePrevComfort = () => {
        setComfortSlide((prev) => (prev - 1 + comfortTexts.length) % comfortTexts.length);
    };

    const displayProps = properties.length > 0 ? properties.slice(0, 3) : FALLBACK_PROPERTIES;

    return (
        <div className="landing-page">
            {/* 1. FLOATING NAVIGATION BAR */}
            <div className="landing-nav-wrapper">
                <header className="landing-nav">
                    <div className="landing-nav-left">
                        <Link to="/" className="landing-brand">
                            <div className="landing-brand-logo">
                                <Building2 size={19} />
                            </div>
                            <span className="landing-brand-name">EstateFlow</span>
                        </Link>
                    </div>

                    <nav className="landing-nav-center">
                        <button type="button" className="landing-nav-link active">
                            Home
                        </button>
                        <a href="#about" className="landing-nav-link">
                            About
                        </a>
                        <a href="#how-it-works" className="landing-nav-link">
                            How it works
                        </a>
                        <a href="#escapes" className="landing-nav-link">
                            Properties
                        </a>
                        <a href="#pricing" className="landing-nav-link">
                            Pricing
                        </a>
                    </nav>

                    <div className="landing-nav-right">
                        <div className="landing-nav-meta">
                            <span className="landing-lang-badge">EN</span>
                            <a href="tel:+620995368973" className="landing-phone-link">
                                +62 (099) 536 8973
                            </a>
                        </div>

                        <button
                            type="button"
                            className="landing-theme-toggle"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === "light" ? "Nocturnal Dusk" : "Warm Linen"} Theme`}
                        >
                            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        {isAuthenticated ? (
                            <Link to="/dashboard" className="landing-cta-btn">
                                <LayoutDashboard size={15} />
                                <span>{portalMode === "owner" ? "Owner Portal" : "Dashboard"}</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="landing-cta-btn">
                                <LogIn size={15} />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </header>
            </div>

            {/* 2. HERO CONTAINER */}
            <section className="landing-hero-container">
                <div className="landing-hero-card">
                    {/* Background dusk architectural photography */}
                    <img
                        src="/images/hero-villa.jpg"
                        alt="Modern luxury villa at dusk with warm interior lighting"
                        className="landing-hero-bg"
                    />
                    <div className="landing-hero-overlay" />

                    {/* Hero Header Content */}
                    <div className="landing-hero-content">
                        <div className="landing-hero-left">
                            <div className="landing-status-badge">
                                <span className="status-dot-green" />
                                <span>Available now</span>
                            </div>
                            <h1 className="landing-hero-title">
                                Plan Your<br />Escape
                            </h1>
                        </div>

                        {/* Right Side Pill Tags */}
                        <div className="landing-hero-tags">
                            {["Mountain Retreat", "Nordic Charm", "Cozy Cottage", "Nature Escape"].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`landing-tag-pill ${activeTag === tag ? "active" : ""}`}
                                    onClick={() => setActiveTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Booking Strip & Location */}
                    <div className="landing-hero-bottom">
                        <div className="landing-booking-strip">
                            <div className="booking-field-group">
                                <label className="booking-field-label">From Date</label>
                                <input
                                    type="date"
                                    className="booking-field-input"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>

                            <div className="booking-field-group">
                                <label className="booking-field-label">To Date</label>
                                <input
                                    type="date"
                                    className="booking-field-input"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>

                            <div className="booking-field-group">
                                <label className="booking-field-label">Phone Number</label>
                                <input
                                    type="text"
                                    className="booking-field-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+ (380) 50 561 80 69"
                                />
                            </div>

                            <button
                                type="button"
                                className="booking-btn-book"
                                onClick={() => handleOpenBooking()}
                            >
                                <span>Book a House</span>
                                <ArrowUpRight size={17} />
                            </button>
                        </div>

                        <div className="landing-hero-address">
                            <strong>971 Coolidge Street</strong>
                            <span>Rain Town, Montana 59917</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECTION: /About house (Bento Grid) */}
            <section id="about" className="landing-about-section">
                <div className="landing-section-header">
                    <h2 className="landing-section-title">/About house</h2>
                </div>

                <div className="bento-grid">
                    {/* Card 1: Comfort & Nature */}
                    <div className="bento-card bento-card-comfort">
                        <div className="bento-card-comfort-img-wrap">
                            <img
                                src="/images/bento-comfort.jpg"
                                alt="Folded architectural origami sculpture vignette"
                                className="bento-card-comfort-img"
                            />
                        </div>
                        <div className="bento-card-comfort-body">
                            <p className="bento-card-comfort-title">
                                Comfort in the <span className="highlight">{comfortTexts[comfortSlide].highlight}</span> of nature
                            </p>
                            <div className="bento-slider-controls">
                                <button
                                    type="button"
                                    className="bento-arrow-btn bento-arrow-btn-muted"
                                    onClick={handlePrevComfort}
                                    title="Previous vignette"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="bento-arrow-btn bento-arrow-btn-accent"
                                    onClick={handleNextComfort}
                                    title="Next vignette"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Lookbook & Gallery */}
                    <div className="bento-card bento-card-lookbook">
                        <img
                            src="/images/bento-lookbook.jpg"
                            alt="Open architectural magazine on oak wood"
                            className="bento-card-img-full"
                        />
                        <div className="bento-card-bottom-action">
                            <button
                                type="button"
                                className="bento-pill-action"
                                onClick={() => setShowGalleryModal(true)}
                            >
                                <span>View Full Gallery</span>
                                <ArrowUpRight size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Modern Moody Bedroom Suite */}
                    <div className="bento-card bento-card-bedroom">
                        <img
                            src="/images/bento-bedroom.jpg"
                            alt="Moody luxury bedroom with slate wall and amber bedside light"
                            className="bento-card-img-full"
                        />
                        <div className="bento-card-floating-circles">
                            <button
                                type="button"
                                className="bento-circle-btn"
                                onClick={() => handleOpenBooking()}
                                title="Pin location"
                            >
                                <MapPin size={17} />
                            </button>
                            <button
                                type="button"
                                className="bento-circle-btn"
                                onClick={() => setShowGalleryModal(true)}
                                title="Explore Suite"
                            >
                                <Compass size={17} />
                            </button>
                        </div>
                    </div>

                    {/* Card 4: Mountain Retreat Quote */}
                    <div className="bento-card bento-card-quote">
                        <div className="bento-tag-badge">
                            <span>Mountain Retreat</span>
                        </div>
                        <div className="bento-quote-text">
                            One <span className="highlight">simple</span> booking, endless moments of{" "}
                            <span className="highlight">peace</span> and <span className="highlight">beauty</span>
                            <ArrowUpRight size={18} className="bento-quote-arrow" />
                        </div>
                    </div>

                    {/* Card 5: Scandinavian Fireplace Lounge & Reviews */}
                    <div className="bento-card bento-card-fireplace">
                        <img
                            src="/images/bento-fireplace.jpg"
                            alt="Scandinavian sunlit living room with black fireplace stove"
                            className="bento-card-img-full"
                        />
                        <div className="bento-card-top-action">
                            <button
                                type="button"
                                className="bento-reviews-pill"
                                onClick={() => setShowReviewsModal(true)}
                            >
                                <span>Reviews</span>
                                <ArrowUpRight size={14} />
                            </button>
                        </div>

                        <div className="bento-customers-card">
                            <div className="bento-customers-label">Satisfied Customers</div>
                            <div className="bento-customers-avatars">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                    alt="Guest avatar"
                                    className="bento-avatar"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                                    alt="Guest avatar"
                                    className="bento-avatar"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                                    alt="Guest avatar"
                                    className="bento-avatar"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                                    alt="Guest avatar"
                                    className="bento-avatar"
                                />
                                <span className="bento-avatar-badge">125+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. CURATED ESCAPES (AVAILABLE PROPERTIES) */}
            <section id="escapes" className="landing-properties-section">
                <div className="landing-section-header">
                    <h2 className="landing-section-title">Curated Escapes</h2>
                    <p className="landing-section-subtitle">
                        Handcrafted sanctuaries engineered for stillness, architectural beauty, and restorative living.
                    </p>
                </div>

                <div className="featured-properties-grid">
                    {displayProps.map((prop) => (
                        <div key={prop.id} className="featured-prop-card">
                            <div className="featured-prop-image-wrap">
                                <img
                                    src={((prop as any).imageUrls && (prop as any).imageUrls[0]) || (prop as any).imageUrl || "/images/hero-villa.jpg"}
                                    alt={prop.propertyName}
                                    className="featured-prop-image"
                                />
                                <div className="featured-prop-tag">{prop.propertyType}</div>
                                <div className="featured-prop-price-badge">
                                    ${((prop as any).rentAmount || (prop as any).monthlyRent || 3800)?.toLocaleString()}/mo
                                </div>
                            </div>
                            <div className="featured-prop-body">
                                <div>
                                    <h3 className="featured-prop-name">{prop.propertyName}</h3>
                                    <div className="featured-prop-location">
                                        <MapPin size={15} />
                                        <span>
                                            {prop.city}, {prop.state || "Montana"}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                        {(prop as any).description || "Architectural sanctuary with natural light and refined finishes."}
                                    </p>
                                </div>

                                <div>
                                    <div className="featured-prop-meta">
                                        <span>{(prop as any).bedrooms || 3} Bedrooms</span>
                                        <span>•</span>
                                        <span>{(prop as any).bathrooms || 2} Bathrooms</span>
                                        <span>•</span>
                                        <span>Verified Stay</span>
                                    </div>

                                    <div className="featured-prop-action-row">
                                        <button
                                            type="button"
                                            className="btn-reserve-prop"
                                            onClick={() => handleOpenBooking(prop)}
                                        >
                                            <span>Reserve House</span>
                                            <ArrowUpRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. EXPERIENCE & HOW IT WORKS */}
            <section id="how-it-works" className="landing-experience-section">
                <div className="landing-section-header">
                    <h2 className="landing-section-title">The Effortless Journey</h2>
                    <p className="landing-section-subtitle">
                        From discovering architectural sanctuaries to digital leases and intelligent keyless entry.
                    </p>
                </div>

                <div className="experience-grid">
                    <div className="experience-card">
                        <div className="experience-step-num">01</div>
                        <h3 className="experience-card-title">Curated Discovery</h3>
                        <p className="experience-card-desc">
                            Every villa and sanctuary is handpicked for architectural integrity, natural seclusion, and tactile comfort.
                        </p>
                    </div>

                    <div className="experience-card">
                        <div className="experience-step-num">02</div>
                        <h3 className="experience-card-title">Instant Digital Lease</h3>
                        <p className="experience-card-desc">
                            Seamless paperless contracts, encrypted deposit handling, and direct owner messaging in one unified portal.
                        </p>
                    </div>

                    <div className="experience-card">
                        <div className="experience-step-num">03</div>
                        <h3 className="experience-card-title">24/7 Concierge Care</h3>
                        <p className="experience-card-desc">
                            Automated maintenance dispatches, local culinary recommendations, and high-touch hospitality throughout your stay.
                        </p>
                    </div>
                </div>
            </section>

            {/* 6. FOOTER */}
            <footer className="landing-footer">
                <div className="landing-footer-grid">
                    <div>
                        <div className="landing-brand">
                            <div className="landing-brand-logo">
                                <Building2 size={18} />
                            </div>
                            <span className="landing-brand-name">EstateFlow</span>
                        </div>
                        <p className="footer-brand-desc">
                            High-end retreat living and modern property management designed for architectural enthusiasts and discerning owners.
                        </p>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Navigation</h4>
                        <ul className="footer-links-list">
                            <li><a href="#about" className="footer-link">About House</a></li>
                            <li><a href="#escapes" className="footer-link">Featured Stays</a></li>
                            <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
                            <li><Link to="/login" className="footer-link">Owner & Tenant Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Locations</h4>
                        <ul className="footer-links-list">
                            <li><span className="footer-link">Rain Town, Montana</span></li>
                            <li><span className="footer-link">Aspen Valley, Colorado</span></li>
                            <li><span className="footer-link">Nordic Coast, Oregon</span></li>
                            <li><span className="footer-link">Sedona Ridge, Arizona</span></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-col-title">Contact</h4>
                        <ul className="footer-links-list">
                            <li><a href="tel:+620995368973" className="footer-link">+62 (099) 536 8973</a></li>
                            <li><a href="mailto:concierge@estateflow.luxury" className="footer-link">concierge@estateflow.luxury</a></li>
                            <li><span className="footer-link">971 Coolidge Street, MT</span></li>
                        </ul>
                    </div>
                </div>

                <div className="landing-footer-bottom">
                    <div>&copy; {new Date().getFullYear()} EstateFlow Retreats & Property Management. All rights reserved.</div>
                    <div style={{ display: "flex", gap: "16px" }}>
                        <a href="#privacy" className="footer-link">Privacy Policy</a>
                        <a href="#terms" className="footer-link">Terms of Hospitality</a>
                    </div>
                </div>
            </footer>

            {/* 7. MODALS */}
            {/* Booking Reservation Modal */}
            {showBookingModal && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="luxury-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="luxury-modal-close"
                            onClick={() => setShowBookingModal(false)}
                        >
                            <X size={18} />
                        </button>

                        <h3 className="modal-header-serif">Reserve Your Escape</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                            {selectedProperty ? selectedProperty.propertyName : "Villa Serena Retreat"} • Rain Town, MT
                        </p>

                        {bookingSuccess ? (
                            <div style={{ textAlign: "center", padding: "30px 10px" }}>
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    background: "var(--success-bg)",
                                    color: "var(--success)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px auto"
                                }}>
                                    <Check size={28} />
                                </div>
                                <h4 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                    Inquiry Received!
                                </h4>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "6px" }}>
                                    Redirecting to your dashboard to complete your reservation...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                                            Check-In Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                borderRadius: "var(--radius-sm)",
                                                border: "1px solid var(--border-medium)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)"
                                            }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                                            Check-Out Date
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                borderRadius: "var(--radius-sm)",
                                                border: "1px solid var(--border-medium)",
                                                backgroundColor: "var(--bg-input)",
                                                color: "var(--text-primary)"
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                                        Contact Phone / WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--border-medium)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)"
                                        }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                                        Special Requests / Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tell us about your stay, party size, or architectural preferences..."
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            borderRadius: "var(--radius-sm)",
                                            border: "1px solid var(--border-medium)",
                                            backgroundColor: "var(--bg-input)",
                                            color: "var(--text-primary)",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: "8px",
                                        padding: "12px 24px",
                                        borderRadius: "var(--radius-pill)",
                                        backgroundColor: "var(--accent)",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        fontSize: "0.95rem",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px"
                                    }}
                                >
                                    <span>Confirm Reservation Request</span>
                                    <ArrowUpRight size={17} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Gallery Lightbox Modal */}
            {showGalleryModal && (
                <div className="modal-overlay" onClick={() => setShowGalleryModal(false)}>
                    <div className="luxury-modal-card gallery-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="luxury-modal-close"
                            onClick={() => setShowGalleryModal(false)}
                            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", borderColor: "rgba(255,255,255,0.2)" }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ position: "relative" }}>
                            <img
                                src={GALLERY_IMAGES[activeGalleryIndex].url}
                                alt={GALLERY_IMAGES[activeGalleryIndex].title}
                                className="gallery-slider-img"
                            />
                            <div style={{
                                marginTop: "16px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div>
                                    <h4 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "1.4rem", color: "#ffffff" }}>
                                        {GALLERY_IMAGES[activeGalleryIndex].title}
                                    </h4>
                                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}>
                                        {GALLERY_IMAGES[activeGalleryIndex].subtitle}
                                    </p>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type="button"
                                        className="bento-arrow-btn bento-arrow-btn-muted"
                                        onClick={() => setActiveGalleryIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
                                        style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="bento-arrow-btn bento-arrow-btn-accent"
                                        onClick={() => setActiveGalleryIndex((prev) => (prev + 1) % GALLERY_IMAGES.length)}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal */}
            {showReviewsModal && (
                <div className="modal-overlay" onClick={() => setShowReviewsModal(false)}>
                    <div className="luxury-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="luxury-modal-close"
                            onClick={() => setShowReviewsModal(false)}
                        >
                            <X size={18} />
                        </button>

                        <h3 className="modal-header-serif">Guest Reflections</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                            Verified reviews from residents and guests of our Montana sanctuaries.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {REVIEWS.map((rev) => (
                                <div key={rev.name} style={{
                                    padding: "16px",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--bg-subtle)",
                                    border: "1px solid var(--border-subtle)"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <div>
                                            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{rev.name}</strong>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "8px" }}>{rev.location}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "2px", color: "var(--accent)" }}>
                                            {[...Array(rev.rating)].map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                        "{rev.text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LandingPage;
