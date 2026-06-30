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
    createInvoice: build.mutation<Invoice, Partial<Invoice>>({
      query: (body) => ({ url: "/invoices", method: "POST", body }),
      invalidatesTags: ["Invoices"],
    }),
    createInvoiceFromBooking: build.mutation<
      Invoice | string,
      {
        booking_id: string | number;
        invoice_date?: string;
        due_date?: string;
        tax_percent?: number;
        discount?: number;
        notes?: string;
        items?: { description: string; quantity: number; unit_price: number }[];
      }
    >({
      query: (body) => ({ url: "/invoices", method: "POST", body: { ...body, invoice_type: "from_booking" } }),
      invalidatesTags: ["Invoices", "Bookings"],
    }),
    updateInvoice: build.mutation<Invoice, { id: string | number; body: Partial<Invoice> }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}`, method: "PUT", body }),
      invalidatesTags: (result, error, { id }) => ["Invoices", { type: "Invoices", id }],
    }),
    deleteInvoice: build.mutation<void, string | number>({
      query: (id) => ({ url: `/invoices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Invoices"],
    }),
    recordInvoicePayment: build.mutation<void, { id: string | number; body: Partial<InvoicePayment> }>({
      query: ({ id, body }) => ({ url: `/invoices/${id}/payments`, method: "POST", body }),
      invalidatesTags: (result, error, { id }) => ["Invoices", { type: "Invoices", id }, "Bookings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoiceStatisticsQuery,
  useCreateInvoiceMutation,
  useCreateInvoiceFromBookingMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRecordInvoicePaymentMutation,
} = invoicesApi;
