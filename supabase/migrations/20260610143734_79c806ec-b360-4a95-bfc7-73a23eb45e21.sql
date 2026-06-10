WITH rt AS (
  SELECT id, hotel_id, row_number() OVER (PARTITION BY hotel_id ORDER BY random()) rn
  FROM public.hotel_room_types
), src AS (
  SELECT rt.id AS room_type_id, rt.hotel_id,
         (random() < 0.4) AS is_direct,
         row_number() OVER () AS rn2
  FROM rt WHERE rt.rn <= 3
)
INSERT INTO public.rates (code, hotel_id, supplier_id, room_type_id, meal_plan, currency, valid_from, valid_to, cost_per_night, selling_price, markup_pct, status, is_direct, is_simulated)
SELECT
  'SIM-RT-' || substr(md5(random()::text), 1, 10) || '-' || src.rn2,
  src.hotel_id,
  CASE WHEN src.is_direct THEN NULL ELSE (SELECT id FROM public.suppliers WHERE is_simulated = true ORDER BY random() LIMIT 1) END,
  src.room_type_id,
  (ARRAY['RO','BB','HB','FB'])[1 + floor(random()*4)::int]::rate_board,
  'SAR'::character(3),
  CURRENT_DATE - 7,
  CURRENT_DATE + 90,
  (180 + floor(random()*1200))::numeric,
  (250 + floor(random()*1500))::numeric,
  (10 + floor(random()*25))::numeric,
  'approved'::approval_status,
  src.is_direct,
  true
FROM src
LIMIT 200;