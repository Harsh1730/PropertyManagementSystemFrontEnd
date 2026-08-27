import { useState, useEffect, useRef, type FormEvent } from "react";
import {
    Send,
    X,
    User,
    Building2,
    MessageSquare,
    LoaderCircle,
    Check,
    CheckCheck
} from "lucide-react";
import type { ChatMessageResponse } from "../../types/chat";
import { sendMessage, getConversation } from "../../api/chatApi";
import { getApiErrorMessage } from "../../api/error";
import { useAuth } from "../../context/useAuth";

interface ChatDrawerProps {
    otherUserId: number;
    otherUserName: string;
    otherUserRole?: string;
    propertyId?: number;
    propertyName?: string;
    bookingId?: number;
    onClose: () => void;
}

export function ChatDrawer({
    otherUserId,
    otherUserName,
    otherUserRole,
    propertyId,
    propertyName,
    bookingId,
    onClose,
}: ChatDrawerProps) {
    const { user, userEmail } = useAuth();
    const currentUserId = user?.userId;
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async (isInitial = false) => {
        try {
            const data = await getConversation(otherUserId);
            setMessages(data);
            if (isInitial) {
                setTimeout(scrollToBottom, 100);
            }
        } catch (err) {
            if (isInitial) {
                setError(getApiErrorMessage(err, "Failed to load chat history."));
            }
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        void fetchMessages(true);

        const interval = setInterval(() => {
            if (isCurrent) {
                void fetchMessages(false);
            }
        }, 3000);

        return () => {
            isCurrent = false;
            clearInterval(interval);
        };
    }, [otherUserId]);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        const text = inputMessage.trim();
        if (!text || sending) return;

        setSending(true);
        setError("");

        try {
            const sent = await sendMessage({
                receiverId: otherUserId,
                propertyId,
                bookingId,
                message: text,
            });

            setMessages((prev) => [...prev, sent]);
            setInputMessage("");
            setTimeout(scrollToBottom, 50);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to send message."));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="chat-drawer-backdrop" onClick={onClose}>
            <div className="chat-drawer-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="chat-drawer-header">
                    <div className="chat-user-info">
                        <div className="chat-avatar">
                            <User size={16} />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                    {otherUserName}
                                </span>
                                {otherUserRole && (
                                    <span className="type-badge" style={{ fontSize: "10px" }}>{otherUserRole}</span>
                                )}
                            </div>
                            {propertyName && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                                    <Building2 size={11} />
                                    <span>{propertyName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        title="Close Chat"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Messages Body */}
                <div className="chat-messages-container">
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "8px" }}>
                            <LoaderCircle size={20} className="spinning" />
                            <span style={{ fontSize: "12px" }}>Loading chat history...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: "center", color: "var(--text-muted)", margin: "auto", padding: "20px" }}>
                            <MessageSquare size={32} style={{ opacity: 0.4, margin: "0 auto 8px" }} />
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Start the conversation</p>
                            <p style={{ fontSize: "11px", marginTop: "2px" }}>
                                Send a message to discuss booking details or lease terms.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = (currentUserId && msg.senderId === currentUserId) ||
                                (userEmail && msg.senderEmail === userEmail);
                            return (
                                <div
                                    key={`msg-${msg.id}`}
                                    className={`chat-bubble-row ${isMe ? "me" : "other"}`}
                                >
                                    <div className={`chat-bubble ${isMe ? "me" : "other"}`}>
                                        {msg.message}
                                    </div>
                                    <div className="chat-time">
                                        <span>{formatTime(msg.timestamp)}</span>
                                        {isMe && (
                                            msg.isRead ? (
                                                <CheckCheck size={11} color="var(--info)" />
                                            ) : (
                                                <Check size={11} />
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert-banner error" style={{ margin: 0, borderRadius: 0, padding: "6px 12px", fontSize: "11px" }}>
                        <span>{error}</span>
                    </div>
                )}

                {/* Input Bar */}
                <form className="chat-input-bar" onSubmit={handleSend}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Type a message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={sending}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={sending || !inputMessage.trim()}
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}

function formatTime(isoStr: string) {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

export default ChatDrawer;
