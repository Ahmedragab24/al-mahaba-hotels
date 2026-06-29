export interface Price {
  id: string | number;
  code: string;
  hotel_id: string | number;
  room_id?: string | number;
  room_type_id?: string | number; // Backward compatibility
  hotel_view_id?: string | number | null;
  view_id?: string | number | null; // Backward compatibility
  currency_id?: string | number;
  currency?: string; // Backward compatibility
  supplier_id: string | number | null;
  is_direct: boolean;
  
  valid_from: string;
  valid_to: string;
  
  meal_plan_type?: "inclusive" | "exclusive";
  meal_plan_inclusive_details?: number[];
  meal_plan_exclusive_prices?: Record<number, number>;
  
  // Backward compatibility for old meal fields
  meal_plan?: any;
  meals_included?: boolean;
  breakfast_price?: number | null;
  lunch_price?: number | null;
  dinner_price?: number | null;
  half_board_price?: number | null;
  full_board_price?: number | null;

  cost_per_night: number;
  selling_price: number | null;
  profit_margin?: number | null;
  markup_pct?: number | null;
  
  tax_type?: "inclusive_tax" | "exclusive_tax";
  tax_rate?: number;

  status: any;
  notes_ar: string | null;
  notes_en: string | null;
  cancellation_policy_ar: string | null;
  cancellation_policy_en: string | null;

  min_nights?: number;
  max_nights?: number | null;
  release_days?: number;
  allotment?: number | null;
  allow_extra_bed?: boolean;
  extra_bed_limit?: number | null;
  extra_bed_price?: number | null;

  contract_id?: string | null;
  is_simulated?: boolean;
  parent_rate_id?: string | null;
  rejection_reason?: string | null;
  version?: number;
  
  created_at?: string;
  created_by?: string | null;
  updated_at?: string;
  updated_by?: string | null;
  deleted_at?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  superseded_at?: string | null;
  superseded_by?: string | null;
}
