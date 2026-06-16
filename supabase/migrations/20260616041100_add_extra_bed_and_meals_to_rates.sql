-- Add extra bed and meal plan add-ons columns to rates table
ALTER TABLE public.rates 
  ADD COLUMN IF NOT EXISTS allow_extra_bed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extra_bed_price numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_bed_limit integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS meals_included boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS breakfast_price numeric(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS half_board_price numeric(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS full_board_price numeric(12,2) DEFAULT NULL;
