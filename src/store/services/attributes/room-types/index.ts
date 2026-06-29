import { api } from "../../../baseApi";
import type { RoomType } from "@/types/api";

export const roomTypesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoomTypes: build.query<any, Record<string, any> | void>({
      query: (params) => ({ url: "/room-types", params: params || undefined }),
      providesTags: ["RoomTypes"],
    }),
    getRoomTypeById: build.query<RoomType, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/room-types/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "RoomTypes", id }],
    }),
    createRoomType: build.mutation<RoomType, Partial<RoomType>>({
      query: (body) => ({ url: "/room-types", method: "POST", body }),
      invalidatesTags: ["RoomTypes"],
    }),
    updateRoomType: build.mutation<RoomType, { id: string | number; body: Partial<RoomType> }>({
      query: ({ id, body }) => ({ url: `/room-types/${id}`, method: "PUT", body }),
      invalidatesTags: ["RoomTypes"],
    }),
    deleteRoomType: build.mutation<void, string | number>({
      query: (id) => ({ url: `/room-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["RoomTypes"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomTypesQuery,
  useGetRoomTypeByIdQuery,
  useCreateRoomTypeMutation,
  useUpdateRoomTypeMutation,
  useDeleteRoomTypeMutation,
} = roomTypesApi;
