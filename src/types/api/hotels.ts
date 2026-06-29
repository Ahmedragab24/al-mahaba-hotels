export interface Hotel {
  address_line1: string | null;
  address_line2: string | null;
  brand: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  city_id: string | null;
  code: string;
  country_id: string | number | null;
  country_code: string | null;
  cover_image_path: string | null;
  created_at: string;
  created_by: string | null;
  deleted_at: string | null;
  description_ar: string | null;
  description_en: string | null;
  district: string | null;
  email: string | null;
  id: string;
  is_direct_supplier: boolean;
  latitude: number | null;
  location_url: string | null;
  longitude: number | null;
  name_ar: string;
  name_en: string;
  phone: string | null;
  policies_ar: string | null;
  policies_en: string | null;
  postal_code: string | null;
  star_rating: number | null;
  status: string;
  updated_at: string;
  updated_by: string | null;
  website: string | null;
}

export interface HotelView {
  code: string;
  hotel_id: string;
  id: string;
  is_active: boolean;
  name_ar: string;
  name_en: string;
}
