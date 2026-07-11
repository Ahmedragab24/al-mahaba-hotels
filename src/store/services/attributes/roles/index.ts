import { api } from "../../../baseApi";
import type { CreateRoleRequest, RoleResponseType, RoleResponseTypeSingle, RoomType } from "@/types/api";

export const rolesApi = api.injectEndpoints({
    endpoints: (build) => ({
        getRoles: build.query<RoleResponseType, void>({
            query: () => ({ url: "/roles" }),
            providesTags: ["Roles"],
        }),
        getRoleById: build.query<RoleResponseTypeSingle, { id: string | number; lang?: string }>({
            query: ({ id, lang }) => ({ url: `/roles/${id}`, params: { lang } }),
            providesTags: (result, error, { id }) => [{ type: "Roles", id }],
        }),
        createRole: build.mutation<RoleResponseTypeSingle, CreateRoleRequest>({
            query: (body) => ({ url: "/roles", method: "POST", body }),
            invalidatesTags: ["Roles"],
        }),
        updateRole: build.mutation<RoleResponseTypeSingle, { id: string | number; body: Partial<CreateRoleRequest> }>({
            query: ({ id, body }) => ({ url: `/roles/${id}`, method: "PUT", body }),
            invalidatesTags: ["Roles"],
        }),
        deleteRole: build.mutation<void, string | number>({
            query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
            invalidatesTags: ["Roles"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} = rolesApi;
