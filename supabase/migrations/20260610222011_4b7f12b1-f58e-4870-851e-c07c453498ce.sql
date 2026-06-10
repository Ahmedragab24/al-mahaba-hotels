
-- 1) Lock down audit_logs inserts to require user_id = auth.uid()
DROP POLICY IF EXISTS audit_self_insert ON public.audit_logs;
CREATE POLICY audit_self_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2) Block supplier users from sensitive customer/finance/booking tables (RESTRICTIVE)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'booking_guests',
    'customer_adjustments',
    'customer_attachments',
    'customer_communications',
    'customer_contacts',
    'invoice_items',
    'receipt_allocations',
    'receipts'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS no_supplier_access ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY no_supplier_access ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (NOT public.is_supplier_user(auth.uid())) WITH CHECK (NOT public.is_supplier_user(auth.uid()))',
      t
    );
  END LOOP;
END $$;

-- 3) Scope supplier-readable tables so supplier users only see their own data
-- rfq_supplier_requests: supplier sees only requests for their supplier_id
DROP POLICY IF EXISTS supplier_scope ON public.rfq_supplier_requests;
CREATE POLICY supplier_scope ON public.rfq_supplier_requests AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  );

-- rfq_supplier_responses
DROP POLICY IF EXISTS supplier_scope ON public.rfq_supplier_responses;
CREATE POLICY supplier_scope ON public.rfq_supplier_responses AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  );

-- hotel_contacts: supplier sees only contacts at hotels they're linked to
DROP POLICY IF EXISTS supplier_scope ON public.hotel_contacts;
CREATE POLICY supplier_scope ON public.hotel_contacts AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.hotel_suppliers hs
      WHERE hs.hotel_id = hotel_contacts.hotel_id
        AND hs.supplier_id = public.current_user_supplier_id()
    )
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.hotel_suppliers hs
      WHERE hs.hotel_id = hotel_contacts.hotel_id
        AND hs.supplier_id = public.current_user_supplier_id()
    )
  );

-- payment_orders: supplier sees only their own orders
DROP POLICY IF EXISTS supplier_scope ON public.payment_orders;
CREATE POLICY supplier_scope ON public.payment_orders AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR supplier_id = public.current_user_supplier_id()
  );

-- payment_order_items: scoped via parent order
DROP POLICY IF EXISTS supplier_scope ON public.payment_order_items;
CREATE POLICY supplier_scope ON public.payment_order_items AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.payment_orders po
      WHERE po.id = payment_order_items.order_id
        AND po.supplier_id = public.current_user_supplier_id()
    )
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.payment_orders po
      WHERE po.id = payment_order_items.order_id
        AND po.supplier_id = public.current_user_supplier_id()
    )
  );

-- payment_allocations: scoped via parent supplier_payments
DROP POLICY IF EXISTS supplier_scope ON public.payment_allocations;
CREATE POLICY supplier_scope ON public.payment_allocations AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.supplier_payments sp
      WHERE sp.id = payment_allocations.payment_id
        AND sp.supplier_id = public.current_user_supplier_id()
    )
  )
  WITH CHECK (
    NOT public.is_supplier_user(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.supplier_payments sp
      WHERE sp.id = payment_allocations.payment_id
        AND sp.supplier_id = public.current_user_supplier_id()
    )
  );

-- 4) Explicitly lock user_roles writes to admins only (default-deny is already
-- in effect, but make it explicit so no future permissive policy widens access)
DROP POLICY IF EXISTS user_roles_admin_write ON public.user_roles;
CREATE POLICY user_roles_admin_write ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
