import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
function useCountries() {
  return useQuery({
    queryKey: ["lookup", "countries"],
    staleTime: 5 * 6e4,
    queryFn: async () => {
      const { data, error } = await supabase.from("countries").select("code,name_en,name_ar,is_active").order("name_en");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useCities(countryCode) {
  return useQuery({
    queryKey: ["lookup", "cities", countryCode ?? "all"],
    staleTime: 5 * 6e4,
    queryFn: async () => {
      let q = supabase.from("cities").select("id,country_code,name_en,name_ar,is_active").order("name_en");
      if (countryCode) q = q.eq("country_code", countryCode);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useCurrencies() {
  return useQuery({
    queryKey: ["lookup", "currencies"],
    staleTime: 5 * 6e4,
    queryFn: async () => {
      const { data, error } = await supabase.from("currencies").select("code,name_en,name_ar,symbol,is_active").order("code");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useFacilities() {
  return useQuery({
    queryKey: ["lookup", "facilities"],
    staleTime: 5 * 6e4,
    queryFn: async () => {
      const { data, error } = await supabase.from("facilities").select("id,code,name_en,name_ar,icon,category").order("name_en");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useHotelsLite() {
  return useQuery({
    queryKey: ["lookup", "hotels-lite"],
    staleTime: 6e4,
    queryFn: async () => {
      const { data, error } = await supabase.from("hotels").select("id,code,name_en,name_ar").is("deleted_at", null).order("name_en");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useSuppliersLite() {
  return useQuery({
    queryKey: ["lookup", "suppliers-lite"],
    staleTime: 6e4,
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,code,name_en,name_ar").is("deleted_at", null).order("name_en");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useHotelRoomTypes(hotelId) {
  return useQuery({
    queryKey: ["lookup", "room-types", hotelId ?? "none"],
    enabled: !!hotelId,
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_room_types").select("id,code,name_en,name_ar,max_adults,max_children").eq("hotel_id", hotelId).eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useHotelViews(hotelId) {
  return useQuery({
    queryKey: ["lookup", "hotel-views", hotelId ?? "none"],
    enabled: !!hotelId,
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_views").select("id,code,name_en,name_ar").eq("hotel_id", hotelId).eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useSupplierContracts(supplierId) {
  return useQuery({
    queryKey: ["lookup", "supplier-contracts", supplierId ?? "none"],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_contracts").select("id,contract_number,title,start_date,end_date,currency,status").eq("supplier_id", supplierId).order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
}
export {
  useHotelsLite as a,
  useCountries as b,
  useSuppliersLite as c,
  useCities as d,
  useHotelRoomTypes as e,
  useHotelViews as f,
  useSupplierContracts as g,
  useFacilities as h,
  useCurrencies as u
};
