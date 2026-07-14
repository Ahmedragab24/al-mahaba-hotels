import type { UserProfile } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
  role_id?: string | number;
  fcm?: string;
}

export interface LoginResponse {
  user: UserProfile;
  access_token: string;
  token_type: string;
  token?: string;
  message?: string;
  status_code?: number;
}
