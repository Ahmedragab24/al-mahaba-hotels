import { api } from "../../baseApi";
import type { Room } from "@/types/api";

export const roomsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRooms: build.query<Room[], { lang?: string; search?: string; status?: number; hotel_id?: number | string; room_type_id?: number | string; per_page?: number | string } | void>({
      query: (params) => ({ url: "/rooms", params: params || undefined }),
      providesTags: ["Rooms"],
    }),
    getRoomById: build.query<Room, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/rooms/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Rooms", id }],
    }),
    createRoom: build.mutation<Room, FormData | Partial<Room>>({
      query: (body) => ({ url: "/rooms", method: "POST", body }),
      invalidatesTags: ["Rooms"],
    }),
    updateRoom: build.mutation<Room, { id: string | number; body: FormData | Partial<Room> }>({
      query: ({ id, body }) => {
        let finalBody = body;
        if (body instanceof FormData) {
          if (!body.has("_method")) {
            body.append("_method", "PUT");
          }
        } else if (typeof body === "object" && body !== null) {
          finalBody = { ...body, _method: "PUT" };
        }
        return { url: `/rooms/${id}`, method: "POST", body: finalBody };
      },
      invalidatesTags: ["Rooms"],
    }),
    deleteRoom: build.mutation<void, string | number>({
      query: (id) => ({ url: `/rooms/${id}`, method: "DELETE" }),
      invalidatesTags: ["Rooms"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
