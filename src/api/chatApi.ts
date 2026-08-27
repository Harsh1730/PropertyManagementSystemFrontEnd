import api from "./axios";
import type {
    ChatMessageResponse,
    ConversationSummaryResponse,
    SendChatMessageRequest,
} from "../types/chat";

export const sendMessage = async (
    payload: SendChatMessageRequest
): Promise<ChatMessageResponse> => {
    const response = await api.post<ChatMessageResponse>("/chat/send", payload);
    return response.data;
};

export const getConversation = async (
    otherUserId: number
): Promise<ChatMessageResponse[]> => {
    const response = await api.get<ChatMessageResponse[]>(`/chat/conversation/${otherUserId}`);
    return response.data;
};

export const getBookingMessages = async (
    bookingId: number
): Promise<ChatMessageResponse[]> => {
    const response = await api.get<ChatMessageResponse[]>(`/chat/booking/${bookingId}`);
    return response.data;
};

export const getChatInbox = async (): Promise<ConversationSummaryResponse[]> => {
    const response = await api.get<ConversationSummaryResponse[]>("/chat/inbox");
    return response.data;
};

export const markChatAsRead = async (
    otherUserId: number
): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(`/chat/read/${otherUserId}`);
    return response.data;
};
