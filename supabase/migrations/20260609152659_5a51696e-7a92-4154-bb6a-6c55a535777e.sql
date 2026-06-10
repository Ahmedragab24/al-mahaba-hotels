
-- Pin search_path on remaining functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.tg_audit_row() SET search_path = public;
ALTER FUNCTION public.tg_customer_code() SET search_path = public;
ALTER FUNCTION public.tg_hotel_code() SET search_path = public;
ALTER FUNCTION public.tg_supplier_code() SET search_path = public;
ALTER FUNCTION public.tg_rate_code() SET search_path = public;

-- Revoke execute from anon/public on security-definer helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.next_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_audit(text,text,text,jsonb,jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit(text,text,text,jsonb,jsonb,jsonb) TO authenticated;

-- Tighten UPDATE WITH CHECK clauses
DROP POLICY IF EXISTS "customers_update" ON public.customers;
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','sales_manager','sales_agent','operations_manager']::public.app_role[]));

DROP POLICY IF EXISTS "rates_update" ON public.rates;
CREATE POLICY "rates_update" ON public.rates FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(),
    ARRAY['super_admin','admin','operations_manager','operations_agent']::public.app_role[]));
