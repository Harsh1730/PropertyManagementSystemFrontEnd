import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Building2, Sun, Moon } from "lucide-react";
import { loginUser } from "../api/Authapi";
import { getApiErrorMessage } from "../api/error";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginUser({
                email: email.trim(),
                password,
            });

            login(response);
            navigate("/dashboard");
        } catch (apiError) {
            setError(getApiErrorMessage(apiError, "Invalid credentials. Please check your email and password."));
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

            <div className="auth-form-card">
                <div className="auth-header">
                    <div className="auth-brand-icon">
                        <Building2 size={20} />
                    </div>
                    <h1 className="auth-title">EstateFlow</h1>
                    <p className="auth-subtitle">Sign in to your property management dashboard</p>
                </div>

                {error && (
                    <div className="alert-banner error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email-input">Email Address</label>
                        <input
                            id="email-input"
                            type="email"
                            className="form-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="form-label" htmlFor="password-input">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <div style={{ position: "relative" }}>
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", marginTop: "6px", padding: "10px" }}
                    >
                        <LogIn size={15} />
                        <span>{loading ? "Signing in..." : "Sign In"}</span>
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        Create one
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Login;