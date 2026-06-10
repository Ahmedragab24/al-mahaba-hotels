-- 1) Harden record_successful_login: only the signed-in user can reset their own lock state
CREATE OR REPLACE FUNCTION public.record_successful_login(_user_id uuid, _ip text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'NOT_ALLOWED: can only record login for the current user';
  END IF;
  UPDATE public.profiles
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login_at = now(),
         last_login_ip = _ip
   WHERE id = _user_id;
  PERFORM public.log_audit('login', 'auth', _user_id::text, NULL, NULL, jsonb_build_object('ip', _ip));
END $function$;

-- 2) Revoke API access to internal SECURITY DEFINER functions (still work inside triggers/definer chains)
REVOKE EXECUTE ON FUNCTION public.record_successful_login(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit(text, text, text, jsonb, jsonb, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_code(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_audit_row() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_room_type_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_contract_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_season_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_hotel_tax_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_customer_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_hotel_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_rate_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_supplier_code() FROM anon, authenticated, PUBLIC;

-- 3) Lock the counters table away from direct API access (managed only via next_code)
REVOKE ALL ON public.counters FROM anon, authenticated;
GRANT ALL ON public.counters TO service_role;