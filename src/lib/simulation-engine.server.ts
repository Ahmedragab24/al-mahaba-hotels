/**
 * Simulation engine — runs server-side and creates "live" looking activity
 * (customers, suppliers, RFQs, bookings, invoices, receipts) tagged with
 * is_simulated = true. Safe to disable at any time and to purge.
 */

type TickResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  created: Record<string, number>;
  intensity?: string;
  ts?: string;
  error?: string;
};

const FIRST_NAMES_AR = [
  "محمد",
  "أحمد",
  "خالد",
  "سعد",
  "فهد",
  "عبدالله",
  "ياسر",
  "نور",
  "ريم",
  "سارة",
];
const LAST_NAMES_AR = [
  "العتيبي",
  "الحربي",
  "القحطاني",
  "الشهري",
  "الزهراني",
  "الدوسري",
  "الغامدي",
  "المالكي",
];
const COMPANY_NAMES_AR = [
  "شركة الواحة للسياحة",
  "مجموعة الأفق للسفر",
  "وكالة النخبة السياحية",
  "بوابة المسافر",
  "رحلات الخليج",
  "أجنحة الراحة",
];
const HOTEL_NAMES_AR = [
  "فندق الواحة",
  "منتجع البحر الأحمر",
  "فندق قصر الرياض",
  "منتجع جدة بلازا",
  "فندق المدينة الذهبية",
  "منتجع تبوك العالمي",
  "فندق أبراج مكة",
  "منتجع الدمام بيتش",
];

const pick = (arr: any[]): any => arr[Math.floor(Math.random() * arr.length)];
const intBetween = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

async function ensureMinCustomers(admin: any, minCount: number) {
  const { count } = await admin
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("is_simulated", true);
  const have = count ?? 0;
  const need = Math.max(0, minCount - have);
  if (need === 0) return;
  const rows: any[] = [];
  for (let i = 0; i < need; i++) {
    const isIndividual = Math.random() < 0.4;
    const code = `SIM-C-${Date.now()}-${i}`;
    if (isIndividual) {
      const fn = pick(FIRST_NAMES_AR);
      const ln = pick(LAST_NAMES_AR);
      rows.push({
        code,
        customer_type: "individual",
        name_ar: `${fn} ${ln}`,
        name_en: `${fn} ${ln}`,
        preferred_currency: "SAR",
        preferred_language: "ar",
        status: "active",
        is_simulated: true,
      });
    } else {
      const n = pick(COMPANY_NAMES_AR);
      rows.push({
        code,
        customer_type: pick(["corporate", "agency", "government"]),
        name_ar: n,
        name_en: n,
        legal_name: n,
        preferred_currency: "SAR",
        preferred_language: "ar",
        status: "active",
        is_simulated: true,
      });
    }
  }
  await admin.from("customers").insert(rows);
}

async function ensureMinSuppliers(admin: any, minCount: number) {
  const { count } = await admin
    .from("suppliers")
    .select("*", { count: "exact", head: true })
    .eq("is_simulated", true);
  const have = count ?? 0;
  const need = Math.max(0, minCount - have);
  if (need === 0) return;
  const rows: any[] = [];
  for (let i = 0; i < need; i++) {
    const n = pick(HOTEL_NAMES_AR);
    rows.push({
      code: `SIM-S-${Date.now()}-${i}`,
      supplier_type: "hotel_supplier",
      name_ar: n,
      name_en: n,
      legal_name: n,
      preferred_currency: "SAR",
      status: "active",
      is_simulated: true,
    });
  }
  await admin.from("suppliers").insert(rows);
}

async function createRfq(admin: any): Promise<string | null> {
  const { data: customers } = await admin
    .from("customers")
    .select("id")
    .eq("is_simulated", true)
    .limit(50);
  if (!customers || customers.length === 0) return null;
  const customer = pick(customers);
  const startDays = intBetween(7, 60);
  const nights = intBetween(2, 7);
  const start = new Date(Date.now() + startDays * 86400000);
  const end = new Date(start.getTime() + nights * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const destination = pick(["الرياض", "جدة", "مكة", "المدينة", "الدمام", "أبها", "تبوك"]);
  const { data, error } = await admin
    .from("rfqs")
    .insert({
      rfq_no: `SIM-RFQ-${Date.now().toString(36).toUpperCase()}`,
      customer_id: customer.id,
      travel_start: fmt(start),
      travel_end: fmt(end),
      destination,
      currency: "SAR",
      status: pick(["draft", "sent", "partial"]),
      notes: "محاكاة تلقائية",
      is_simulated: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

async function createBooking(admin: any): Promise<string | null> {
  const { data: customers } = await admin
    .from("customers")
    .select("id, preferred_currency")
    .eq("is_simulated", true)
    .limit(50);
  if (!customers || customers.length === 0) return null;
  const customer = pick(customers);
  const { data, error } = await admin
    .from("bookings")
    .insert({
      booking_no: `SIM-B-${Date.now().toString(36).toUpperCase()}`,
      customer_id: customer.id,
      status: pick(["draft", "confirmed", "checked_in"]),
      currency: customer.preferred_currency || "SAR",
      booking_date: new Date().toISOString().slice(0, 10),
      notes: "حجز تجريبي (محاكاة)",
      is_simulated: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

async function createInvoice(admin: any): Promise<string | null> {
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, customer_id, currency")
    .eq("is_simulated", true)
    .limit(50);
  if (!bookings || bookings.length === 0) return null;
  const b = pick(bookings);
  const subtotal = intBetween(500, 15000);
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + tax;
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("invoices")
    .insert({
      invoice_no: `SIM-INV-${Date.now().toString(36).toUpperCase()}`,
      booking_id: b.id,
      customer_id: b.customer_id,
      currency: b.currency || "SAR",
      invoice_date: today,
      due_date: due,
      subtotal,
      taxes: tax,
      fees: 0,
      discount: 0,
      total_amount: total,
      paid_amount: 0,
      status: pick(["draft", "issued"]),
      is_simulated: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

async function createReceipt(admin: any): Promise<string | null> {
  const { data: invoices } = await admin
    .from("invoices")
    .select("id, customer_id, currency, total_amount, paid_amount")
    .eq("is_simulated", true)
    .limit(20);
  if (!invoices || invoices.length === 0) return null;
  const inv = pick(invoices);
  const remaining = Math.max(0, Number(inv.total_amount) - Number(inv.paid_amount || 0));
  if (remaining <= 0) return null;
  const amount = Math.min(remaining, intBetween(100, 5000));
  const { data, error } = await admin
    .from("receipts")
    .insert({
      receipt_no: `SIM-RCP-${Date.now().toString(36).toUpperCase()}`,
      customer_id: inv.customer_id,
      currency: inv.currency || "SAR",
      receipt_date: new Date().toISOString().slice(0, 10),
      amount,
      payment_method: pick(["cash", "bank_transfer", "card"]),
      status: "confirmed",
      is_simulated: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

async function createRate(admin: any): Promise<string | null> {
  const { data: hotels } = await admin.from("hotels").select("id").is("deleted_at", null).limit(50);
  if (!hotels || hotels.length === 0) return null;
  const hotel = pick(hotels);
  const { data: rts } = await admin
    .from("hotel_room_types")
    .select("id")
    .eq("hotel_id", hotel.id)
    .limit(20);
  if (!rts || rts.length === 0) return null;
  const rt = pick(rts);

  const isDirect = Math.random() < 0.4;
  let supplierId: string | null = null;
  if (!isDirect) {
    const { data: sups } = await admin
      .from("suppliers")
      .select("id")
      .eq("is_simulated", true)
      .limit(30);
    if (!sups || sups.length === 0) return null;
    supplierId = pick(sups).id;
  }

  const today = new Date();
  const validFrom = new Date(today.getTime() - 7 * 86400000);
  const validTo = new Date(today.getTime() + 90 * 86400000);
  const cost = intBetween(180, 1400);
  const markup = intBetween(10, 35);
  const selling = Math.round(cost * (1 + markup / 100));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data, error } = await admin
    .from("rates")
    .insert({
      code: `SIM-RT-${Date.now().toString(36).toUpperCase()}-${intBetween(100, 999)}`,
      hotel_id: hotel.id,
      supplier_id: supplierId,
      room_type_id: rt.id,
      meal_plan: pick(["RO", "BB", "HB", "FB"]),
      currency: "SAR",
      valid_from: fmt(validFrom),
      valid_to: fmt(validTo),
      cost_per_night: cost,
      selling_price: selling,
      markup_pct: markup,
      status: pick(["draft", "approved", "approved", "approved"]),
      is_direct: isDirect,
      is_simulated: true,
    })
    .select("id")
    .single();
  if (error) return null;
  return data?.id ?? null;
}

export async function runSimulationTick(opts: { force?: boolean } = {}): Promise<TickResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin;

  const { data: settings } = await admin
    .from("simulation_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!settings) {
    return { ok: false, skipped: true, reason: "no_settings", created: {} };
  }
  if (!opts.force && !settings.enabled) {
    return { ok: true, skipped: true, reason: "disabled", created: {} };
  }

  const intensity = settings.intensity as "low" | "medium" | "high";
  const eventsPerTick = intensity === "high" ? 8 : intensity === "medium" ? 4 : 2;

  const created: Record<string, number> = {};
  const bump = (k: string) => (created[k] = (created[k] ?? 0) + 1);

  try {
    await ensureMinCustomers(admin, 6);
    await ensureMinSuppliers(admin, 4);

    for (let i = 0; i < eventsPerTick; i++) {
      const action = pick(["rate", "rate", "rfq", "rfq", "booking", "booking", "invoice", "receipt"]);
      if (action === "rfq") {
        if (await createRfq(admin)) bump("rfqs");
      } else if (action === "booking") {
        if (await createBooking(admin)) bump("bookings");
      } else if (action === "invoice") {
        if (await createInvoice(admin)) bump("invoices");
      } else if (action === "receipt") {
        if (await createReceipt(admin)) bump("receipts");
      } else if (action === "rate") {
        if (await createRate(admin)) bump("rates");
      }
    }

    await admin
      .from("simulation_settings")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_status: "ok",
        last_run_summary: { created, intensity, force: !!opts.force },
        total_runs: (settings.total_runs ?? 0) + 1,
      })
      .eq("id", settings.id);

    return { ok: true, created, intensity, ts: new Date().toISOString() };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await admin
      .from("simulation_settings")
      .update({
        last_run_at: new Date().toISOString(),
        last_run_status: "error",
        last_run_summary: { error: msg, created },
      })
      .eq("id", settings.id);
    return { ok: false, error: msg, created };
  }
}
