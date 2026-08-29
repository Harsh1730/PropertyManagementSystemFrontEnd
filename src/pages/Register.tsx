import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Building2, Sun, Moon } from "lucide-react";
import { registerUser, loginWithGoogle } from "../api/Authapi";
import { getApiErrorMessage } from "../api/error";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import type { UserRole } from "../types/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("TENANT");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await registerUser({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                password,
                role,
            });

            setSuccess(response.msg || "Account created successfully! Redirecting to login...");

            window.setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, "Registration failed. Please check your details."));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (idToken: string) => {
        setError("");
        setLoading(true);
        try {
            const response = await loginWithGoogle({ idToken, role });
            login(response);
            navigate("/dashboard");
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, "Google registration failed. Please try again."));
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="auth-container">
            {/* Theme Toggle Top-Right */}
            <button
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                style={{ position: "absolute", top: "20px", right: "20px" }}
                title={`Switch to ${theme === "light" ? "Charcoal Dark" : "Clean Light"} Theme`}
            >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="auth-form-card" style={{ maxWidth: "480px" }}>
                <div className="auth-header">
                    <div className="auth-brand-icon">
                        <Building2 size={20} />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join EstateFlow for property operations</p>
                </div>

                {error && (
                    <div className="alert-banner error">
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert-banner success">
                        <span>{success}</span>
                    </div>
                )}

                {/* Role Tabs */}
                <div className="auth-role-tabs">
                    <button
                        type="button"
                        className={`role-tab-btn ${role === "TENANT" ? "active" : ""}`}
                        onClick={() => setRole("TENANT")}
                    >
                        Tenant / Renter
                    </button>
                    <button
                        type="button"
                        className={`role-tab-btn ${role === "OWNER" ? "active" : ""}`}
                        onClick={() => setRole("OWNER")}
                    >
                        Property Owner
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-grid two-col">
                    <div className="form-group">
                        <label className="form-label" htmlFor="first-name">First Name *</label>
                        <input
                            id="first-name"
                            type="text"
                            className="form-input"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="last-name">Last Name *</label>
                        <input
                            id="last-name"
                            type="text"
                            className="form-input"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label" htmlFor="email-register">Email Address *</label>
                        <input
                            id="email-register"
                            type="email"
                            className="form-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label" htmlFor="phone-number">Phone Number *</label>
                        <input
                            id="phone-number"
                            type="tel"
                            className="form-input"
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="form-label" htmlFor="password-register">Password *</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <input
                            id="password-register"
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            placeholder="Minimum 4 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={4}
                        />
                    </div>

                    <div className="form-group full-width" style={{ marginTop: "6px" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: "100%", padding: "10px" }}
                        >
                            <UserPlus size={15} />
                            <span>{loading ? "Creating..." : `Register as ${role === "OWNER" ? "Owner" : "Tenant"}`}</span>
                        </button>
                    </div>
                </form>

                {/* Social Registration Divider */}
                <div style={{ display: "flex", alignItems: "center", margin: "20px 0 16px", gap: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>or sign up with</span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                </div>

                {/* Google Sign-In Button */}
                <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={(err) => setError(err)}
                    text="signup_with"
                    role={role}
                    disabled={loading}
                />

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </div>
            </div>
        </main>

    );
}

export default Register;