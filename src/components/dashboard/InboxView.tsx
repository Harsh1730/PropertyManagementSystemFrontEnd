import { useState, useEffect } from "react";
import {
    MessageSquare,
    User,
    Building2,
    Search,
    LoaderCircle
} from "lucide-react";
import type { ConversationSummaryResponse } from "../../types/chat";
import { getChatInbox } from "../../api/chatApi";
import { getApiErrorMessage } from "../../api/error";

interface InboxViewProps {
    onOpenChat: (otherUserId: number, otherUserName: string, propertyId?: number, propertyName?: string) => void;
    onSetError: (msg: string) => void;
}

export function InboxView({
    onOpenChat,
    onSetError,
}: InboxViewProps) {
    const [threads, setThreads] = useState<ConversationSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchInbox = async () => {
        try {
            const data = await getChatInbox();
            setThreads(data);
        } catch (err) {
            onSetError(getApiErrorMessage(err, "Failed to load chat conversations."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isCurrent = true;
        void fetchInbox();

        const interval = setInterval(() => {
            if (isCurrent) void fetchInbox();
        }, 5000);

        return () => {
            isCurrent = false;
            clearInterval(interval);
        };
    }, []);

    const filtered = threads.filter((t) => {
        const query = search.toLowerCase();
        return (
            t.otherUserName?.toLowerCase().includes(query) ||
            t.otherUserEmail?.toLowerCase().includes(query) ||
            t.propertyName?.toLowerCase().includes(query) ||
            t.lastMessage?.toLowerCase().includes(query)
        );
    });

    const formatTimestamp = (isoStr: string) => {
        if (!isoStr) return "";
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
                   d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    return (
        <div className="panel-grid-stack">
            {/* Header */}
            <div className="card-panel">
                <div className="card-header">
                    <div className="card-header-left">
                        <h3>Messages & Direct Chat</h3>
                        <p>Real-time conversations with tenants, landlords, and prospective applicants</p>
                    </div>

                    <div className="search-box" style={{ maxWidth: "300px" }}>
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            className="form-input search-input"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Conversation Threads List */}
            <div className="card-panel" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <LoaderCircle size={36} className="spinning" color="var(--primary)" />
                        <p style={{ marginTop: "10px" }}>Loading conversations...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <MessageSquare size={44} className="empty-state-icon" style={{ color: "var(--primary)" }} />
                        <h3>No Active Conversations</h3>
                        <p style={{ marginTop: "6px", maxWidth: "420px", margin: "6px auto 0" }}>
                            {search
                                ? "No conversations match your search query."
                                : "You haven't started any chat conversations yet. You can start a conversation from any property listing or booking application."}
                        </p>
                    </div>
                ) : (
                    <div className="inbox-threads-list">
                        {filtered.map((t) => (
                            <div
                                key={`thread-${t.otherUserId}`}
                                className={`inbox-thread-item ${t.unreadCount > 0 ? "unread" : ""}`}
                                onClick={() => onOpenChat(t.otherUserId, t.otherUserName, t.propertyId, t.propertyName)}
                            >
                                <div className="thread-avatar">
                                    <User size={20} />
                                    {t.unreadCount > 0 && (
                                        <span className="unread-dot" />
                                    )}
                                </div>

                                <div className="thread-info">
                                    <div className="thread-top-row">
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <strong className="thread-name">{t.otherUserName}</strong>
                                            <span className="type-badge" style={{ fontSize: "10px" }}>{t.otherUserRole}</span>
                                            {t.propertyName && (
                                                <span className="thread-prop-tag">
                                                    <Building2 size={11} />
                                                    <span>{t.propertyName}</span>
                                                </span>
                                            )}
                                        </div>

                                        <span className="thread-time">
                                            {formatTimestamp(t.lastMessageTimestamp)}
                                        </span>
                                    </div>

                                    <div className="thread-bottom-row">
                                        <p className="thread-preview">{t.lastMessage}</p>
                                        {t.unreadCount > 0 && (
                                            <span className="unread-badge-count">{t.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InboxView;
