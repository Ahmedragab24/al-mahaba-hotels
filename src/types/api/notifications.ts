export interface Notification {
  id: string;
  title: string;
  message: string;
  title_en: string;
  message_en: string;
  read_at: string | null;
  created_at: string;
  updated_at?: string;
}
