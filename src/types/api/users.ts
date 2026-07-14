
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: number;
  role: {
    id: number;
    name: string;
    name_ar: string;
    name_en: string;
    status: boolean;
  } | null;
  image: string | null;
  fcm: string | null;
  country: {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
    phone_code: string;
    name: string;
  } | null;
  city: {
    id: number;
    name_ar: string;
    name_en: string;
    name: string;
  } | null;
  permissions: Record<string, string | boolean> | string[];
}

export interface UsersResponse {
  data: {
    data: UserProfile[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  message: string;
  status_code: number;
}