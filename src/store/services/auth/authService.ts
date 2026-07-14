import { api } from "../../baseApi";
import type { LoginRequest, LoginResponse } from "@/types/api";
import { clearAuth, setCredentials } from "@/store/features/authSlice";

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/login", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        // Handle API response structure (unwrapped by baseQuery)
        const user = data.user;
        const token = data.access_token || data.token;
        
        if (token && user) {
          dispatch(
            setCredentials({
              token,
              user: {
                id: String(user.id),
                email: user.email,
              },
              profile: user,
              roles: user?.role?.name_en ? [user.role.name_en] : (user?.role?.name ? [user.role.name] : []),
            }),
          );
        }
      },
      invalidatesTags: ["Auth"],
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearAuth());
        }
      },
      invalidatesTags: ["Auth"],
    }),
    getProfile: build.query<any, void>({
      query: () => ({ url: "/user" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            const user = data.user || data;
            const roles = user.role?.name_en ? [user.role.name_en] : (user.role?.name ? [user.role.name] : (user.type ? [user.type] : []));
            const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
            const token = match ? decodeURIComponent(match[2]) : null;
            if (token) {
              const userId = String(user.id);
              document.cookie = `auth_user_id=${encodeURIComponent(userId)}; path=/; max-age=86400; SameSite=Lax`;
              if (typeof window !== "undefined") {
                localStorage.setItem("auth_user_id", userId);
              }
              dispatch(
                setCredentials({
                  token,
                  user: { id: userId, email: user.email },
                  profile: user,
                  roles,
                })
              );
            }
          }
        } catch (error) {
          dispatch(clearAuth());
        }
      },
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useLogoutMutation, useGetProfileQuery } = authApi;
