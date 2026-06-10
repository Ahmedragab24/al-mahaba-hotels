
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supplier';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_supplier_id ON public.profiles(supplier_id);

CREATE OR REPLACE FUNCTION public.is_supplier_user(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role::text = 'supplier'
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_supplier_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT supplier_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE TABLE IF NOT EXISTS public.supplier_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  supplier_type text NOT NULL CHECK (supplier_type IN ('direct_hotel','wholesaler','dmc','hotel_supplier','other')),
  legal_name text,
  tax_number text,
  commercial_registration text,
  country_code char(2) REFERENCES public.countries(code),
  city_id uuid REFERENCES public.cities(id),
  address_line1 text,
  website text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  contact_position text,
  commercial_reg_path text,
  tax_cert_path text,
  profile_path text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','under_review','approved','rejected')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason text,
  admin_notes text,
  created_supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  created_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.supplier_applications TO authenticated;
GRANT INSERT ON public.supplier_applications TO anon, authenticated;
GRANT ALL ON public.supplier_applications TO service_role;

ALTER TABLE public.supplier_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sa_public_insert" ON public.supplier_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND created_supplier_id IS NULL
    AND created_user_id IS NULL
    AND reviewed_by IS NULL
  );

CREATE POLICY "sa_admin_read" ON public.supplier_applications
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "sa_admin_update" ON public.supplier_applications
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "sa_admin_delete" ON public.supplier_applications
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_sa_updated_at BEFORE UPDATE ON public.supplier_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sa_status ON public.supplier_applications(status);
CREATE INDEX IF NOT EXISTS idx_sa_submitted ON public.supplier_applications(submitted_at DESC);

-- Restrictive SELECT scope for suppliers
CREATE POLICY "suppliers_supplier_scope" ON public.suppliers
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()) OR id = public.current_user_supplier_id());

CREATE POLICY "sc_supplier_scope" ON public.supplier_contracts
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()) OR supplier_id = public.current_user_supplier_id());

CREATE POLICY "rates_supplier_scope" ON public.rates
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()) OR supplier_id = public.current_user_supplier_id());

CREATE POLICY "bk_supplier_scope" ON public.bookings
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.booking_rooms br
      WHERE br.booking_id = bookings.id
        AND br.supplier_id = public.current_user_supplier_id()
    )
  );

CREATE POLICY "bkr_supplier_scope" ON public.booking_rooms
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()) OR supplier_id = public.current_user_supplier_id());

CREATE POLICY "hotels_supplier_scope" ON public.hotels
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (SELECT 1 FROM public.hotel_suppliers hs
               WHERE hs.hotel_id = hotels.id AND hs.supplier_id = public.current_user_supplier_id())
  );

CREATE POLICY "hs_supplier_scope" ON public.hotel_suppliers
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()) OR supplier_id = public.current_user_supplier_id());

CREATE POLICY "hrt_supplier_scope" ON public.hotel_room_types
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (SELECT 1 FROM public.hotel_suppliers hs
               WHERE hs.hotel_id = hotel_room_types.hotel_id AND hs.supplier_id = public.current_user_supplier_id())
  );

CREATE POLICY "hmp_supplier_scope" ON public.hotel_meal_plans
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (SELECT 1 FROM public.hotel_suppliers hs
               WHERE hs.hotel_id = hotel_meal_plans.hotel_id AND hs.supplier_id = public.current_user_supplier_id())
  );

CREATE POLICY "customers_no_supplier" ON public.customers
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()));

CREATE POLICY "invoices_no_supplier" ON public.invoices
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()));

CREATE POLICY "quotations_no_supplier" ON public.quotations
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (NOT public.is_supplier_user(auth.uid()));

-- Supplier write capabilities
CREATE POLICY "suppliers_self_update" ON public.suppliers
  FOR UPDATE TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND id = public.current_user_supplier_id())
  WITH CHECK (public.is_supplier_user(auth.uid()) AND id = public.current_user_supplier_id());

CREATE POLICY "sba_supplier_read" ON public.supplier_bank_accounts
  FOR SELECT TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "sba_supplier_write" ON public.supplier_bank_accounts
  FOR ALL TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id())
  WITH CHECK (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "scon_supplier_read" ON public.supplier_contacts
  FOR SELECT TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "scon_supplier_write" ON public.supplier_contacts
  FOR ALL TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id())
  WITH CHECK (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "sp_supplier_read" ON public.supplier_payables
  FOR SELECT TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "spay_supplier_read" ON public.supplier_payments
  FOR SELECT TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

CREATE POLICY "rates_supplier_insert" ON public.rates
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_supplier_user(auth.uid())
    AND supplier_id = public.current_user_supplier_id()
    AND status::text IN ('draft','submitted')
  );

CREATE POLICY "rates_supplier_update" ON public.rates
  FOR UPDATE TO authenticated
  USING (
    public.is_supplier_user(auth.uid())
    AND supplier_id = public.current_user_supplier_id()
    AND status::text IN ('draft','rejected','submitted')
  )
  WITH CHECK (
    public.is_supplier_user(auth.uid())
    AND supplier_id = public.current_user_supplier_id()
  );

CREATE POLICY "bkr_supplier_update" ON public.booking_rooms
  FOR UPDATE TO authenticated
  USING (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id())
  WITH CHECK (public.is_supplier_user(auth.uid()) AND supplier_id = public.current_user_supplier_id());

-- Finalize / reject application functions
CREATE OR REPLACE FUNCTION public.finalize_supplier_application(_app_id uuid, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_app record;
  v_supplier_id uuid;
  v_code text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'FORBIDDEN: only admins can finalize applications';
  END IF;
  SELECT * INTO v_app FROM public.supplier_applications WHERE id = _app_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'APP_NOT_FOUND'; END IF;
  IF v_app.status = 'approved' THEN RAISE EXCEPTION 'ALREADY_APPROVED'; END IF;

  v_code := public.next_code('supplier');

  INSERT INTO public.suppliers(
    code, supplier_type, name_en, name_ar, legal_name, tax_number,
    commercial_registration, country_code, city_id, address_line1, website,
    email, phone, status, created_by
  ) VALUES (
    v_code, v_app.supplier_type, v_app.name_en, v_app.name_ar, v_app.legal_name, v_app.tax_number,
    v_app.commercial_registration, v_app.country_code, v_app.city_id, v_app.address_line1, v_app.website,
    v_app.contact_email, v_app.contact_phone, 'active', auth.uid()
  )
  RETURNING id INTO v_supplier_id;

  UPDATE public.profiles
    SET supplier_id = v_supplier_id, must_change_password = true, updated_at = now()
    WHERE id = _user_id;

  EXECUTE 'INSERT INTO public.user_roles(user_id, role) VALUES ($1, ''supplier''::public.app_role) ON CONFLICT DO NOTHING'
    USING _user_id;

  UPDATE public.supplier_applications
    SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(),
        created_supplier_id = v_supplier_id, created_user_id = _user_id, updated_at = now()
    WHERE id = _app_id;

  PERFORM public.log_audit('approve','supplier_applications', _app_id::text, NULL, NULL,
    jsonb_build_object('supplier_id', v_supplier_id, 'user_id', _user_id));

  RETURN jsonb_build_object('supplier_id', v_supplier_id, 'code', v_code, 'user_id', _user_id);
END $$;

CREATE OR REPLACE FUNCTION public.reject_supplier_application(_app_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'REASON_REQUIRED: rejection reason is required';
  END IF;
  UPDATE public.supplier_applications
    SET status='rejected', reviewed_at=now(), reviewed_by=auth.uid(),
        rejection_reason=_reason, updated_at=now()
    WHERE id=_app_id AND status <> 'approved';
  IF NOT FOUND THEN RAISE EXCEPTION 'APP_NOT_FOUND_OR_ALREADY_APPROVED'; END IF;
  PERFORM public.log_audit('reject','supplier_applications', _app_id::text, NULL, NULL,
    jsonb_build_object('reason', _reason));
END $$;
