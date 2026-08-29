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

    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "366114134958-placeholder.apps.googleusercontent.com";

    useEffect(() => {
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
    }, [onError]);

    useEffect(() => {
        if (!scriptLoaded || !buttonRef.current || !window.google?.accounts?.id) {
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
    }, [scriptLoaded, clientId, text, onSuccess, onError]);

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? "none" : "auto" }}>
            <div ref={buttonRef} style={{ minHeight: "44px", width: "100%", display: "flex", justifyContent: "center" }} />
        </div>
    );
}

export default GoogleSignInButton;
