export type PlatformTransactionType = "income" | "expense";
export type PlatformTransactionMethod = "cash" | "bank_transfer" | "credit_card" | "cheque" | "other";

export interface PlatformTransaction {
  id: number;
  type: PlatformTransactionType;
  type_text?: string;
  category: string;
  category_text?: string;
  amount: number;
  currency_id: number;
  exchange_rate?: number;
  amount_sar?: number;
  currency?: {
    id: number;
    name_en: string;
    name_ar: string;
    code: string;
    symbol_ar?: string;
    symbol_en?: string;
    symbol?: string;
    rate_to_sar?: number;
  };
  transaction_date: string;
  description: string;
  payment_method: PlatformTransactionMethod;
  receipt_image?: string | null;
  creator?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface PlatformTransactionMonthlyBreakdown {
  month: string;
  income: number;
  expense: number;
  net_profit: number;
}

export interface PlatformTransactionCategoryBreakdown {
  type: PlatformTransactionType;
  type_text: string;
  category: string;
  category_text: string;
  total_sar: number;
}

export interface PlatformTransactionsStatistics {
  // Real API field names
  total_income_sar: number;
  total_expense_sar: number;
  net_profit_sar: number;
  year: number;
  monthly_breakdown: PlatformTransactionMonthlyBreakdown[];
  category_breakdown: PlatformTransactionCategoryBreakdown[];
  // Legacy aliases (kept for safety)
  income?: number;
  expense?: number;
  net?: number;
}
