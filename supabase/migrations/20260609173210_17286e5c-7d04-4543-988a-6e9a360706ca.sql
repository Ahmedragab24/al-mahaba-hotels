-- Taxes & Fees: expiry date + application scope
ALTER TABLE public.hotel_taxes
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS apply_scope text NOT NULL DEFAULT 'per_stay';
ALTER TABLE public.hotel_taxes DROP CONSTRAINT IF EXISTS hotel_taxes_apply_scope_check;
ALTER TABLE public.hotel_taxes ADD CONSTRAINT hotel_taxes_apply_scope_check
  CHECK (apply_scope IN ('per_room','per_night','per_person','per_stay'));

-- Contracts: commission type (percentage or fixed amount)
ALTER TABLE public.supplier_contracts
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'percentage';
ALTER TABLE public.supplier_contracts DROP CONSTRAINT IF EXISTS sct_commission_type_chk;
ALTER TABLE public.supplier_contracts ADD CONSTRAINT sct_commission_type_chk
  CHECK (commission_type IN ('percentage','fixed'));

-- Room types: unique code per hotel (active records only)
CREATE UNIQUE INDEX IF NOT EXISTS hrt_hotel_code_uq
  ON public.hotel_room_types (hotel_id, lower(code))
  WHERE deleted_at IS NULL;

-- Tax date-range validation (extends existing validation)
CREATE OR REPLACE FUNCTION public.tg_hotel_tax_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.calc_method = 'percentage' AND NEW.value > 100 THEN
    RAISE EXCEPTION 'TAX_INVALID_PCT: percentage value cannot exceed 100';
  END IF;
  IF NEW.calc_method = 'fixed' AND (NEW.currency IS NULL OR btrim(NEW.currency) = '') THEN
    RAISE EXCEPTION 'TAX_CURRENCY_REQUIRED: fixed amount fees require a currency';
  END IF;
  IF NEW.expiry_date IS NOT NULL AND NEW.effective_date IS NOT NULL AND NEW.expiry_date < NEW.effective_date THEN
    RAISE EXCEPTION 'TAX_DATE_RANGE: expiry date cannot be before effective date';
  END IF;
  RETURN NEW;
END $$;

-- Room types: prevent delete/archive while linked to active rates
CREATE OR REPLACE FUNCTION public.tg_room_type_block_delete()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE v_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN v_id := OLD.id;
  ELSIF TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN v_id := NEW.id;
  ELSE RETURN COALESCE(NEW, OLD);
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.rates r
    WHERE r.room_type_id = v_id
      AND r.deleted_at IS NULL
      AND r.status IN ('approved','pending_approval')
  ) THEN
    RAISE EXCEPTION 'ROOM_TYPE_IN_USE: room type is linked to active rates';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_room_type_block_delete ON public.hotel_room_types;
CREATE TRIGGER trg_room_type_block_delete
  BEFORE UPDATE OR DELETE ON public.hotel_room_types
  FOR EACH ROW EXECUTE FUNCTION public.tg_room_type_block_delete();

REVOKE EXECUTE ON FUNCTION public.tg_hotel_tax_validate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_room_type_block_delete() FROM PUBLIC, anon, authenticated;