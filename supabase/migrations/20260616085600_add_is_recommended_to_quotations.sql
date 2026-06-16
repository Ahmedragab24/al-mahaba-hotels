-- Add is_recommended column to quotations table
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false;
