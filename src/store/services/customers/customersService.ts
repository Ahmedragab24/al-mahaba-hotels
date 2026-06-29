import { api } from "../../baseApi";
import type { Customer } from "@/types/api";

export const customersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<Customer[], { search?: string; type?: string; status?: string | number | boolean; country_id?: string | number; all?: boolean; is_archived?: boolean; lang?: string } | void>({
      query: (params) => ({ url: "/customers", params: params || undefined }),
      providesTags: ["Customers"],
    }),
    getCustomerById: build.query<Customer, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/customers/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Customers", id }],
    }),
    createCustomer: build.mutation<Customer, Partial<Customer>>({
      query: (body) => ({ url: "/customers", method: "POST", body }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: build.mutation<Customer, { id: string | number; body: Partial<Customer> }>({
      query: ({ id, body }) => ({ url: `/customers/${id}`, method: "PUT", body }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: build.mutation<void, string | number>({
      query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customers"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
