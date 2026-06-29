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
    updateBooking: build.mutation<Booking, { id: string | number; body: FormData | Partial<Booking> }>({
      query: ({ id, body }) => {
        let finalBody: any = body;
        if (body instanceof FormData) {
          if (!body.has("_method")) {
            body.append("_method", "PUT");
          }
        } else if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/bookings/${id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: ["Bookings"],
    }),
    deleteBooking: build.mutation<void, string | number>({
      query: (id) => ({ url: `/bookings/${id}`, method: "DELETE" }),
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
} = bookingsApi;
