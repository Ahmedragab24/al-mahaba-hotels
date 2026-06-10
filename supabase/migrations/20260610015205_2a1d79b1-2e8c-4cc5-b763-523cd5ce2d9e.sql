SET session_replication_role = replica;

DO $do$
DECLARE
  v_cust uuid[]; v_sup uuid[]; v_cust_cnt int; rate_cnt int;
  q_status text[]; b_status text[];
  methods text[] := ARRAY['cash','bank_transfer','card','online','cheque'];
  i int; j int; k int; pick int; n_items int; nights int; rooms int;
  qid uuid; bid uuid; iid uuid; ord_id uuid; pay_id uuid; cust uuid;
  cur text; st text; phase text; rec_hotel text; v_notes text;
  fx numeric; cost numeric; sell numeric; tax numeric;
  tot_sell numeric; tot_cost numeric; tot_tax numeric; paid numeric; amt numeric; a1 numeric;
  qdate date; bdate date; ci date; co date; idate date; ddate date;
  rec record; r record;
  q_base int; b_base int; inv_base int; rct_base int; pyb_base int; po_base int; sp_base int;
  qno int := 0; bno int := 0; inv_no int := 0; rcpt_no int := 0; pyb_no int := 0; po_no int := 0; spay_no int := 0;
  conv_cnt int := 0;
BEGIN
  CREATE TEMP TABLE tr4 ON COMMIT DROP AS
    SELECT r2.id rate_id, r2.hotel_id, r2.room_type_id, r2.supplier_id, r2.valid_from, r2.valid_to,
           h.name_en hotel_name, p.occupancy_type occ, p.cost_price, p.selling_price,
           row_number() OVER () rn
    FROM rates r2
    JOIN hotels h ON h.id = r2.hotel_id
    JOIN rate_occupancy_prices p ON p.rate_id = r2.id AND p.occupancy_type IN ('DBL','TPL','QUAD')
    WHERE r2.status='approved' AND r2.deleted_at IS NULL
      AND r2.valid_from <= current_date - 15 AND r2.valid_to >= current_date + 20;
  SELECT count(*) INTO rate_cnt FROM tr4;

  CREATE TEMP TABLE conv4 (c_qid uuid, c_cust uuid, c_cur text, c_fx numeric, c_qdate date) ON COMMIT DROP;
  CREATE TEMP TABLE binfo4 (b_id uuid, b_cust uuid, b_st text, b_cur text, b_fx numeric, b_date date, b_phase text) ON COMMIT DROP;
  CREATE TEMP TABLE tinv4 (i_id uuid, i_cust uuid, i_total numeric, i_paid numeric, i_st text, i_date date, i_cur text, i_fx numeric) ON COMMIT DROP;
  CREATE TEMP TABLE tpyb4 (p_id uuid, p_sup uuid, p_amt numeric, p_paid numeric, p_st text, p_cur text, p_fx numeric, p_split boolean DEFAULT false) ON COMMIT DROP;
  CREATE TEMP TABLE tq4 (q_id uuid) ON COMMIT DROP;
  CREATE TEMP TABLE trc4 (r_id uuid) ON COMMIT DROP;
  CREATE TEMP TABLE tpo4 (o_id uuid) ON COMMIT DROP;
  CREATE TEMP TABLE tsp4 (s_id uuid) ON COMMIT DROP;

  SELECT array_agg(id) INTO v_cust FROM customers WHERE status='active' AND deleted_at IS NULL;
  v_cust_cnt := array_length(v_cust,1);
  SELECT array_agg(id) INTO v_sup FROM suppliers WHERE status='active' AND deleted_at IS NULL;

  q_base   := COALESCE((SELECT current_value FROM counters WHERE key='quotation'), 0);
  b_base   := COALESCE((SELECT current_value FROM counters WHERE key='booking'), 0);
  inv_base := COALESCE((SELECT current_value FROM counters WHERE key='invoice'), 0);
  rct_base := COALESCE((SELECT current_value FROM counters WHERE key='receipt'), 0);
  pyb_base := COALESCE((SELECT current_value FROM counters WHERE key='payable'), 0);
  po_base  := COALESCE((SELECT current_value FROM counters WHERE key='payment_order'), 0);
  sp_base  := COALESCE((SELECT current_value FROM counters WHERE key='supplier_payment'), 0);

  q_status := array_fill('accepted'::text, ARRAY[150])
    || array_fill('rejected'::text, ARRAY[40])
    || array_fill('expired'::text, ARRAY[35])
    || array_fill('cancelled'::text, ARRAY[15])
    || array_fill('draft'::text, ARRAY[60])
    || array_fill('pending_approval'::text, ARRAY[50])
    || array_fill('approved'::text, ARRAY[40])
    || array_fill('sent'::text, ARRAY[60])
    || array_fill('sent'::text, ARRAY[100])
    || array_fill('approved'::text, ARRAY[50]);

  FOR i IN 1..600 LOOP
    qno := qno + 1;
    st := q_status[i];
    phase := CASE WHEN i <= 240 THEN 'past' WHEN i <= 450 THEN 'now' ELSE 'future' END;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    IF random() < 0.85 THEN cur := 'SAR'; fx := 1;
    ELSIF random() < 0.7 THEN cur := 'USD'; fx := 3.75;
    ELSE cur := 'EUR'; fx := 4.05; END IF;
    qdate := CASE phase
      WHEN 'past' THEN current_date - (8 + floor(random()*8))::int
      WHEN 'now'  THEN current_date - floor(random()*8)::int
      ELSE current_date - floor(random()*4)::int END;
    qid := gen_random_uuid();
    tot_sell := 0; tot_cost := 0; rec_hotel := NULL;

    INSERT INTO quotations(id, quotation_no, customer_id, status, currency, quotation_date, travel_date, expiry_date, created_at, updated_at)
    VALUES (qid, 'QUO-'||lpad((q_base+qno)::text,5,'0'), cust, st, cur, qdate,
      CASE phase WHEN 'past' THEN qdate + 5 WHEN 'now' THEN current_date + 3 + floor(random()*7)::int ELSE current_date + 7 + floor(random()*8)::int END,
      qdate + 7, qdate::timestamptz, qdate::timestamptz + interval '6 hours');
    INSERT INTO tq4 VALUES (qid);

    n_items := 1 + floor(random()*3)::int;
    FOR j IN 1..n_items LOOP
      pick := 1 + floor(random()*rate_cnt)::int;
      SELECT * INTO STRICT r FROM tr4 WHERE rn = pick;
      nights := 3 + floor(random()*5)::int;
      ci := CASE phase
        WHEN 'past' THEN current_date - (4 + floor(random()*8))::int
        WHEN 'now'  THEN current_date + 3 + floor(random()*7)::int
        ELSE current_date + 7 + floor(random()*8)::int END;
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
        CASE WHEN st='approved' THEN qdate::timestamptz + interval '8 hours' END,
        CASE WHEN st='rejected' THEN qdate::timestamptz + interval '8 hours' END,
        CASE WHEN st='rejected' THEN 'Margin below approved threshold; revise pricing.' END,
        qdate::timestamptz, qdate::timestamptz + interval '8 hours');
    END IF;

    IF st = 'accepted' AND conv_cnt < 150 THEN
      conv_cnt := conv_cnt + 1;
      INSERT INTO conv4 VALUES (qid, cust, cur, fx, qdate);
    END IF;
  END LOOP;

  b_status := array_fill('checked_out'::text, ARRAY[130])
    || array_fill('cancelled'::text, ARRAY[20])
    || array_fill('no_show'::text, ARRAY[10])
    || array_fill('checked_in'::text, ARRAY[70])
    || array_fill('confirmed'::text, ARRAY[40])
    || array_fill('pending_confirmation'::text, ARRAY[30])
    || array_fill('confirmed'::text, ARRAY[70])
    || array_fill('draft'::text, ARRAY[30]);

  FOR rec IN SELECT * FROM conv4 LOOP
    bno := bno + 1;
    st := b_status[bno];
    phase := CASE WHEN bno <= 160 THEN 'past' WHEN bno <= 300 THEN 'now' ELSE 'future' END;
    bid := gen_random_uuid();
    bdate := greatest(rec.c_qdate + 1, current_date - 14);
    INSERT INTO bookings(id, booking_no, quotation_id, customer_id, status, currency, booking_date,
      confirmed_at, checked_in_at, checked_out_at, cancelled_at, no_show_at, cancellation_reason, created_at, updated_at)
    VALUES (bid, 'BK-'||lpad((b_base+bno)::text,5,'0'), rec.c_qid, rec.c_cust, st, rec.c_cur, bdate,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      CASE WHEN st IN ('checked_in','checked_out') THEN (current_date - CASE WHEN st='checked_out' THEN 8 ELSE 2 END)::timestamptz END,
      CASE WHEN st = 'checked_out' THEN (current_date - 3)::timestamptz END,
      CASE WHEN st = 'cancelled' THEN (bdate+2)::timestamptz END,
      CASE WHEN st = 'no_show' THEN (current_date - 6)::timestamptz END,
      CASE WHEN st='cancelled' THEN 'Customer cancelled - cancellation charges applied per policy'
           WHEN st='no_show' THEN 'Group did not arrive on scheduled date' END,
      bdate::timestamptz, bdate::timestamptz + interval '1 day');

    INSERT INTO booking_rooms(booking_id, quotation_item_id, hotel_id, rate_id, room_type_id, supplier_id, occupancy_type, check_in, check_out, nights, rooms, cost_price, selling_price, margin, taxes, fees, total_cost, total_selling, confirmation_status, supplier_confirmation_no, room_confirmed_at, created_at, updated_at)
    SELECT bid, qi.id, qi.hotel_id, qi.rate_id, qi.room_type_id, rt2.supplier_id, qi.occupancy_type, qi.check_in, qi.check_out, qi.nights, qi.rooms, qi.cost_price, qi.selling_price, qi.margin, qi.taxes, qi.fees, qi.total_cost, qi.total_selling,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'confirmed' ELSE 'pending' END,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN 'SUP-CONF-'||(100000+floor(random()*900000))::int END,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      bdate::timestamptz, bdate::timestamptz
    FROM quotation_items qi LEFT JOIN rates rt2 ON rt2.id = qi.rate_id
    WHERE qi.quotation_id = rec.c_qid;

    INSERT INTO binfo4 VALUES (bid, rec.c_cust, st, rec.c_cur, rec.c_fx, bdate, phase);
  END LOOP;

  FOR i IN (bno+1)..400 LOOP
    bno := bno + 1;
    st := b_status[bno];
    phase := CASE WHEN bno <= 160 THEN 'past' WHEN bno <= 300 THEN 'now' ELSE 'future' END;
    bid := gen_random_uuid();
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    IF random() < 0.9 THEN cur := 'SAR'; fx := 1; ELSE cur := 'USD'; fx := 3.75; END IF;
    bdate := CASE phase
      WHEN 'past' THEN current_date - (10 + floor(random()*5))::int
      WHEN 'now'  THEN current_date - (2 + floor(random()*5))::int
      ELSE current_date - floor(random()*3)::int END;
    INSERT INTO bookings(id, booking_no, customer_id, status, currency, booking_date,
      confirmed_at, checked_in_at, checked_out_at, cancelled_at, no_show_at, cancellation_reason, created_at, updated_at)
    VALUES (bid, 'BK-'||lpad((b_base+bno)::text,5,'0'), cust, st, cur, bdate,
      CASE WHEN st IN ('confirmed','checked_in','checked_out','no_show') THEN (bdate+1)::timestamptz END,
      CASE WHEN st IN ('checked_in','checked_out') THEN (current_date - CASE WHEN st='checked_out' THEN 8 ELSE 2 END)::timestamptz END,
      CASE WHEN st = 'checked_out' THEN (current_date - 3)::timestamptz END,
      CASE WHEN st = 'cancelled' THEN (bdate+2)::timestamptz END,
      CASE WHEN st = 'no_show' THEN (current_date - 6)::timestamptz END,
      CASE WHEN st='cancelled' THEN 'Customer cancelled - cancellation charges applied per policy'
           WHEN st='no_show' THEN 'Group did not arrive on scheduled date' END,
      bdate::timestamptz, bdate::timestamptz + interval '1 day');

    n_items := 1 + floor(random()*2)::int;
    FOR j IN 1..n_items LOOP
      pick := 1 + floor(random()*rate_cnt)::int;
      SELECT * INTO STRICT r FROM tr4 WHERE rn = pick;
      IF st = 'checked_out' OR st = 'no_show' THEN
        ci := current_date - (8 + floor(random()*4))::int; nights := 3 + floor(random()*3)::int;
        IF ci + nights > current_date - 2 THEN nights := greatest(1, current_date - 2 - ci); END IF;
      ELSIF st = 'checked_in' THEN
        ci := current_date - (1 + floor(random()*3))::int; nights := 4 + floor(random()*4)::int;
      ELSIF st = 'cancelled' THEN
        ci := current_date - (5 + floor(random()*5))::int; nights := 3 + floor(random()*3)::int;
      ELSIF phase = 'now' THEN
        ci := current_date + 1 + floor(random()*5)::int; nights := 3 + floor(random()*5)::int;
      ELSE
        ci := current_date + 5 + floor(random()*10)::int; nights := 3 + floor(random()*5)::int;
      END IF;
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
    INSERT INTO binfo4 VALUES (bid, cust, st, cur, fx, bdate, phase);
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
  FROM binfo4 b CROSS JOIN LATERAL generate_series(1, 2+floor(random()*3)::int) gs(n);

  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, NULL, 'draft', b_date::timestamptz FROM binfo4;
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'draft', 'pending_confirmation', b_date::timestamptz + interval '6 hours' FROM binfo4 WHERE b_st <> 'draft';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'pending_confirmation', 'confirmed', (b_date+1)::timestamptz FROM binfo4 WHERE b_st IN ('confirmed','checked_in','checked_out','no_show');
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'confirmed', 'checked_in', (current_date - CASE WHEN b_st='checked_out' THEN 8 ELSE 2 END)::timestamptz FROM binfo4 WHERE b_st IN ('checked_in','checked_out');
  INSERT INTO booking_status_history(booking_id, from_status, to_status, created_at)
  SELECT b_id, 'checked_in', 'checked_out', (current_date - 3)::timestamptz FROM binfo4 WHERE b_st = 'checked_out';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, reason, created_at)
  SELECT b_id, 'pending_confirmation', 'cancelled', 'Customer cancelled - cancellation charges applied per policy', (b_date+2)::timestamptz FROM binfo4 WHERE b_st = 'cancelled';
  INSERT INTO booking_status_history(booking_id, from_status, to_status, reason, created_at)
  SELECT b_id, 'confirmed', 'no_show', 'Group did not arrive on scheduled date', (current_date-6)::timestamptz FROM binfo4 WHERE b_st = 'no_show';

  INSERT INTO attachments(entity_type, entity_id, file_name, original_name, mime_type, file_size, storage_path, uploaded_at, created_at, updated_at)
  SELECT 'booking', b_id, 'voucher.pdf', 'supplier-voucher.pdf', 'application/pdf',
         (150000+floor(random()*500000))::bigint, 'attachments/bookings/'||b_id||'/voucher.pdf',
         (b_date+1)::timestamptz, (b_date+1)::timestamptz, (b_date+1)::timestamptz
  FROM binfo4 WHERE b_st IN ('confirmed','checked_in','checked_out');

  FOR rec IN SELECT * FROM binfo4 WHERE b_st IN ('confirmed','checked_in','checked_out') ORDER BY b_date LOOP
    inv_no := inv_no + 1;
    iid := gen_random_uuid();
    st := CASE WHEN rec.b_st='checked_out' THEN 'paid'
               WHEN rec.b_st='checked_in' THEN 'partially_paid'
               ELSE 'issued' END;
    idate := CASE WHEN rec.b_phase='future' THEN current_date ELSE rec.b_date + 1 END;
    ddate := CASE WHEN rec.b_phase='future' THEN current_date + 10 + floor(random()*4)::int ELSE idate + 10 END;
    SELECT COALESCE(sum(br.total_selling - br.taxes),0), COALESCE(sum(br.taxes),0)
      INTO tot_sell, tot_tax FROM booking_rooms br WHERE br.booking_id = rec.b_id;
    paid := CASE st WHEN 'paid' THEN round(tot_sell+tot_tax,2) WHEN 'partially_paid' THEN round((tot_sell+tot_tax)*0.45,2) ELSE 0 END;
    INSERT INTO invoices(id, invoice_no, booking_id, customer_id, status, invoice_date, due_date, currency, exchange_rate, subtotal, taxes, fees, discount, total_amount, paid_amount, issued_at, created_at, updated_at)
    VALUES (iid, 'INV-'||lpad((inv_base+inv_no)::text,5,'0'), rec.b_id, rec.b_cust, st, idate, ddate, rec.b_cur, rec.b_fx,
            round(tot_sell,2), round(tot_tax,2), 0, 0, round(tot_sell+tot_tax,2), paid,
            idate::timestamptz + interval '1 hour', idate::timestamptz, idate::timestamptz + interval '1 hour');
    INSERT INTO invoice_items(invoice_id, booking_room_id, description_en, description_ar, quantity, unit_price, taxes, fees, line_total, created_at, updated_at)
    SELECT iid, br.id, h.name_en||' - '||br.occupancy_type||' '||br.check_in||' to '||br.check_out, h.name_ar,
           br.nights*br.rooms, br.selling_price, br.taxes, br.fees, br.total_selling,
           idate::timestamptz, idate::timestamptz
    FROM booking_rooms br JOIN hotels h ON h.id = br.hotel_id WHERE br.booking_id = rec.b_id;
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, NULL, 'draft', idate::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'draft', 'issued', idate::timestamptz + interval '1 hour');
    IF st = 'partially_paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'partially_paid', (idate+2)::timestamptz);
    ELSIF st = 'paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'partially_paid', (idate+2)::timestamptz);
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'partially_paid', 'paid', (idate+5)::timestamptz);
    END IF;
    INSERT INTO tinv4 VALUES (iid, rec.b_cust, round(tot_sell+tot_tax,2), paid, st, idate, rec.b_cur, rec.b_fx);
  END LOOP;

  FOR rec IN SELECT * FROM binfo4 WHERE b_st = 'cancelled' LOOP
    inv_no := inv_no + 1;
    iid := gen_random_uuid();
    st := CASE WHEN inv_no % 2 = 0 THEN 'issued' ELSE 'paid' END;
    SELECT COALESCE(sum(br.selling_price * br.rooms),0) INTO tot_sell FROM booking_rooms br WHERE br.booking_id = rec.b_id;
    IF tot_sell <= 0 THEN tot_sell := 1500; END IF;
    tot_tax := round(tot_sell*0.15,2);
    paid := CASE WHEN st='paid' THEN round(tot_sell+tot_tax,2) ELSE 0 END;
    idate := rec.b_date + 3;
    INSERT INTO invoices(id, invoice_no, booking_id, customer_id, status, invoice_date, due_date, currency, exchange_rate, subtotal, taxes, fees, discount, total_amount, paid_amount, notes, issued_at, created_at, updated_at)
    VALUES (iid, 'INV-'||lpad((inv_base+inv_no)::text,5,'0'), rec.b_id, rec.b_cust, st, idate, idate+10, rec.b_cur, rec.b_fx,
            round(tot_sell,2), tot_tax, 0, 0, round(tot_sell+tot_tax,2), paid, 'Cancellation charges - one night penalty per policy',
            idate::timestamptz, idate::timestamptz, idate::timestamptz);
    INSERT INTO invoice_items(invoice_id, description_en, description_ar, quantity, unit_price, taxes, fees, line_total, created_at, updated_at)
    VALUES (iid, 'Cancellation charges - 1 night penalty', 'رسوم إلغاء - غرامة ليلة واحدة', 1, round(tot_sell,2), tot_tax, 0, round(tot_sell+tot_tax,2), idate::timestamptz, idate::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, NULL, 'draft', idate::timestamptz);
    INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'draft', 'issued', idate::timestamptz + interval '1 hour');
    IF st='paid' THEN
      INSERT INTO invoice_status_history(invoice_id, from_status, to_status, created_at) VALUES (iid, 'issued', 'paid', (idate+4)::timestamptz);
    END IF;
    INSERT INTO tinv4 VALUES (iid, rec.b_cust, round(tot_sell+tot_tax,2), paid, st, idate, rec.b_cur, rec.b_fx);
  END LOOP;

  k := 0;
  FOR rec IN SELECT * FROM tinv4 WHERE i_paid > 0 ORDER BY i_date LOOP
    IF rec.i_st = 'paid' AND k < 60 THEN
      k := k + 1;
      a1 := round(rec.i_paid*0.6, 2);
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+2, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, a1, a1, (rec.i_date+2)::timestamptz, (rec.i_date+2)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, a1, (rec.i_date+2)::timestamptz);
      INSERT INTO trc4 VALUES (iid);
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+5, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, rec.i_paid - a1, rec.i_paid - a1, (rec.i_date+5)::timestamptz, (rec.i_date+5)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, rec.i_paid - a1, (rec.i_date+5)::timestamptz);
      INSERT INTO trc4 VALUES (iid);
    ELSE
      rcpt_no := rcpt_no + 1;
      iid := gen_random_uuid();
      INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, created_at, updated_at)
      VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), rec.i_cust, 'confirmed', rec.i_date+3, methods[1+(rcpt_no % 5)],
              'REF-'||(100000+floor(random()*900000))::int, rec.i_cur, rec.i_fx, rec.i_paid, rec.i_paid, (rec.i_date+3)::timestamptz, (rec.i_date+3)::timestamptz);
      INSERT INTO receipt_allocations(receipt_id, invoice_id, amount, created_at) VALUES (iid, rec.i_id, rec.i_paid, (rec.i_date+3)::timestamptz);
      INSERT INTO trc4 VALUES (iid);
    END IF;
  END LOOP;

  WHILE rcpt_no < 290 LOOP
    rcpt_no := rcpt_no + 1;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date - floor(random()*14)::int;
    amt := round((5000 + random()*45000)::numeric, 2);
    iid := gen_random_uuid();
    INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, notes, created_at, updated_at)
    VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), cust, 'confirmed', qdate, methods[1+(rcpt_no % 5)],
            'REF-'||(100000+floor(random()*900000))::int, 'SAR', 1, amt, 0, 'Advance payment on account', qdate::timestamptz, qdate::timestamptz);
    INSERT INTO trc4 VALUES (iid);
  END LOOP;

  WHILE rcpt_no < 295 LOOP
    rcpt_no := rcpt_no + 1;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date + 5 + floor(random()*9)::int;
    amt := round((8000 + random()*30000)::numeric, 2);
    iid := gen_random_uuid();
    INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, reference_no, currency, exchange_rate, amount, allocated_amount, notes, created_at, updated_at)
    VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), cust, 'confirmed', qdate, 'cheque',
            'PDC-'||(100000+floor(random()*900000))::int, 'SAR', 1, amt, 0, 'Post-dated cheque - scheduled collection', now(), now());
    INSERT INTO trc4 VALUES (iid);
  END LOOP;

  WHILE rcpt_no < 300 LOOP
    rcpt_no := rcpt_no + 1;
    cust := v_cust[1 + floor(random()*v_cust_cnt)::int];
    qdate := current_date - floor(random()*12)::int;
    amt := round((3000 + random()*20000)::numeric, 2);
    iid := gen_random_uuid();
    INSERT INTO receipts(id, receipt_no, customer_id, status, receipt_date, payment_method, currency, exchange_rate, amount, allocated_amount, cancellation_reason, cancelled_at, created_at, updated_at)
    VALUES (iid, 'RCT-'||lpad((rct_base+rcpt_no)::text,5,'0'), cust, 'cancelled', qdate, methods[1+(rcpt_no % 5)], 'SAR', 1, amt, 0,
            'Entered with wrong amount - re-issued correctly', (qdate+1)::timestamptz, qdate::timestamptz, (qdate+1)::timestamptz);
    INSERT INTO trc4 VALUES (iid);
  END LOOP;

  k := 0;
  FOR rec IN SELECT br.id brid, br.booking_id bkid, br.supplier_id sup, br.total_cost amt2, b2.b_cur, b2.b_fx, br.check_in, b2.b_phase
             FROM booking_rooms br JOIN binfo4 b2 ON b2.b_id = br.booking_id
             WHERE b2.b_st IN ('confirmed','checked_in','checked_out') AND br.supplier_id IS NOT NULL AND br.total_cost > 0
             ORDER BY random() LIMIT 220 LOOP
    k := k + 1; pyb_no := pyb_no + 1;
    st := CASE WHEN k <= 45 THEN 'paid' WHEN k <= 60 THEN 'partially_paid' WHEN k <= 210 THEN 'pending' ELSE 'cancelled' END;
    paid := CASE st WHEN 'paid' THEN rec.amt2 WHEN 'partially_paid' THEN round(rec.amt2*0.45,2) ELSE 0 END;
    v_notes := CASE WHEN st='pending' AND k % 12 = 0 THEN 'On hold - pending supplier statement reconciliation' END;
    iid := gen_random_uuid();
    INSERT INTO supplier_payables(id, payable_no, supplier_id, booking_id, booking_room_id, status, currency, exchange_rate, amount, paid_amount, due_date, notes, cancellation_reason, created_at, updated_at)
    VALUES (iid, 'PYB-'||lpad((pyb_base+pyb_no)::text,5,'0'), rec.sup, rec.bkid, rec.brid, st, rec.b_cur, rec.b_fx, rec.amt2, paid, rec.check_in,
            v_notes, CASE WHEN st='cancelled' THEN 'Room cancelled with supplier free of charge' END,
            now() - interval '12 days', now() - interval '2 days');
    INSERT INTO tpyb4 VALUES (iid, rec.sup, rec.amt2, paid, st, rec.b_cur, rec.b_fx, k <= 10);
  END LOOP;

  WHILE pyb_no < 230 LOOP
    pyb_no := pyb_no + 1;
    amt := round((3000 + random()*30000)::numeric, 2);
    iid := gen_random_uuid();
    INSERT INTO supplier_payables(id, payable_no, supplier_id, status, currency, exchange_rate, amount, paid_amount, due_date, notes, created_at, updated_at)
    VALUES (iid, 'PYB-'||lpad((pyb_base+pyb_no)::text,5,'0'), v_sup[1 + floor(random()*array_length(v_sup,1))::int], 'pending', 'SAR', 1, amt, 0,
            current_date + 5 + floor(random()*10)::int, 'Scheduled future settlement per contract terms',
            now() - interval '5 days', now() - interval '1 day');
    INSERT INTO tpyb4 VALUES (iid, v_sup[1 + ((pyb_no) % array_length(v_sup,1))], amt, 0, 'pending', 'SAR', 1, false);
  END LOOP;

  FOR rec IN SELECT * FROM tpyb4 WHERE p_st = 'paid' LOOP
    po_no := po_no + 1; ord_id := gen_random_uuid();
    INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, approved_at, created_at, updated_at)
    VALUES (ord_id, 'PO-'||lpad((po_base+po_no)::text,5,'0'), rec.p_sup, 'paid', rec.p_cur, rec.p_fx, rec.p_paid,
            now() - interval '9 days', now() - interval '10 days', now() - interval '4 days');
    INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.p_id, rec.p_paid);
    INSERT INTO tpo4 VALUES (ord_id);
    IF rec.p_split THEN
      a1 := round(rec.p_paid*0.6, 2);
      spay_no := spay_no + 1; pay_id := gen_random_uuid();
      INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
      VALUES (pay_id, 'SPAY-'||lpad((sp_base+spay_no)::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 8, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, a1, now() - interval '8 days', now() - interval '8 days');
      INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.p_id, a1);
      INSERT INTO tsp4 VALUES (pay_id);
      spay_no := spay_no + 1; pay_id := gen_random_uuid();
      INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
      VALUES (pay_id, 'SPAY-'||lpad((sp_base+spay_no)::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 4, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.p_paid - a1, now() - interval '4 days', now() - interval '4 days');
      INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.p_id, rec.p_paid - a1);
      INSERT INTO tsp4 VALUES (pay_id);
    ELSE
      spay_no := spay_no + 1; pay_id := gen_random_uuid();
      INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
      VALUES (pay_id, 'SPAY-'||lpad((sp_base+spay_no)::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 6, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.p_paid, now() - interval '6 days', now() - interval '6 days');
      INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.p_id, rec.p_paid);
      INSERT INTO tsp4 VALUES (pay_id);
    END IF;
  END LOOP;

  FOR rec IN SELECT * FROM tpyb4 WHERE p_st = 'partially_paid' LOOP
    po_no := po_no + 1; ord_id := gen_random_uuid();
    INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, approved_at, created_at, updated_at)
    VALUES (ord_id, 'PO-'||lpad((po_base+po_no)::text,5,'0'), rec.p_sup, 'approved', rec.p_cur, rec.p_fx, rec.p_amt,
            now() - interval '3 days', now() - interval '5 days', now() - interval '2 days');
    INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.p_id, rec.p_amt);
    INSERT INTO tpo4 VALUES (ord_id);
    spay_no := spay_no + 1; pay_id := gen_random_uuid();
    INSERT INTO supplier_payments(id, payment_no, payment_order_id, supplier_id, status, payment_date, payment_method, reference_no, currency, exchange_rate, amount, created_at, updated_at)
    VALUES (pay_id, 'SPAY-'||lpad((sp_base+spay_no)::text,5,'0'), ord_id, rec.p_sup, 'confirmed', current_date - 2, (ARRAY['bank_transfer','cash','cheque'])[1+(spay_no % 3)], 'TRF-'||(100000+floor(random()*900000))::int, rec.p_cur, rec.p_fx, rec.p_paid, now() - interval '2 days', now() - interval '2 days');
    INSERT INTO payment_allocations(payment_id, payable_id, amount) VALUES (pay_id, rec.p_id, rec.p_paid);
    INSERT INTO tsp4 VALUES (pay_id);
  END LOOP;

  k := 0;
  FOR rec IN SELECT * FROM tpyb4 WHERE p_st = 'pending' ORDER BY random() LIMIT 10 LOOP
    k := k + 1;
    po_no := po_no + 1; ord_id := gen_random_uuid();
    st := CASE WHEN k <= 6 THEN 'pending_approval' WHEN k <= 9 THEN 'draft' ELSE 'cancelled' END;
    INSERT INTO payment_orders(id, order_no, supplier_id, status, currency, exchange_rate, total_amount, created_at, updated_at)
    VALUES (ord_id, 'PO-'||lpad((po_base+po_no)::text,5,'0'), rec.p_sup, st, rec.p_cur, rec.p_fx, rec.p_amt,
            now() - interval '2 days', now() - interval '1 day');
    INSERT INTO payment_order_items(order_id, payable_id, amount) VALUES (ord_id, rec.p_id, rec.p_amt);
    INSERT INTO tpo4 VALUES (ord_id);
  END LOOP;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'sales.agent1@uat.example.com', a.act, 'quotations', qq.id::text,
         jsonb_build_object('quotation_no', qq.quotation_no, 'channel', a.chan, 'source', 'uat_seed_phase4'),
         qq.created_at + a.ofs
  FROM quotations qq JOIN tq4 ON tq4.q_id = qq.id
  CROSS JOIN LATERAL (VALUES
    ('create', 'app', interval '0 hours'),
    ('pdf_export', 'pdf', interval '3 hours'),
    ('whatsapp_send', 'whatsapp', interval '4 hours')
  ) a(act, chan, ofs)
  WHERE a.act = 'create' OR qq.status IN ('sent','accepted','approved','expired');

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'ops.manager@uat.example.com',
         CASE b.b_st WHEN 'confirmed' THEN 'confirm' WHEN 'checked_in' THEN 'check_in' WHEN 'checked_out' THEN 'check_out'
                     WHEN 'cancelled' THEN 'cancel' WHEN 'no_show' THEN 'no_show' ELSE 'create' END,
         'bookings', b.b_id::text, jsonb_build_object('source', 'uat_seed_phase4'),
         b.b_date::timestamptz + interval '1 day'
  FROM binfo4 b;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.agent1@uat.example.com', a.act, 'invoices', t.i_id::text,
         jsonb_build_object('channel', a.chan, 'source', 'uat_seed_phase4'),
         t.i_date::timestamptz + a.ofs
  FROM tinv4 t
  CROSS JOIN LATERAL (VALUES
    ('issue', 'app', interval '1 hour'),
    ('pdf_export', 'pdf', interval '2 hours'),
    ('email_send', 'email', interval '3 hours')
  ) a(act, chan, ofs);

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.agent1@uat.example.com', 'receipt_issued', 'receipts', t.r_id::text,
         jsonb_build_object('source', 'uat_seed_phase4'), now() - (random()*interval '12 days')
  FROM trc4 t;

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.manager@uat.example.com', a.act, 'payment_orders', t.o_id::text,
         jsonb_build_object('source', 'uat_seed_phase4'), now() - a.ofs
  FROM tpo4 t JOIN payment_orders po ON po.id = t.o_id
  CROSS JOIN LATERAL (VALUES ('submit', interval '3 days'), ('approve', interval '2 days')) a(act, ofs)
  WHERE (a.act = 'submit' AND po.status <> 'draft') OR (a.act = 'approve' AND po.status IN ('approved','paid'));

  INSERT INTO audit_logs(user_email, action, entity_type, entity_id, metadata, created_at)
  SELECT 'finance.manager@uat.example.com', 'payment_recorded', 'supplier_payments', t.s_id::text,
         jsonb_build_object('source', 'uat_seed_phase4'), now() - (random()*interval '8 days')
  FROM tsp4 t;

  UPDATE counters SET current_value = q_base + qno, updated_at = now() WHERE key='quotation';
  UPDATE counters SET current_value = b_base + bno, updated_at = now() WHERE key='booking';
  UPDATE counters SET current_value = inv_base + inv_no, updated_at = now() WHERE key='invoice';
  UPDATE counters SET current_value = rct_base + rcpt_no, updated_at = now() WHERE key='receipt';
  UPDATE counters SET current_value = pyb_base + pyb_no, updated_at = now() WHERE key='payable';
  UPDATE counters SET current_value = po_base + po_no, updated_at = now() WHERE key='payment_order';
  INSERT INTO counters(key, prefix, current_value, padding) VALUES ('supplier_payment','SPAY', sp_base + spay_no, 5)
  ON CONFLICT (key) DO UPDATE SET current_value = EXCLUDED.current_value, updated_at = now();
END $do$;

SET session_replication_role = DEFAULT;