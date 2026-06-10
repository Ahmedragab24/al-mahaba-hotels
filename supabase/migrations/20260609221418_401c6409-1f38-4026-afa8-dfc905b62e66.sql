CREATE TABLE public.rate_occupancy_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES public.rates(id) ON DELETE CASCADE,
  occupancy_type text NOT NULL CHECK (occupancy_type IN ('SGL','DBL','TPL','QUAD','CHD','INF')),
  cost_price numeric(12,2) NOT NULL CHECK (cost_price >= 0),
  selling_price numeric(12,2) CHECK (selling_price >= 0),
  markup_percent numeric(8,3) CHECK (markup_percent >= 0),
  currency text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rate_id, occupancy_type)
);
CREATE INDEX idx_rop_rate ON public.rate_occupancy_prices(rate_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_occupancy_prices TO authenticated;
GRANT ALL ON public.rate_occupancy_prices TO service_role;

ALTER TABLE public.rate_occupancy_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY rop_read ON public.rate_occupancy_prices
  FOR SELECT TO authenticated USING (true);
CREATE POLICY rop_write ON public.rate_occupancy_prices
  FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]));

-- Validation + markup recalculation
CREATE OR REPLACE FUNCTION public.tg_rate_occupancy_validate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- default currency from parent rate
  IF NEW.currency IS NULL OR btrim(NEW.currency) = '' THEN
    SELECT r.currency INTO NEW.currency FROM public.rates r WHERE r.id = NEW.rate_id;
  END IF;
  -- derive selling from markup if missing
  IF NEW.selling_price IS NULL AND NEW.markup_percent IS NOT NULL THEN
    NEW.selling_price := round(NEW.cost_price * (1 + NEW.markup_percent / 100.0), 2);
  END IF;
  -- derive markup from prices if missing
  IF NEW.markup_percent IS NULL AND NEW.selling_price IS NOT NULL AND NEW.cost_price > 0 THEN
    NEW.markup_percent := round(((NEW.selling_price - NEW.cost_price) / NEW.cost_price) * 100.0, 3);
  END IF;
  -- selling can never be below cost
  IF NEW.selling_price IS NOT NULL AND NEW.selling_price < NEW.cost_price THEN
    RAISE EXCEPTION 'OCCUPANCY_SELLING_BELOW_COST: selling price cannot be lower than cost price';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_rop_validate BEFORE INSERT OR UPDATE ON public.rate_occupancy_prices
  FOR EACH ROW EXECUTE FUNCTION public.tg_rate_occupancy_validate();

-- Activation rule: a rate needs active SGL + DBL pricing before approval
CREATE OR REPLACE FUNCTION public.tg_rate_requires_occupancy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT EXISTS (SELECT 1 FROM public.rate_occupancy_prices p WHERE p.rate_id = NEW.id AND p.occupancy_type = 'SGL' AND p.active)
       OR NOT EXISTS (SELECT 1 FROM public.rate_occupancy_prices p WHERE p.rate_id = NEW.id AND p.occupancy_type = 'DBL' AND p.active) THEN
      RAISE EXCEPTION 'RATE_MISSING_OCCUPANCY: rate requires active SGL and DBL occupancy prices before activation';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_rate_requires_occupancy BEFORE UPDATE ON public.rates
  FOR EACH ROW EXECUTE FUNCTION public.tg_rate_requires_occupancy();

-- updated_at + audit
CREATE TRIGGER trg_rop_updated BEFORE UPDATE ON public.rate_occupancy_prices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rop_audit AFTER INSERT OR UPDATE OR DELETE ON public.rate_occupancy_prices
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();