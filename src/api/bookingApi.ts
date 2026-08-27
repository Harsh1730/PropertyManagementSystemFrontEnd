import api from "./axios";
import type { BookingResponse, CreateBookingRequest } from "../types/booking";

export const createBooking = async (
    payload: CreateBookingRequest
): Promise<BookingResponse> => {
    const response = await api.post<BookingResponse>("/bookings", payload);
    return response.data;
};

export const getMyBookings = async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>("/bookings/my");
    return response.data;
};

export const getOwnerBookings = async (): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>("/bookings/owner");
    return response.data;
};

export const getBookingsForProperty = async (
    propertyId: number
): Promise<BookingResponse[]> => {
    const response = await api.get<BookingResponse[]>(`/bookings/property/${propertyId}`);
    return response.data;
};

export const approveBooking = async (id: number): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(`/bookings/${id}/approve`);
    return response.data;
};

export const rejectBooking = async (id: number): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(`/bookings/${id}/reject`);
    return response.data;
};

export const cancelBooking = async (id: number): Promise<BookingResponse> => {
    const response = await api.patch<BookingResponse>(`/bookings/${id}/cancel`);
    return response.data;
};
