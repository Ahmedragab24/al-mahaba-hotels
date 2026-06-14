-- Add location_url column to hotels table
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS location_url text;
