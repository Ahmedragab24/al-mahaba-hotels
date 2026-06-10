-- ============ BOOKING MANAGEMENT ENGINE (Section 14) ============

-- BR-BK-001: auto booking numbers
INSERT INTO public.counters(key, prefix, current_value, padding)
VALUES ('booking','BK',0,5) ON CONFLICT (key) DO NOTHING;

-- ============ TABLES ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_no text UNIQUE,
  quotation_id uuid UNIQUE REFERENCES public.quotations(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_confirmation','confirmed','checked_in','checked_out','cancelled','no_show')),
  currency text NOT NULL DEFAULT 'SAR',
  booking_date date NOT NULL DEFAULT current_date,
  special_requests text,
  notes text,
  cancellation_reason text,
  confirmed_by uuid, confirmed_at timestamptz,
  checked_in_by uuid, checked_in_at timestamptz,
  checked_out_by uuid, checked_out_at timestamptz,
  cancelled_by uuid, cancelled_at timestamptz,
  no_show_by uuid, no_show_at timestamptz,
  created_by uuid,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY bk_read ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY bk_insert ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE POLICY bk_update ON public.bookings FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE POLICY bk_delete ON public.bookings FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TABLE public.booking_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  quotation_item_id uuid REFERENCES public.quotation_items(id),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id),
  rate_id uuid REFERENCES public.rates(id),
  room_type_id uuid REFERENCES public.hotel_room_types(id),
  supplier_id uuid REFERENCES public.suppliers(id),
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
  confirmation_status text NOT NULL DEFAULT 'pending' CHECK (confirmation_status IN ('pending','confirmed','rejected')),
  supplier_confirmation_no text,
  room_confirmed_by uuid, room_confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_booking_rooms_booking ON public.booking_rooms(booking_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_rooms TO authenticated;
GRANT ALL ON public.booking_rooms TO service_role;
ALTER TABLE public.booking_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY bkr_read ON public.booking_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY bkr_write ON public.booking_rooms FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));

CREATE TABLE public.booking_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  booking_room_id uuid REFERENCES public.booking_rooms(id) ON DELETE SET NULL,
  full_name text NOT NULL CHECK (btrim(full_name) <> ''),
  guest_type text NOT NULL DEFAULT 'adult' CHECK (guest_type IN ('adult','child','infant')),
  nationality text,
  passport_no text,
  phone text,
  email text,
  is_lead boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_booking_guests_booking ON public.booking_guests(booking_id);
-- BR: exactly one lead guest per booking
CREATE UNIQUE INDEX uq_booking_lead_guest ON public.booking_guests(booking_id) WHERE is_lead;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_guests TO authenticated;
GRANT ALL ON public.booking_guests TO service_role;
ALTER TABLE public.booking_guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY bkg_read ON public.booking_guests FOR SELECT TO authenticated USING (true);
CREATE POLICY bkg_write ON public.booking_guests FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));

CREATE TABLE public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_booking_history_booking ON public.booking_status_history(booking_id);
GRANT SELECT, INSERT ON public.booking_status_history TO authenticated;
GRANT ALL ON public.booking_status_history TO service_role;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY bkh_read ON public.booking_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY bkh_insert ON public.booking_status_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============ ATTACHMENT ENGINE SUPPORT ============
ALTER TABLE public.attachments DROP CONSTRAINT attachments_entity_type_check;
ALTER TABLE public.attachments ADD CONSTRAINT attachments_entity_type_check
  CHECK (entity_type IN ('hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice','rfq','rfq_response','booking'));

-- ============ TRIGGER FUNCTIONS ============

-- BR-BK-001: auto number
CREATE OR REPLACE FUNCTION public.tg_booking_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.booking_no IS NULL OR NEW.booking_no = '' THEN NEW.booking_no := public.next_code('booking'); END IF;
  RETURN NEW;
END $$;

-- BR-BK-012 + header locks
CREATE OR REPLACE FUNCTION public.tg_booking_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.booking_no IS DISTINCT FROM OLD.booking_no THEN
      RAISE EXCEPTION 'BOOKING_NO_IMMUTABLE: booking number cannot be changed';
    END IF;
    -- terminal states are fully locked (except soft archive by admins)
    IF OLD.status IN ('checked_out','cancelled','no_show')
       AND NEW.status = OLD.status
       AND NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at THEN
      IF NEW.customer_id <> OLD.customer_id OR NEW.currency <> OLD.currency
         OR NEW.booking_date <> OLD.booking_date
         OR NEW.special_requests IS DISTINCT FROM OLD.special_requests
         OR NEW.notes IS DISTINCT FROM OLD.notes
         OR NEW.quotation_id IS DISTINCT FROM OLD.quotation_id THEN
        RAISE EXCEPTION 'BOOKING_LOCKED: completed or cancelled bookings cannot be edited';
      END IF;
    END IF;
    -- after leaving draft, core commercial fields are frozen
    IF OLD.status NOT IN ('draft') AND NEW.status = OLD.status THEN
      IF NEW.customer_id <> OLD.customer_id OR NEW.currency <> OLD.currency OR NEW.quotation_id IS DISTINCT FROM OLD.quotation_id THEN
        RAISE EXCEPTION 'BOOKING_LOCKED_EDIT: customer and currency can only be edited while the booking is draft';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- BR-BK-006..011: workflow engine
CREATE OR REPLACE FUNCTION public.tg_booking_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rooms int;
  v_lead int;
  v_unconfirmed int;
  v_min_checkin date;
  v_is_manager boolean;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_is_manager := has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager']::app_role[]);

    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('pending_confirmation','cancelled')) OR
      (OLD.status = 'pending_confirmation' AND NEW.status IN ('confirmed','draft','cancelled')) OR
      (OLD.status = 'confirmed' AND NEW.status IN ('checked_in','cancelled','no_show')) OR
      (OLD.status = 'checked_in' AND NEW.status = 'checked_out')
    ) THEN
      RAISE EXCEPTION 'BOOKING_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
    END IF;

    SELECT count(*), min(check_in) INTO v_rooms, v_min_checkin FROM public.booking_rooms WHERE booking_id = NEW.id;
    SELECT count(*) INTO v_lead FROM public.booking_guests WHERE booking_id = NEW.id AND is_lead;

    -- BR: confirmation prerequisites
    IF NEW.status IN ('pending_confirmation','confirmed') THEN
      IF v_rooms = 0 THEN RAISE EXCEPTION 'BOOKING_NO_ROOMS: a booking requires at least one room'; END IF;
      IF v_lead = 0 THEN RAISE EXCEPTION 'BOOKING_NO_LEAD: a booking requires a lead guest'; END IF;
    END IF;

    -- BR: supplier confirmation required before booking confirmation
    IF NEW.status = 'confirmed' THEN
      IF NOT v_is_manager THEN RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action'; END IF;
      SELECT count(*) INTO v_unconfirmed FROM public.booking_rooms
       WHERE booking_id = NEW.id AND (confirmation_status <> 'confirmed' OR supplier_confirmation_no IS NULL OR btrim(supplier_confirmation_no) = '');
      IF v_unconfirmed > 0 THEN
        RAISE EXCEPTION 'BOOKING_SUPPLIER_UNCONFIRMED: every room requires a supplier confirmation before the booking can be confirmed';
      END IF;
      NEW.confirmed_by := auth.uid(); NEW.confirmed_at := now();
    END IF;

    -- BR: check-in only on/after arrival date
    IF NEW.status = 'checked_in' THEN
      IF v_min_checkin IS NOT NULL AND current_date < v_min_checkin THEN
        RAISE EXCEPTION 'BOOKING_EARLY_CHECKIN: check-in is only allowed on or after the arrival date';
      END IF;
      NEW.checked_in_by := auth.uid(); NEW.checked_in_at := now();
    END IF;

    IF NEW.status = 'checked_out' THEN
      NEW.checked_out_by := auth.uid(); NEW.checked_out_at := now();
    END IF;

    -- BR: cancellation requires a reason
    IF NEW.status = 'cancelled' THEN
      IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
        RAISE EXCEPTION 'BOOKING_CANCEL_REASON: a cancellation reason is required';
      END IF;
      NEW.cancelled_by := auth.uid(); NEW.cancelled_at := now();
    END IF;

    -- BR: no-show only on/after arrival date, managers only
    IF NEW.status = 'no_show' THEN
      IF NOT v_is_manager THEN RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action'; END IF;
      IF v_min_checkin IS NOT NULL AND current_date < v_min_checkin THEN
        RAISE EXCEPTION 'BOOKING_NO_SHOW_EARLY: no-show can only be recorded on or after the arrival date';
      END IF;
      NEW.no_show_by := auth.uid(); NEW.no_show_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- Status history + workflow audit
CREATE OR REPLACE FUNCTION public.tg_booking_after_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_status_history(booking_id, from_status, to_status) VALUES (NEW.id, NULL, NEW.status);
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.booking_status_history(booking_id, from_status, to_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, CASE WHEN NEW.status IN ('cancelled','no_show') THEN NEW.cancellation_reason ELSE NULL END);
    v_action := CASE NEW.status
      WHEN 'pending_confirmation' THEN 'submit'
      WHEN 'confirmed' THEN 'confirm'
      WHEN 'checked_in' THEN 'check_in'
      WHEN 'checked_out' THEN 'check_out'
      WHEN 'cancelled' THEN 'cancel'
      WHEN 'no_show' THEN 'no_show'
      ELSE 'update' END;
    PERFORM public.log_audit(v_action, 'bookings', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW),
      jsonb_build_object('booking_no', NEW.booking_no));
  END IF;
  RETURN NEW;
END $$;

-- BR-BK rooms: calculation + supplier confirmation + locking
CREATE OR REPLACE FUNCTION public.tg_booking_room_calc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_status text;
  v_room_cost numeric; v_room_sell numeric;
  v_taxes numeric := 0; v_fees numeric := 0;
  t record;
  v_only_confirmation boolean;
BEGIN
  SELECT status INTO v_status FROM public.bookings WHERE id = NEW.booking_id;

  IF TG_OP = 'UPDATE' THEN
    v_only_confirmation :=
      NEW.hotel_id = OLD.hotel_id AND NEW.rate_id IS NOT DISTINCT FROM OLD.rate_id
      AND NEW.room_type_id IS NOT DISTINCT FROM OLD.room_type_id
      AND NEW.occupancy_type = OLD.occupancy_type AND NEW.check_in = OLD.check_in
      AND NEW.check_out = OLD.check_out AND NEW.rooms = OLD.rooms
      AND NEW.cost_price IS NOT DISTINCT FROM OLD.cost_price
      AND NEW.selling_price IS NOT DISTINCT FROM OLD.selling_price
      AND NEW.supplier_id IS NOT DISTINCT FROM OLD.supplier_id;
    IF v_status NOT IN ('draft') AND NOT (v_only_confirmation AND v_status = 'pending_confirmation') THEN
      RAISE EXCEPTION 'BOOKING_ROOMS_LOCKED: rooms can only be modified while the booking is draft (confirmations while pending confirmation)';
    END IF;
  ELSE
    IF v_status <> 'draft' THEN
      RAISE EXCEPTION 'BOOKING_ROOMS_LOCKED: rooms can only be added while the booking is draft';
    END IF;
  END IF;

  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'BOOKING_ROOM_DATES: check-out must be after check-in';
  END IF;
  NEW.nights := NEW.check_out - NEW.check_in;

  -- price pull from occupancy engine when not supplied (BR: no manual prices on direct bookings)
  IF (NEW.cost_price IS NULL OR NEW.selling_price IS NULL) AND NEW.rate_id IS NOT NULL THEN
    SELECT p.cost_price, p.selling_price INTO v_room_cost, v_room_sell
      FROM public.rate_occupancy_prices p
     WHERE p.rate_id = NEW.rate_id AND p.occupancy_type = NEW.occupancy_type AND p.active LIMIT 1;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'BOOKING_NO_PRICE: no active occupancy price found for this rate and occupancy type';
    END IF;
    NEW.cost_price := COALESCE(NEW.cost_price, v_room_cost);
    NEW.selling_price := COALESCE(NEW.selling_price, v_room_sell);
  END IF;
  IF NEW.cost_price IS NULL OR NEW.selling_price IS NULL THEN
    RAISE EXCEPTION 'BOOKING_PRICE_REQUIRED: cost and selling prices are required';
  END IF;
  IF NEW.selling_price < NEW.cost_price THEN
    RAISE EXCEPTION 'OCCUPANCY_SELLING_BELOW_COST: selling price cannot be lower than cost price';
  END IF;

  IF NEW.room_type_id IS NULL AND NEW.rate_id IS NOT NULL THEN
    SELECT r.room_type_id INTO NEW.room_type_id FROM public.rates r WHERE r.id = NEW.rate_id;
  END IF;
  -- derive supplier from the rate's contract when missing
  IF NEW.supplier_id IS NULL AND NEW.rate_id IS NOT NULL THEN
    SELECT c.supplier_id INTO NEW.supplier_id
      FROM public.rates r JOIN public.supplier_contracts c ON c.id = r.contract_id
     WHERE r.id = NEW.rate_id;
  END IF;

  -- taxes & fees
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

  -- supplier confirmation rules
  IF NEW.confirmation_status = 'confirmed' THEN
    IF NEW.supplier_confirmation_no IS NULL OR btrim(NEW.supplier_confirmation_no) = '' THEN
      RAISE EXCEPTION 'BOOKING_CONFIRMATION_NO_REQUIRED: a supplier confirmation number is required';
    END IF;
    IF TG_OP = 'INSERT' OR OLD.confirmation_status <> 'confirmed' THEN
      NEW.room_confirmed_by := auth.uid(); NEW.room_confirmed_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_booking_room_delete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.bookings WHERE id = OLD.booking_id;
  IF v_status IS NOT NULL AND v_status <> 'draft' THEN
    RAISE EXCEPTION 'BOOKING_ROOMS_LOCKED: rooms can only be removed while the booking is draft';
  END IF;
  RETURN OLD;
END $$;

-- Guests: locking + lead default
CREATE OR REPLACE FUNCTION public.tg_booking_guest_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_status text; v_count int;
BEGIN
  SELECT status INTO v_status FROM public.bookings WHERE id = COALESCE(NEW.booking_id, OLD.booking_id);
  IF v_status IS NOT NULL AND v_status NOT IN ('draft','pending_confirmation','confirmed') THEN
    RAISE EXCEPTION 'BOOKING_GUESTS_LOCKED: guests can only be modified before check-in';
  END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO v_count FROM public.booking_guests WHERE booking_id = NEW.booking_id;
    IF v_count = 0 THEN NEW.is_lead := true; END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

-- BR-BK-002: conversion from accepted quotation (single-use)
CREATE OR REPLACE FUNCTION public.create_booking_from_quotation(_quotation_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_q record;
  v_items int;
  v_booking_id uuid;
BEGIN
  IF NOT has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]) THEN
    RAISE EXCEPTION 'APPROVAL_FORBIDDEN: you do not have permission to create bookings';
  END IF;
  SELECT * INTO v_q FROM public.quotations WHERE id = _quotation_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'BOOKING_QUOTE_MISSING: quotation not found'; END IF;
  IF v_q.status <> 'accepted' THEN
    RAISE EXCEPTION 'BOOKING_QUOTE_NOT_ACCEPTED: only accepted quotations can be converted to bookings';
  END IF;
  IF EXISTS (SELECT 1 FROM public.bookings WHERE quotation_id = _quotation_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'BOOKING_QUOTE_ALREADY_CONVERTED: this quotation has already been converted to a booking';
  END IF;
  SELECT count(*) INTO v_items FROM public.quotation_items WHERE quotation_id = _quotation_id;
  IF v_items = 0 THEN RAISE EXCEPTION 'QUOTATION_NO_ITEMS: the quotation has no items'; END IF;

  INSERT INTO public.bookings(quotation_id, customer_id, currency, notes, created_by)
  VALUES (_quotation_id, v_q.customer_id, v_q.currency, v_q.notes, auth.uid())
  RETURNING id INTO v_booking_id;

  INSERT INTO public.booking_rooms(booking_id, quotation_item_id, hotel_id, rate_id, room_type_id,
    occupancy_type, check_in, check_out, rooms, cost_price, selling_price)
  SELECT v_booking_id, qi.id, qi.hotel_id, qi.rate_id, qi.room_type_id,
         qi.occupancy_type, qi.check_in, qi.check_out, qi.rooms, qi.cost_price, qi.selling_price
    FROM public.quotation_items qi WHERE qi.quotation_id = _quotation_id;

  PERFORM public.log_audit('convert', 'bookings', v_booking_id::text, NULL, NULL,
    jsonb_build_object('quotation_id', _quotation_id, 'quotation_no', v_q.quotation_no));
  RETURN v_booking_id;
END $$;

GRANT EXECUTE ON FUNCTION public.create_booking_from_quotation(uuid) TO authenticated;

-- ============ TRIGGERS ============
CREATE TRIGGER trg_booking_code BEFORE INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_booking_code();
CREATE TRIGGER trg_booking_validate BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_booking_validate();
CREATE TRIGGER trg_booking_workflow BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_booking_workflow();
CREATE TRIGGER trg_booking_after_status AFTER INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_booking_after_status();
CREATE TRIGGER trg_booking_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_booking_audit AFTER INSERT OR UPDATE OR DELETE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_booking_room_calc BEFORE INSERT OR UPDATE ON public.booking_rooms FOR EACH ROW EXECUTE FUNCTION public.tg_booking_room_calc();
CREATE TRIGGER trg_booking_room_delete BEFORE DELETE ON public.booking_rooms FOR EACH ROW EXECUTE FUNCTION public.tg_booking_room_delete();
CREATE TRIGGER trg_booking_room_updated BEFORE UPDATE ON public.booking_rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_booking_room_audit AFTER INSERT OR UPDATE OR DELETE ON public.booking_rooms FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_booking_guest_validate BEFORE INSERT OR UPDATE OR DELETE ON public.booking_guests FOR EACH ROW EXECUTE FUNCTION public.tg_booking_guest_validate();
CREATE TRIGGER trg_booking_guest_updated BEFORE UPDATE ON public.booking_guests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_booking_guest_audit AFTER INSERT OR UPDATE OR DELETE ON public.booking_guests FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();