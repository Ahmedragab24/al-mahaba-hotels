export interface QuotationItem {
  id?: string | number;
  quotation_id?: string | number;
  price_id: number | string;
  room_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Quotation {
  id: string | number;
  customer_id: number | string;
  group_size?: number;
  currency_id: number | string;
  language_id?: number | string;
  start_date: string;
  end_date: string;
  hotel_id: number | string;
  is_recommended?: boolean;
  notes?: string;
  status: "draft" | "pending" | "approved" | "sent";
  items: QuotationItem[];
  created_at?: string;
  updated_at?: string;
}
