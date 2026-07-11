export type InvoiceStatus = "draft" | "issued" | "sent" | "partially_paid" | "paid" | "overdue" | "cancelled";
export type InvoiceType = "manual" | "from_booking";

export interface InvoiceItem {
  id?: number | string;
  invoice_id?: number;
  description: string;
  description_en?: string;
  description_ar?: string;
  quantity: number;
  unit_price: number;
  taxes?: number;
  fees?: number;
  total_price?: number;
  line_total?: number;
  subtotal?: number;
}

export interface InvoicePayment {
  id: number;
  invoice_id: number;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "credit_card" | "cheque" | "other";
  transaction_reference?: string;
  notes?: string;
  created_at?: string;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  invoice_type: InvoiceType;
  booking_id: number | null;
  customer_id: number;
  currency_id: number;
  currency?: string | { id: number; name_en: string; name_ar: string; code: string };
  invoice_date: string;
  due_date: string;
  tax_percent: number;
  discount: number;
  notes: string | null;
  status: InvoiceStatus;
  sub_total: number;
  subtotal?: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  exchange_rate?: number;
  taxes?: number;
  fees?: number;
  cancellation_reason?: string | null;
  invoice_number?: string;
  total_amount_sar?: number;
  status_text?: string;
  payment_method_text?: string;
  creator?: { id: number; name: string };
  customer?: {
    id: number;
    name_en: string;
    name_ar: string;
    email?: string;
    phone?: string;
    tax_number?: string;
    address?: string;
    country?: { name?: string; name_en?: string; name_ar?: string };
    commercial_register?: string;
  };
  booking?: {
    id: number;
    booking_no: string;
    status?: string;
    code?: string;
    payment_method_text?: string;
  };
  items?: InvoiceItem[];
  allocs?: any[];
  payments?: InvoicePayment[];
  created_at?: string;
  updated_at?: string;
  invoice_image?: string | null;
  booking_code?: string | null;
  bookings?: any[];
}

export interface InvoiceStatistics {
  total?: number;
  outstanding?: number;
  overdue?: number;
  paid?: number;
  draft?: number;

  total_invoices_count?: number;
  due_amount_sar?: number;
  overdue_count?: number;
  paid_count?: number;
  scheduled_count?: number;
}
