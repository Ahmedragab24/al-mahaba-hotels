-- Update create_rate_version function to copy the new columns
CREATE OR REPLACE FUNCTION public.create_rate_version(_rate_id uuid, _changes jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_old public.rates; v_new_id uuid;
BEGIN
  IF NOT public.has_any_role(auth.uid(), ARRAY['super_admin','admin','operations_manager','operations_agent']::app_role[]) THEN
    RAISE EXCEPTION 'APPROVAL_FORBIDDEN: you do not have permission to version rates';
  END IF;
  SELECT * INTO v_old FROM public.rates WHERE id = _rate_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'RATE_NOT_FOUND'; END IF;

  INSERT INTO public.rates (
    code, hotel_id, supplier_id, contract_id, room_type_id, view_id,
    meal_plan, currency, valid_from, valid_to,
    cost_per_night, selling_price, markup_pct,
    min_nights, max_nights, release_days, allotment,
    notes_en, notes_ar, cancellation_policy_en, cancellation_policy_ar,
    status, is_direct, version, parent_rate_id, created_by,
    allow_extra_bed, extra_bed_price, extra_bed_limit,
    meals_included, breakfast_price, half_board_price, full_board_price
  ) VALUES (
    public.next_code('rate'),
    COALESCE((_changes->>'hotel_id')::uuid, v_old.hotel_id),
    CASE WHEN _changes ? 'supplier_id' THEN NULLIF(_changes->>'supplier_id','')::uuid ELSE v_old.supplier_id END,
    CASE WHEN _changes ? 'contract_id' THEN NULLIF(_changes->>'contract_id','')::uuid ELSE v_old.contract_id END,
    COALESCE((_changes->>'room_type_id')::uuid, v_old.room_type_id),
    CASE WHEN _changes ? 'view_id' THEN NULLIF(_changes->>'view_id','')::uuid ELSE v_old.view_id END,
    COALESCE((_changes->>'meal_plan')::rate_board, v_old.meal_plan),
    COALESCE(_changes->>'currency', v_old.currency)::char(3),
    COALESCE((_changes->>'valid_from')::date, v_old.valid_from),
    COALESCE((_changes->>'valid_to')::date, v_old.valid_to),
    COALESCE((_changes->>'cost_per_night')::numeric, v_old.cost_per_night),
    COALESCE((_changes->>'selling_price')::numeric, v_old.selling_price),
    COALESCE((_changes->>'markup_pct')::numeric, v_old.markup_pct),
    COALESCE((_changes->>'min_nights')::int, v_old.min_nights),
    COALESCE((_changes->>'max_nights')::int, v_old.max_nights),
    COALESCE((_changes->>'release_days')::int, v_old.release_days),
    COALESCE((_changes->>'allotment')::int, v_old.allotment),
    COALESCE(_changes->>'notes_en', v_old.notes_en),
    COALESCE(_changes->>'notes_ar', v_old.notes_ar),
    COALESCE(_changes->>'cancellation_policy_en', v_old.cancellation_policy_en),
    COALESCE(_changes->>'cancellation_policy_ar', v_old.cancellation_policy_ar),
    'draft'::approval_status,
    COALESCE((_changes->>'is_direct')::boolean, v_old.is_direct),
    v_old.version + 1, v_old.id, auth.uid(),
    COALESCE((_changes->>'allow_extra_bed')::boolean, v_old.allow_extra_bed),
    COALESCE((_changes->>'extra_bed_price')::numeric, v_old.extra_bed_price),
    COALESCE((_changes->>'extra_bed_limit')::int, v_old.extra_bed_limit),
    COALESCE((_changes->>'meals_included')::boolean, v_old.meals_included),
    COALESCE((_changes->>'breakfast_price')::numeric, v_old.breakfast_price),
    COALESCE((_changes->>'half_board_price')::numeric, v_old.half_board_price),
    COALESCE((_changes->>'full_board_price')::numeric, v_old.full_board_price)
  ) RETURNING id INTO v_new_id;

  UPDATE public.rates SET superseded_at = now(), superseded_by = auth.uid() WHERE id = v_old.id;
  PERFORM public.log_audit('version','rates', v_new_id::text, to_jsonb(v_old), NULL,
    jsonb_build_object('parent_rate_id', v_old.id, 'version', v_old.version + 1));
  RETURN v_new_id;
END $$;
