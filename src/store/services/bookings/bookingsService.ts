import { api } from "../../baseApi";
import type { Booking } from "@/types/api";

export const bookingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBookings: build.query<Booking[], { search?: string; hotel_id?: string | number; customer_id?: string | number; status?: string; start_date?: string; end_date?: string; per_page?: number; all?: boolean | string; lang?: string } | void>({
      query: (params) => ({ url: "/bookings", params: params || undefined }),
      providesTags: ["Bookings"],
    }),
    getBookingById: build.query<Booking, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/bookings/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Bookings", id }],
    }),
    createBooking: build.mutation<Booking, FormData | Partial<Booking>>({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    updateBooking: build.mutation<Booking, { id: string | number; body: {} | Partial<Booking> }>({
      query: ({ id, body }) => ({ url: `/bookings/${id}`, method: "PUT", body }),
      invalidatesTags: ["Bookings"],
    }),
    deleteBooking: build.mutation<void, string | number>({
      query: (id) => ({ url: `/bookings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Bookings"],
    }),
    getBookingGuests: build.query<any[], { booking_id: string | number }>({
      query: ({ booking_id }) => ({ url: `/bookings/${booking_id}/guests` }),
      providesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    createBookingGuest: build.mutation<any, { booking_id: string | number; body: any }>({
      query: ({ booking_id, body }) => ({ url: `/bookings/${booking_id}/guests`, method: "POST", body }),
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    updateBookingGuest: build.mutation<any, { booking_id: string | number; guest_id: string | number; body: any }>({
      query: ({ booking_id, guest_id, body }) => {
        let finalBody: any = body;
        if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/bookings/${booking_id}/guests/${guest_id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    deleteBookingGuest: build.mutation<void, { booking_id: string | number; guest_id: string | number }>({
      query: ({ booking_id, guest_id }) => ({ url: `/bookings/${booking_id}/guests/${guest_id}`, method: "DELETE" }),
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    getBookingRooms: build.query<any[], { booking_id: string | number }>({
      query: ({ booking_id }) => ({ url: `/bookings/${booking_id}/rooms` }),
      providesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    createBookingRoom: build.mutation<any, { booking_id: string | number; body: any }>({
      query: ({ booking_id, body }) => ({ url: `/bookings/${booking_id}/rooms`, method: "POST", body }),
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    updateBookingRoom: build.mutation<any, { booking_id: string | number; room_id: string | number; body: any }>({
      query: ({ booking_id, room_id, body }) => {
        let finalBody: any = body;
        if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/bookings/${booking_id}/rooms/${room_id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    deleteBookingRoom: build.mutation<void, { booking_id: string | number; room_id: string | number }>({
      query: ({ booking_id, room_id }) => ({ url: `/bookings/${booking_id}/rooms/${room_id}`, method: "DELETE" }),
      invalidatesTags: (result, error, { booking_id }) => [{ type: "Bookings", id: booking_id }],
    }),
    createBookingFromQuotation: build.mutation<any, any>({
      query: (body) => ({ url: `/bookings/create-from-quotation`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useGetBookingGuestsQuery,
  useCreateBookingGuestMutation,
  useUpdateBookingGuestMutation,
  useDeleteBookingGuestMutation,
  useGetBookingRoomsQuery,
  useCreateBookingRoomMutation,
  useUpdateBookingRoomMutation,
  useDeleteBookingRoomMutation,
  useCreateBookingFromQuotationMutation,
} = bookingsApi;
