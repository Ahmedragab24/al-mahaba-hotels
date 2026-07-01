import { api } from "../../baseApi";
import type { Invoice, InvoiceStatistics, InvoicePayment } from "@/types/api";

export const invoicesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getInvoices: build.query<
      Invoice[] | { data: Invoice[]; total?: number; count?: number },
      {
        search?: string;
        customer_id?: string | number;
        status?: string;
        invoice_type?: string;
        start_date?: string;
        end_date?: string;
        per_page?: number;
        all?: boolean | string;
        lang?: string;
        page?: number;
      } | void
    >({
      query: (params) => ({ url: "/invoices", params: params || undefined }),
      providesTags: ["Invoices"],
    }),
    getInvoiceById: build.query<Invoice, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/invoices/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Invoices", id }],
    }),
    getInvoiceStatistics: build.query<InvoiceStatistics, { lang?: string } | void>({
      query: (params) => ({ url: "/invoices/statistics", params: params || undefined }),
      providesTags: ["Invoices"],
    }),

    updateInvoice: build.mutation<Invoice, { id: string | number; body: any }>({
      query: ({ id, body }) => {
        const isFormData = body instanceof FormData;
        return {
          url: `/invoices/${id}`,
          method: isFormData ? "POST" : "PUT",
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => ["Invoices", { type: "Invoices", id }],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceStatisticsQuery,
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
} = invoicesApi;
