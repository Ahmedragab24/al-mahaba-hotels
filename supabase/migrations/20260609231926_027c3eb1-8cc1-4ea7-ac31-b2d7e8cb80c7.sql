-- ============ FINANCE: INVOICES & RECEIPTS (S15) + SUPPLIER PAYABLES (S16) ============

-- Auto numbers
INSERT INTO public.counters(key, prefix, current_value, padding) VALUES
 ('invoice','INV',0,5), ('receipt','RCT',0,5), ('adjustment','ADJ',0,5),
 ('payable','PYB',0,5), ('payment_order','PO',0,5), ('supplier_payment','SPY',0,5)
ON CONFLICT (key) DO NOTHING;

-- Base currency setting
INSERT INTO public.system_settings(key, value, description)
VALUES ('finance.base_currency', '"SAR"'::jsonb, 'Base currency for financial reporting')
ON CONFLICT (key) DO NOTHING;

-- ============ EXCHANGE RATES ============
CREATE TABLE public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency text NOT NULL,
  rate numeric(14,6) NOT NULL CHECK (rate > 0),
  rate_date date NOT NULL DEFAULT current_date,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (currency, rate_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_rates TO authenticated;
GRANT ALL ON public.exchange_rates TO service_role;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY fx_read ON public.exchange_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY fx_write ON public.exchange_rates FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));
CREATE TRIGGER fx_updated BEFORE UPDATE ON public.exchange_rates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ INVOICES ============
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text UNIQUE,
  booking_id uuid REFERENCES public.bookings(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','sent','partially_paid','paid','cancelled')),
  invoice_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL DEFAULT current_date,
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  subtotal numeric(14,2) NOT NULL DEFAULT 0,
  taxes numeric(14,2) NOT NULL DEFAULT 0,
  fees numeric(14,2) NOT NULL DEFAULT 0,
  discount numeric(14,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  cancellation_reason text,
  issued_by uuid, issued_at timestamptz,
  cancelled_by uuid, cancelled_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_invoice_active_booking ON public.invoices(booking_id) WHERE booking_id IS NOT NULL AND status <> 'cancelled' AND deleted_at IS NULL;
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY inv_read ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY inv_write ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));
CREATE POLICY inv_update ON public.invoices FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));
CREATE POLICY inv_delete ON public.invoices FOR DELETE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin']::app_role[]));

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  booking_room_id uuid REFERENCES public.booking_rooms(id),
  description_en text NOT NULL CHECK (btrim(description_en) <> ''),
  description_ar text,
  quantity numeric(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  taxes numeric(12,2) NOT NULL DEFAULT 0 CHECK (taxes >= 0),
  fees numeric(12,2) NOT NULL DEFAULT 0 CHECK (fees >= 0),
  line_total numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY invi_read ON public.invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY invi_write ON public.invoice_items FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

CREATE TABLE public.invoice_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  changed_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_history ON public.invoice_status_history(invoice_id);
GRANT SELECT, INSERT ON public.invoice_status_history TO authenticated;
GRANT ALL ON public.invoice_status_history TO service_role;
ALTER TABLE public.invoice_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY invh_read ON public.invoice_status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY invh_insert ON public.invoice_status_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============ RECEIPTS ============
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  receipt_date date NOT NULL DEFAULT current_date,
  payment_method text NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('cash','bank_transfer','cheque','card','online')),
  reference_no text,
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  allocated_amount numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  cancellation_reason text,
  cancelled_by uuid, cancelled_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_receipts_customer ON public.receipts(customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY rct_read ON public.receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY rct_write ON public.receipts FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

CREATE TABLE public.receipt_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_receipt_alloc_receipt ON public.receipt_allocations(receipt_id);
CREATE INDEX idx_receipt_alloc_invoice ON public.receipt_allocations(invoice_id);
GRANT SELECT, INSERT, DELETE ON public.receipt_allocations TO authenticated;
GRANT ALL ON public.receipt_allocations TO service_role;
ALTER TABLE public.receipt_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rcta_read ON public.receipt_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY rcta_write ON public.receipt_allocations FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

-- ============ CUSTOMER ADJUSTMENTS ============
CREATE TABLE public.customer_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_no text UNIQUE,
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('credit','debit')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  reason text NOT NULL CHECK (btrim(reason) <> ''),
  invoice_id uuid REFERENCES public.invoices(id),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cadj_customer ON public.customer_adjustments(customer_id);
GRANT SELECT, INSERT ON public.customer_adjustments TO authenticated;
GRANT ALL ON public.customer_adjustments TO service_role;
ALTER TABLE public.customer_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY cadj_read ON public.customer_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY cadj_insert ON public.customer_adjustments FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager']::app_role[]));

-- ============ SUPPLIER PAYABLES ============
CREATE TABLE public.supplier_payables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payable_no text UNIQUE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  booking_id uuid REFERENCES public.bookings(id),
  booking_room_id uuid UNIQUE REFERENCES public.booking_rooms(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partially_paid','paid','cancelled')),
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  due_date date,
  notes text,
  cancellation_reason text,
  created_by uuid DEFAULT auth.uid(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payables_supplier ON public.supplier_payables(supplier_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_payables TO authenticated;
GRANT ALL ON public.supplier_payables TO service_role;
ALTER TABLE public.supplier_payables ENABLE ROW LEVEL SECURITY;
CREATE POLICY pyb_read ON public.supplier_payables FOR SELECT TO authenticated USING (true);
CREATE POLICY pyb_write ON public.supplier_payables FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

-- ============ PAYMENT ORDERS ============
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text UNIQUE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','rejected','paid','cancelled')),
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  rejection_reason text,
  requested_by uuid DEFAULT auth.uid(),
  approved_by uuid, approved_at timestamptz,
  rejected_by uuid, rejected_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_porders_supplier ON public.payment_orders(supplier_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_orders TO authenticated;
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY po_read ON public.payment_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY po_write ON public.payment_orders FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

CREATE TABLE public.payment_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  payable_id uuid NOT NULL REFERENCES public.supplier_payables(id),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, payable_id)
);
CREATE INDEX idx_po_items_order ON public.payment_order_items(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_order_items TO authenticated;
GRANT ALL ON public.payment_order_items TO service_role;
ALTER TABLE public.payment_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY poi_read ON public.payment_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY poi_write ON public.payment_order_items FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

-- ============ SUPPLIER PAYMENTS ============
CREATE TABLE public.supplier_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_no text UNIQUE,
  payment_order_id uuid NOT NULL REFERENCES public.payment_orders(id),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  payment_date date NOT NULL DEFAULT current_date,
  payment_method text NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('cash','bank_transfer','cheque','card','online')),
  reference_no text,
  currency text NOT NULL DEFAULT 'SAR',
  exchange_rate numeric(14,6) NOT NULL DEFAULT 1 CHECK (exchange_rate > 0),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  notes text,
  cancellation_reason text,
  cancelled_by uuid, cancelled_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_spayments_order ON public.supplier_payments(payment_order_id);
GRANT SELECT, INSERT, UPDATE ON public.supplier_payments TO authenticated;
GRANT ALL ON public.supplier_payments TO service_role;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY spy_read ON public.supplier_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY spy_write ON public.supplier_payments FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

CREATE TABLE public.payment_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.supplier_payments(id) ON DELETE CASCADE,
  payable_id uuid NOT NULL REFERENCES public.supplier_payables(id),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_alloc_payment ON public.payment_allocations(payment_id);
CREATE INDEX idx_pay_alloc_payable ON public.payment_allocations(payable_id);
GRANT SELECT, INSERT, DELETE ON public.payment_allocations TO authenticated;
GRANT ALL ON public.payment_allocations TO service_role;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY pala_read ON public.payment_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY pala_write ON public.payment_allocations FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]));

-- ============ ATTACHMENT ENGINE SUPPORT ============
ALTER TABLE public.attachments DROP CONSTRAINT attachments_entity_type_check;
ALTER TABLE public.attachments ADD CONSTRAINT attachments_entity_type_check
  CHECK (entity_type IN ('hotel','supplier','customer','contract','rate','season','tax','quotation','reservation','invoice','rfq','rfq_response','booking','receipt','payable','payment_order','supplier_payment'));

-- ============ TRIGGER FUNCTIONS ============

-- Auto numbers (BR-INV-001 / BR-PAY-001)
CREATE OR REPLACE FUNCTION public.tg_invoice_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.invoice_no IS NULL OR NEW.invoice_no='' THEN NEW.invoice_no := public.next_code('invoice'); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.tg_receipt_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.receipt_no IS NULL OR NEW.receipt_no='' THEN NEW.receipt_no := public.next_code('receipt'); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.tg_adjustment_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.adjustment_no IS NULL OR NEW.adjustment_no='' THEN NEW.adjustment_no := public.next_code('adjustment'); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.tg_payable_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.payable_no IS NULL OR NEW.payable_no='' THEN NEW.payable_no := public.next_code('payable'); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.tg_porder_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.order_no IS NULL OR NEW.order_no='' THEN NEW.order_no := public.next_code('payment_order'); END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION public.tg_spayment_code() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.payment_no IS NULL OR NEW.payment_no='' THEN NEW.payment_no := public.next_code('supplier_payment'); END IF; RETURN NEW; END $$;

-- BR-INV-002..008: invoice validation + workflow
CREATE OR REPLACE FUNCTION public.tg_invoice_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bstatus text; v_items int;
BEGIN
  IF NEW.due_date < NEW.invoice_date THEN
    RAISE EXCEPTION 'INV_DUE_DATE: due date cannot be before the invoice date';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.booking_id IS NOT NULL THEN
    SELECT status INTO v_bstatus FROM public.bookings WHERE id = NEW.booking_id AND deleted_at IS NULL;
    IF v_bstatus IS NULL THEN RAISE EXCEPTION 'INV_BOOKING_MISSING: booking not found'; END IF;
    IF v_bstatus NOT IN ('confirmed','checked_in','checked_out') THEN
      RAISE EXCEPTION 'INV_BOOKING_NOT_CONFIRMED: invoices can only be created for confirmed bookings';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.invoice_no IS DISTINCT FROM OLD.invoice_no THEN
      RAISE EXCEPTION 'INV_NO_IMMUTABLE: invoice number cannot be changed';
    END IF;
    IF NEW.paid_amount IS DISTINCT FROM OLD.paid_amount AND current_setting('app.allow_paid_update', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'INV_PAID_PROTECTED: paid amount is maintained by receipt allocations';
    END IF;
    -- header lock after leaving draft
    IF OLD.status <> 'draft' AND NEW.status = OLD.status AND NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at THEN
      IF NEW.customer_id <> OLD.customer_id OR NEW.currency <> OLD.currency
         OR NEW.invoice_date <> OLD.invoice_date OR NEW.due_date <> OLD.due_date
         OR NEW.discount <> OLD.discount OR NEW.booking_id IS DISTINCT FROM OLD.booking_id THEN
        RAISE EXCEPTION 'INV_LOCKED_EDIT: invoice details can only be edited while draft';
      END IF;
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (
        (OLD.status = 'draft' AND NEW.status IN ('issued','cancelled')) OR
        (OLD.status = 'issued' AND NEW.status IN ('sent','partially_paid','paid','cancelled')) OR
        (OLD.status = 'sent' AND NEW.status IN ('partially_paid','paid','cancelled')) OR
        (OLD.status = 'partially_paid' AND NEW.status IN ('paid','sent')) OR
        (OLD.status = 'paid' AND NEW.status IN ('partially_paid'))
      ) THEN
        RAISE EXCEPTION 'INV_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
      END IF;
      IF NEW.status = 'issued' THEN
        SELECT count(*) INTO v_items FROM public.invoice_items WHERE invoice_id = NEW.id;
        IF v_items = 0 THEN RAISE EXCEPTION 'INV_NO_ITEMS: an invoice requires at least one item before issuing'; END IF;
        NEW.issued_by := auth.uid(); NEW.issued_at := now();
      END IF;
      IF NEW.status = 'cancelled' THEN
        IF OLD.paid_amount > 0 THEN RAISE EXCEPTION 'INV_CANCEL_PAID: invoices with recorded payments cannot be cancelled'; END IF;
        IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
          RAISE EXCEPTION 'INV_CANCEL_REASON: a cancellation reason is required';
        END IF;
        IF OLD.status <> 'draft' AND NOT has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager']::app_role[]) THEN
          RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
        END IF;
        NEW.cancelled_by := auth.uid(); NEW.cancelled_at := now();
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_invoice_after_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.invoice_status_history(invoice_id, from_status, to_status) VALUES (NEW.id, NULL, NEW.status);
    PERFORM public.log_audit('create','invoices', NEW.id::text, NULL, to_jsonb(NEW), jsonb_build_object('invoice_no', NEW.invoice_no));
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.invoice_status_history(invoice_id, from_status, to_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, CASE WHEN NEW.status='cancelled' THEN NEW.cancellation_reason ELSE NULL END);
    v_action := CASE NEW.status WHEN 'issued' THEN 'issue' WHEN 'sent' THEN 'send'
      WHEN 'partially_paid' THEN 'partial_payment' WHEN 'paid' THEN 'pay' WHEN 'cancelled' THEN 'cancel' ELSE 'update' END;
    PERFORM public.log_audit(v_action,'invoices', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), jsonb_build_object('invoice_no', NEW.invoice_no));
  ELSIF to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
    PERFORM public.log_audit('update','invoices', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), jsonb_build_object('invoice_no', NEW.invoice_no));
  END IF;
  RETURN NEW;
END $$;

-- BR-INV-005/006: items locked after issue + totals auto-calc
CREATE OR REPLACE FUNCTION public.tg_invoice_item_calc()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  IF v_status IS NULL THEN RAISE EXCEPTION 'INV_MISSING: invoice not found'; END IF;
  IF v_status <> 'draft' THEN
    RAISE EXCEPTION 'INV_ITEMS_LOCKED: items can only be modified while the invoice is draft';
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    NEW.line_total := round(NEW.quantity * NEW.unit_price + NEW.taxes + NEW.fees, 2);
    RETURN NEW;
  END IF;
  RETURN OLD;
END $$;

CREATE OR REPLACE FUNCTION public.tg_invoice_item_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  v_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  UPDATE public.invoices i SET
    subtotal = s.sub, taxes = s.tax, fees = s.fee,
    total_amount = greatest(round(s.sub + s.tax + s.fee - i.discount, 2), 0)
  FROM (
    SELECT COALESCE(sum(round(quantity*unit_price,2)),0) sub, COALESCE(sum(taxes),0) tax, COALESCE(sum(fees),0) fee
    FROM public.invoice_items WHERE invoice_id = v_id
  ) s WHERE i.id = v_id;
  RETURN COALESCE(NEW, OLD);
END $$;

-- BR-INV-007/009: receipt allocation engine
CREATE OR REPLACE FUNCTION public.tg_receipt_alloc_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; inv record; v_alloc numeric;
BEGIN
  SELECT * INTO r FROM public.receipts WHERE id = NEW.receipt_id;
  IF r.status <> 'confirmed' THEN RAISE EXCEPTION 'RCT_NOT_CONFIRMED: only confirmed receipts can be allocated'; END IF;
  SELECT * INTO inv FROM public.invoices WHERE id = NEW.invoice_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'INV_MISSING: invoice not found'; END IF;
  IF inv.status NOT IN ('issued','sent','partially_paid') THEN
    RAISE EXCEPTION 'RCT_INVOICE_STATUS: allocations are only allowed on issued, sent or partially paid invoices';
  END IF;
  IF inv.currency <> r.currency THEN RAISE EXCEPTION 'RCT_CURRENCY_MISMATCH: receipt and invoice currencies must match'; END IF;
  IF inv.customer_id <> r.customer_id THEN RAISE EXCEPTION 'RCT_CUSTOMER_MISMATCH: receipt and invoice belong to different customers'; END IF;
  SELECT COALESCE(sum(amount),0) INTO v_alloc FROM public.receipt_allocations WHERE receipt_id = NEW.receipt_id;
  IF v_alloc + NEW.amount > r.amount THEN
    RAISE EXCEPTION 'RCT_OVER_ALLOCATED: allocation exceeds the unallocated receipt amount';
  END IF;
  IF inv.paid_amount + NEW.amount > inv.total_amount THEN
    RAISE EXCEPTION 'RCT_EXCEEDS_BALANCE: allocation exceeds the invoice balance due';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_receipt_alloc_apply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_receipt uuid; v_invoice uuid; v_paid numeric; v_total numeric; v_status text;
BEGIN
  v_receipt := COALESCE(NEW.receipt_id, OLD.receipt_id);
  v_invoice := COALESCE(NEW.invoice_id, OLD.invoice_id);
  UPDATE public.receipts SET allocated_amount = (SELECT COALESCE(sum(amount),0) FROM public.receipt_allocations WHERE receipt_id = v_receipt) WHERE id = v_receipt;
  SELECT COALESCE(sum(a.amount),0) INTO v_paid FROM public.receipt_allocations a WHERE a.invoice_id = v_invoice;
  SELECT total_amount, status INTO v_total, v_status FROM public.invoices WHERE id = v_invoice;
  PERFORM set_config('app.allow_paid_update','on', true);
  UPDATE public.invoices SET paid_amount = v_paid,
    status = CASE WHEN v_paid >= total_amount AND total_amount > 0 THEN 'paid'
                  WHEN v_paid > 0 THEN 'partially_paid'
                  WHEN status IN ('partially_paid','paid') THEN 'sent'
                  ELSE status END
   WHERE id = v_invoice;
  PERFORM set_config('app.allow_paid_update','off', true);
  PERFORM public.log_audit(CASE WHEN TG_OP='DELETE' THEN 'unallocate' ELSE 'allocate' END,'receipts', v_receipt::text,
    NULL, to_jsonb(COALESCE(NEW, OLD)), jsonb_build_object('invoice_id', v_invoice));
  RETURN COALESCE(NEW, OLD);
END $$;

-- Receipt rules: locked when cancelled, cancel requires reason + no allocations
CREATE OR REPLACE FUNCTION public.tg_receipt_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.receipt_no IS DISTINCT FROM OLD.receipt_no THEN
      RAISE EXCEPTION 'RCT_NO_IMMUTABLE: receipt number cannot be changed';
    END IF;
    IF OLD.status = 'cancelled' AND to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
      RAISE EXCEPTION 'RCT_LOCKED: cancelled receipts cannot be edited';
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
      IF OLD.allocated_amount > 0 THEN
        RAISE EXCEPTION 'RCT_CANCEL_ALLOCATED: remove allocations before cancelling the receipt';
      END IF;
      IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
        RAISE EXCEPTION 'RCT_CANCEL_REASON: a cancellation reason is required';
      END IF;
      NEW.cancelled_by := auth.uid(); NEW.cancelled_at := now();
    END IF;
    IF NEW.amount IS DISTINCT FROM OLD.amount AND OLD.allocated_amount > 0 AND NEW.amount < OLD.allocated_amount THEN
      RAISE EXCEPTION 'RCT_AMOUNT_BELOW_ALLOCATED: amount cannot be lower than the allocated total';
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- BR-PAY: payable validation
CREATE OR REPLACE FUNCTION public.tg_payable_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.payable_no IS DISTINCT FROM OLD.payable_no THEN
      RAISE EXCEPTION 'PYB_NO_IMMUTABLE: payable number cannot be changed';
    END IF;
    IF NEW.paid_amount IS DISTINCT FROM OLD.paid_amount AND current_setting('app.allow_paid_update', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'PYB_PAID_PROTECTED: paid amount is maintained by payment allocations';
    END IF;
    IF OLD.status = 'paid' AND NEW.status = OLD.status AND to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD)
       AND current_setting('app.allow_paid_update', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'PYB_LOCKED: paid payables cannot be edited';
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
      IF OLD.paid_amount > 0 THEN RAISE EXCEPTION 'PYB_CANCEL_PAID: payables with recorded payments cannot be cancelled'; END IF;
      IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
        RAISE EXCEPTION 'PYB_CANCEL_REASON: a cancellation reason is required';
      END IF;
    END IF;
    IF NEW.amount < OLD.paid_amount THEN
      RAISE EXCEPTION 'PYB_AMOUNT_BELOW_PAID: amount cannot be lower than the paid total';
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- BR-PAY: payment order workflow (approval required)
CREATE OR REPLACE FUNCTION public.tg_porder_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_items int; v_is_approver boolean;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    v_is_approver := has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager']::app_role[]);
    IF NOT (
      (OLD.status = 'draft' AND NEW.status IN ('pending_approval','cancelled')) OR
      (OLD.status = 'pending_approval' AND NEW.status IN ('approved','rejected','draft')) OR
      (OLD.status = 'approved' AND NEW.status IN ('paid','cancelled')) OR
      (OLD.status = 'rejected' AND NEW.status IN ('draft','cancelled'))
    ) THEN
      RAISE EXCEPTION 'PO_INVALID_TRANSITION: cannot move from % to %', OLD.status, NEW.status;
    END IF;
    SELECT count(*) INTO v_items FROM public.payment_order_items WHERE order_id = NEW.id;
    IF NEW.status = 'pending_approval' AND v_items = 0 THEN
      RAISE EXCEPTION 'PO_NO_ITEMS: a payment order requires at least one payable';
    END IF;
    IF NEW.status IN ('approved','rejected') AND NOT v_is_approver THEN
      RAISE EXCEPTION 'APPROVAL_FORBIDDEN: only managers or admins can perform this action';
    END IF;
    IF NEW.status = 'approved' THEN NEW.approved_by := auth.uid(); NEW.approved_at := now(); END IF;
    IF NEW.status = 'rejected' THEN
      IF NEW.rejection_reason IS NULL OR btrim(NEW.rejection_reason) = '' THEN
        RAISE EXCEPTION 'PO_REJECT_REASON: a rejection reason is required';
      END IF;
      NEW.rejected_by := auth.uid(); NEW.rejected_at := now();
    END IF;
    IF NEW.status = 'paid' AND current_setting('app.allow_paid_update', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'PO_PAID_PROTECTED: orders are marked paid automatically when payments cover the total';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status NOT IN ('draft','rejected') AND NEW.status = OLD.status
     AND current_setting('app.allow_paid_update', true) IS DISTINCT FROM 'on' THEN
    IF NEW.supplier_id <> OLD.supplier_id OR NEW.currency <> OLD.currency OR NEW.total_amount <> OLD.total_amount THEN
      RAISE EXCEPTION 'PO_LOCKED_EDIT: order details can only be edited while draft or rejected';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_porder_after()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_action text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('create','payment_orders', NEW.id::text, NULL, to_jsonb(NEW), jsonb_build_object('order_no', NEW.order_no));
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_action := CASE NEW.status WHEN 'pending_approval' THEN 'submit' WHEN 'approved' THEN 'approve'
      WHEN 'rejected' THEN 'reject' WHEN 'paid' THEN 'pay' WHEN 'cancelled' THEN 'cancel' ELSE 'update' END;
    PERFORM public.log_audit(v_action,'payment_orders', NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), jsonb_build_object('order_no', NEW.order_no));
  END IF;
  RETURN NEW;
END $$;

-- order items: supplier/currency/balance checks + totals
CREATE OR REPLACE FUNCTION public.tg_porder_item_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o record; p record; v_committed numeric;
BEGIN
  SELECT * INTO o FROM public.payment_orders WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  IF o.status <> 'draft' THEN
    RAISE EXCEPTION 'PO_ITEMS_LOCKED: order items can only be modified while the order is draft';
  END IF;
  IF TG_OP IN ('INSERT','UPDATE') THEN
    SELECT * INTO p FROM public.supplier_payables WHERE id = NEW.payable_id AND deleted_at IS NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'PYB_MISSING: payable not found'; END IF;
    IF p.status IN ('paid','cancelled') THEN RAISE EXCEPTION 'PO_PAYABLE_CLOSED: this payable is already paid or cancelled'; END IF;
    IF p.supplier_id <> o.supplier_id THEN RAISE EXCEPTION 'PO_SUPPLIER_MISMATCH: payable belongs to a different supplier'; END IF;
    IF p.currency <> o.currency THEN RAISE EXCEPTION 'PO_CURRENCY_MISMATCH: payable and order currencies must match'; END IF;
    SELECT COALESCE(sum(i.amount),0) INTO v_committed
      FROM public.payment_order_items i
      JOIN public.payment_orders po ON po.id = i.order_id
     WHERE i.payable_id = NEW.payable_id AND i.id IS DISTINCT FROM NEW.id
       AND po.status IN ('draft','pending_approval','approved');
    IF v_committed + NEW.amount > p.amount - p.paid_amount THEN
      RAISE EXCEPTION 'PO_EXCEEDS_BALANCE: amount exceeds the remaining payable balance';
    END IF;
    RETURN NEW;
  END IF;
  RETURN OLD;
END $$;

CREATE OR REPLACE FUNCTION public.tg_porder_item_totals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  v_id := COALESCE(NEW.order_id, OLD.order_id);
  PERFORM set_config('app.allow_paid_update','on', true);
  UPDATE public.payment_orders SET total_amount = (SELECT COALESCE(sum(amount),0) FROM public.payment_order_items WHERE order_id = v_id) WHERE id = v_id;
  PERFORM set_config('app.allow_paid_update','off', true);
  RETURN COALESCE(NEW, OLD);
END $$;

-- BR-PAY: payments only on approved orders; cannot exceed order total
CREATE OR REPLACE FUNCTION public.tg_spayment_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o record; v_paid numeric;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT * INTO o FROM public.payment_orders WHERE id = NEW.payment_order_id AND deleted_at IS NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'PO_MISSING: payment order not found'; END IF;
    IF o.status NOT IN ('approved','paid') THEN
      RAISE EXCEPTION 'SPAY_ORDER_NOT_APPROVED: payments can only be recorded against approved payment orders';
    END IF;
    NEW.supplier_id := o.supplier_id;
    IF NEW.currency <> o.currency THEN RAISE EXCEPTION 'SPAY_CURRENCY_MISMATCH: payment and order currencies must match'; END IF;
    SELECT COALESCE(sum(amount),0) INTO v_paid FROM public.supplier_payments WHERE payment_order_id = NEW.payment_order_id AND status = 'confirmed';
    IF v_paid + NEW.amount > o.total_amount THEN
      RAISE EXCEPTION 'SPAY_EXCEEDS_ORDER: total payments cannot exceed the order total';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.payment_no IS DISTINCT FROM OLD.payment_no THEN
      RAISE EXCEPTION 'SPAY_NO_IMMUTABLE: payment number cannot be changed';
    END IF;
    IF OLD.status = 'cancelled' AND to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
      RAISE EXCEPTION 'SPAY_LOCKED: cancelled payments cannot be edited';
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
      IF EXISTS (SELECT 1 FROM public.payment_allocations WHERE payment_id = NEW.id) THEN
        RAISE EXCEPTION 'SPAY_CANCEL_ALLOCATED: remove allocations before cancelling the payment';
      END IF;
      IF NEW.cancellation_reason IS NULL OR btrim(NEW.cancellation_reason) = '' THEN
        RAISE EXCEPTION 'SPAY_CANCEL_REASON: a cancellation reason is required';
      END IF;
      NEW.cancelled_by := auth.uid(); NEW.cancelled_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- payment allocations: validate + apply to payables and orders
CREATE OR REPLACE FUNCTION public.tg_pay_alloc_validate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pay record; p record; v_alloc numeric;
BEGIN
  SELECT * INTO pay FROM public.supplier_payments WHERE id = NEW.payment_id;
  IF pay.status <> 'confirmed' THEN RAISE EXCEPTION 'SPAY_NOT_CONFIRMED: only confirmed payments can be allocated'; END IF;
  SELECT * INTO p FROM public.supplier_payables WHERE id = NEW.payable_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'PYB_MISSING: payable not found'; END IF;
  IF p.supplier_id <> pay.supplier_id THEN RAISE EXCEPTION 'PO_SUPPLIER_MISMATCH: payable belongs to a different supplier'; END IF;
  IF p.currency <> pay.currency THEN RAISE EXCEPTION 'PO_CURRENCY_MISMATCH: payable and payment currencies must match'; END IF;
  SELECT COALESCE(sum(amount),0) INTO v_alloc FROM public.payment_allocations WHERE payment_id = NEW.payment_id;
  IF v_alloc + NEW.amount > pay.amount THEN
    RAISE EXCEPTION 'SPAY_OVER_ALLOCATED: allocation exceeds the unallocated payment amount';
  END IF;
  IF p.paid_amount + NEW.amount > p.amount THEN
    RAISE EXCEPTION 'PYB_EXCEEDS_BALANCE: allocation exceeds the payable balance';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_pay_alloc_apply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_payable uuid; v_payment uuid; v_paid numeric; v_order uuid; v_order_paid numeric; v_total numeric;
BEGIN
  v_payable := COALESCE(NEW.payable_id, OLD.payable_id);
  v_payment := COALESCE(NEW.payment_id, OLD.payment_id);
  SELECT COALESCE(sum(amount),0) INTO v_paid FROM public.payment_allocations WHERE payable_id = v_payable;
  PERFORM set_config('app.allow_paid_update','on', true);
  UPDATE public.supplier_payables SET paid_amount = v_paid,
    status = CASE WHEN v_paid >= amount THEN 'paid' WHEN v_paid > 0 THEN 'partially_paid' ELSE 'pending' END
   WHERE id = v_payable;
  -- order paid status
  SELECT payment_order_id INTO v_order FROM public.supplier_payments WHERE id = v_payment;
  SELECT COALESCE(sum(amount),0), (SELECT total_amount FROM public.payment_orders WHERE id = v_order)
    INTO v_order_paid, v_total FROM public.supplier_payments WHERE payment_order_id = v_order AND status = 'confirmed';
  IF v_order_paid >= v_total AND v_total > 0 THEN
    UPDATE public.payment_orders SET status = 'paid' WHERE id = v_order AND status = 'approved';
  END IF;
  PERFORM set_config('app.allow_paid_update','off', true);
  PERFORM public.log_audit(CASE WHEN TG_OP='DELETE' THEN 'unallocate' ELSE 'allocate' END,'supplier_payments', v_payment::text,
    NULL, to_jsonb(COALESCE(NEW, OLD)), jsonb_build_object('payable_id', v_payable));
  RETURN COALESCE(NEW, OLD);
END $$;

-- ============ CONVERSION HELPERS ============

-- Create invoice from a confirmed booking (BR-INV-002)
CREATE OR REPLACE FUNCTION public.create_invoice_from_booking(_booking_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; v_invoice uuid; r record;
BEGIN
  IF NOT has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]) THEN
    RAISE EXCEPTION 'APPROVAL_FORBIDDEN: you do not have permission to create invoices';
  END IF;
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'INV_BOOKING_MISSING: booking not found'; END IF;
  IF b.status NOT IN ('confirmed','checked_in','checked_out') THEN
    RAISE EXCEPTION 'INV_BOOKING_NOT_CONFIRMED: invoices can only be created for confirmed bookings';
  END IF;
  IF EXISTS (SELECT 1 FROM public.invoices WHERE booking_id = _booking_id AND status <> 'cancelled' AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'INV_BOOKING_ALREADY_INVOICED: this booking already has an active invoice';
  END IF;
  INSERT INTO public.invoices(booking_id, customer_id, currency, due_date, created_by)
  VALUES (_booking_id, b.customer_id, b.currency, current_date + 14, auth.uid())
  RETURNING id INTO v_invoice;
  FOR r IN
    SELECT br.*, h.name_en hname_en, h.name_ar hname_ar, rt.name_en rtname_en, rt.name_ar rtname_ar
      FROM public.booking_rooms br
      JOIN public.hotels h ON h.id = br.hotel_id
      LEFT JOIN public.hotel_room_types rt ON rt.id = br.room_type_id
     WHERE br.booking_id = _booking_id
  LOOP
    INSERT INTO public.invoice_items(invoice_id, booking_room_id, description_en, description_ar, quantity, unit_price, taxes, fees)
    VALUES (v_invoice, r.id,
      r.hname_en || COALESCE(' — ' || r.rtname_en, '') || ' (' || r.occupancy_type || ') ' || r.check_in || ' → ' || r.check_out,
      COALESCE(r.hname_ar, r.hname_en) || COALESCE(' — ' || COALESCE(r.rtname_ar, r.rtname_en), '') || ' (' || r.occupancy_type || ') ' || r.check_in || ' → ' || r.check_out,
      r.nights * r.rooms, r.selling_price, r.taxes, r.fees);
  END LOOP;
  PERFORM public.log_audit('convert','invoices', v_invoice::text, NULL, NULL, jsonb_build_object('booking_id', _booking_id, 'booking_no', b.booking_no));
  RETURN v_invoice;
END $$;

-- Create supplier payables from a confirmed booking (BR-PAY-002)
CREATE OR REPLACE FUNCTION public.create_payables_from_booking(_booking_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; r record; v_count int := 0;
BEGIN
  IF NOT has_any_role(auth.uid(), ARRAY['super_admin','admin','finance_manager','finance_agent']::app_role[]) THEN
    RAISE EXCEPTION 'APPROVAL_FORBIDDEN: you do not have permission to create payables';
  END IF;
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'INV_BOOKING_MISSING: booking not found'; END IF;
  IF b.status NOT IN ('confirmed','checked_in','checked_out') THEN
    RAISE EXCEPTION 'PYB_BOOKING_NOT_CONFIRMED: payables can only be created for confirmed bookings';
  END IF;
  FOR r IN
    SELECT br.* FROM public.booking_rooms br
     WHERE br.booking_id = _booking_id AND br.supplier_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.supplier_payables sp WHERE sp.booking_room_id = br.id)
  LOOP
    INSERT INTO public.supplier_payables(supplier_id, booking_id, booking_room_id, currency, amount, due_date, created_by)
    VALUES (r.supplier_id, _booking_id, r.id, b.currency, r.total_cost, r.check_in, auth.uid());
    v_count := v_count + 1;
  END LOOP;
  IF v_count = 0 THEN
    RAISE EXCEPTION 'PYB_NOTHING_TO_CREATE: all rooms already have payables or no supplier is set';
  END IF;
  PERFORM public.log_audit('convert','supplier_payables', _booking_id::text, NULL, NULL, jsonb_build_object('booking_no', b.booking_no, 'count', v_count));
  RETURN v_count;
END $$;

-- ============ TRIGGERS ============
CREATE TRIGGER inv_code BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.tg_invoice_code();
CREATE TRIGGER inv_validate BEFORE INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.tg_invoice_validate();
CREATE TRIGGER inv_after AFTER INSERT OR UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.tg_invoice_after_status();
CREATE TRIGGER inv_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER invi_calc BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.tg_invoice_item_calc();
CREATE TRIGGER invi_totals AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.tg_invoice_item_totals();
CREATE TRIGGER invi_updated BEFORE UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER rct_code BEFORE INSERT ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.tg_receipt_code();
CREATE TRIGGER rct_validate BEFORE INSERT OR UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.tg_receipt_validate();
CREATE TRIGGER rct_audit AFTER INSERT OR UPDATE OR DELETE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE TRIGGER rct_updated BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER rcta_validate BEFORE INSERT ON public.receipt_allocations FOR EACH ROW EXECUTE FUNCTION public.tg_receipt_alloc_validate();
CREATE TRIGGER rcta_apply AFTER INSERT OR DELETE ON public.receipt_allocations FOR EACH ROW EXECUTE FUNCTION public.tg_receipt_alloc_apply();

CREATE TRIGGER cadj_code BEFORE INSERT ON public.customer_adjustments FOR EACH ROW EXECUTE FUNCTION public.tg_adjustment_code();
CREATE TRIGGER cadj_audit AFTER INSERT ON public.customer_adjustments FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE TRIGGER pyb_code BEFORE INSERT ON public.supplier_payables FOR EACH ROW EXECUTE FUNCTION public.tg_payable_code();
CREATE TRIGGER pyb_validate BEFORE INSERT OR UPDATE ON public.supplier_payables FOR EACH ROW EXECUTE FUNCTION public.tg_payable_validate();
CREATE TRIGGER pyb_audit AFTER INSERT OR UPDATE OR DELETE ON public.supplier_payables FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE TRIGGER pyb_updated BEFORE UPDATE ON public.supplier_payables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER po_code BEFORE INSERT ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION public.tg_porder_code();
CREATE TRIGGER po_workflow BEFORE INSERT OR UPDATE ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION public.tg_porder_workflow();
CREATE TRIGGER po_after AFTER INSERT OR UPDATE ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION public.tg_porder_after();
CREATE TRIGGER po_updated BEFORE UPDATE ON public.payment_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER poi_validate BEFORE INSERT OR UPDATE OR DELETE ON public.payment_order_items FOR EACH ROW EXECUTE FUNCTION public.tg_porder_item_validate();
CREATE TRIGGER poi_totals AFTER INSERT OR UPDATE OR DELETE ON public.payment_order_items FOR EACH ROW EXECUTE FUNCTION public.tg_porder_item_totals();

CREATE TRIGGER spy_code BEFORE INSERT ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION public.tg_spayment_code();
CREATE TRIGGER spy_validate BEFORE INSERT OR UPDATE ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION public.tg_spayment_validate();
CREATE TRIGGER spy_audit AFTER INSERT OR UPDATE ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE TRIGGER spy_updated BEFORE UPDATE ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER pala_validate BEFORE INSERT ON public.payment_allocations FOR EACH ROW EXECUTE FUNCTION public.tg_pay_alloc_validate();
CREATE TRIGGER pala_apply AFTER INSERT OR DELETE ON public.payment_allocations FOR EACH ROW EXECUTE FUNCTION public.tg_pay_alloc_apply();