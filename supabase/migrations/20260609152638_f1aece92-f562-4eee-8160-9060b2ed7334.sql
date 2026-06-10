
-- ============================================================
-- PHASE 1: FOUNDATION + MASTER DATA
-- Hotel Quotation & Reservation Management System
-- ============================================================

-- ---------- Extensions ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ---------- Enums ----------
CREATE TYPE public.app_role AS ENUM (
  'super_admin','admin','sales_manager','sales_agent',
  'operations_manager','operations_agent','finance_manager','finance_agent','viewer'
);

CREATE TYPE public.app_language AS ENUM ('ar','en');

CREATE TYPE public.entity_status AS ENUM ('active','inactive','archived');

CREATE TYPE public.approval_status AS ENUM ('draft','pending_approval','approved','rejected','expired');

CREATE TYPE public.contract_status AS ENUM ('draft','active','expired','terminated');

CREATE TYPE public.rate_board AS ENUM ('RO','BB','HB','FB','AI','UAI');

-- ---------- Updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ---------- Profiles ----------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username citext UNIQUE,
  email citext NOT NULL,
  full_name_ar text,
  full_name_en text,
  phone text,
  avatar_url text,
  preferred_language public.app_language NOT NULL DEFAULT 'ar',
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  failed_login_attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  last_login_ip text,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- User Roles ----------
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ---------- Role helper functions ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles))
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin','admin'))
$$;

CREATE OR REPLACE FUNCTION public.current_user_roles()
RETURNS public.app_role[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(role), ARRAY[]::public.app_role[])
  FROM public.user_roles WHERE user_id = auth.uid()
$$;

-- ---------- Profiles RLS ----------
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE
  TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());

-- ---------- User Roles RLS ----------
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ---------- Profile auto-create trigger ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_is_first boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO v_is_first;
  INSERT INTO public.profiles (id, email, full_name_en, full_name_ar, username, preferred_language, must_change_password)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name_en', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name_ar', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'preferred_language')::public.app_language, 'ar'),
    NOT v_is_first
  );
  IF v_is_first THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- System Settings ----------
CREATE TABLE public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_read_all" ON public.system_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_admin_write" ON public.system_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.system_settings(key,value,description) VALUES
  ('company.name_ar', '"شركتي للسياحة"', 'Company name in Arabic'),
  ('company.name_en', '"My Travel Co."', 'Company name in English'),
  ('company.default_currency', '"SAR"', 'Default currency'),
  ('security.session_timeout_minutes', '30', 'Session timeout in minutes'),
  ('security.max_failed_attempts', '5', 'Max failed login attempts before lock'),
  ('security.lock_duration_minutes', '15', 'Account lock duration'),
  ('security.password_min_length', '8', 'Minimum password length'),
  ('localization.default_language', '"ar"', 'Default UI language')
ON CONFLICT (key) DO NOTHING;

-- ---------- Counters (auto-numbering) ----------
CREATE TABLE public.counters (
  key text PRIMARY KEY,
  prefix text NOT NULL DEFAULT '',
  current_value bigint NOT NULL DEFAULT 0,
  padding int NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.counters TO authenticated;
GRANT ALL ON public.counters TO service_role;
ALTER TABLE public.counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counters_read" ON public.counters FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.next_code(_key text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prefix text; v_val bigint; v_pad int;
BEGIN
  INSERT INTO public.counters(key, prefix, current_value, padding)
  VALUES (_key, upper(_key), 0, 5) ON CONFLICT (key) DO NOTHING;
  UPDATE public.counters SET current_value = current_value + 1, updated_at = now()
   WHERE key = _key RETURNING prefix, current_value, padding INTO v_prefix, v_val, v_pad;
  RETURN v_prefix || '-' || lpad(v_val::text, v_pad, '0');
END $$;

INSERT INTO public.counters(key, prefix, padding) VALUES
  ('customer','CUS',5),('hotel','HTL',5),('supplier','SUP',5),('rate','RT',6)
ON CONFLICT (key) DO NOTHING;

-- ---------- Audit Logs ----------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "audit_self_insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE OR REPLACE FUNCTION public.log_audit(_action text, _entity_type text, _entity_id text,
  _old jsonb DEFAULT NULL, _new jsonb DEFAULT NULL, _metadata jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs(user_id,user_email,action,entity_type,entity_id,old_values,new_values,metadata)
  VALUES (auth.uid(), v_email, _action, _entity_type, _entity_id, _old, _new, _metadata)
  RETURNING id INTO v_id; RETURN v_id;
END $$;

-- ---------- Generic audit trigger ----------
CREATE OR REPLACE FUNCTION public.tg_audit_row()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit('create', TG_TABLE_NAME, NEW.id::text, NULL, to_jsonb(NEW), NULL);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit('update', TG_TABLE_NAME, NEW.id::text, to_jsonb(OLD), to_jsonb(NEW), NULL);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit('delete', TG_TABLE_NAME, OLD.id::text, to_jsonb(OLD), NULL, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

-- ---------- Lookups ----------
CREATE TABLE public.countries (
  code char(2) PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  phone_code text,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries_read" ON public.countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "countries_admin_write" ON public.countries FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code char(2) NOT NULL REFERENCES public.countries(code) ON DELETE RESTRICT,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(country_code, name_en)
);
GRANT SELECT ON public.cities TO authenticated;
GRANT ALL ON public.cities TO service_role;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cities_read" ON public.cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "cities_admin_write" ON public.cities FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.currencies (
  code char(3) PRIMARY KEY,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  symbol text,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.currencies TO authenticated;
GRANT ALL ON public.currencies TO service_role;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "currencies_read" ON public.currencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "currencies_admin_write" ON public.currencies FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Seed essential lookups
INSERT INTO public.countries(code,name_en,name_ar,phone_code) VALUES
  ('SA','Saudi Arabia','المملكة العربية السعودية','+966'),
  ('AE','United Arab Emirates','الإمارات العربية المتحدة','+971'),
  ('EG','Egypt','مصر','+20'),
  ('JO','Jordan','الأردن','+962'),
  ('KW','Kuwait','الكويت','+965'),
  ('QA','Qatar','قطر','+974'),
  ('BH','Bahrain','البحرين','+973'),
  ('OM','Oman','عمان','+968'),
  ('TR','Turkey','تركيا','+90'),
  ('GB','United Kingdom','المملكة المتحدة','+44'),
  ('US','United States','الولايات المتحدة','+1')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.currencies(code,name_en,name_ar,symbol) VALUES
  ('SAR','Saudi Riyal','ريال سعودي','ر.س'),
  ('AED','UAE Dirham','درهم إماراتي','د.إ'),
  ('USD','US Dollar','دولار أمريكي','$'),
  ('EUR','Euro','يورو','€'),
  ('EGP','Egyptian Pound','جنيه مصري','ج.م'),
  ('GBP','British Pound','جنيه إسترليني','£'),
  ('KWD','Kuwaiti Dinar','دينار كويتي','د.ك'),
  ('QAR','Qatari Riyal','ريال قطري','ر.ق'),
  ('TRY','Turkish Lira','ليرة تركية','₺')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  customer_type text NOT NULL DEFAULT 'corporate' CHECK (customer_type IN ('corporate','individual','agency','government')),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  legal_name text,
  tax_number text,
  commercial_registration text,
  country_code char(2) REFERENCES public.countries(code),
  city_id uuid REFERENCES public.cities(id),
  address_line1 text,
  address_line2 text,
  postal_code text,
  email citext,
  phone text,
  mobile text,
  website text,
  preferred_language public.app_language NOT NULL DEFAULT 'ar',
  preferred_currency char(3) REFERENCES public.currencies(code) DEFAULT 'SAR',
  credit_limit numeric(14,2) NOT NULL DEFAULT 0,
  credit_days int NOT NULL DEFAULT 0,
  payment_terms text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  status public.entity_status NOT NULL DEFAULT 'active',
  notes text,
  tags text[] DEFAULT ARRAY[]::text[],
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_customers_code ON public.customers(code);
CREATE INDEX idx_customers_name_en ON public.customers(name_en);
CREATE INDEX idx_customers_name_ar ON public.customers(name_ar);
CREATE INDEX idx_customers_status ON public.customers(status) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_customers_audit AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();

CREATE POLICY "customers_read" ON public.customers FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_admin(auth.uid()));
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]))
  WITH CHECK (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TABLE public.customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text,
  email citext,
  phone text,
  mobile text,
  is_primary boolean NOT NULL DEFAULT false,
  preferred_language public.app_language DEFAULT 'ar',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_contacts TO authenticated;
GRANT ALL ON public.customer_contacts TO service_role;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_cc_updated BEFORE UPDATE ON public.customer_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "cc_read" ON public.customer_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "cc_write" ON public.customer_contacts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]));

CREATE TABLE public.customer_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  category text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_attachments TO authenticated;
GRANT ALL ON public.customer_attachments TO service_role;
ALTER TABLE public.customer_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ca_read" ON public.customer_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "ca_write" ON public.customer_attachments FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]));

CREATE TABLE public.customer_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','phone','whatsapp','meeting','note','other')),
  direction text CHECK (direction IN ('inbound','outbound')),
  subject text,
  body text,
  contact_id uuid REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_comm_customer ON public.customer_communications(customer_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_communications TO authenticated;
GRANT ALL ON public.customer_communications TO service_role;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccom_read" ON public.customer_communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "ccom_write" ON public.customer_communications FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]));

-- Auto-number customer code
CREATE OR REPLACE FUNCTION public.tg_customer_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN NEW.code := public.next_code('customer'); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_customer_code BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.tg_customer_code();

-- ============================================================
-- HOTELS
-- ============================================================
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  brand text,
  star_rating int CHECK (star_rating BETWEEN 1 AND 5),
  country_code char(2) REFERENCES public.countries(code),
  city_id uuid REFERENCES public.cities(id),
  district text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  phone text,
  email citext,
  website text,
  check_in_time time DEFAULT '14:00',
  check_out_time time DEFAULT '12:00',
  description_en text,
  description_ar text,
  policies_en text,
  policies_ar text,
  cover_image_path text,
  status public.entity_status NOT NULL DEFAULT 'active',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_hotels_code ON public.hotels(code);
CREATE INDEX idx_hotels_city ON public.hotels(city_id);
CREATE INDEX idx_hotels_country ON public.hotels(country_code);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotels TO authenticated;
GRANT ALL ON public.hotels TO service_role;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_hotels_updated BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_hotels_audit AFTER INSERT OR UPDATE OR DELETE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE POLICY "hotels_read" ON public.hotels FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_admin(auth.uid()));
CREATE POLICY "hotels_write" ON public.hotels FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE OR REPLACE FUNCTION public.tg_hotel_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.code IS NULL OR NEW.code='' THEN NEW.code := public.next_code('hotel'); END IF; RETURN NEW; END $$;
CREATE TRIGGER trg_hotel_code BEFORE INSERT ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.tg_hotel_code();

CREATE TABLE public.hotel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_images TO authenticated;
GRANT ALL ON public.hotel_images TO service_role;
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hi_read" ON public.hotel_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "hi_write" ON public.hotel_images FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.hotel_room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  max_adults int NOT NULL DEFAULT 2,
  max_children int NOT NULL DEFAULT 0,
  max_occupancy int NOT NULL DEFAULT 2,
  bed_type text,
  size_sqm numeric(6,2),
  description_en text,
  description_ar text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_room_types TO authenticated;
GRANT ALL ON public.hotel_room_types TO service_role;
ALTER TABLE public.hotel_room_types ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_hrt_updated BEFORE UPDATE ON public.hotel_room_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "hrt_read" ON public.hotel_room_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "hrt_write" ON public.hotel_room_types FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.hotel_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(hotel_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_views TO authenticated;
GRANT ALL ON public.hotel_views TO service_role;
ALTER TABLE public.hotel_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hv_read" ON public.hotel_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "hv_write" ON public.hotel_views FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.hotel_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  board public.rate_board NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_ar text,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(hotel_id, board)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_meal_plans TO authenticated;
GRANT ALL ON public.hotel_meal_plans TO service_role;
ALTER TABLE public.hotel_meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hmp_read" ON public.hotel_meal_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "hmp_write" ON public.hotel_meal_plans FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  icon text,
  category text
);
GRANT SELECT ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fac_read" ON public.facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "fac_admin_write" ON public.facilities FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.facilities(code,name_en,name_ar,category) VALUES
  ('wifi','Free Wi-Fi','واي فاي مجاني','connectivity'),
  ('parking','Parking','موقف سيارات','transport'),
  ('pool','Swimming Pool','مسبح','recreation'),
  ('gym','Fitness Center','نادي رياضي','recreation'),
  ('spa','Spa','سبا','recreation'),
  ('restaurant','Restaurant','مطعم','dining'),
  ('bar','Bar/Lounge','بار','dining'),
  ('room_service','Room Service','خدمة الغرف','services'),
  ('laundry','Laundry','غسيل ملابس','services'),
  ('airport_shuttle','Airport Shuttle','نقل المطار','transport'),
  ('business_center','Business Center','مركز أعمال','business'),
  ('meeting_rooms','Meeting Rooms','قاعات اجتماعات','business'),
  ('prayer_room','Prayer Room','مصلى','services'),
  ('family_rooms','Family Rooms','غرف عائلية','rooms'),
  ('accessible','Accessible','مهيأ لذوي الاحتياجات','accessibility')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE public.hotel_facilities (
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  PRIMARY KEY (hotel_id, facility_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_facilities TO authenticated;
GRANT ALL ON public.hotel_facilities TO service_role;
ALTER TABLE public.hotel_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hf_read" ON public.hotel_facilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "hf_write" ON public.hotel_facilities FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  supplier_type text NOT NULL DEFAULT 'hotel_supplier' CHECK (supplier_type IN ('hotel_supplier','dmc','direct_hotel','wholesaler','other')),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  legal_name text,
  tax_number text,
  commercial_registration text,
  country_code char(2) REFERENCES public.countries(code),
  city_id uuid REFERENCES public.cities(id),
  address_line1 text,
  address_line2 text,
  email citext,
  phone text,
  mobile text,
  website text,
  preferred_currency char(3) REFERENCES public.currencies(code) DEFAULT 'SAR',
  payment_terms text,
  credit_days int NOT NULL DEFAULT 0,
  rating numeric(3,2) CHECK (rating BETWEEN 0 AND 5),
  status public.entity_status NOT NULL DEFAULT 'active',
  notes text,
  tags text[] DEFAULT ARRAY[]::text[],
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
CREATE INDEX idx_suppliers_code ON public.suppliers(code);
CREATE INDEX idx_suppliers_status ON public.suppliers(status) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_suppliers_audit AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE POLICY "suppliers_read" ON public.suppliers FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_admin(auth.uid()));
CREATE POLICY "suppliers_write" ON public.suppliers FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]));

CREATE OR REPLACE FUNCTION public.tg_supplier_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.code IS NULL OR NEW.code='' THEN NEW.code := public.next_code('supplier'); END IF; RETURN NEW; END $$;
CREATE TRIGGER trg_supplier_code BEFORE INSERT ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.tg_supplier_code();

CREATE TABLE public.supplier_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text,
  email citext,
  phone text,
  mobile text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_contacts TO authenticated;
GRANT ALL ON public.supplier_contacts TO service_role;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sc_updated BEFORE UPDATE ON public.supplier_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "sc_read" ON public.supplier_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "sc_write" ON public.supplier_contacts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent','finance_manager']::public.app_role[]));

CREATE TABLE public.supplier_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  contract_number text NOT NULL,
  title text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  currency char(3) REFERENCES public.currencies(code),
  payment_terms text,
  cancellation_terms text,
  commission_pct numeric(5,2),
  notes text,
  file_path text,
  status public.contract_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  UNIQUE(supplier_id, contract_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_contracts TO authenticated;
GRANT ALL ON public.supplier_contracts TO service_role;
ALTER TABLE public.supplier_contracts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sct_updated BEFORE UPDATE ON public.supplier_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "sct_read" ON public.supplier_contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "sct_write" ON public.supplier_contracts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','finance_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','finance_manager']::public.app_role[]));

CREATE TABLE public.supplier_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_holder text NOT NULL,
  account_number text NOT NULL,
  iban text,
  swift text,
  currency char(3) REFERENCES public.currencies(code),
  branch text,
  country_code char(2) REFERENCES public.countries(code),
  is_default boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_bank_accounts TO authenticated;
GRANT ALL ON public.supplier_bank_accounts TO service_role;
ALTER TABLE public.supplier_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_sba_updated BEFORE UPDATE ON public.supplier_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "sba_read" ON public.supplier_bank_accounts FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','finance_manager','finance_agent','operations_manager']::public.app_role[]));
CREATE POLICY "sba_write" ON public.supplier_bank_accounts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','finance_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','finance_manager']::public.app_role[]));

CREATE TABLE public.supplier_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score BETWEEN 1 AND 5),
  category text,
  comment text,
  rated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_ratings TO authenticated;
GRANT ALL ON public.supplier_ratings TO service_role;
ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sr_read" ON public.supplier_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "sr_write" ON public.supplier_ratings FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent','sales_manager']::public.app_role[]))
  WITH CHECK (rated_by = auth.uid() OR public.is_admin(auth.uid()));

-- Hotel <-> Supplier link
CREATE TABLE public.hotel_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  is_preferred boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hotel_id, supplier_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_suppliers TO authenticated;
GRANT ALL ON public.hotel_suppliers TO service_role;
ALTER TABLE public.hotel_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hs_read" ON public.hotel_suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "hs_write" ON public.hotel_suppliers FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

-- ============================================================
-- RATES
-- ============================================================
CREATE TABLE public.rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  contract_id uuid REFERENCES public.supplier_contracts(id) ON DELETE SET NULL,
  room_type_id uuid NOT NULL REFERENCES public.hotel_room_types(id) ON DELETE RESTRICT,
  view_id uuid REFERENCES public.hotel_views(id) ON DELETE SET NULL,
  meal_plan public.rate_board NOT NULL,
  currency char(3) NOT NULL REFERENCES public.currencies(code),
  valid_from date NOT NULL,
  valid_to date NOT NULL,
  cost_per_night numeric(12,2) NOT NULL CHECK (cost_per_night >= 0),
  selling_price numeric(12,2),
  markup_pct numeric(5,2),
  min_nights int NOT NULL DEFAULT 1,
  max_nights int,
  release_days int NOT NULL DEFAULT 0,
  allotment int,
  notes_en text,
  notes_ar text,
  cancellation_policy_en text,
  cancellation_policy_ar text,
  status public.approval_status NOT NULL DEFAULT 'draft',
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CHECK (valid_to >= valid_from)
);
CREATE INDEX idx_rates_hotel ON public.rates(hotel_id);
CREATE INDEX idx_rates_supplier ON public.rates(supplier_id);
CREATE INDEX idx_rates_validity ON public.rates(valid_from, valid_to);
CREATE INDEX idx_rates_status ON public.rates(status) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rates TO authenticated;
GRANT ALL ON public.rates TO service_role;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_rates_updated BEFORE UPDATE ON public.rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rates_audit AFTER INSERT OR UPDATE OR DELETE ON public.rates
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_row();
CREATE POLICY "rates_read" ON public.rates FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_admin(auth.uid()));
CREATE POLICY "rates_insert" ON public.rates FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));
CREATE POLICY "rates_update" ON public.rates FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (true);
CREATE POLICY "rates_delete" ON public.rates FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.tg_rate_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN IF NEW.code IS NULL OR NEW.code='' THEN NEW.code := public.next_code('rate'); END IF; RETURN NEW; END $$;
CREATE TRIGGER trg_rate_code BEFORE INSERT ON public.rates
  FOR EACH ROW EXECUTE FUNCTION public.tg_rate_code();

CREATE TABLE public.rate_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES public.rates(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cost_per_night numeric(12,2) NOT NULL CHECK (cost_per_night >= 0),
  selling_price numeric(12,2),
  min_nights int NOT NULL DEFAULT 1,
  notes text,
  CHECK (end_date >= start_date)
);
CREATE INDEX idx_rs_rate ON public.rate_seasons(rate_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_seasons TO authenticated;
GRANT ALL ON public.rate_seasons TO service_role;
ALTER TABLE public.rate_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rs_read" ON public.rate_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "rs_write" ON public.rate_seasons FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.rate_taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES public.rates(id) ON DELETE CASCADE,
  name text NOT NULL,
  tax_type text NOT NULL CHECK (tax_type IN ('percentage','fixed_per_night','fixed_per_stay','fixed_per_person')),
  value numeric(10,2) NOT NULL,
  is_inclusive boolean NOT NULL DEFAULT false,
  applies_to text NOT NULL DEFAULT 'room' CHECK (applies_to IN ('room','total'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_taxes TO authenticated;
GRANT ALL ON public.rate_taxes TO service_role;
ALTER TABLE public.rate_taxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rt_read" ON public.rate_taxes FOR SELECT TO authenticated USING (true);
CREATE POLICY "rt_write" ON public.rate_taxes FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.rate_cancellation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES public.rates(id) ON DELETE CASCADE,
  days_before_checkin int NOT NULL,
  penalty_type text NOT NULL CHECK (penalty_type IN ('percentage','nights','fixed','non_refundable')),
  penalty_value numeric(10,2) NOT NULL DEFAULT 0,
  notes text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_cancellation_rules TO authenticated;
GRANT ALL ON public.rate_cancellation_rules TO service_role;
ALTER TABLE public.rate_cancellation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rcr_read" ON public.rate_cancellation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "rcr_write" ON public.rate_cancellation_rules FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));

CREATE TABLE public.rate_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES public.rates(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('submit','approve','reject','revise')),
  performed_by uuid REFERENCES auth.users(id),
  comments text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ra_rate ON public.rate_approvals(rate_id);
GRANT SELECT, INSERT ON public.rate_approvals TO authenticated;
GRANT ALL ON public.rate_approvals TO service_role;
ALTER TABLE public.rate_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ra_read" ON public.rate_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "ra_insert" ON public.rate_approvals FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());
