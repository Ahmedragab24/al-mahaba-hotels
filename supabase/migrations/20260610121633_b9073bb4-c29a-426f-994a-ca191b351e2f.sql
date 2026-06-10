
ALTER TABLE public.rates
  ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_rate_id uuid REFERENCES public.rates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS superseded_at timestamptz,
  ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_direct boolean NOT NULL DEFAULT false;

ALTER TABLE public.rates ALTER COLUMN supplier_id DROP NOT NULL;

ALTER TABLE public.rates DROP CONSTRAINT IF EXISTS rates_source_chk;
ALTER TABLE public.rates ADD CONSTRAINT rates_source_chk
  CHECK ( (is_direct = true AND supplier_id IS NULL) OR (is_direct = false AND supplier_id IS NOT NULL) );

CREATE INDEX IF NOT EXISTS idx_rates_parent ON public.rates(parent_rate_id);
CREATE INDEX IF NOT EXISTS idx_rates_active_versions ON public.rates(hotel_id, room_type_id, valid_from, valid_to)
  WHERE deleted_at IS NULL AND superseded_at IS NULL;

ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS is_direct_supplier boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.approval_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('payment_order','invoice','supplier_payment','rate')),
  currency char(3) NOT NULL REFERENCES public.currencies(code),
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  requires_second_approver boolean NOT NULL DEFAULT true,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE (entity_type, currency)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_thresholds TO authenticated;
GRANT ALL ON public.approval_thresholds TO service_role;
ALTER TABLE public.approval_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_thresholds_read_auth" ON public.approval_thresholds
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "approval_thresholds_manage_finance" ON public.approval_thresholds
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager']::app_role[]));

CREATE TRIGGER trg_approval_thresholds_updated
  BEFORE UPDATE ON public.approval_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.tg_rates_version_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_is_admin boolean;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    v_is_admin := public.has_any_role(auth.uid(), ARRAY['super_admin']::app_role[]);
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
       OR NEW.superseded_at IS DISTINCT FROM OLD.superseded_at THEN
      RETURN NEW;
    END IF;
    IF OLD.status = 'approved' AND NOT v_is_admin THEN
      RAISE EXCEPTION 'RATE_APPROVED_LOCKED: approved rates cannot be edited; create a new version instead';
    END IF;
    IF OLD.superseded_at IS NOT NULL AND NOT v_is_admin THEN
      RAISE EXCEPTION 'RATE_SUPERSEDED_LOCKED: superseded rate versions are read-only';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_rates_version_guard ON public.rates;
CREATE TRIGGER trg_rates_version_guard
  BEFORE UPDATE ON public.rates
  FOR EACH ROW EXECUTE FUNCTION public.tg_rates_version_guard();

CREATE OR REPLACE FUNCTION public.create_rate_version(_rate_id uuid, _changes jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_old public.rates; v_new_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]) THEN
    RAISE EXCEPTION 'APPROVAL_FORBIDDEN: you do not have permission to version rates';
  END IF;
  SELECT * INTO v_old FROM public.rates WHERE id = _rate_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'RATE_NOT_FOUND'; END IF;

  INSERT INTO public.rates (
    code, hotel_id, supplier_id, contract_id, room_type_id, view_id,
    meal_plan, currency, valid_from, valid_to,
    cost_per_night, selling_price, markup_pct,
    min_nights, max_nights, release_days, allotment,
    notes_en, notes_ar, cancellation_policy_en, cancellation_policy_ar,
    status, is_direct, version, parent_rate_id, created_by
  ) VALUES (
    public.next_code('rate'),
    COALESCE((_changes->>'hotel_id')::uuid, v_old.hotel_id),
    CASE WHEN _changes ? 'supplier_id' THEN NULLIF(_changes->>'supplier_id','')::uuid ELSE v_old.supplier_id END,
    CASE WHEN _changes ? 'contract_id' THEN NULLIF(_changes->>'contract_id','')::uuid ELSE v_old.contract_id END,
    COALESCE((_changes->>'room_type_id')::uuid, v_old.room_type_id),
    CASE WHEN _changes ? 'view_id' THEN NULLIF(_changes->>'view_id','')::uuid ELSE v_old.view_id END,
    COALESCE((_changes->>'meal_plan')::rate_board, v_old.meal_plan),
    COALESCE(_changes->>'currency', v_old.currency)::char(3),
    COALESCE((_changes->>'valid_from')::date, v_old.valid_from),
    COALESCE((_changes->>'valid_to')::date, v_old.valid_to),
    COALESCE((_changes->>'cost_per_night')::numeric, v_old.cost_per_night),
    COALESCE((_changes->>'selling_price')::numeric, v_old.selling_price),
    COALESCE((_changes->>'markup_pct')::numeric, v_old.markup_pct),
    COALESCE((_changes->>'min_nights')::int, v_old.min_nights),
    COALESCE((_changes->>'max_nights')::int, v_old.max_nights),
    COALESCE((_changes->>'release_days')::int, v_old.release_days),
    COALESCE((_changes->>'allotment')::int, v_old.allotment),
    COALESCE(_changes->>'notes_en', v_old.notes_en),
    COALESCE(_changes->>'notes_ar', v_old.notes_ar),
    COALESCE(_changes->>'cancellation_policy_en', v_old.cancellation_policy_en),
    COALESCE(_changes->>'cancellation_policy_ar', v_old.cancellation_policy_ar),
    'draft'::approval_status,
    COALESCE((_changes->>'is_direct')::boolean, v_old.is_direct),
    v_old.version + 1, v_old.id, auth.uid()
  ) RETURNING id INTO v_new_id;

  UPDATE public.rates SET superseded_at = now(), superseded_by = auth.uid() WHERE id = v_old.id;
  PERFORM public.log_audit('version','rates', v_new_id::text, to_jsonb(v_old), NULL,
    jsonb_build_object('parent_rate_id', v_old.id, 'version', v_old.version + 1));
  RETURN v_new_id;
END $$;

CREATE OR REPLACE FUNCTION public.archive_old_rates()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count int;
BEGIN
  UPDATE public.rates SET deleted_at = now()
   WHERE deleted_at IS NULL AND valid_to < (current_date - interval '1 year');
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION public.tg_payment_maker_checker()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_threshold numeric; v_requires boolean;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'approved' THEN
    SELECT amount, requires_second_approver INTO v_threshold, v_requires
      FROM public.approval_thresholds
     WHERE entity_type = 'payment_order' AND currency = NEW.currency AND is_active = true LIMIT 1;
    IF v_threshold IS NOT NULL AND v_requires AND NEW.total_amount >= v_threshold THEN
      IF NEW.created_by = auth.uid() AND NOT public.has_any_role(auth.uid(), ARRAY['super_admin']::app_role[]) THEN
        RAISE EXCEPTION 'MAKER_CHECKER_VIOLATION: the user who created this payment cannot also approve it (amount >= %)', v_threshold;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_payment_maker_checker ON public.payment_orders;
CREATE TRIGGER trg_payment_maker_checker
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_payment_maker_checker();
