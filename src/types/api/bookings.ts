export interface BookingRoomItem {
  id?: string | number;
  booking_id?: string | number;
  price_id: number | string;
  room_count: number;
  hotel_id?: number | string;
  total_selling?: number | string;
  check_in?: string;
  check_out?: string;
}

export type BookingStatus =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export interface Booking {
  id: string | number;
  booking_no?: string;
  booking_type: "direct" | "quotation";
  booking_source?: string;
  customer_id: number | string;
  currency_id: number | string;
  booking_date: string;
  country_id?: number | string;
  city_id?: number | string;
  hotel_id?: number | string;
  check_in: string;
  check_out: string;
  payment_method?: string;
  paid_amount?: number | string;
  second_payment_due_date?: string;
  special_requests?: string;
  notes?: string;
  status: BookingStatus;
  items?: BookingRoomItem[];
  rooms?: BookingRoomItem[]; // UI mapping uses rooms
  created_at?: string;
  updated_at?: string;
}
