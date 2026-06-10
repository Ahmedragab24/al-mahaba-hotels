-- ============ 1) PERFORMANCE: missing indexes on foreign keys ============
CREATE INDEX IF NOT EXISTS idx_booking_rooms_hotel ON public.booking_rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_rate ON public.booking_rooms(rate_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_type ON public.booking_rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_supplier ON public.booking_rooms(supplier_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_qitem ON public.booking_rooms(quotation_item_id);
CREATE INDEX IF NOT EXISTS idx_booking_guests_room ON public.booking_guests(booking_room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_hotel ON public.quotation_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_rate ON public.quotation_items(rate_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_room_type ON public.quotation_items(room_type_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_rfq_resp ON public.quotation_items(rfq_response_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_customer ON public.rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_hotel ON public.rfq_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_room_type ON public.rfq_items(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sup_requests_supplier ON public.rfq_supplier_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rfq_sup_responses_supplier ON public.rfq_supplier_responses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_booking_room ON public.invoice_items(booking_room_id);
CREATE INDEX IF NOT EXISTS idx_customer_adjustments_invoice ON public.customer_adjustments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payables_booking ON public.supplier_payables(booking_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier ON public.supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_porder_items_payable ON public.payment_order_items(payable_id);
CREATE INDEX IF NOT EXISTS idx_rates_contract ON public.rates(contract_id);
CREATE INDEX IF NOT EXISTS idx_rates_room_type ON public.rates(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rate_cancel_rules_rate ON public.rate_cancellation_rules(rate_id);
CREATE INDEX IF NOT EXISTS idx_rate_taxes_rate ON public.rate_taxes(rate_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer ON public.customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier ON public.supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bank_accounts_supplier ON public.supplier_bank_accounts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_template ON public.report_schedules(template_id);
CREATE INDEX IF NOT EXISTS idx_hotel_images_hotel ON public.hotel_images(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_suppliers_supplier ON public.hotel_suppliers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_hotel_facilities_facility ON public.hotel_facilities(facility_id);

-- ============ 2) AUDIT: missing change-tracking triggers ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customer_contacts','customer_communications','supplier_contacts',
    'supplier_bank_accounts','supplier_ratings','exchange_rates','user_roles',
    'rate_seasons','rate_taxes','rate_cancellation_rules'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row()', t, t);
  END LOOP;
END $$;

-- system_settings has no id column: dedicated audit trigger keyed on "key"
CREATE OR REPLACE FUNCTION public.tg_audit_settings()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('create','system_settings', NEW.key, NULL, to_jsonb(NEW), NULL);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit('update','system_settings', NEW.key, to_jsonb(OLD), to_jsonb(NEW), NULL);
    RETURN NEW;
  ELSE
    PERFORM public.log_audit('delete','system_settings', OLD.key, to_jsonb(OLD), NULL, NULL);
    RETURN OLD;
  END IF;
END $$;
DROP TRIGGER IF EXISTS trg_system_settings_audit ON public.system_settings;
CREATE TRIGGER trg_system_settings_audit AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_settings();

-- ============ 3) SECURITY: tighten overly-permissive history insert policies ============
DROP POLICY IF EXISTS bkh_insert ON public.booking_status_history;
CREATE POLICY bkh_insert ON public.booking_status_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS invh_insert ON public.invoice_status_history;
CREATE POLICY invh_insert ON public.invoice_status_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS rfq_hist_insert ON public.rfq_status_history;
CREATE POLICY rfq_hist_insert ON public.rfq_status_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ============ 4) SECURITY: remove anonymous execute on privileged functions ============
-- Trigger functions and business RPCs must not be callable by anonymous visitors.
-- check_account_lock / record_failed_login stay anon-callable (used on the login screen pre-auth).
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace AND n.nspname = 'public'
    WHERE p.prosecdef
      AND p.proname NOT IN ('check_account_lock','record_failed_login')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn.sig);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', fn.sig);
  END LOOP;
END $$;