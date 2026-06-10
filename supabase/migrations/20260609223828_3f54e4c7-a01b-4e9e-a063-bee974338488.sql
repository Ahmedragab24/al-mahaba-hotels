-- Quotation header validation: expiry date + edit lock for blocked statuses
CREATE OR REPLACE FUNCTION public.tg_quotation_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.expiry_date <= NEW.quotation_date THEN
    RAISE EXCEPTION 'QUOTATION_EXPIRY: expiry date must be after the quotation date';
  END IF;
  IF TG_OP = 'UPDATE'
     AND OLD.status NOT IN ('draft','rejected')
     AND NEW.status = OLD.status
     AND NEW.deleted_at IS NOT DISTINCT FROM OLD.deleted_at THEN
    IF NEW.customer_id <> OLD.customer_id
       OR NEW.currency <> OLD.currency
       OR NEW.quotation_date <> OLD.quotation_date
       OR NEW.travel_date IS DISTINCT FROM OLD.travel_date
       OR NEW.expiry_date <> OLD.expiry_date
       OR NEW.notes IS DISTINCT FROM OLD.notes THEN
      RAISE EXCEPTION 'QUOTATION_LOCKED_EDIT: quotation details can only be edited while draft or rejected';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS quotation_validate ON public.quotations;
CREATE TRIGGER quotation_validate
BEFORE INSERT OR UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_validate();

-- Prevent duplicate room selection (same hotel/room type/occupancy with overlapping dates) in one quotation
CREATE OR REPLACE FUNCTION public.tg_quotation_item_duplicate()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.quotation_items qi
    WHERE qi.quotation_id = NEW.quotation_id
      AND qi.id <> NEW.id
      AND qi.hotel_id = NEW.hotel_id
      AND qi.room_type_id IS NOT DISTINCT FROM NEW.room_type_id
      AND qi.occupancy_type = NEW.occupancy_type
      AND daterange(qi.check_in, qi.check_out, '[)') && daterange(NEW.check_in, NEW.check_out, '[)')
  ) THEN
    RAISE EXCEPTION 'QITEM_DUPLICATE: an item for the same hotel, room type and occupancy already covers these dates';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS quotation_item_duplicate ON public.quotation_items;
CREATE TRIGGER quotation_item_duplicate
BEFORE INSERT OR UPDATE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION public.tg_quotation_item_duplicate();

-- Allow client to record PDF generation in the audit log
GRANT EXECUTE ON FUNCTION public.log_audit(text, text, text, jsonb, jsonb, jsonb) TO authenticated;