-- Counter for quotation numbers
INSERT INTO public.counters(key, prefix, current_value, padding)
VALUES ('quotation', 'QT', 0, 5) ON CONFLICT (key) DO NOTHING;

-- Approval threshold setting
INSERT INTO public.system_settings(key, value)
VALUES ('quotation.approval_threshold', '10000'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============ QUOTATIONS ============
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_no text NOT NULL UNIQUE DEFAULT '',
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','sent','accepted','expired','cancelled')),
  currency char(3) NOT NULL DEFAULT 'SAR',
  quotation_date date NOT NULL DEFAULT CURRENT_DATE,
  travel_date date,
  expiry_date date NOT NULL,
  notes text,
  created_by uuid DEFAULT auth.uid(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY q_read ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY q_insert ON public.quotations FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent']::app_role[]));
CREATE POLICY q_update ON public.quotations FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent']::app_role[]));
CREATE POLICY q_delete ON public.quotations FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

-- ============ QUOTATION ITEMS ============
CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES public.hotels(id),
  rate_id uuid REFERENCES public.rates(id),
  room_type_id uuid REFERENCES public.hotel_room_types(id),
  occupancy_type text NOT NULL CHECK (occupancy_type IN ('SGL','DBL','TPL','QUAD','CHD','INF')),
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights integer NOT NULL DEFAULT 0,
  rooms integer NOT NULL DEFAULT 1 CHECK (rooms > 0),
  cost_price numeric(12,2) CHECK (cost_price >= 0),
  selling_price numeric(12,2) CHECK (selling_price >= 0),
  margin numeric(12,2) NOT NULL DEFAULT 0,
  taxes numeric(12,2) NOT NULL DEFAULT 0,
  fees numeric(12,2) NOT NULL DEFAULT 0,
  total_cost numeric(14,2) NOT NULL DEFAULT 0,
  total_selling numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qitems_quotation ON public.quotation_items(quotation_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT ALL ON public.quotation_items TO service_role;

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY qi_read ON public.quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY qi_write ON public.quotation_items FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent']::app_role[]));

-- ============ CODE + updated_at ============
CREATE OR REPLACE FUNCTION public.tg_quotation_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.quotation_no IS NULL OR NEW.quotation_no = '' THEN
    NEW.quotation_no := public.next_code('quotation');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_q_code BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_code();
CREATE TRIGGER trg_q_updated BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_qi_updated BEFORE UPDATE ON public.quotation_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CALCULATION ENGINE ============
CREATE OR REPLACE FUNCTION public.tg_quotation_item_calc()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE
  v_room_selling numeric;
  v_room_cost numeric;
  v_taxes numeric := 0;
  v_fees numeric := 0;
  t record;
BEGIN
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'QITEM_DATES: check-out must be after check-in';
  END IF;
  NEW.nights := NEW.check_out - NEW.check_in;

  -- Pull pricing from the Occupancy Pricing engine when not provided
  IF (NEW.cost_price IS NULL OR NEW.selling_price IS NULL) AND NEW.rate_id IS NOT NULL THEN
    SELECT p.cost_price, p.selling_price
      INTO v_room_cost, v_room_selling
      FROM public.rate_occupancy_prices p
     WHERE p.rate_id = NEW.rate_id AND p.occupancy_type = NEW.occupancy_type AND p.active
     LIMIT 1;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'QITEM_NO_PRICE: no active occupancy price found for this rate and occupancy type';
    END IF;
    NEW.cost_price := COALESCE(NEW.cost_price, v_room_cost);
    NEW.selling_price := COALESCE(NEW.selling_price, v_room_selling);
  END IF;

  IF NEW.cost_price IS NULL OR NEW.selling_price IS NULL THEN
    RAISE EXCEPTION 'QITEM_PRICE_REQUIRED: cost and selling prices are required (select a rate or enter manually)';
  END IF;
  IF NEW.selling_price < NEW.cost_price THEN
    RAISE EXCEPTION 'OCCUPANCY_SELLING_BELOW_COST: selling price cannot be lower than cost price';
  END IF;

  -- default room_type from rate
  IF NEW.room_type_id IS NULL AND NEW.rate_id IS NOT NULL THEN
    SELECT r.room_type_id INTO NEW.room_type_id FROM public.rates r WHERE r.id = NEW.rate_id;
  END IF;

  -- Taxes (percentage) & fees (fixed) from active hotel taxes
  FOR t IN
    SELECT ht.calc_method, ht.value, ht.apply_scope, ht.is_inclusive
      FROM public.hotel_taxes ht
     WHERE ht.hotel_id = NEW.hotel_id AND ht.is_active AND ht.deleted_at IS NULL
       AND (ht.effective_date IS NULL OR ht.effective_date <= NEW.check_in)
       AND (ht.expiry_date IS NULL OR ht.expiry_date >= NEW.check_in)
  LOOP
    IF t.is_inclusive THEN CONTINUE; END IF;
    IF t.calc_method = 'percentage' THEN
      v_taxes := v_taxes + round(NEW.selling_price * NEW.nights * NEW.rooms * t.value / 100.0, 2);
    ELSE
      v_fees := v_fees + round(t.value * CASE t.apply_scope
        WHEN 'per_night' THEN NEW.nights * NEW.rooms
        WHEN 'per_room' THEN NEW.rooms
        WHEN 'per_person' THEN NEW.rooms
        ELSE 1 END, 2);
    END IF;
  END LOOP;

  NEW.taxes := v_taxes;
  NEW.fees := v_fees;
  NEW.total_cost := round(NEW.cost_price * NEW.nights * NEW.rooms, 2);
  NEW.margin := round((NEW.selling_price - NEW.cost_price) * NEW.nights * NEW.rooms, 2);
  NEW.total_selling := round(NEW.selling_price * NEW.nights * NEW.rooms + v_taxes + v_fees, 2);
  RETURN NEW;
END $$;
CREATE TRIGGER trg_qi_calc BEFORE INSERT OR UPDATE ON public.quotation_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_item_calc();

-- Items only editable while quotation is editable
CREATE OR REPLACE FUNCTION public.tg_quotation_item_lock()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.quotations WHERE id = COALESCE(NEW.quotation_id, OLD.quotation_id);
  IF v_status NOT IN ('draft','rejected') THEN
    RAISE EXCEPTION 'QUOTATION_LOCKED: items can only be modified while the quotation is in draft or rejected status';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_qi_lock BEFORE INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_item_lock();

-- ============ WORKFLOW ============
CREATE OR REPLACE FUNCTION public.tg_quotation_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_total numeric;
  v_threshold numeric;
  v_is_approver boolean;
  v_items int;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_is_approver := has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager']::app_role[]);

    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('pending_approval','sent','cancelled')) OR
      (OLD.status = 'pending_approval' AND NEW.status IN ('approved','rejected','draft')) OR
      (OLD.status = 'approved' AND NEW.status IN ('sent','cancelled')) OR
      (OLD.status = 'rejected' AND NEW.status IN ('draft','cancelled')) OR
      (OLD.status = 'sent' AND NEW.status IN ('accepted','expired','cancelled'))
    ) THEN
      RAISE EXCEPTION 'QUOTATION_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
    END IF;

    SELECT count(*), COALESCE(sum(total_selling),0) INTO v_items, v_total
      FROM public.quotation_items WHERE quotation_id = NEW.id;

    IF NEW.status IN ('pending_approval','sent') AND v_items = 0 THEN
      RAISE EXCEPTION 'QUOTATION_NO_ITEMS: a quotation requires at least one item';
    END IF;

    -- Sending directly from draft only allowed below approval threshold
    IF OLD.status = 'draft' AND NEW.status = 'sent' THEN
      SELECT (value::text)::numeric INTO v_threshold FROM public.system_settings WHERE key = 'quotation.approval_threshold';
      IF v_total >= COALESCE(v_threshold, 0) THEN
        RAISE EXCEPTION 'QUOTATION_APPROVAL_REQUIRED: this quotation exceeds the approval threshold and must be approved before sending';
      END IF;
    END IF;

    IF NEW.status IN ('approved','rejected') AND NOT v_is_approver THEN
      RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
    END IF;

    -- Bridge: submitting opens an approval request (if none open)
    IF NEW.status = 'pending_approval' THEN
      IF NOT EXISTS (SELECT 1 FROM public.approval_requests ar
                      WHERE ar.entity_type = 'quotation' AND ar.entity_id = NEW.id
                        AND ar.status IN ('draft','submitted','returned')) THEN
        INSERT INTO public.approval_requests(entity_type, entity_id, status)
        VALUES ('quotation', NEW.id, 'submitted');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_q_workflow BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_workflow();

-- Bridge: approval request decisions update the quotation status
CREATE OR REPLACE FUNCTION public.tg_quotation_approval_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.entity_type = 'quotation' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'approved' THEN
      UPDATE public.quotations SET status = 'approved' WHERE id = NEW.entity_id AND status = 'pending_approval';
    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.quotations SET status = 'rejected' WHERE id = NEW.entity_id AND status = 'pending_approval';
    ELSIF NEW.status = 'returned' THEN
      UPDATE public.quotations SET status = 'draft' WHERE id = NEW.entity_id AND status = 'pending_approval';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_apr_quotation_sync AFTER UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_approval_sync();

-- ============ AUDIT ============
CREATE TRIGGER trg_q_audit AFTER INSERT OR UPDATE OR DELETE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE TRIGGER trg_qi_audit AFTER INSERT OR UPDATE OR DELETE ON public.quotation_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();