export type CustomerType = "individual" | "company" | "agency" | "government";

export interface Customer {
  id: string | number;
  code?: string;
  type?: CustomerType; // Some places might refer to customer_type
  name_ar: string;
  name_en: string;
  name: string;
  email: string;
  phone: string;
  country_id?: number | string;
  country: {
    id: number | string;
    name_ar: string;
    name_en: string;
    code: string;
    phone_code: string;
    name: string;
  },
  currency: {
    id: number,
    name_ar: string;
    name_en: string;
    code: string;
    symbol_ar: string;
    symbol_en: string;
    name: string;
    symbol: string;
  },
  legal_name?: string;
  tax_number?: string;
  commercial_register?: string;
  credit_limit?: number | string;
  credit_days?: number;
  currency_id?: number | string;
  status: boolean | string;
  notes?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}
