export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    message_ar?: string;
    title_ar?: string;
    message_en?: string;
    title_en?: string;
    user_id?: number;
    user_name?: string;
    user_type?: string;
    user_email?: string;
    key?: string;
    keyId?: number;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResponseNotifications {
  status_code: number;
  message: string;
  notifications: Notification[];
  countUnreadNotifications: number;
}