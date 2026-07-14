import { api } from "../../baseApi";
import type { UserProfile, UsersResponse } from "@/types/api";

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersResponse, { lang?: string } | void>({
      query: (params) => ({ url: "/users", params: params || undefined }),
      providesTags: ["Users"],
    }),
    getUserById: build.query<UserProfile, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/users/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Users", id }],
    }),
    createUser: build.mutation<UserProfile, Partial<UserProfile> & { password?: string }>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    updateUser: build.mutation<UserProfile, { id: string | number; body: Partial<UserProfile> }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "POST", body }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: build.mutation<void, string | number>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
