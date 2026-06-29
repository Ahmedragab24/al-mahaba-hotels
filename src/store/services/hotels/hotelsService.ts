import { api } from "../../baseApi";
import type { Hotel, HotelView } from "@/types/api";

export const hotelsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHotels: build.query<
      Hotel[],
      {
        lang?: string;
        status?: number;
        country_id?: number | string;
        per_page?: number | string;
        city_id?: number | string;
      } | void
    >({
      query: (params) => ({ url: "/hotels", params: params || undefined }),
      providesTags: ["Hotels"],
    }),
    getHotelById: build.query<Hotel, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/hotels/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Hotels", id }],
    }),
    createHotel: build.mutation<Hotel, FormData | Partial<Hotel>>({
      query: (body) => ({ url: "/hotels", method: "POST", body }),
      invalidatesTags: ["Hotels"],
    }),
    updateHotel: build.mutation<Hotel, { id: string | number; body: FormData | Partial<Hotel> }>({
      query: ({ id, body }) => {
        let finalBody: any = body;
        if (body instanceof FormData) {
          if (!body.has("_method")) {
            body.append("_method", "PUT");
          }
        } else if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/hotels/${id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: ["Hotels"],
    }),
    deleteHotel: build.mutation<void, string | number>({
      query: (id) => ({ url: `/hotels/${id}`, method: "DELETE" }),
      invalidatesTags: ["Hotels"],
    }),

    getHotelViews: build.query<HotelView[], { hotel_id?: number | string } | void>({
      query: (params) => ({ url: "/hotel-views", params: params || undefined }),
      providesTags: ["HotelViews"],
    }),
    getHotelViewById: build.query<HotelView, string | number>({
      query: (id) => ({ url: `/hotel-views/${id}` }),
      providesTags: (result, error, id) => [{ type: "HotelViews", id }],
    }),
    createHotelView: build.mutation<HotelView, Partial<HotelView>>({
      query: (body) => ({ url: "/hotel-views", method: "POST", body }),
      invalidatesTags: ["HotelViews"],
    }),
    updateHotelView: build.mutation<HotelView, { id: string | number; body: Partial<HotelView> }>({
      query: ({ id, body }) => ({ url: `/hotel-views/${id}`, method: "PUT", body }),
      invalidatesTags: ["HotelViews"],
    }),
    deleteHotelView: build.mutation<void, string | number>({
      query: (id) => ({ url: `/hotel-views/${id}`, method: "DELETE" }),
      invalidatesTags: ["HotelViews"],
    }),


    getHotelImages: build.query<any[], { hotel_id?: number | string } | void>({
      query: (params) => ({ url: `/hotels/${params?.hotel_id}/images`, params: params || undefined }),
      providesTags: ["HotelImages", "HotelViews"],
    }),

    uploadHotelImages: build.mutation<any, FormData>({
      query: (body) => {
        const hotelId = body.get("hotel_id");
        return { url: `/hotels/${hotelId}/images`, method: "POST", body };
      },
      invalidatesTags: ["HotelViews", "HotelImages"],
    }),
    setImageAsCover: build.mutation<HotelView, { id: string | number; body: Partial<HotelView> }>({
      query: ({ id, body }) => ({ url: `/hotels/images/${id}/cover`, method: "PUT", body }),
      invalidatesTags: ["HotelViews", "HotelImages"],
    }),
    deleteHotelImage: build.mutation<void, string | number>({
      query: (id) => ({ url: `/hotels/images/${id}`, method: "DELETE" }),
      invalidatesTags: ["HotelViews", "HotelImages"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useGetHotelViewsQuery,
  useGetHotelViewByIdQuery,
  useCreateHotelViewMutation,
  useUpdateHotelViewMutation,
  useDeleteHotelViewMutation,
  useGetHotelImagesQuery,
  useUploadHotelImagesMutation,
  useSetImageAsCoverMutation,
  useDeleteHotelImageMutation,
} = hotelsApi;
