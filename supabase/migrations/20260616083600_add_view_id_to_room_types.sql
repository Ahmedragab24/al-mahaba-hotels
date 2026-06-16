-- Add view_id to hotel_room_types table
ALTER TABLE public.hotel_room_types
  ADD COLUMN IF NOT EXISTS view_id uuid REFERENCES public.hotel_views(id) ON DELETE SET NULL;
