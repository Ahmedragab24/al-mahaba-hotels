
CREATE OR REPLACE FUNCTION public.record_successful_login(_user_id uuid, _ip text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login_at = now(),
         last_login_ip = _ip
   WHERE id = _user_id;
  PERFORM public.log_audit('login', 'auth', _user_id::text, NULL, NULL, jsonb_build_object('ip', _ip));
END $$;

CREATE OR REPLACE FUNCTION public.record_failed_login(_email text, _ip text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_max int;
  v_dur int;
  v_attempts int;
  v_locked timestamptz;
  v_profile_id uuid;
BEGIN
  SELECT (value::text)::int INTO v_max FROM public.system_settings WHERE key='security.max_failed_attempts';
  SELECT (value::text)::int INTO v_dur FROM public.system_settings WHERE key='security.lock_duration_minutes';
  v_max := COALESCE(v_max, 5);
  v_dur := COALESCE(v_dur, 15);

  SELECT id INTO v_profile_id FROM public.profiles WHERE lower(email) = lower(_email) LIMIT 1;
  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('locked', false, 'attempts', 0);
  END IF;

  UPDATE public.profiles
     SET failed_login_attempts = failed_login_attempts + 1,
         locked_until = CASE WHEN failed_login_attempts + 1 >= v_max
                             THEN now() + (v_dur || ' minutes')::interval
                             ELSE locked_until END
   WHERE id = v_profile_id
   RETURNING failed_login_attempts, locked_until INTO v_attempts, v_locked;

  PERFORM public.log_audit('failed_login', 'auth', v_profile_id::text, NULL, NULL,
    jsonb_build_object('ip', _ip, 'email', _email, 'attempts', v_attempts));

  RETURN jsonb_build_object('locked', v_locked IS NOT NULL AND v_locked > now(),
                            'locked_until', v_locked,
                            'attempts', v_attempts,
                            'max_attempts', v_max);
END $$;

CREATE OR REPLACE FUNCTION public.check_account_lock(_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_locked timestamptz;
BEGIN
  SELECT locked_until INTO v_locked FROM public.profiles
   WHERE lower(email) = lower(_email) LIMIT 1;
  RETURN jsonb_build_object('locked', v_locked IS NOT NULL AND v_locked > now(),
                            'locked_until', v_locked);
END $$;

REVOKE EXECUTE ON FUNCTION public.record_successful_login(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_account_lock(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_successful_login(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_failed_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_account_lock(text) TO anon, authenticated;
