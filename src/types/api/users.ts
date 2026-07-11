export type UserType =
  | "super_admin"
  | "sales_manager"
  | "financial_manager"
  | "viewer"
  | "employee";

export interface UserProfile {
  image?: string;
  avatar_url: string | null;
  created_at: string;
  created_by: string | null;
  email: string;
  failed_login_attempts: number;
  full_name_ar: string | null;
  full_name_en: string | null;
  id: string;
  is_active: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  locked_until: string | null;
  must_change_password: boolean;
  password_changed_at: string | null;
  phone: string | null;
  preferred_language: "en" | "ar";
  supplier_id: string | null;
  type: UserType | null;
  updated_at: string;
  username: string | null;
  fcm?: string | null;
}
