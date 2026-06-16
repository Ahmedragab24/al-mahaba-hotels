-- Add country, city, language, hotel, and group columns to quotations table
ALTER TABLE public.quotations 
  ADD COLUMN IF NOT EXISTS country_code text REFERENCES public.countries(code),
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS hotel_id uuid REFERENCES public.hotels(id),
  ADD COLUMN IF NOT EXISTS group_name text;
