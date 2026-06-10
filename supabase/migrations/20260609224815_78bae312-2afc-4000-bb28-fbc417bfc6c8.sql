-- ============ RFQ HEADER ============
CREATE TABLE public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_no text UNIQUE,
  customer_id uuid REFERENCES public.customers(id),
  travel_start date NOT NULL,
  travel_end date NOT NULL,
  destination text,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','partial','completed','approved','rejected','expired','cancelled')),
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfqs TO authenticated;
GRANT ALL ON public.rfqs TO service_role;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfqs_select" ON public.rfqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "rfqs_insert" ON public.rfqs FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE POLICY "rfqs_update" ON public.rfqs FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE POLICY "rfqs_delete" ON public.rfqs FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- ============ RFQ ITEMS ============
CREATE TABLE public.rfq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES public.hotels(id),
  room_type_id uuid REFERENCES public.hotel_room_types(id),
  occupancy_type text NOT NULL CHECK (occupancy_type IN ('SGL','DBL','TPL','QUAD','CHD','INF')),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights int NOT NULL DEFAULT 1,
  meal_plan text CHECK (meal_plan IN ('RO','BB','HB','FB','AI','UAI')),
  special_requests text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfq_items TO authenticated;
GRANT ALL ON public.rfq_items TO service_role;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfq_items_select" ON public.rfq_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "rfq_items_write" ON public.rfq_items FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE INDEX idx_rfq_items_rfq ON public.rfq_items(rfq_id);

-- ============ SUPPLIER REQUESTS ============
CREATE TABLE public.rfq_supplier_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  sent_at timestamptz,
  response_due_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','responded','overdue','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, supplier_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfq_supplier_requests TO authenticated;
GRANT ALL ON public.rfq_supplier_requests TO service_role;
ALTER TABLE public.rfq_supplier_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfq_sreq_select" ON public.rfq_supplier_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "rfq_sreq_write" ON public.rfq_supplier_requests FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE INDEX idx_rfq_sreq_rfq ON public.rfq_supplier_requests(rfq_id);

-- ============ SUPPLIER RESPONSES ============
CREATE TABLE public.rfq_supplier_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.rfq_supplier_requests(id) ON DELETE CASCADE,
  rfq_item_id uuid NOT NULL REFERENCES public.rfq_items(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available','unavailable','on_request')),
  available_rooms int CHECK (available_rooms >= 0),
  cost_price numeric(12,2) CHECK (cost_price >= 0),
  currency text,
  cancellation_policy text,
  release_days int CHECK (release_days >= 0),
  remarks text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected')),
  responded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, rfq_item_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rfq_supplier_responses TO authenticated;
GRANT ALL ON public.rfq_supplier_responses TO service_role;
ALTER TABLE public.rfq_supplier_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfq_resp_select" ON public.rfq_supplier_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "rfq_resp_write" ON public.rfq_supplier_responses FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager','operations_agent']::app_role[]));
CREATE INDEX idx_rfq_resp_rfq ON public.rfq_supplier_responses(rfq_id);
CREATE INDEX idx_rfq_resp_item ON public.rfq_supplier_responses(rfq_item_id);

-- ============ STATUS HISTORY ============
CREATE TABLE public.rfq_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  notes text,
  changed_by uuid DEFAULT auth.uid(),
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.rfq_status_history TO authenticated;
GRANT ALL ON public.rfq_status_history TO service_role;
ALTER TABLE public.rfq_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rfq_hist_select" ON public.rfq_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "rfq_hist_insert" ON public.rfq_status_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_rfq_hist_rfq ON public.rfq_status_history(rfq_id);

-- ============ ENTITY TYPE EXTENSIONS (attachments + approvals) ============
ALTER TABLE public.attachments DROP CONSTRAINT attachments_entity_type_check;
ALTER TABLE public.attachments ADD CONSTRAINT attachments_entity_type_check CHECK (entity_type = ANY (ARRAY['hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice','rfq','rfq_response']));
ALTER TABLE public.approval_requests DROP CONSTRAINT approval_requests_entity_type_check;
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_entity_type_check CHECK (entity_type = ANY (ARRAY['hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice','rfq']));

-- ============ QUOTATION INTEGRATION ============
ALTER TABLE public.quotation_items ADD COLUMN rfq_response_id uuid REFERENCES public.rfq_supplier_responses(id);

-- ============ TRIGGER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.tg_rfq_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rfq_no IS NULL OR NEW.rfq_no = '' THEN NEW.rfq_no := public.next_code('rfq'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_item_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'RFQ_ITEM_DATES: check-out must be after check-in';
  END IF;
  NEW.nights := NEW.check_out - NEW.check_in;
  SELECT status INTO v_status FROM public.rfqs WHERE id = NEW.rfq_id;
  IF v_status NOT IN ('draft') THEN
    RAISE EXCEPTION 'RFQ_LOCKED: items can only be modified while the RFQ is in draft';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_is_approver boolean;
  v_items int;
  v_suppliers int;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_is_approver := has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager']::app_role[]);

    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('sent','cancelled')) OR
      (OLD.status = 'sent' AND NEW.status IN ('partial','completed','expired','cancelled')) OR
      (OLD.status = 'partial' AND NEW.status IN ('completed','expired','cancelled')) OR
      (OLD.status = 'completed' AND NEW.status IN ('approved','rejected','expired')) OR
      (OLD.status = 'rejected' AND NEW.status IN ('draft','cancelled'))
    ) THEN
      RAISE EXCEPTION 'RFQ_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
    END IF;

    IF NEW.status = 'sent' THEN
      SELECT count(*) INTO v_items FROM public.rfq_items WHERE rfq_id = NEW.id;
      IF v_items = 0 THEN RAISE EXCEPTION 'RFQ_NO_ITEMS: an RFQ requires at least one item before sending'; END IF;
      SELECT count(*) INTO v_suppliers FROM public.rfq_supplier_requests WHERE rfq_id = NEW.id AND status <> 'cancelled';
      IF v_suppliers = 0 THEN RAISE EXCEPTION 'RFQ_NO_SUPPLIER: an RFQ cannot be sent without at least one supplier'; END IF;
    END IF;

    IF NEW.status IN ('approved','rejected') AND NOT v_is_approver THEN
      RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
    END IF;

    -- approval bridge: approving an RFQ requires at least one approved supplier response
    IF NEW.status = 'approved' THEN
      IF NOT EXISTS (SELECT 1 FROM public.rfq_supplier_responses r WHERE r.rfq_id = NEW.id AND r.status = 'approved') THEN
        RAISE EXCEPTION 'RFQ_NO_APPROVED_RESPONSE: at least one supplier response must be approved first';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_after_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.rfq_status_history(rfq_id, from_status, to_status) VALUES (NEW.id, NULL, NEW.status);
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.rfq_status_history(rfq_id, from_status, to_status) VALUES (NEW.id, OLD.status, NEW.status);
    IF NEW.status = 'sent' THEN
      UPDATE public.rfq_supplier_requests
         SET status = 'sent', sent_at = now()
       WHERE rfq_id = NEW.id AND status = 'pending';
    ELSIF NEW.status IN ('expired','cancelled') THEN
      UPDATE public.rfq_supplier_requests
         SET status = 'cancelled'
       WHERE rfq_id = NEW.id AND status IN ('pending','sent','overdue');
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_response_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_req record;
  v_rfq record;
  v_is_approver boolean;
BEGIN
  SELECT * INTO v_req FROM public.rfq_supplier_requests WHERE id = NEW.request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'RFQ_REQUEST_MISSING: supplier request not found'; END IF;
  NEW.rfq_id := v_req.rfq_id;
  NEW.supplier_id := v_req.supplier_id;

  SELECT * INTO v_rfq FROM public.rfqs WHERE id = NEW.rfq_id;
  IF TG_OP = 'INSERT' THEN
    IF v_rfq.status NOT IN ('sent','partial') THEN
      RAISE EXCEPTION 'RFQ_RESPONSE_CLOSED: responses are only accepted while the RFQ is awaiting responses';
    END IF;
    IF v_req.response_due_date IS NOT NULL AND current_date > v_req.response_due_date THEN
      RAISE EXCEPTION 'RFQ_RESPONSE_OVERDUE: the response deadline has passed';
    END IF;
  END IF;

  IF NEW.availability = 'available' AND NEW.cost_price IS NULL THEN
    RAISE EXCEPTION 'RFQ_RESPONSE_PRICE_REQUIRED: cost price is required when rooms are available';
  END IF;
  IF NEW.currency IS NULL OR btrim(NEW.currency) = '' THEN NEW.currency := v_rfq.currency; END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    v_is_approver := has_any_role(auth.uid(), ARRAY['super_admin','admin','sales_manager','operations_manager']::app_role[]);
    IF NOT v_is_approver THEN
      RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
    END IF;
    IF NEW.status = 'approved' AND NEW.availability <> 'available' THEN
      RAISE EXCEPTION 'RFQ_RESPONSE_NOT_AVAILABLE: only available responses can be approved';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_response_after()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total int; v_responded int;
BEGIN
  UPDATE public.rfq_supplier_requests SET status = 'responded' WHERE id = NEW.request_id AND status IN ('pending','sent','overdue');
  SELECT count(*) INTO v_total FROM public.rfq_supplier_requests WHERE rfq_id = NEW.rfq_id AND status <> 'cancelled';
  SELECT count(*) INTO v_responded FROM public.rfq_supplier_requests WHERE rfq_id = NEW.rfq_id AND status = 'responded';
  IF v_total > 0 AND v_responded >= v_total THEN
    UPDATE public.rfqs SET status = 'completed' WHERE id = NEW.rfq_id AND status IN ('sent','partial');
  ELSIF v_responded > 0 THEN
    UPDATE public.rfqs SET status = 'partial' WHERE id = NEW.rfq_id AND status = 'sent';
  END IF;
  PERFORM public.log_audit('supplier_response', 'rfqs', NEW.rfq_id::text, NULL, to_jsonb(NEW),
    jsonb_build_object('supplier_id', NEW.supplier_id, 'rfq_item_id', NEW.rfq_item_id));
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_rfq_approval_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.entity_type = 'rfq' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'approved' THEN
      UPDATE public.rfqs SET status = 'approved' WHERE id = NEW.entity_id AND status = 'completed';
    ELSIF NEW.status = 'rejected' THEN
      UPDATE public.rfqs SET status = 'rejected' WHERE id = NEW.entity_id AND status = 'completed';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_qitem_rfq_source()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_resp record;
BEGIN
  IF NEW.rfq_response_id IS NOT NULL THEN
    SELECT * INTO v_resp FROM public.rfq_supplier_responses WHERE id = NEW.rfq_response_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'QITEM_RFQ_MISSING: RFQ response not found'; END IF;
    IF v_resp.status <> 'approved' THEN
      RAISE EXCEPTION 'QITEM_RFQ_NOT_APPROVED: quotation items can only be created from approved RFQ responses';
    END IF;
    IF NEW.cost_price IS NULL THEN NEW.cost_price := v_resp.cost_price; END IF;
  END IF;
  RETURN NEW;
END $$;

-- ============ TRIGGERS ============
CREATE TRIGGER trg_rfq_code BEFORE INSERT ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_code();
CREATE TRIGGER trg_rfq_workflow BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_workflow();
CREATE TRIGGER trg_rfq_after_status AFTER INSERT OR UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_after_status();
CREATE TRIGGER trg_rfq_updated BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rfq_audit AFTER INSERT OR UPDATE OR DELETE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_rfq_item_validate BEFORE INSERT OR UPDATE ON public.rfq_items FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_item_validate();
CREATE TRIGGER trg_rfq_item_updated BEFORE UPDATE ON public.rfq_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rfq_item_audit AFTER INSERT OR UPDATE OR DELETE ON public.rfq_items FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_rfq_sreq_updated BEFORE UPDATE ON public.rfq_supplier_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rfq_sreq_audit AFTER INSERT OR UPDATE OR DELETE ON public.rfq_supplier_requests FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_rfq_resp_validate BEFORE INSERT OR UPDATE ON public.rfq_supplier_responses FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_response_validate();
CREATE TRIGGER trg_rfq_resp_after AFTER INSERT ON public.rfq_supplier_responses FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_response_after();
CREATE TRIGGER trg_rfq_resp_updated BEFORE UPDATE ON public.rfq_supplier_responses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rfq_resp_audit AFTER INSERT OR UPDATE OR DELETE ON public.rfq_supplier_responses FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER trg_rfq_approval_sync AFTER UPDATE ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION public.tg_rfq_approval_sync();

CREATE TRIGGER trg_qitem_rfq_source BEFORE INSERT OR UPDATE ON public.quotation_items FOR EACH ROW EXECUTE FUNCTION public.tg_qitem_rfq_source();

-- counter seed for RFQ numbering
INSERT INTO public.counters(key, prefix, current_value, padding) VALUES ('rfq','RFQ',0,5) ON CONFLICT (key) DO NOTHING;