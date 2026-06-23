SET session_replication_role = replica;

DO $seed$
DECLARE
  d0 date := current_date;
  mk uuid := 'efb5cd3a-7382-4b2c-aef0-efa9a7fa7070';
  md uuid := '9e4887cc-fd57-4b1d-aadd-51608c647559';
  jd uuid := 'aea596fc-bc45-4c1a-8e0a-2aba7568ba03';
  unames text[] := ARRAY['Faisal Al-Mutairi','Salem Al-Ghamdi','Nouf Al-Harbi','Rizky Pratama','Usman Farooq','Huda Al-Sharif','Tariq Mansour','Lina Qutub','Omar Bashir','Dina Al-Amoudi','Majed Al-Subhi','Reem Al-Zahrani'];
  unames_ar text[] := ARRAY['فيصل المطيري','سالم الغامدي','نوف الحربي','رزقي براتاما','عثمان فاروق','هدى الشريف','طارق منصور','لينا قطب','عمر بشير','دينا العمودي','ماجد الصبحي','ريم الزهراني'];
  uroles text[] := ARRAY['operations_manager','operations_agent','operations_agent','operations_agent','operations_agent','finance_manager','finance_agent','finance_agent','sales_agent','sales_agent','viewer','viewer'];
  uuser text[] := ARRAY['faisal.mutairi','salem.ghamdi','nouf.harbi','rizky.pratama','usman.farooq','huda.sharif','tariq.mansour','lina.qutub','omar.bashir','dina.amoudi','majed.subhi','reem.zahrani'];
  cnames text[] := ARRAY[
    'Al Noor Hajj Services','Mawasim Al Khair Travel','Rehlat Al Iman Agency','Dar Al Salam Tours','Bait Al Deyafah Group','Anwar Al Madinah Travel','Safa Marwa Tours','Al Rawda Pilgrims Services',
    'Crescent Journeys Ltd','Holy Lands Travel UK','Zamzam Tours USA','Pilgrim Path International','Sacred Route Travel','Unity Umrah Services','Crescent Star Travel Canada','Hijaz Gateway Ltd',
    'Amanah Wisata Nusantara','Barokah Travel Jakarta','Cahaya Madinah Tour','Damai Umrah Surabaya','Hikmah Travel Bandung','Insan Mulia Wisata','Jannah Tour Indonesia','Khazanah Travel Medan',
    'Al Falah Travels Karachi','Madina Caravan Lahore','Noor-e-Haram Travels','Raza Tours Islamabad','Bilal Travels Rawalpindi','Hujjaj Services Multan','Iman Travels Faisalabad','Taqwa Tours Peshawar'];
  clang text[] := ARRAY['ar','en','id','ur'];
  cctry text[] := ARRAY['SA','GB','ID','PK'];
  snames text[] := ARRAY['Haramain Hospitality Co','Makkah Rooms Wholesale','Madinah Stay DMC','Jeddah Hotel Partners','Ajyad Distribution House','Tayba Accommodation Services'];
  stypes text[] := ARRAY['direct_hotel','wholesaler','dmc','hotel_supplier','wholesaler','direct_hotel'];
  hnames text[] := ARRAY['Jabal Omar Grand Residence','Abraj Al Tayseer Hotel','Manazel Ajyad Suites','Rawdat Al Aziziyah Hotel','Taiba Front Hotel','Saha Al Salam Suites','Qiblatain Residence','Corniche Pearl Hotel','Red Sea Gate Hotel'];
  hnames_ar text[] := ARRAY['جبل عمر جراند ريزيدنس','أبراج التيسير','منازل أجياد سويتس','روضة العزيزية','طيبة فرونت','ساحة السلام سويتس','مساكن القبلتين','لؤلؤة الكورنيش','بوابة البحر الأحمر'];
  hstar int[] := ARRAY[5,4,3,4,5,4,3,5,4];
  rtnames text[] := ARRAY['Standard Double Room','Triple Room','Quad Family Suite'];
  rtnames_ar text[] := ARRAY['غرفة مزدوجة قياسية','غرفة ثلاثية','جناح عائلي رباعي'];
  meals text[] := ARRAY['BB','HB','RO'];
  occs text[] := ARRAY['SGL','DBL','TPL','QUAD'];
  omult numeric[] := ARRAY[0.85,1.0,1.3,1.55];
  i int; j int; k int;
  uid uuid; cid uuid; sid uuid; hid uuid; rtid uuid; ctid uuid; rid uuid; vid uuid;
  hcity uuid; star int; base numeric; slug text; lang text;
  u_ids uuid[] := '{}'; sup_ids uuid[] := '{}'; hot_ids uuid[] := '{}'; act_ct uuid[] := '{}';
BEGIN
  CREATE TEMP TABLE trt(t_h int, t_j int, t_id uuid) ON COMMIT DROP;
  CREATE TEMP TABLE tv(t_h int, t_j int, t_id uuid) ON COMMIT DROP;

  FOR i IN 1..12 LOOP
    uid := gen_random_uuid();
    u_ids := u_ids || uid;
    INSERT INTO profiles(id, username, email, full_name_en, full_name_ar, phone, preferred_language, is_active, must_change_password, last_login_at, created_at, updated_at)
    VALUES (uid, uuser[i], uuser[i]||'@uat-hrs.sa', unames[i], unames_ar[i], '+9665'||(10000000+floor(random()*89999999))::int,
            CASE WHEN i IN (4) THEN 'id'::app_language WHEN i IN (5) THEN 'ur'::app_language WHEN i % 2 = 0 THEN 'ar'::app_language ELSE 'en'::app_language END,
            true, false, d0::timestamptz - (floor(random()*5)||' days')::interval,
            (d0-29)::timestamptz, (d0-29)::timestamptz);
    INSERT INTO user_roles(user_id, role, granted_at) VALUES (uid, uroles[i]::app_role, (d0-29)::timestamptz);
  END LOOP;

  FOR i IN 1..32 LOOP
    cid := gen_random_uuid();
    lang := clang[1+((i-1)/8)];
    slug := lower(regexp_replace(cnames[i], '[^a-zA-Z]', '', 'g'));
    INSERT INTO customers(id, code, customer_type, name_en, name_ar, legal_name, tax_number, country_code, city_id,
      address_line1, email, phone, mobile, preferred_language, preferred_currency, credit_limit, credit_days,
      payment_terms, rating, status, notes, created_at, updated_at, created_by)
    VALUES (cid, 'CUS-'||(20000+i), (ARRAY['agency','agency','corporate','agent'])[1+(i%4)], cnames[i], cnames[i],
      cnames[i]||' LLC', '3'||(100000000+floor(random()*899999999))::bigint||'0003',
      cctry[1+((i-1)/8)], CASE WHEN ((i-1)/8)=0 THEN jd ELSE NULL END,
      'Office '||(100+i)||', Business District', 'bookings@'||slug||'.com',
      '+9661'||(2000000+i*137), '+9665'||(50000000+i*911),
      lang::app_language, CASE WHEN i%5=0 THEN 'USD' ELSE 'SAR' END,
      (ARRAY[100000,250000,500000,750000])[1+(i%4)], (ARRAY[15,30,45,60])[1+(i%4)],
      'Net '||(ARRAY[15,30,45,60])[1+(i%4)]||' days', 3+(i%3), 'active',
      'UAT 30-day simulation customer', (d0-28+(i%10))::timestamptz, (d0-28+(i%10))::timestamptz, u_ids[1+(i%12)]);

    INSERT INTO customer_contacts(customer_id, full_name, title, email, phone, mobile, is_primary, preferred_language, created_at, updated_at)
    VALUES (cid, (ARRAY['Ahmed Saleh','James Walker','Budi Santoso','Imran Khan'])[1+((i-1)/8)]||' '||i, 'Reservations Manager',
            'manager'||i||'@'||slug||'.com', '+9661'||(3000000+i), '+9665'||(60000000+i*7), true, lang::app_language,
            (d0-28)::timestamptz, (d0-28)::timestamptz),
           (cid, (ARRAY['Fatimah Noor','Sarah Bennett','Siti Rahma','Ayesha Malik'])[1+((i-1)/8)]||' '||i, 'Accounts Officer',
            'accounts'||i||'@'||slug||'.com', '+9661'||(4000000+i), '+9665'||(70000000+i*7), false, lang::app_language,
            (d0-28)::timestamptz, (d0-28)::timestamptz);

    FOR j IN 1..3 LOOP
      INSERT INTO customer_communications(customer_id, channel, direction, subject, body, occurred_at, created_by, created_at)
      VALUES (cid, (ARRAY['whatsapp','email','phone'])[j],
        CASE WHEN j=3 THEN 'inbound' ELSE 'outbound' END,
        (ARRAY['Quotation follow-up','Group booking inquiry','Payment confirmation call'])[j],
        (ARRAY['Shared latest group quotation and answered room category questions.','Customer requested Ramadan-season availability for Makkah and Madinah.','Customer confirmed transfer initiated for outstanding invoice balance.'])[j],
        (d0 - 14 + ((i+j*4) % 14))::timestamptz + (j*3||' hours')::interval, u_ids[1+((i+j)%12)],
        (d0 - 14 + ((i+j*4) % 14))::timestamptz);
    END LOOP;

    IF i % 2 = 0 THEN
      INSERT INTO customer_attachments(customer_id, file_name, file_path, file_type, file_size, category, uploaded_by, created_at)
      VALUES (cid, 'agency-agreement-'||i||'.pdf', 'customers/'||cid||'/agency-agreement.pdf', 'application/pdf',
              (200000+i*1311)::bigint, (ARRAY['contract','legal','operations'])[1+(i%3)], u_ids[1+(i%12)], (d0-20)::timestamptz);
    END IF;
  END LOOP;

  FOR i IN 1..6 LOOP
    sid := gen_random_uuid();
    sup_ids := sup_ids || sid;
    slug := lower(regexp_replace(snames[i], '[^a-zA-Z]', '', 'g'));
    INSERT INTO suppliers(id, code, supplier_type, name_en, name_ar, legal_name, tax_number, country_code, city_id,
      address_line1, email, phone, preferred_currency, payment_terms, credit_days, rating, status, notes, created_at, updated_at, created_by)
    VALUES (sid, 'SUP-'||(20000+i), stypes[i], snames[i], snames[i], snames[i]||' LLC',
      '3'||(200000000+i*7777777)::bigint||'0003', 'SA', CASE WHEN i IN (1,2) THEN mk WHEN i IN (3,6) THEN md ELSE jd END,
      'District '||i||', King Abdulaziz Road', 'reservations@'||slug||'.sa', '+9661'||(5000000+i*13),
      CASE WHEN i=4 THEN 'USD' ELSE 'SAR' END, 'Net 30 days', 30, 3.5+(i%3)*0.5, 'active',
      'UAT 30-day simulation supplier', (d0-29)::timestamptz, (d0-29)::timestamptz, u_ids[1]);

    INSERT INTO supplier_contacts(supplier_id, full_name, title, email, phone, mobile, is_primary, created_at, updated_at)
    VALUES (sid, (ARRAY['Khalid Al-Amri','Saad Al-Juhani','Yasser Hamdan','Fahad Al-Dossari','Naif Al-Shehri','Sultan Bakr'])[i], 'Sales Director',
            'sales@'||slug||'.sa', '+9661'||(6000000+i), '+9665'||(80000000+i*3), true, (d0-29)::timestamptz, (d0-29)::timestamptz),
           (sid, (ARRAY['Hassan Qari','Adel Mahmoud','Waleed Samman','Rami Khoury','Anas Tamimi','Zaki Hariri'])[i], 'Finance Officer',
            'finance@'||slug||'.sa', '+9661'||(7000000+i), '+9665'||(90000000+i*3), false, (d0-29)::timestamptz, (d0-29)::timestamptz);

    INSERT INTO supplier_bank_accounts(supplier_id, bank_name, account_holder, account_number, iban, swift, currency, branch, country_code, is_default, created_at, updated_at)
    VALUES (sid, (ARRAY['Al Rajhi Bank','SNB','Riyad Bank','SABB','Alinma Bank','Bank Albilad'])[i], snames[i]||' LLC',
            (3000000000+i*123457)::bigint::text, 'SA'||(44+i)||'80000'||(3000000000+i*123457)::bigint, 'RJHISARI', 'SAR', 'Main Branch', 'SA', true,
            (d0-29)::timestamptz, (d0-29)::timestamptz);
    IF i <= 3 THEN
      INSERT INTO supplier_bank_accounts(supplier_id, bank_name, account_holder, account_number, iban, swift, currency, branch, country_code, is_default, created_at, updated_at)
      VALUES (sid, 'SNB', snames[i]||' LLC (USD)', (4000000000+i*98765)::bigint::text, 'SA'||(50+i)||'10000'||(4000000000+i*98765)::bigint, 'NCBKSAJE', 'USD', 'Corporate Branch', 'SA', false,
              (d0-29)::timestamptz, (d0-29)::timestamptz);
    END IF;

    INSERT INTO supplier_ratings(supplier_id, score, category, comment, rated_by, created_at)
    VALUES (sid, 3+(i%3), (ARRAY['reliability','pricing','quality','responsiveness'])[1+(i%4)], 'Consistent confirmations during peak season.', u_ids[1], (d0-10)::timestamptz),
           (sid, 4, (ARRAY['responsiveness','quality','pricing','reliability'])[1+(i%4)], 'Responds to confirmation requests within hours.', u_ids[2], (d0-4)::timestamptz);
  END LOOP;

  FOR i IN 1..9 LOOP
    hid := gen_random_uuid();
    hot_ids := hot_ids || hid;
    hcity := CASE WHEN i <= 4 THEN mk WHEN i <= 7 THEN md ELSE jd END;
    star := hstar[i];
    INSERT INTO hotels(id, code, name_en, name_ar, star_rating, country_code, city_id, district, address_line1,
      phone, email, check_in_time, check_out_time, description_en, description_ar, status, cover_image_path, created_at, updated_at, created_by)
    VALUES (hid, 'HTL-'||(20000+i), hnames[i], hnames_ar[i], star, 'SA', hcity,
      CASE WHEN i<=4 THEN (ARRAY['Ajyad','Al Aziziyah','Al Misfalah','Al Aziziyah'])[i] WHEN i<=7 THEN 'Central Area' ELSE 'Corniche' END,
      'Plot '||(200+i)||', Main Road', '+96612'||(500000+i*31), 'info@'||lower(regexp_replace(hnames[i],'[^a-zA-Z]','','g'))||'.sa',
      '15:00','12:00', star||'-star property used for the 30-day UAT simulation.', 'فندق '||star||' نجوم ضمن بيانات اختبار القبول.',
      'active', 'hotels/HTL-'||(20000+i)||'/cover.jpg', (d0-29)::timestamptz, (d0-29)::timestamptz, u_ids[1]);

    FOR j IN 1..3 LOOP
      rtid := gen_random_uuid();
      INSERT INTO trt VALUES (i, j, rtid);
      INSERT INTO hotel_room_types(id, hotel_id, code, name_en, name_ar, max_adults, max_children, max_occupancy, bed_type, size_sqm, is_active, sort_order, created_at, updated_at)
      VALUES (rtid, hid, 'RTX-'||(20000+i*10+j), rtnames[j], rtnames_ar[j],
              (ARRAY[2,3,4])[j], 1, (ARRAY[3,4,5])[j], (ARRAY['Twin/Double','Three singles','Two doubles + sofa'])[j],
              (ARRAY[24,30,42])[j], true, j, (d0-29)::timestamptz, (d0-29)::timestamptz);
    END LOOP;

    FOR j IN 1..2 LOOP
      vid := gen_random_uuid();
      INSERT INTO tv VALUES (i, j, vid);
      INSERT INTO hotel_views(id, hotel_id, code, name_en, name_ar, is_active)
      VALUES (vid, hid, 'VW-'||(20000+i*10+j),
        CASE WHEN i<=7 AND j=1 THEN 'Haram View' WHEN i>7 AND j=1 THEN 'Sea View' WHEN i<=4 THEN 'City View' WHEN i<=7 THEN 'Courtyard View' ELSE 'City View' END,
        CASE WHEN i<=7 AND j=1 THEN 'إطلالة على الحرم' WHEN i>7 AND j=1 THEN 'إطلالة بحرية' ELSE 'إطلالة على المدينة' END, true);
    END LOOP;

    FOR j IN 1..3 LOOP
      INSERT INTO hotel_meal_plans(hotel_id, board, name_en, name_ar, is_active)
      VALUES (hid, meals[j]::rate_board, (ARRAY['Bed & Breakfast','Half Board','Room Only'])[j], (ARRAY['إفطار','Half Board','غرفة فقط'])[j], true);
    END LOOP;

    INSERT INTO hotel_facilities(hotel_id, facility_id)
    SELECT hid, f.id FROM (SELECT id FROM facilities ORDER BY random() LIMIT 6) f;

    FOR j IN 1..3 LOOP
      INSERT INTO hotel_images(hotel_id, file_path, caption, sort_order, is_cover, created_at)
      VALUES (hid, 'hotels/HTL-'||(20000+i)||'/img'||j||'.jpg', (ARRAY['Exterior','Lobby','Room'])[j], j, j=1, (d0-29)::timestamptz);
    END LOOP;

    INSERT INTO hotel_suppliers(hotel_id, supplier_id, is_preferred, notes, created_at)
    VALUES (hid, sup_ids[1+((i-1)%6)], true, 'Primary allotment partner', (d0-29)::timestamptz);
  END LOOP;

  FOR i IN 1..9 LOOP
    ctid := gen_random_uuid();
    act_ct := act_ct || ctid;
    INSERT INTO supplier_contracts(id, contract_number, supplier_id, hotel_id, title, contract_type, start_date, end_date,
      currency, payment_terms, cancellation_terms, commission_pct, commission_type, credit_days, status, notes, created_at, updated_at, created_by)
    VALUES (ctid, 'CNT-'||(20000+i), sup_ids[1+((i-1)%6)], hot_ids[i], hnames[i]||' — Annual Allotment '||extract(year from d0),
      'allotment', d0-60, d0+200, 'SAR', 'Net 30 days', 'Free cancellation 14 days prior to arrival', 10, 'percentage', 30, 'active',
      'Active UAT contract', (d0-60)::timestamptz, (d0-60)::timestamptz, u_ids[1]);
  END LOOP;
  FOR i IN 1..4 LOOP
    INSERT INTO supplier_contracts(contract_number, supplier_id, hotel_id, title, contract_type, start_date, end_date,
      currency, payment_terms, commission_pct, commission_type, credit_days, status, notes, created_at, updated_at, created_by)
    VALUES ('CNT-'||(20009+i), sup_ids[1+(i%6)], hot_ids[i], hnames[i]||' — Seasonal Block (expiring)',
      'on_request', d0-100, d0+20, 'SAR', 'Net 15 days', 8, 'percentage', 15, 'active',
      'Expiring within 30 days — renewal under negotiation', (d0-100)::timestamptz, (d0-100)::timestamptz, u_ids[1]);
  END LOOP;
  FOR i IN 1..4 LOOP
    INSERT INTO supplier_contracts(contract_number, supplier_id, hotel_id, title, contract_type, start_date, end_date,
      currency, payment_terms, commission_pct, commission_type, credit_days, status, notes, created_at, updated_at, created_by)
    VALUES ('CNT-'||(20013+i), sup_ids[1+((i+2)%6)], hot_ids[4+i], hnames[4+i]||' — Prior Season Contract',
      'allotment', d0-400, d0-35, 'SAR', 'Net 30 days', 10, 'percentage', 30, 'expired',
      'Expired contract retained for reporting', (d0-400)::timestamptz, (d0-35)::timestamptz, u_ids[1]);
  END LOOP;

  FOR i IN 1..9 LOOP
    star := hstar[i];
    FOR j IN 1..3 LOOP
      base := (CASE star WHEN 5 THEN 700 WHEN 4 THEN 450 ELSE 300 END) * (1 + (j-1)*0.25);
      rid := gen_random_uuid();
      SELECT t_id INTO rtid FROM trt WHERE t_h=i AND t_j=j;
      SELECT t_id INTO vid FROM tv WHERE t_h=i AND t_j=1+(j%2);
      INSERT INTO rates(id, code, hotel_id, supplier_id, contract_id, room_type_id, view_id, meal_plan, currency,
        valid_from, valid_to, cost_per_night, selling_price, markup_pct, min_nights, max_nights, release_days, allotment,
        cancellation_policy_en, status, approved_at, created_at, updated_at, created_by)
      VALUES (rid, 'RT-'||(20000+i*10+j), hot_ids[i], sup_ids[1+((i-1)%6)], act_ct[i], rtid, vid, meals[j]::rate_board, 'SAR',
        d0-20, d0+120, base, round(base*1.25,2), 25, 1, 30, 7, 50,
        'Free cancellation up to 14 days before arrival; 50% within 7 days; non-refundable within 48 hours.',
        'approved', (d0-18)::timestamptz, (d0-20)::timestamptz, (d0-18)::timestamptz, u_ids[1]);
      FOR k IN 1..4 LOOP
        INSERT INTO rate_occupancy_prices(rate_id, occupancy_type, cost_price, selling_price, markup_percent, currency, active, created_at, updated_at)
        VALUES (rid, occs[k], round(base*omult[k],2), round(base*1.25*omult[k],2), 25, 'SAR', true, (d0-18)::timestamptz, (d0-18)::timestamptz);
      END LOOP;
      INSERT INTO rate_taxes(rate_id, name, tax_type, value, is_inclusive, applies_to)
      VALUES (rid, 'VAT 15%', 'percentage', 15, false, 'total'), (rid, 'Municipality Fee', 'percentage', 2.5, false, 'room');
      INSERT INTO rate_cancellation_rules(rate_id, days_before_checkin, penalty_type, penalty_value, notes)
      VALUES (rid, 14, 'percentage', 0, 'Free cancellation'), (rid, 7, 'percentage', 50, '50% charge'), (rid, 2, 'non_refundable', 100, 'Non-refundable');
    END LOOP;
    base := (CASE star WHEN 5 THEN 700 WHEN 4 THEN 450 ELSE 300 END);
    rid := gen_random_uuid();
    SELECT t_id INTO rtid FROM trt WHERE t_h=i AND t_j=1;
    SELECT t_id INTO vid FROM tv WHERE t_h=i AND t_j=1;
    INSERT INTO rates(id, code, hotel_id, supplier_id, contract_id, room_type_id, view_id, meal_plan, currency,
      valid_from, valid_to, cost_per_night, selling_price, markup_pct, min_nights, max_nights, release_days, allotment,
      cancellation_policy_en, status, approved_at, created_at, updated_at, created_by)
    VALUES (rid, 'RT-'||(20100+i), hot_ids[i], sup_ids[1+((i-1)%6)], act_ct[i], rtid, vid, 'RO'::rate_board, 'USD',
      d0-20, d0+120, round(base/3.75,2), round(base*1.25/3.75,2), 25, 1, 30, 7, 30,
      'Free cancellation up to 14 days before arrival; 50% within 7 days.', 'approved', (d0-18)::timestamptz, (d0-20)::timestamptz, (d0-18)::timestamptz, u_ids[1]);
    FOR k IN 1..4 LOOP
      INSERT INTO rate_occupancy_prices(rate_id, occupancy_type, cost_price, selling_price, markup_percent, currency, active, created_at, updated_at)
      VALUES (rid, occs[k], round(base*omult[k]/3.75,2), round(base*1.25*omult[k]/3.75,2), 25, 'USD', true, (d0-18)::timestamptz, (d0-18)::timestamptz);
    END LOOP;
    INSERT INTO rate_taxes(rate_id, name, tax_type, value, is_inclusive, applies_to) VALUES (rid, 'VAT 15%', 'percentage', 15, false, 'total');
    INSERT INTO rate_cancellation_rules(rate_id, days_before_checkin, penalty_type, penalty_value, notes)
    VALUES (rid, 14, 'percentage', 0, 'Free cancellation'), (rid, 7, 'percentage', 50, '50% charge');
  END LOOP;

  UPDATE counters SET current_value = 20050 WHERE key IN ('customer','hotel','supplier','contract');
  UPDATE counters SET current_value = 20200 WHERE key = 'rate';
END $seed$;

SET session_replication_role = DEFAULT;