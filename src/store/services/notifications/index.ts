import { api } from "../../baseApi";
import type { Notification } from "@/types/api";

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<Notification[], void>({
      query: () => ({ url: "/notifications" }),
      providesTags: ["Notifications"],
    }),
    getUnreadNotificationsCount: build.query<{ count: number } | number, void>({
      query: () => ({ url: "/notifications/unread" }),
      providesTags: ["Notifications"],
    }),
    markNotificationAsRead: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "POST" }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: build.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/delete`, method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsAsRead: build.mutation<void, void>({
      query: () => ({ url: "/notifications/mark-all-read", method: "POST" }),
      invalidatesTags: ["Notifications"],
    }),
    deleteAllNotifications: build.mutation<void, void>({
      query: () => ({ url: "/notifications/delete-all", method: "DELETE" }),
      invalidatesTags: ["Notifications"],
    }),
    sendTestNotificationRange: build.mutation<void, { title: string; message: string; title_en: string; message_en: string; key: string; id_from: number; id_to: number }>({
      query: (body) => ({ url: "/notifications/send-range", method: "POST", body }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteAllNotificationsMutation,
  useSendTestNotificationRangeMutation,
} = notificationsApi;
