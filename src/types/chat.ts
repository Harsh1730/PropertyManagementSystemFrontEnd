import type { UserRole } from "./api";

export interface ChatMessageResponse {
    id: number;
    senderId: number;
    senderName: string;
    senderEmail: string;
    senderRole: UserRole;
    receiverId: number;
    receiverName: string;
    receiverEmail: string;
    receiverRole: UserRole;
    propertyId?: number;
    propertyName?: string;
    bookingId?: number;
    message: string;
    isRead: boolean;
    timestamp: string;
}

export interface ConversationSummaryResponse {
    otherUserId: number;
    otherUserName: string;
    otherUserEmail: string;
    otherUserRole: UserRole;
    otherUserPhoneNumber?: string;
    propertyId?: number;
    propertyName?: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
}

export interface SendChatMessageRequest {
    receiverId: number;
    propertyId?: number;
    bookingId?: number;
    message: string;
}
