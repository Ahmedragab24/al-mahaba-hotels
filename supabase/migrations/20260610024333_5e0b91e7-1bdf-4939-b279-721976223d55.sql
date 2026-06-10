CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := COALESCE(NEW.created_by, auth.uid());
  RETURN NEW;
END;
$$;

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'quotations','customer_communications','customers','bookings','invoices','receipts',
    'rfqs','rates','hotels','suppliers','seasons','exchange_rates','customer_adjustments',
    'hotel_room_types','hotel_taxes','receipt_allocations','report_schedules','report_templates',
    'rfq_supplier_responses','supplier_contracts','supplier_payables','supplier_payments'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_created_by ON public.%I', tbl);
    EXECUTE format('CREATE TRIGGER trg_set_created_by BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_created_by()', tbl);
  END LOOP;
END $$;

ALTER TABLE public.customer_communications ALTER COLUMN occurred_at SET DEFAULT now();