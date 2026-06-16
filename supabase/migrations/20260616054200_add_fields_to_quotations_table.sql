-- Add room_type_id, rooms, view_id, meal_plan, meals_included, and final_price to quotations table
ALTER TABLE public.quotations 
  ADD COLUMN IF NOT EXISTS room_type_id uuid REFERENCES public.hotel_room_types(id),
  ADD COLUMN IF NOT EXISTS rooms integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS view_id uuid REFERENCES public.hotel_views(id),
  ADD COLUMN IF NOT EXISTS meal_plan text,
  ADD COLUMN IF NOT EXISTS meals_included boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS final_price numeric(14,2);
