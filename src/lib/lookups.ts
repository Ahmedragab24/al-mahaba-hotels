import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/api-client";
import { db } from "@/lib/api/db";

export function useCurrencies(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["currencies", params],
    queryFn: () => apiClient.currencies.getAll(params),
  });
}

export function useCountries(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["countries", params],
    queryFn: () => apiClient.countries.getAll(params),
  });
}

export function useCities(params?: string | null | Record<string, any>) {
  const queryParams = typeof params === "string" || typeof params === "number"
    ? { country_id: params }
    : (params && typeof params === "object" ? params : undefined);

  return useQuery({
    queryKey: ["cities", queryParams],
    queryFn: () => apiClient.cities.getAll(queryParams),
    enabled: queryParams === undefined || queryParams.country_id !== undefined,
  });
}

export function useSupplierTypes(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["supplier-types", params],
    queryFn: () => apiClient.supplierTypes.getAll(params),
  });
}

export function useRoomTypes(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["room-types", params],
    queryFn: () => apiClient.roomTypes.getAll(params),
  });
}

export function useMealPlans(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["meal-plans", params],
    queryFn: () => apiClient.mealPlans.getAll(params),
  });
}

export function useHotels(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["hotels", params],
    queryFn: () => apiClient.hotels.getAll(params),
  });
}

export function useSuppliers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => apiClient.suppliers.getAll(params),
  });
}

export function useRooms(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => apiClient.rooms.getAll(params),
  });
}

export function useHotelViews(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["hotel-views", params],
    queryFn: () => apiClient.hotelViews.getAll(params),
  });
}

export function useHotelsLite() {
  return useQuery({
    queryKey: ["lookup", "hotels-lite"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await db
        .from("hotels").select("id,code,name_en,name_ar,star_rating")
        .is("deleted_at", null).order("name_en");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSuppliersLite() {
  return useQuery({
    queryKey: ["lookup", "suppliers-lite"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await db
        .from("suppliers").select("id,code,name_en,name_ar")
        .is("deleted_at", null).order("name_en");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHotelRoomTypes(hotelId?: string | null) {
  return useQuery({
    queryKey: ["lookup", "room-types", hotelId ?? "none"],
    enabled: !!hotelId,
    queryFn: async () => {
      const { data, error } = await db
        .from("hotel_room_types").select("id,code,name_en,name_ar,max_adults,max_children")
        .eq("hotel_id", hotelId!).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHotelViewsScoped(hotelId?: string | null) {
  return useQuery({
    queryKey: ["lookup", "hotel-views", hotelId ?? "none"],
    enabled: !!hotelId,
    queryFn: async () => {
      const { data, error } = await db
        .from("hotel_views").select("id,code,name_en,name_ar")
        .eq("hotel_id", hotelId!).eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSupplierContracts(supplierId?: string | null) {
  return useQuery({
    queryKey: ["lookup", "supplier-contracts", supplierId ?? "none"],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await db
        .from("supplier_contracts")
        .select("id,contract_number,title,start_date,end_date,currency,status")
        .eq("supplier_id", supplierId!).order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ["lookup", "facilities"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await db
        .from("facilities").select("id,name_en,name_ar,category")
        .order("category");
      if (error) throw error;
      return data ?? [];
    },
  });
}

