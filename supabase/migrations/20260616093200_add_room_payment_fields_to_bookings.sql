-- Add hotel/room booking fields to the bookings header table
-- These fields allow direct hotel room booking without needing booking_rooms sub-table for simple cases

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS hotel_id      uuid REFERENCES public.hotels(id),
  ADD COLUMN IF NOT EXISTS room_type_id  uuid REFERENCES public.hotel_room_types(id),
  ADD COLUMN IF NOT EXISTS view_id       uuid REFERENCES public.hotel_views(id),
  ADD COLUMN IF NOT EXISTS occupancy_type text CHECK (occupancy_type IN ('SGL','DBL','TPL','QUAD','CHD','INF')),
  ADD COLUMN IF NOT EXISTS rooms         integer DEFAULT 1 CHECK (rooms > 0),
  ADD COLUMN IF NOT EXISTS check_in      date,
  ADD COLUMN IF NOT EXISTS check_out     date,
  ADD COLUMN IF NOT EXISTS room_rate     numeric(12,2),
  ADD COLUMN IF NOT EXISTS total_amount  numeric(14,2),
  ADD COLUMN IF NOT EXISTS amount_paid   numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_mode  text DEFAULT 'full' CHECK (payment_mode IN ('full','partial','deferred'));

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_bookings_hotel      ON public.bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in   ON public.bookings(check_in);
