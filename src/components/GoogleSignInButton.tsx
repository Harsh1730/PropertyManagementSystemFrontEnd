import { useEffect, useRef, useState } from "react";
import type { UserRole } from "../types/api";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: {
                            type?: "standard" | "icon";
                            theme?: "outline" | "filled_blue" | "filled_black";
                            size?: "large" | "medium" | "small";
                            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
                            shape?: "rectangular" | "pill" | "circle" | "square";
                            logo_alignment?: "left" | "center";
                            width?: number | string;
                        }
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

interface GoogleSignInButtonProps {
    onSuccess: (idToken: string) => void;
    onError?: (error: string) => void;
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    role?: UserRole;
    disabled?: boolean;
}

export function GoogleSignInButton({
    onSuccess,
    onError,
    text = "continue_with",
    disabled = false,
}: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const isConfigured = Boolean(clientId && !clientId.includes("placeholder"));

    useEffect(() => {
        if (!isConfigured) {
            return;
        }

        // Load Google Identity Services script if not present
        if (window.google?.accounts?.id) {
            setScriptLoaded(true);
            return;
        }

        const existingScript = document.getElementById("google-gsi-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => setScriptLoaded(true));
            return;
        }

        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => {
            if (onError) onError("Failed to load Google Sign-In SDK");
        };
        document.head.appendChild(script);
    }, [isConfigured, onError]);

    useEffect(() => {
        if (!isConfigured || !scriptLoaded || !buttonRef.current || !window.google?.accounts?.id) {
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => {
                    if (response.credential) {
                        onSuccess(response.credential);
                    } else {
                        if (onError) onError("Google Sign-In failed to return credentials");
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            buttonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(buttonRef.current, {
                type: "standard",
                theme: "filled_black",
                size: "large",
                text: text,
                shape: "rectangular",
                logo_alignment: "left",
                width: 320,
            });
        } catch (e) {
            console.error("Google button initialization error:", e);
        }
    }, [isConfigured, scriptLoaded, clientId, text, onSuccess, onError]);

    if (!isConfigured) {
        return (
            <button
                type="button"
                className="btn"
                onClick={() => {
                    if (onError) {
                        onError("Google OAuth Client ID is not configured yet. Please add VITE_GOOGLE_CLIENT_ID to your .env file.");
                    }
                }}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
                <span>{text === "signup_with" ? "Sign up with Google" : "Continue with Google"}</span>
            </button>
        );
    }


    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}>
            <div ref={buttonRef} style={{ minHeight: "44px", width: "100%", display: "flex", justifyContent: "center" }} />
        </div>
    );
}

export default GoogleSignInButton;
