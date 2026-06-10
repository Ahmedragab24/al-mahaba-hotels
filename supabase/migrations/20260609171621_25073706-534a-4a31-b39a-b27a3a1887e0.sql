-- ============ MODULE 1: ROOM TYPES (gap-fill) ============
ALTER TABLE public.hotel_room_types
  ADD COLUMN IF NOT EXISTS smoking_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid;

CREATE OR REPLACE FUNCTION public.tg_room_type_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN NEW.code := public.next_code('room_type'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_room_type_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.max_adults < 1 THEN RAISE EXCEPTION 'Adults capacity must be at least 1'; END IF;
  IF NEW.max_children < 0 THEN RAISE EXCEPTION 'Children capacity cannot be negative'; END IF;
  IF NEW.max_occupancy < NEW.max_adults THEN RAISE EXCEPTION 'Maximum occupancy cannot be less than adults capacity'; END IF;
  IF NEW.max_occupancy > NEW.max_adults + NEW.max_children THEN RAISE EXCEPTION 'Maximum occupancy cannot exceed adults + children capacity'; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_room_type_code ON public.hotel_room_types;
CREATE TRIGGER trg_room_type_code BEFORE INSERT ON public.hotel_room_types
FOR EACH ROW EXECUTE FUNCTION public.tg_room_type_code();

DROP TRIGGER IF EXISTS trg_room_type_validate ON public.hotel_room_types;
CREATE TRIGGER trg_room_type_validate BEFORE INSERT OR UPDATE ON public.hotel_room_types
FOR EACH ROW EXECUTE FUNCTION public.tg_room_type_validate();

DROP TRIGGER IF EXISTS trg_hrt_audit ON public.hotel_room_types;
CREATE TRIGGER trg_hrt_audit AFTER INSERT OR UPDATE OR DELETE ON public.hotel_room_types
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

INSERT INTO public.counters(key, prefix, current_value, padding)
VALUES ('room_type','RT',0,5), ('contract','CON',0,5), ('season','SSN',0,4), ('hotel_tax','TAX',0,4)
ON CONFLICT (key) DO NOTHING;

-- ============ MODULE 2: HOTEL CONTRACTS (upgrade) ============
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'suspended';
ALTER TYPE public.contract_status ADD VALUE IF NOT EXISTS 'closed';

ALTER TABLE public.supplier_contracts
  ADD COLUMN IF NOT EXISTS hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contract_type text NOT NULL DEFAULT 'allotment',
  ADD COLUMN IF NOT EXISTS credit_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

ALTER TABLE public.supplier_contracts DROP CONSTRAINT IF EXISTS sct_dates_chk;
ALTER TABLE public.supplier_contracts ADD CONSTRAINT sct_dates_chk CHECK (end_date >= start_date);
ALTER TABLE public.supplier_contracts DROP CONSTRAINT IF EXISTS sct_type_chk;
ALTER TABLE public.supplier_contracts ADD CONSTRAINT sct_type_chk CHECK (contract_type IN ('allotment','free_sale','on_request','commitment','other'));
ALTER TABLE public.supplier_contracts DROP CONSTRAINT IF EXISTS sct_credit_chk;
ALTER TABLE public.supplier_contracts ADD CONSTRAINT sct_credit_chk CHECK (credit_days >= 0);

CREATE INDEX IF NOT EXISTS idx_sct_hotel ON public.supplier_contracts(hotel_id);
CREATE INDEX IF NOT EXISTS idx_sct_supplier ON public.supplier_contracts(supplier_id);

CREATE OR REPLACE FUNCTION public.tg_contract_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.contract_number IS NULL OR NEW.contract_number = '' THEN NEW.contract_number := public.next_code('contract'); END IF;
  RETURN NEW;
END $$;

-- Business rule: no overlapping live contracts for the same supplier + hotel
CREATE OR REPLACE FUNCTION public.tg_contract_no_overlap()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.hotel_id IS NOT NULL AND NEW.deleted_at IS NULL
     AND NEW.status::text NOT IN ('expired','terminated','closed') THEN
    IF EXISTS (
      SELECT 1 FROM public.supplier_contracts c
      WHERE c.supplier_id = NEW.supplier_id
        AND c.hotel_id = NEW.hotel_id
        AND c.id <> NEW.id
        AND c.deleted_at IS NULL
        AND c.status::text NOT IN ('expired','terminated','closed')
        AND daterange(c.start_date, c.end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]')
    ) THEN
      RAISE EXCEPTION 'CONTRACT_OVERLAP: contract dates overlap with an existing contract for the same supplier and hotel';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_contract_code ON public.supplier_contracts;
CREATE TRIGGER trg_contract_code BEFORE INSERT ON public.supplier_contracts
FOR EACH ROW EXECUTE FUNCTION public.tg_contract_code();

DROP TRIGGER IF EXISTS trg_contract_no_overlap ON public.supplier_contracts;
CREATE TRIGGER trg_contract_no_overlap BEFORE INSERT OR UPDATE ON public.supplier_contracts
FOR EACH ROW EXECUTE FUNCTION public.tg_contract_no_overlap();

DROP TRIGGER IF EXISTS trg_sct_audit ON public.supplier_contracts;
CREATE TRIGGER trg_sct_audit AFTER INSERT OR UPDATE OR DELETE ON public.supplier_contracts
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

-- Business rule: rate can only be approved when its contract is active
CREATE OR REPLACE FUNCTION public.tg_rate_requires_active_contract()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.contract_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.supplier_contracts c
      WHERE c.id = NEW.contract_id AND c.deleted_at IS NULL AND c.status::text = 'active'
    ) THEN
      RAISE EXCEPTION 'CONTRACT_NOT_ACTIVE: rates can only be approved under an active contract';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_rate_requires_active_contract ON public.rates;
CREATE TRIGGER trg_rate_requires_active_contract BEFORE UPDATE ON public.rates
FOR EACH ROW EXECUTE FUNCTION public.tg_rate_requires_active_contract();

-- ============ MODULE 3: SEASONS (global) ============
CREATE TABLE public.seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT '',
  name_en text NOT NULL,
  name_ar text NOT NULL,
  season_type text NOT NULL DEFAULT 'custom' CHECK (season_type IN ('low','high','peak','ramadan','eid','hajj','new_year','custom')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seasons_dates_chk CHECK (end_date >= start_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasons TO authenticated;
GRANT ALL ON public.seasons TO service_role;

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY seasons_read ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY seasons_write ON public.seasons FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE OR REPLACE FUNCTION public.tg_season_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN NEW.code := public.next_code('season'); END IF;
  RETURN NEW;
END $$;

-- Business rules: unique names + no date overlap within the same season type
CREATE OR REPLACE FUNCTION public.tg_season_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.deleted_at IS NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id <> NEW.id AND s.deleted_at IS NULL
        AND (lower(s.name_en) = lower(NEW.name_en) OR lower(s.name_ar) = lower(NEW.name_ar))
    ) THEN
      RAISE EXCEPTION 'SEASON_DUPLICATE_NAME: a season with the same name already exists';
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.seasons s
      WHERE s.id <> NEW.id AND s.deleted_at IS NULL
        AND s.season_type = NEW.season_type
        AND daterange(s.start_date, s.end_date, '[]') && daterange(NEW.start_date, NEW.end_date, '[]')
    ) THEN
      RAISE EXCEPTION 'SEASON_OVERLAP: season dates overlap with an existing season of the same type';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_season_code BEFORE INSERT ON public.seasons
FOR EACH ROW EXECUTE FUNCTION public.tg_season_code();
CREATE TRIGGER trg_season_validate BEFORE INSERT OR UPDATE ON public.seasons
FOR EACH ROW EXECUTE FUNCTION public.tg_season_validate();
CREATE TRIGGER trg_seasons_updated BEFORE UPDATE ON public.seasons
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_seasons_audit AFTER INSERT OR UPDATE OR DELETE ON public.seasons
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

-- ============ MODULE 4 (Batch A): HOTEL TAXES & FEES ============
CREATE TABLE public.hotel_taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT '',
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  tax_type text NOT NULL DEFAULT 'vat' CHECK (tax_type IN ('vat','municipality_fee','tourism_fee','service_charge','resort_fee','custom')),
  calc_method text NOT NULL DEFAULT 'percentage' CHECK (calc_method IN ('fixed','percentage')),
  value numeric(12,4) NOT NULL CHECK (value >= 0),
  currency character(3),
  is_inclusive boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  effective_date date,
  notes text,
  deleted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_taxes TO authenticated;
GRANT ALL ON public.hotel_taxes TO service_role;

ALTER TABLE public.hotel_taxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY htx_read ON public.hotel_taxes FOR SELECT TO authenticated USING (true);
CREATE POLICY htx_write ON public.hotel_taxes FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]));

CREATE INDEX idx_htx_hotel ON public.hotel_taxes(hotel_id);

CREATE OR REPLACE FUNCTION public.tg_hotel_tax_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN NEW.code := public.next_code('hotel_tax'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.tg_hotel_tax_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.calc_method = 'percentage' AND NEW.value > 100 THEN
    RAISE EXCEPTION 'TAX_INVALID_PCT: percentage value cannot exceed 100';
  END IF;
  IF NEW.calc_method = 'fixed' AND (NEW.currency IS NULL OR btrim(NEW.currency) = '') THEN
    RAISE EXCEPTION 'TAX_CURRENCY_REQUIRED: fixed amount fees require a currency';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_hotel_tax_code BEFORE INSERT ON public.hotel_taxes
FOR EACH ROW EXECUTE FUNCTION public.tg_hotel_tax_code();
CREATE TRIGGER trg_hotel_tax_validate BEFORE INSERT OR UPDATE ON public.hotel_taxes
FOR EACH ROW EXECUTE FUNCTION public.tg_hotel_tax_validate();
CREATE TRIGGER trg_hotel_taxes_updated BEFORE UPDATE ON public.hotel_taxes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_hotel_taxes_audit AFTER INSERT OR UPDATE OR DELETE ON public.hotel_taxes
FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();