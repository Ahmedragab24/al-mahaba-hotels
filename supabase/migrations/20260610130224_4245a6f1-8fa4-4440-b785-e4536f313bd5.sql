
REVOKE EXECUTE ON FUNCTION public.is_supplier_user(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_supplier_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalize_supplier_application(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_supplier_application(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_supplier_user(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_supplier_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finalize_supplier_application(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_supplier_application(uuid, text) TO authenticated, service_role;
