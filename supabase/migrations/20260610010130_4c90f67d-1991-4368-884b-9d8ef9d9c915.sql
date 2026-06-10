SET session_replication_role = replica;

DO $do$
DECLARE
  v_cust uuid[]; v_sup uuid[];
  v_cust_cnt int; rate_cnt int;
  q_status text[]; b_status text[]; methods text[] := ARRAY['cash','bank_transfer','card','online','cheque'];
  i int; j int; k int; pick int; n_items int; nights int; rooms int;
  qid uuid; bid uuid; iid uuid; ord_id uuid; pay_id uuid; cust uuid;
  cur text; st text; v_notes text; rec_hotel text;
  fx numeric; cost numeric; sell numeric; tax numeric;
  tot_sell numeric; tot_cost numeric; tot_tax numeric; paid numeric; amt numeric; a1 numeric;
  qdate date; bdate date; ci date; co date;
  rec record; r record;
  conv_cnt int := 0; bno int := 0; inv_no int := 0; rcpt_no int := 0;
  pyb_no int := 0; po_no int := 0; spay_no int := 0; split_cnt int := 0;
BEGIN
  CREATE TEMP TABLE tr ON COMMIT DROP AS
    SELECT r2.id rate_id, r2.hotel_id, r2.room_type_id, r2.supplier_id, r2.valid_from, r2.valid_to,
           h.name_en hotel_name, p.occupancy_type occ, p.cost_price, p.selling_price,
           row_number() OVER () rn
    FROM rates r2
    JOIN hotels h ON h.id = r2.hotel_id
    JOIN rate_occupancy_prices p ON p.rate_id = r2.id AND p.occupancy_type IN ('DBL','TPL','QUAD')
    WHERE r2.status = 'approved' AND r2.deleted_at IS NULL;
  SELECT count(*) INTO rate_cnt FROM tr;

  CREATE TEMP TABLE conv (c_qid uuid, c_cust uuid, c_cur text, c_fx numeric, c_qdate date) ON COMMIT DROP;
  CREATE TEMP TABLE binfo (b_id uuid, b_cust uuid, b_st text, b_cur text, b_fx numeric, b_date date) ON COMMIT DROP;
  CREATE TEMP TABLE tinv (i_id uuid, i_cust uuid, i_total numeric, i_paid numeric, i_st text, i_date date, i_cur text, i_fx numeric) ON COMMIT DROP;
  CREATE TEMP TABLE tpyb (p_id uuid, p_sup uuid, p_amt numeric, p_paid numeric, p_st text, p_cur text, p_fx numeric) ON COMMIT DROP;

  SELECT array_agg(id) INTO v_cust FROM customers WHERE status='active' AND deleted_at IS NULL;
  v_cust_cnt := array_length(v_cust,1);
  SELECT array_agg(id) INTO v_sup FROM suppliers WHERE status='active' AND deleted_at IS NULL;

  q_status := array_fill('draft'::text, ARRAY[25])
    || array_fill('pending_approval'::text, ARRAY[20])
    || array_fill('approved'::text, ARRAY[25])
    || array_fill('sent'::text, ARRAY[35])
    || array_fill('accepted'::text, ARRAY[65])
    || array_fill('rejected'::text, ARRAY[15])
    || array_fill('expired'::text, ARRAY[10])
    || array_fill('cancelled'::text, ARRAY[5]);

  FOR i IN 1..200 LOOP
    st := q_status[i];
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    IF random() < 0.85 THEN cur := 'SAR'; fx := 1;
    ELSIF random() < 0.7 THEN cur := 'USD'; fx := 3.75;
    ELSE cur := 'EUR'; fx := 4.05; END IF;
    qdate := current_date - floor(random()*180)::int;
    qid := gen_random_uuid();
    tot_sell := 0; tot_cost := 0; rec_hotel := NULL;

    INSERT INTO quotations(id, quotation_no, customer_id, status, currency, quotation_date, travel_date, expiry_date, created_at, updated_at)
    VALUES (qid, 'QUO-'||lpad(i::text,5,'0'), cust, st, cur, qdate, qdate+25, qdate+14, qdate::timestamptz, qdate::timestamptz);

    n_items := 1 + floor(random()*3)::int;
    FOR j IN 1..n_items LOOP
      pick := 1 + floor(random()*rate_cnt)::int;
      SELECT * INTO STRICT r FROM tr WHERE rn = pick;
      nights := 3 + floor(random()*8)::int;
      ci := greatest(r.valid_from, qdate + 20);
      IF ci + nights > r.valid_to THEN ci := r.valid_from; END IF;
      IF ci + nights > r.valid_to THEN nights := greatest(1, r.valid_to - ci); END IF;
      co := ci + nights;
      rooms := 5 + floor(random()*26)::int;
      cost := round(r.cost_price / fx, 2);
      sell := round(r.selling_price / fx, 2);
      tax := round(sell*nights*rooms*0.15, 2);
      IF rec_hotel IS NULL THEN rec_hotel := r.hotel_name; END IF;
      INSERT INTO quotation_items(quotation_id, hotel_id, rate_id, room_type_id, occupancy_type, check_in, check_out, nights, rooms, cost_price, selling_price, margin, taxes, fees, total_cost, total_selling, created_at, updated_at)
      VALUES (qid, r.hotel_id, r.rate_id, r.room_type_id, r.occ, ci, co, nights, rooms, cost, sell,
              round((sell-cost)*nights*rooms,2), tax, 0, round(cost*nights*rooms,2), round(sell*nights*rooms + tax,2),
              qdate::timestamptz, qdate::timestamptz);
      tot_sell := tot_sell + sell*nights*rooms + tax;
      tot_cost := tot_cost + cost*nights*rooms;
    END LOOP;

    UPDATE quotations SET notes = 'Recommended hotel: '||rec_hotel||'. Expected profit: '||round(tot_sell - tot_cost - tot_sell*0.15/1.15, 2)||' '||cur
    WHERE id = qid;

    IF st IN ('pending_approval','approved','rejected') THEN
      INSERT INTO approval_requests(entity_type, entity_id, status, submitted_at, approved_at, rejected_at, approval_notes, created_at, updated_at)
      VALUES ('quotation', qid,
        CASE st WHEN 'pending_approval' THEN 'submitted' WHEN 'approved' THEN 'approved' ELSE 'rejected' END,
        qdate::timestamptz + interval '2 hours',
        CASE WHEN st='approved' THEN qdate::timestamptz + interval '1 day' END,
        CASE WHEN st='rejected' THEN qdate::timestamptz + interval '1 day' END,
        CASE WHEN st='rejected' THEN 'Margin below approved threshold; revise pricing.' END,
        qdate::timestamptz, qdate::timestamptz + interval '1 day');
    END IF;

    IF st = 'accepted' AND conv_cnt < 40 THEN
      conv_cnt := conv_cnt + 1;
      INSERT INTO conv VALUES (qid, cust, cur, fx, qdate);
    END IF;
  END LOOP;

  b_status := array_fill('confirmed'::text, ARRAY[20]) || array_fill('checked_out'::text, ARRAY[15]) || array_fill('checked_in'::text, ARRAY[5])
    || array_fill('draft'::text, ARRAY[15]) || array_fill('pending_confirmation'::text, ARRAY[15])
    || array_fill('confirmed'::text, ARRAY[10]) || array_fill('checked_in'::text, ARRAY[5]) || array_fill('checked_out'::text, ARRAY[15])
    || array_fill('cancelled'::text, ARRAY[15]) || array_fill('no_show'::text, ARRAY[5]);

  FOR rec IN SELECT * FROM conv LOOP
    bno := bno + 1;
    st := b_status[bno];
    bid := gen_random_uuid();
    bdate := rec.c_qdate + 3;
    INSERT INTO bookings(id, booking_no, quotation_id, customer_id, status, currency, booking_date,
      confirmed_at, checked_in_at, checked_out_at, cancelled_at, no_show_at, cancellation_reason, created_at, updated_at)
    VALUES (bid, 'BK-'||lpad(bno::text,5,'0'), rec.c_qid, rec.c_cust, st, rec.c_cur, bdate,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      CASE WHEN st IN ('checked_in','checked_out') THEN (bdate+17)::timestamptz END,
      CASE WHEN st = 'checked_out' THEN (bdate+24)::timestamptz END,
      CASE WHEN st = 'cancelled' THEN (bdate+3)::timestamptz END,
      CASE WHEN st = 'no_show' THEN (bdate+17)::timestamptz END,
      CASE WHEN st='cancelled' THEN 'Customer cancelled - cancellation charges applied per policy'
           WHEN st='no_show' THEN 'Group did not arrive on scheduled date' END,
      bdate::timestamptz, bdate::timestamptz);

    INSERT INTO booking_rooms(booking_id, quotation_item_id, hotel_id, rate_id, room_type_id, supplier_id, occupancy_type, check_in, check_out, nights, rooms, cost_price, selling_price, margin, taxes, fees, total_cost, total_selling, confirmation_status, supplier_confirmation_no, room_confirmed_at, created_at, updated_at)
    SELECT bid, qi.id, qi.hotel_id, qi.rate_id, qi.room_type_id, rt2.supplier_id, qi.occupancy_type, qi.check_in, qi.check_out, qi.nights, qi.rooms, qi.cost_price, qi.selling_price, qi.margin, qi.taxes, qi.fees, qi.total_cost, qi.total_selling,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'confirmed' ELSE 'pending' END,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'SUP-CONF-'||(100000+floor(random()*900000))::int END,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      bdate::timestamptz, bdate::timestamptz
    FROM quotation_items qi LEFT JOIN rates rt2 ON rt2.id = qi.rate_id
    WHERE qi.quotation_id = rec.c_qid;

    INSERT INTO binfo VALUES (bid, rec.c_cust, st, rec.c_cur, rec.c_fx, bdate);
  END LOOP;

  FOR i IN (bno+1)..120 LOOP
    bno := bno + 1;
    st := b_status[bno];
    bid := gen_random_uuid();
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    IF random() < 0.9 THEN cur := 'SAR'; fx := 1; ELSE cur := 'USD'; fx := 3.75; END IF;
    bdate := current_date - floor(random()*150)::int;
    INSERT INTO bookings(id, booking_no, customer_id, status, currency, booking_date,
      confirmed_at, checked_in_at, checked_out_at, cancelled_at, no_show_at, cancellation_reason, created_at, updated_at)
    VALUES (bid, 'BK-'||lpad(bno::text,5,'0'), cust, st, cur, bdate,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      CASE WHEN st IN ('checked_in','checked_out') THEN (bdate+17)::timestamptz END,
      CASE WHEN st = 'checked_out' THEN (bdate+24)::timestamptz END,
      CASE WHEN st = 'cancelled' THEN (bdate+3)::timestamptz END,
      CASE WHEN st = 'no_show' THEN (bdate+17)::timestamptz END,
      CASE WHEN st='cancelled' THEN 'Customer cancelled - cancellation charges applied per policy'
           WHEN st='no_show' THEN 'Group did not arrive on scheduled date' END,
      bdate::timestamptz, bdate::timestamptz);

    n_items := 1 + floor(random()*2)::int;
    FOR j IN 1..n_items LOOP
      pick := 1 + floor(random()*rate_cnt)::int;
      SELECT * INTO STRICT r FROM tr WHERE rn = pick;
      nights := 3 + floor(random()*8)::int;
      ci := greatest(r.valid_from, bdate + 15);
      IF ci + nights > r.valid_to THEN ci := r.valid_from; END IF;
      IF ci + nights > r.valid_to THEN nights := greatest(1, r.valid_to - ci); END IF;
      co := ci + nights;
      rooms := 5 + floor(random()*21)::int;
      cost := round(r.cost_price / fx, 2);
      sell := round(r.selling_price / fx, 2);
      tax := round(sell*nights*rooms*0.15, 2);
      INSERT INTO booking_rooms(booking_id, hotel_id, rate_id, room_type_id, supplier_id, occupancy_type, check_in, check_out, nights, rooms, cost_price, selling_price, margin, taxes, fees, total_cost, total_selling, confirmation_status, supplier_confirmation_no, room_confirmed_at, created_at, updated_at)
      VALUES (bid, r.hotel_id, r.rate_id, r.room_type_id, r.supplier_id, r.occ, ci, co, nights, rooms, cost, sell,
        round((sell-cost)*nights*rooms,2), tax, 0, round(cost*nights*rooms,2), round(sell*nights*rooms + tax,2),
        CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'confirmed' ELSE 'pending' END,
        CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'SUP-CONF-'||(100000+floor(random()*900000))::int END,
        CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
        bdate::timestamptz, bdate::timestamptz);
    END LOOP;
    INSERT INTO binfo VALUES (bid, cust, st, cur, fx, bdate);
  END LOOP;

  INSERT INTO booking_guests(booking_id, full_name, guest_type, nationality, passport_no, is_lead, created_at, updated_at)
  SELECT b.b_id,
    (ARRAY['Mohammed','Ahmed','Abdullah','Omar','Yusuf','Ibrahim','Hamza','Bilal','Imran','Tariq','Budi','Agus','Mehmet','Mustafa','Mahmoud','Khalid','Fatimah','Aisha','Maryam','Zainab'])[1+floor(random()*20)::int]
      ||' '||(ARRAY['Al-Qahtani','Al-Otaibi','Hassan','Santoso','Wijaya','Khan','Malik','Sheikh','El-Sayed','Abdelrahman','Yilmaz','Demir','Kaya','Al-Harbi','Rahman'])[1+floor(random()*15)::int],
    'adult',
    (ARRAY['Saudi','Indonesian','Pakistani','Egyptian','Turkish'])[1+floor(random()*5)::int],
    'P'||(10000000+floor(random()*89999999))::int,
    gs.n = 1,
    b.b_date::timestamptz, b.b_date::timestamptz
  FROM binfo b CROSS JOIN LATERAL generate_series(1, 2+floor(random()*3)::int) gs(n);

  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, NULL, 'draft', b_date::timestamptz FROM binfo;
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'draft', 'pending_confirmation', b_date::timestamptz + interval '6 hours' FROM binfo WHERE b_st <> 'draft';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'pending_confirmation', 'confirmed', (b_date+1)::timestamptz FROM binfo WHERE b_st IN ('confirmed','checked_in','checked_out','no_show');
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'confirmed', 'checked_in', (b_date+17)::timestamptz FROM binfo WHERE b_st IN ('checked_in','checked_out');
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'checked_in', 'checked_out', (b_date+24)::timestamptz FROM binfo WHERE b_st = 'checked_out';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, reason, created_at)
  SELECT b_id, 'pending_confirmation', 'cancelled', 'Customer cancelled - cancellation charges applied per policy', (b_date+3)::timestamptz FROM binfo WHERE b_st = 'cancelled';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, reason, created_at)
  SELECT b_id, 'confirmed', 'no_show', 'Group did not arrive on scheduled date', (b_date+17)::timestamptz FROM binfo WHERE b_st = 'no_show';

  INSERT INTO attachments(entity_type, entity_id, file_name, original_name, mime_type, file_size, storage_path, uploaded_at, created_at, updated_at)
  SELECT 'booking', b_id, 'voucher.pdf', 'supplier-voucher.pdf', 'application/pdf',
         (150000+floor(random()*500000))::bigint, 'attachments/bookings/'||b_id||'/voucher.pdf',
         (b_date+1)::timestamptz, (b_date+1)::timestamptz, (b_date+1)::timestamptz
  FROM binfo WHERE b_st IN ('confirmed','checked_in','checked_out');

  FOR rec IN SELECT * FROM binfo WHERE b_st IN ('confirmed','checked_in','checked_out') LOOP
    inv_no := inv_no + 1;
    iid := gen_random_uuid();
    st := CASE WHEN rec.b_st='checked_out' THEN 'paid'
               WHEN rec.b_st='checked_in' THEN 'partially_paid'
               ELSE CASE WHEN inv_no % 3 = 0 THEN 'partially_paid' ELSE 'issued' END END;
    SELECT COALESCE(sum(br.total_selling - br.taxes),0), COALESCE(sum(br.taxes),0)
      INTO tot_sell, tot_tax FROM booking_rooms br WHERE br.booking_id = rec.b_id;
    paid := CASE st WHEN 'paid' THEN round(tot_sell+tot_tax,2) WHEN 'partially_paid' THEN round((tot_sell+tot_tax)*0.4,2) ELSE 0 END;
    INSERT INTO invoices(id, invoice_no, booking_id, customer_id, status, invoice_date, due_date, currency, exchange_rate, subtotal, taxes, fees, discount, total_amount, paid_amount, issued_at, created_at, updated_at)
    VALUES (iid, 'INV-'||lpad(inv_no::text,5,'0'), rec.b_id, rec.b_cust, st, rec.b_date+2, rec.b_date+16, rec.b_cur, rec.b_fx,
            round(tot_sell,2), round(tot_tax,2), 0, 0, round(tot_sell+tot_tax,2), paid,
            (rec.b_date+2)::timestamptz, (rec.b_date+2)::timestamptz, (rec.b_date+2)::timestamptz);
    INSERT INTO invoice_items(invoice_id, booking_room_id, description_en, description_ar, quantity, unit_price, taxes, fees, line_total, created_at, updated_at)
    SELECT iid, br.id, h.name_en||' - '||br.occupancy_type||' '||br.check_in||' to '||br.check_out, h.name_ar,
           br.nights*br.rooms, br.selling_price, br.taxes, br.fees, br.total_selling,
           (rec.b_date+2)::timestamptz, (rec.b_date+2)::timestamptz
    FROM booking_rooms br JOIN hotels h ON h.id = br.hotel_id WHERE br.booking_id = rec.b_id;
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, NULL, 'draft', (rec.b_date+2)::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'draft', 'issued', (rec.b_date+2)::timestamptz + interval '2 hours');
    IF st = 'partially_paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'partially_paid', (rec.b_date+8)::timestamptz);
    ELSIF st = 'paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'partially_paid', (rec.b_date+8)::timestamptz);
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'partially_paid', 'paid', (rec.b_date+14)::timestamptz);
    END IF;
    INSERT INTO tinv VALUES (iid, rec.b_cust, round(tot_sell+tot_tax,2), paid, st, rec.b_date+2, rec.b_cur, rec.b_fx);
  END LOOP;

  FOR rec IN SELECT * FROM binfo WHERE b_st = 'cancelled' LOOP
    inv_no := inv_no + 1;
    iid := gen_random_uuid();
    st := CASE WHEN inv_no % 3 = 0 THEN 'issued' ELSE 'paid' END;
    SELECT COALESCE(sum(br.selling_price * br.rooms),0) INTO tot_sell FROM booking_rooms br WHERE br.booking_id = rec.b_id;
    IF tot_sell <= 0 THEN tot_sell := 1000; END IF;
    tot_tax := round(tot_sell*0.15,2);
    paid := CASE WHEN st='paid' THEN round(tot_sell+tot_tax,2) ELSE 0 END;
    INSERT INTO invoices(id, invoice_no, booking_id, customer_id, status, invoice_date, due_date, currency, exchange_rate, subtotal, taxes, fees, discount, total_amount, paid_amount, notes, issued_at, created_at, updated_at)
    VALUES (iid, 'INV-'||lpad(inv_no::text,5,'0'), rec.b_id, rec.b_cust, st, rec.b_date+4, rec.b_date+18, rec.b_cur, rec.b_fx,
            round(tot_sell,2), tot_tax, 0, 0, round(tot_sell+tot_tax,2), paid, 'Cancellation charges - one night penalty per policy',
            (rec.b_date+4)::timestamptz, (rec.b_date+4)::timestamptz, (rec.b_date+4)::timestamptz);
    INSERT INTO invoice_items(invoice_id, description_en, description_ar, quantity, unit_price, taxes, fees, line_total, created_at, updated_at)
    VALUES (iid, 'Cancellation charges - 1 night penalty', 'رسوم إلغاء - غرامة ليلة واحدة', 1, round(tot_sell,2), tot_tax, 0, round(tot_sell+tot_tax,2), (rec.b_date+4)::timestamptz, (rec.b_date+4)::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, NULL, 'draft', (rec.b_date+4)::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'draft', 'issued', (rec.b_date+4)::timestamptz + interval '1 hour');
    IF st='paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'paid', (rec.b_date+10)::timestamptz);
    END IF;
    INSERT INTO tinv VALUES (iid, rec.b_cust, round(tot_sell+tot_tax,2), paid, st, rec.b_date+4, rec.b_cur, rec.b_fx);
  END LOOP;

  WHILE inv_no < 150 LOOP
    inv_no := inv_no + 1;
    iid := gen_random_uuid();
    SELECT count(*) INTO k FROM invoices WHERE status='draft';
    IF k < 20 THEN st := 'draft';
    ELSE
      SELECT count(*) INTO k FROM invoices WHERE status='cancelled';
      IF k < 10 THEN st := 'cancelled';
      ELSE
        SELECT count(*) INTO k FROM invoices WHERE status='issued';
        IF k < 40 THEN st := 'issued';
        ELSE
          SELECT count(*) INTO k FROM invoices WHERE status='partially_paid';
          IF k < 30 THEN st := 'partially_paid'; ELSE st := 'paid'; END IF;
        END IF;
      END IF;
    END IF;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date - floor(random()*150)::int;
    tot_sell := round((2000 + random()*38000)::numeric, 2);
    tot_tax := round(tot_sell*0.15,2);
    paid := CASE st WHEN 'paid' THEN round(tot_sell+tot_tax,2) WHEN 'partially_paid' THEN round((tot_sell+tot_tax)*0.5,2) ELSE 0 END;
    INSERT INTO invoices(id, invoice_no, customer_id, status, invoice_date, due_date, currency, exchange_rate, subtotal, taxes, fees, discount, total_amount, paid_amount, cancellation_reason, issued_at, cancelled_at, created_at, updated_at)
    VALUES (iid, 'INV-'||lpad(inv_no::text,5,'0'), cust, st, qdate, qdate+14, 'SAR', 1,
            tot_sell, tot_tax, 0, 0, round(tot_sell+tot_tax,2), paid,
            CASE WHEN st='cancelled' THEN 'Issued in error - duplicate of another invoice' END,
            CASE WHEN st <> 'draft' THEN qdate::timestamptz + interval '1 hour' END,
            CASE WHEN st='cancelled' THEN (qdate+2)::timestamptz END,
            qdate::timestamptz, qdate::timestamptz);
    INSERT INTO invoice_items(invoice_id, description_en, description_ar, quantity, unit_price, taxes, fees, line_total, created_at, updated_at)
    VALUES (iid, (ARRAY['Group coordination service fee','Late checkout charges','Meal plan upgrade','Extra bed supplement','Early check-in supplement'])[1+floor(random()*5)::int],
            'رسوم خدمات إضافية', 1, tot_sell, tot_tax, 0, round(tot_sell+tot_tax,2), qdate::timestamptz, qdate::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, NULL, 'draft', qdate::timestamptz);
    IF st <> 'draft' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'draft', CASE WHEN st='cancelled' THEN 'cancelled' ELSE 'issued' END, qdate::timestamptz + interval '1 hour');
    END IF;
    IF st IN ('partially_paid','paid') THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', st, (qdate+6)::timestamptz);
    END IF;
    IF st <> 'cancelled' THEN
      INSERT INTO tinv VALUES (iid, cust, round(tot_sell+tot_tax,2), paid, st, qdate, 'SAR', 1);
    END IF;
  END LOOP;

  FOR rec IN SELECT * FROM tinv WHERE i_paid > 0 ORDER BY i_date LOOP
    IF rec.i_st = 'paid' AND split_cnt < 30 THEN
      split_cnt := split_cnt + 1;
      a1 := round(rec.i_paid*0.6, 2);
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad(rcpt_no::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+4, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, a1, a1, (rec.i_date+4)::timestamptz, (rec.i_date+4)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, a1, (rec.i_date+4)::timestamptz);
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad(rcpt_no::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+10, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, rec.i_paid - a1, rec.i_paid - a1, (rec.i_date+10)::timestamptz, (rec.i_date+10)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, rec.i_paid - a1, (rec.i_date+10)::timestamptz);
    ELSE
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad(rcpt_no::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+6, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, rec.i_paid, rec.i_paid, (rec.i_date+6)::timestamptz, (rec.i_date+6)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, rec.i_paid, (rec.i_date+6)::timestamptz);
    END IF;
  END LOOP;

  WHILE rcpt_no < 170 LOOP
    rcpt_no := rcpt_no + 1;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date - floor(random()*120)::int;
    amt := round((5000 + random()*45000)::numeric, 2);
    INSERT INTO receipts(receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, notes, created_at, updated_at)
    VALUES ('RCT-'||lpad(rcpt_no::text,5,'0'), cust, 'confirmed', qdate, methods[1+(rcpt_no % 5)],
            'REF-'||(100000+floor(random()*900000))::int, 'SAR', 1, amt, 0, 'Advance payment on account', qdate::timestamptz, qdate::timestamptz);
  END LOOP;

  WHILE rcpt_no < 180 LOOP
    rcpt_no := rcpt_no + 1;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date - floor(random()*120)::int;
    amt := round((3000 + random()*20000)::numeric, 2);
    INSERT INTO receipts(receipt_no, customer_id, status, receipt_date, payment_method, currency, exchange_rate, amount, allocated_amount, cancellation_reason, cancelled_at, created_at, updated_at)
    VALUES ('RCT-'||lpad(rcpt_no::text,5,'0'), cust, 'cancelled', qdate, methods[1+(rcpt_no % 5)], 'SAR', 1, amt, 0,
            'Entered with wrong amount - re-issued correctly', (qdate+1)::timestamptz, qdate::timestamptz, (qdate+1)::timestamptz);
  END LOOP;

  k := 0;
  FOR rec IN SELECT br.id brid, br.booking_id bkid, br.supplier_id sup, br.total_cost amt2, b2.b_cur, b2.b_fx, br.check_in
             FROM booking_rooms br JOIN binfo b2 ON b2.b_id = br.booking_id
             WHERE b2.b_st IN ('confirmed','checked_in','checked_out') AND br.supplier_id IS NOT NULL AND br.total_cost > 0
             ORDER BY random() LIMIT 105 LOOP
    k := k + 1; pyb_no := pyb_no + 1;
    st := CASE WHEN k <= 40 THEN 'paid' WHEN k <= 65 THEN 'partially_paid' WHEN k <= 95 THEN 'pending' ELSE 'cancelled' END;
    paid := CASE st WHEN 'paid' THEN rec.amt2 WHEN 'partially_paid' THEN round(rec.amt2*0.4,2) ELSE 0 END;
    v_notes := CASE WHEN st='pending' AND k > 85 THEN 'On hold - pending supplier statement reconciliation' END;
    iid := gen_random_uuid();
    INSERT INTO supplier_payables(id, payable_no, supplier_id, booking_id, booking_room_id, status, currency, exchange_rate, amount, paid_amount, due_date, notes, cancellation_reason, created_at, updated_at)
    VALUES (iid, 'PYB-'||lpad(pyb_no::text,5,'0'), rec.sup, rec.bkid, rec.brid, st, rec.b_cur, rec.b_fx, rec.amt2, paid, rec.check_in,
            v_notes, CASE WHEN st='cancelled' THEN 'Room cancelled with supplier free of charge' END,
            now() - interval '60 days', now() - interval '30 days');
    INSERT INTO tpyb VALUES (iid, rec.sup, rec.amt2, paid, st, rec.b_cur, rec.b_fx);
  END LOOP;

  WHILE pyb_no < 120 LOOP
    pyb_no := pyb_no + 1; k := k + 1;
    st := CASE WHEN pyb_no <= 115 THEN 'pending' ELSE 'cancelled' END;
    v_notes := CASE WHEN st='pending' AND pyb_no % 2 = 0 THEN 'On hold - awaiting credit note from supplier' END;
    amt := round((3000 + random()*30000)::numeric, 2);
    iid := gen_random_uuid();
    INSERT INTO supplier_payables(id, payable_no, supplier_id, status, currency, exchange_rate, amount, paid_amount, due_date, notes, cancellation_reason, created_at, updated_at)
    VALUES (iid, 'PYB-'||lpad(pyb_no::text,5,'0'), v_sup[1 + floor(random()*array_length(v_sup,1))::int], st, 'SAR', 1, amt, 0,
            current_date + floor(random()*30)::int, v_notes, CASE WHEN st='cancelled' THEN 'Service order withdrawn' END,
            now() - interval '45 days', now() - interval '20 days');
    INSERT INTO tpyb VALUES (iid, v_sup[1], amt, 0, st, 'SAR', 1);
  END LOOP;

  FOR rec IN SELECT p_sup, p_cur, p_fx, array_agg(p_id) pids, array_agg(p_paid) paids
             FROM tpyb WHERE p_st = 'paid' GROUP BY p_sup, p_cur, p_fx LOOP
    i := 1;
    WHILE i <= array_length(rec.pids,1) LOOP
      po_no := po_no + 1; ord_id := gen_random_uuid();
      amt := 0;
      FOR j IN i..least(i+2, array_length(rec.pids,1)) LOOP amt := amt + rec.paids[j]; END LOOP;
      INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, approved_at, created_at, updated_at)
      VALUES (ord_id, 'PO-'||lpad(po_no::text,5,'0'), rec.p_sup, 'paid', rec.p_cur, rec.p_fx, round(amt,2),
              now() - interval '25 days', now() - interval '28 days', now() - interval '20 days');
      FOR j IN i..least(i+2, array_length(rec.pids,1)) LOOP
        INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.pids[j], rec.paids[j]);
        IF split_cnt < 45 THEN
          split_cnt := split_cnt + 1;
          a1 := round(rec.paids[j]*0.6, 2);
          spay_no := spay_no + 1; pay_id := gen_random_uuid();
          INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
          VALUES (pay_id, 'SPAY-'||lpad(spay_no::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 22, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, a1, now() - interval '22 days', now() - interval '22 days');
          INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.pids[j], a1);
          spay_no := spay_no + 1; pay_id := gen_random_uuid();
          INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
          VALUES (pay_id, 'SPAY-'||lpad(spay_no::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 15, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.paids[j] - a1, now() - interval '15 days', now() - interval '15 days');
          INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.pids[j], rec.paids[j] - a1);
        ELSE
          spay_no := spay_no + 1; pay_id := gen_random_uuid();
          INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
          VALUES (pay_id, 'SPAY-'||lpad(spay_no::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 18, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.paids[j], now() - interval '18 days', now() - interval '18 days');
          INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.pids[j], rec.paids[j]);
        END IF;
      END LOOP;
      i := i + 3;
    END LOOP;
  END LOOP;

  FOR rec IN SELECT p_sup, p_cur, p_fx, array_agg(p_id) pids, array_agg(p_paid) paids
             FROM tpyb WHERE p_st = 'partially_paid' GROUP BY p_sup, p_cur, p_fx LOOP
    i := 1;
    WHILE i <= array_length(rec.pids,1) LOOP
      po_no := po_no + 1; ord_id := gen_random_uuid();
      amt := 0;
      FOR j IN i..least(i+2, array_length(rec.pids,1)) LOOP amt := amt + rec.paids[j]; END LOOP;
      INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, approved_at, created_at, updated_at)
      VALUES (ord_id, 'PO-'||lpad(po_no::text,5,'0'), rec.p_sup, 'approved', rec.p_cur, rec.p_fx, round(amt,2),
              now() - interval '12 days', now() - interval '14 days', now() - interval '10 days');
      FOR j IN i..least(i+2, array_length(rec.pids,1)) LOOP
        INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.pids[j], rec.paids[j]);
        spay_no := spay_no + 1; pay_id := gen_random_uuid();
        INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
        VALUES (pay_id, 'SPAY-'||lpad(spay_no::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 8, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.paids[j], now() - interval '8 days', now() - interval '8 days');
        INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.pids[j], rec.paids[j]);
      END LOOP;
      i := i + 3;
    END LOOP;
  END LOOP;

  k := 0;
  FOR rec IN SELECT t.p_id, t.p_sup sup2, t.p_amt, t.p_cur, t.p_fx
             FROM tpyb t WHERE t.p_st = 'pending' AND t.p_sup IS NOT NULL ORDER BY random() LOOP
    EXIT WHEN po_no >= 60;
    k := k + 1;
    po_no := po_no + 1; ord_id := gen_random_uuid();
    st := CASE WHEN k <= 10 THEN 'draft' WHEN k <= 20 THEN 'pending_approval' WHEN k <= 25 THEN 'cancelled' ELSE 'draft' END;
    INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, created_at, updated_at)
    VALUES (ord_id, 'PO-'||lpad(po_no::text,5,'0'), rec.sup2, st, rec.p_cur, rec.p_fx, rec.p_amt,
            now() - interval '5 days', now() - interval '3 days');
    INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.p_id, rec.p_amt);
  END LOOP;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'sales.agent1@uat.example.com', a.act, 'quotations', qq.id::text,
         jsonb_build_object('quotation_no', qq.quotation_no, 'channel', a.chan, 'source', 'uat_seed_phase3'),
         qq.created_at + a.ofs
  FROM quotations qq
  CROSS JOIN LATERAL (VALUES
    ('create', 'app', interval '0 hours'),
    ('pdf_export', 'pdf', interval '3 hours'),
    ('whatsapp_send', 'whatsapp', interval '4 hours'),
    ('email_send', 'email', interval '5 hours')
  ) a(act, chan, ofs)
  WHERE a.act = 'create' OR qq.status IN ('sent','accepted','approved','expired');

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'ops.manager@uat.example.com',
         CASE bb.status WHEN 'confirmed' THEN 'confirm' WHEN 'checked_in' THEN 'check_in' WHEN 'checked_out' THEN 'check_out'
                        WHEN 'cancelled' THEN 'cancel' WHEN 'no_show' THEN 'no_show' ELSE 'create' END,
         'bookings', bb.id::text, jsonb_build_object('booking_no', bb.booking_no, 'source', 'uat_seed_phase3'),
         bb.created_at + interval '1 day'
  FROM bookings bb;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.agent1@uat.example.com', a.act, 'invoices', iv.id::text,
         jsonb_build_object('invoice_no', iv.invoice_no, 'channel', a.chan, 'source', 'uat_seed_phase3'),
         iv.created_at + a.ofs
  FROM invoices iv
  CROSS JOIN LATERAL (VALUES
    ('issue', 'app', interval '1 hour'),
    ('pdf_export', 'pdf', interval '2 hours'),
    ('email_send', 'email', interval '3 hours'),
    ('whatsapp_send', 'whatsapp', interval '4 hours')
  ) a(act, chan, ofs)
  WHERE iv.status <> 'draft';

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.agent1@uat.example.com', 'receipt_issued', 'receipts', rr.id::text,
         jsonb_build_object('receipt_no', rr.receipt_no, 'method', rr.payment_method, 'source', 'uat_seed_phase3'),
         rr.created_at + interval '10 minutes'
  FROM receipts rr;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.manager@uat.example.com', a.act, 'payment_orders', po.id::text,
         jsonb_build_object('order_no', po.order_no, 'source', 'uat_seed_phase3'),
         po.created_at + a.ofs
  FROM payment_orders po
  CROSS JOIN LATERAL (VALUES ('submit', interval '1 hour'), ('approve', interval '1 day')) a(act, ofs)
  WHERE (a.act = 'submit' AND po.status <> 'draft') OR (a.act = 'approve' AND po.status IN ('approved','paid'));

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.manager@uat.example.com', 'payment_recorded', 'supplier_payments', sp.id::text,
         jsonb_build_object('payment_no', sp.payment_no, 'method', sp.payment_method, 'source', 'uat_seed_phase3'),
         sp.created_at + interval '5 minutes'
  FROM supplier_payments sp;

  INSERT INTO counters(key, prefix, current_value, padding) VALUES
    ('quotation','QUO',200,5), ('booking','BK',bno,5), ('invoice','INV',inv_no,5),
    ('receipt','RCT',rcpt_no,5), ('payable','PYB',pyb_no,5), ('payment_order','PO',po_no,5),
    ('supplier_payment','SPAY',spay_no,5)
  ON CONFLICT (key) DO NOTHING;
END $do$;

SET session_replication_role = origin;