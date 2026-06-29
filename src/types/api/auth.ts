import type { UserProfile } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
  type: 'super_admin' | 'sales_manager' | 'financial_manager' | 'viewer' | 'employee' | string;
}

export interface LoginResponse {
  data?: {
    user: UserProfile;
    access_token: string;
    token_type: string;
  };
  token?: string;
  user?: UserProfile;
  roles?: string[];
  message?: string;
  status_code?: number;
}
