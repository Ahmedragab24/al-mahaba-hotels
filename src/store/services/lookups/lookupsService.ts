import { api } from "../../baseApi";

export const lookupsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getHotelsLite: build.query<any[], void>({
      query: () => ({ url: "/hotels", params: { all: 1 } }),
      providesTags: ["Hotels"],
    }),
    getSuppliersLite: build.query<any[], void>({
      query: () => ({ url: "/suppliers", params: { all: 1 } }),
      providesTags: ["Suppliers"],
    }),
    getHotelRoomTypes: build.query<any[], { hotel_id: string | number }>({
      query: (params) => ({ url: "/room-types", params }),
      providesTags: ["RoomTypes"],
    }),
    getHotelViewsScoped: build.query<any[], { hotel_id: string | number }>({
      query: (params) => ({ url: "/hotel-views", params }),
      providesTags: ["HotelViews"],
    }),
    getSupplierContracts: build.query<any[], { supplier_id?: string | number } | void>({
      query: (params) => ({ url: "/supplier-contracts", params: params || undefined }),
      providesTags: ["Bookings", "Quotations"], // Using standard tags
    }),
    getFacilities: build.query<any[], void>({
      query: () => ({ url: "/facilities" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHotelsLiteQuery,
  useGetSuppliersLiteQuery,
  useGetHotelRoomTypesQuery,
  useGetHotelViewsScopedQuery,
  useGetSupplierContractsQuery,
  useGetFacilitiesQuery,
} = lookupsApi;
