export interface Country {
  code: string;
  is_active: boolean;
  name_ar: string;
  name_en: string;
  phone_code: string | null;
}

export interface City {
  country_code: string;
  id: string;
  is_active: boolean;
  name_ar: string;
  name_en: string;
}

export interface SupplierType {
  id: string;
  key: string;
  name_ar: string;
  name_en: string;
  status: number;
}

export interface RoomType {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  is_active?: boolean;
}

export interface MealPlan {
  id: string;
  key: string;
  name_ar: string;
  name_en: string;
  status: boolean;
}

export interface Currency {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
  symbol: string | null;
  status: number;
}

export interface Language {
  id: string | number;
  name_ar: string;
  name_en: string;
  code: string;
  status: boolean;
}

