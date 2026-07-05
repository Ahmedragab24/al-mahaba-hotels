import { api } from "../../baseApi";

export const customApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Supplier Contracts
    getSupplierContractsList: build.query<any, any>({
      query: (params) => ({ url: "/supplier-contracts", params: params || undefined }),
      providesTags: ["Bookings", "Quotations"],
    }),
    getSupplierContractById: build.query<any, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/supplier-contracts/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Bookings", id }],
    }),
    createSupplierContract: build.mutation<any, any>({
      query: (body) => ({ url: "/supplier-contracts", method: "POST", body }),
      invalidatesTags: ["Bookings", "Quotations"],
    }),
    updateSupplierContract: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/supplier-contracts/${id}`, method: "PUT", body }),
      invalidatesTags: ["Bookings", "Quotations"],
    }),
    deleteSupplierContract: build.mutation<any, string | number>({
      query: (id) => ({ url: `/supplier-contracts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Bookings", "Quotations"],
    }),
    updateSupplierContractStatus: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/supplier-contracts/${id}/status`, method: "PUT", body }),
      invalidatesTags: ["Bookings", "Quotations"],
    }),

    // Rates
    getRatesList: build.query<any, any>({
      query: (params) => ({ url: "/rates", params: params || undefined }),
      providesTags: ["Prices"],
    }),
    getRateById: build.query<any, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/rates/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Prices", id }],
    }),
    createRate: build.mutation<any, any>({
      query: (body) => ({ url: "/rates", method: "POST", body }),
      invalidatesTags: ["Prices"],
    }),
    updateRate: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/rates/${id}`, method: "PUT", body }),
      invalidatesTags: ["Prices"],
    }),
    deleteRate: build.mutation<any, string | number>({
      query: (id) => ({ url: `/rates/${id}`, method: "DELETE" }),
      invalidatesTags: ["Prices"],
    }),

    // Seasons
    getSeasonsList: build.query<any, any>({
      query: (params) => ({ url: "/seasons", params: params || undefined }),
      providesTags: ["Prices"],
    }),
    getSeasonById: build.query<any, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/seasons/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Prices", id }],
    }),
    createSeason: build.mutation<any, any>({
      query: (body) => ({ url: "/seasons", method: "POST", body }),
      invalidatesTags: ["Prices"],
    }),
    updateSeason: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/seasons/${id}`, method: "PUT", body }),
      invalidatesTags: ["Prices"],
    }),
    deleteSeason: build.mutation<any, string | number>({
      query: (id) => ({ url: `/seasons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Prices"],
    }),

    // Hotel Taxes / Taxes
    getHotelTaxesList: build.query<any, any>({
      query: (params) => ({ url: "/hotel-taxes", params: params || undefined }),
      providesTags: ["Prices"],
    }),
    getHotelTaxById: build.query<any, { id: string | number; lang?: string }>({
      query: ({ id, lang }) => ({ url: `/hotel-taxes/${id}`, params: { lang } }),
      providesTags: (result, error, { id }) => [{ type: "Prices", id }],
    }),
    createHotelTax: build.mutation<any, any>({
      query: (body) => ({ url: "/hotel-taxes", method: "POST", body }),
      invalidatesTags: ["Prices"],
    }),
    updateHotelTax: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/hotel-taxes/${id}`, method: "PUT", body }),
      invalidatesTags: ["Prices"],
    }),
    deleteHotelTax: build.mutation<any, string | number>({
      query: (id) => ({ url: `/hotel-taxes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Prices"],
    }),

    // Receipts
    getReceiptsList: build.query<any, any>({
      query: (params) => ({ url: "/receipts", params: params || undefined }),
      providesTags: ["Invoices"],
    }),
    createReceipt: build.mutation<any, any>({
      query: (body) => ({ url: "/receipts", method: "POST", body }),
      invalidatesTags: ["Invoices"],
    }),
    updateReceipt: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/receipts/${id}`, method: "PUT", body }),
      invalidatesTags: ["Invoices"],
    }),
    deleteReceipt: build.mutation<any, string | number>({
      query: (id) => ({ url: `/receipts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Invoices"],
    }),

    // Receipt Allocations
    getReceiptAllocationsList: build.query<any, any>({
      query: (params) => ({ url: "/receipt-allocations", params: params || undefined }),
      providesTags: ["Invoices"],
    }),
    createReceiptAllocation: build.mutation<any, any>({
      query: (body) => ({ url: "/receipt-allocations", method: "POST", body }),
      invalidatesTags: ["Invoices"],
    }),
    deleteReceiptAllocation: build.mutation<any, string | number>({
      query: (id) => ({ url: `/receipt-allocations/${id}`, method: "DELETE" }),
      invalidatesTags: ["Invoices"],
    }),

    // Approval Thresholds
    getApprovalThresholdsList: build.query<any, any>({
      query: (params) => ({ url: "/approval-thresholds", params: params || undefined }),
      providesTags: ["Quotations", "Bookings"],
    }),
    createApprovalThreshold: build.mutation<any, any>({
      query: (body) => ({ url: "/approval-thresholds", method: "POST", body }),
      invalidatesTags: ["Quotations", "Bookings"],
    }),
    updateApprovalThreshold: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/approval-thresholds/${id}`, method: "PUT", body }),
      invalidatesTags: ["Quotations", "Bookings"],
    }),
    deleteApprovalThreshold: build.mutation<any, string | number>({
      query: (id) => ({ url: `/approval-thresholds/${id}`, method: "DELETE" }),
      invalidatesTags: ["Quotations", "Bookings"],
    }),

    // Rate Occupancy Prices
    getRateOccupancyPricesList: build.query<any, any>({
      query: (params) => ({ url: "/rate-occupancy-prices", params: params || undefined }),
      providesTags: ["Prices"],
    }),
    createRateOccupancyPrice: build.mutation<any, any>({
      query: (body) => ({ url: "/rate-occupancy-prices", method: "POST", body }),
      invalidatesTags: ["Prices"],
    }),
    updateRateOccupancyPrice: build.mutation<any, { id: string | number; body: any }>({
      query: ({ id, body }) => ({ url: `/rate-occupancy-prices/${id}`, method: "PUT", body }),
      invalidatesTags: ["Prices"],
    }),
    deleteRateOccupancyPrice: build.mutation<any, string | number>({
      query: (id) => ({ url: `/rate-occupancy-prices/${id}`, method: "DELETE" }),
      invalidatesTags: ["Prices"],
    }),

    // Audit logs
    getAuditLogsList: build.query<any, any>({
      query: (params) => ({ url: "/audit-logs", params: params || undefined }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupplierContractsListQuery,
  useGetSupplierContractByIdQuery,
  useCreateSupplierContractMutation,
  useUpdateSupplierContractMutation,
  useDeleteSupplierContractMutation,
  useUpdateSupplierContractStatusMutation,

  useGetRatesListQuery,
  useGetRateByIdQuery,
  useCreateRateMutation,
  useUpdateRateMutation,
  useDeleteRateMutation,

  useGetSeasonsListQuery,
  useGetSeasonByIdQuery,
  useCreateSeasonMutation,
  useUpdateSeasonMutation,
  useDeleteSeasonMutation,

  useGetHotelTaxesListQuery,
  useGetHotelTaxByIdQuery,
  useCreateHotelTaxMutation,
  useUpdateHotelTaxMutation,
  useDeleteHotelTaxMutation,

  useGetReceiptsListQuery,
  useCreateReceiptMutation,
  useUpdateReceiptMutation,
  useDeleteReceiptMutation,

  useGetReceiptAllocationsListQuery,
  useCreateReceiptAllocationMutation,
  useDeleteReceiptAllocationMutation,

  useGetApprovalThresholdsListQuery,
  useCreateApprovalThresholdMutation,
  useUpdateApprovalThresholdMutation,
  useDeleteApprovalThresholdMutation,

  useGetRateOccupancyPricesListQuery,
  useCreateRateOccupancyPriceMutation,
  useUpdateRateOccupancyPriceMutation,
  useDeleteRateOccupancyPriceMutation,

  useGetAuditLogsListQuery,
} = customApi;
