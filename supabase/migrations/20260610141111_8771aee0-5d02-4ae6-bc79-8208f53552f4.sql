CREATE TABLE public.simulation_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  interval_minutes integer NOT NULL DEFAULT 15 CHECK (interval_minutes BETWEEN 1 AND 1440),
  intensity text NOT NULL DEFAULT 'low' CHECK (intensity IN ('low','medium','high')),
  last_run_at timestamptz,
  last_run_status text,
  last_run_summary jsonb,
  total_runs integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulation_settings TO authenticated;
GRANT ALL ON public.simulation_settings TO service_role;

ALTER TABLE public.simulation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read simulation settings"
  ON public.simulation_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage simulation settings"
  ON public.simulation_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER simulation_settings_set_updated_at
  BEFORE UPDATE ON public.simulation_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.simulation_settings (enabled, interval_minutes, intensity)
SELECT false, 15, 'low'
WHERE NOT EXISTS (SELECT 1 FROM public.simulation_settings);

ALTER TABLE public.customers          ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.suppliers          ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.rfqs               ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.quotations         ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.bookings           ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.invoices           ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.receipts           ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;
ALTER TABLE public.supplier_payments  ADD COLUMN IF NOT EXISTS is_simulated boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_customers_is_simulated         ON public.customers(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_is_simulated         ON public.suppliers(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_rfqs_is_simulated              ON public.rfqs(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_quotations_is_simulated        ON public.quotations(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_bookings_is_simulated          ON public.bookings(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_invoices_is_simulated          ON public.invoices(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_receipts_is_simulated          ON public.receipts(is_simulated) WHERE is_simulated = true;
CREATE INDEX IF NOT EXISTS idx_supplier_payments_is_simulated ON public.supplier_payments(is_simulated) WHERE is_simulated = true;