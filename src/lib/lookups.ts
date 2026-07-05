import { useQuery } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { 
  useGetHotelsLiteQuery, 
  useGetSuppliersLiteQuery, 
  useGetHotelRoomTypesQuery, 
  useGetHotelViewsScopedQuery, 
  useGetSupplierContractsQuery, 
  useGetFacilitiesQuery 
} from "@/store/api";

// Standard lookups using apiClient (REST API)
export function useCurrencies(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["currencies", params],
    queryFn: () => apiClient.currencies.getAll(params),
    ...options,
  }) as any;
}

export function useCountries(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["countries", params],
    queryFn: () => apiClient.countries.getAll(params),
    ...options,
  }) as any;
}

export function useCities(params?: string | null | Record<string, any>, options?: any): any {
  const queryParams = typeof params === "string" || typeof params === "number"
    ? { country_id: params }
    : (params && typeof params === "object" ? params : undefined);

  return useQuery({
    queryKey: ["cities", queryParams],
    queryFn: () => apiClient.cities.getAll(queryParams),
    enabled: (queryParams === undefined || queryParams.country_id !== undefined) && (options?.enabled !== false),
    ...options,
  }) as any;
}

export function useSupplierTypes(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["supplier-types", params],
    queryFn: () => apiClient.supplierTypes.getAll(params),
    ...options,
  }) as any;
}

export function useRoomTypes(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["room-types", params],
    queryFn: () => apiClient.roomTypes.getAll(params),
    ...options,
  }) as any;
}

export function useMealPlans(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["meal-plans", params],
    queryFn: () => apiClient.mealPlans.getAll(params),
    ...options,
  }) as any;
}

export function useHotels(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: () => apiClient.hotels.getAll(params),
    ...options,
  }) as any;
}

export function useSuppliers(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => apiClient.suppliers.getAll(params),
    ...options,
  }) as any;
}

export function useRooms(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => apiClient.rooms.getAll(params),
    ...options,
  }) as any;
}

export function useHotelViews(params?: Record<string, any>, options?: any): any {
  return useQuery({
    queryKey: ["hotel-views", params],
    queryFn: () => apiClient.hotelViews.getAll(params),
    ...options,
  }) as any;
}

// Lite lookups mapped to RTK Query hooks
export function useHotelsLite(options?: any): any {
  const q = useGetHotelsLiteQuery(undefined, options) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}

export function useSuppliersLite(options?: any): any {
  const q = useGetSuppliersLiteQuery(undefined, options) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}

export function useHotelRoomTypes(hotelId?: string | null, options?: any): any {
  const q = useGetHotelRoomTypesQuery({ hotel_id: hotelId || "" }, { skip: !hotelId, ...options }) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}

export function useHotelViewsScoped(hotelId?: string | null, options?: any): any {
  const q = useGetHotelViewsScopedQuery({ hotel_id: hotelId || "" }, { skip: !hotelId, ...options }) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}

export function useSupplierContracts(supplierId?: string | null, options?: any): any {
  const q = useGetSupplierContractsQuery(supplierId ? { supplier_id: supplierId } : undefined, { skip: !supplierId, ...options }) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}

export function useFacilities(options?: any): any {
  const q = useGetFacilitiesQuery(undefined, options) as any;
  return {
    ...q,
    isPending: q.isLoading,
  };
}
