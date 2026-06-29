export interface SupplierType {
  id: number;
  key: string;
  name_ar: string;
  name_en: string;
  name: string;
}

export interface Currency {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  symbol_ar: string;
  symbol_en: string;
  name: string;
  symbol: string;
}

export interface Country {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
  phone_code: string;
  name: string;
}

export interface City {
  id: number;
  name_ar: string;
  name_en: string;
  name: string;
}

export interface Supplier {
  id: number;
  code: string;
  name_ar: string;
  name_en: string;
  name: string;
  supplier_type_id: number;
  supplier_type: SupplierType;
  status: boolean;
  is_archived: boolean;
  tax_number: string | null;
  commercial_register: string | null;
  currency_id: number;
  currency: Currency;
  country: Country;
  city: City;
  address_1: string | null;
  address_2: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuppliersStatistics {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  top_rated: number;
  this_month: number;
}

export interface SuppliersListResponse {
  data: Supplier[];
  current_page: number;
  from: number;
  to: number;
  total: number;
  last_page: number;
  per_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  statistics: SuppliersStatistics;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status_code: number;
}
