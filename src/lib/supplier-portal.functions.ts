import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMySupplierProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id,supplier_id,must_change_password,full_name_ar,full_name_en,email")
      .eq("id", context.userId)
      .maybeSingle();
    const supplierId = (profile as { supplier_id?: string | null } | null)?.supplier_id ?? null;
    if (!supplierId) return { profile, supplier: null, stats: null };

    const { data: supplier } = await context.supabase
      .from("suppliers")
      .select("*")
      .eq("id", supplierId)
      .maybeSingle();

    const [{ count: hotels }, { count: contracts }, { count: rates }, { count: bookings }, { data: payables }] =
      await Promise.all([
        context.supabase.from("hotel_suppliers").select("hotel_id", { count: "exact", head: true }).eq("supplier_id", supplierId),
        context.supabase.from("supplier_contracts").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
        context.supabase.from("rates").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
        context.supabase.from("booking_rooms").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
        context.supabase.from("supplier_payables").select("amount,status").eq("supplier_id", supplierId),
      ]);

    const outstanding = (payables ?? [])
      .filter((p: { status: string }) => p.status !== "paid")
      .reduce((s: number, p: { amount: number }) => s + Number(p.amount || 0), 0);

    return {
      profile,
      supplier,
      stats: {
        hotels: hotels ?? 0,
        contracts: contracts ?? 0,
        rates: rates ?? 0,
        bookings: bookings ?? 0,
        outstanding,
      },
    };
  });

export const listMyHotels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("hotel_suppliers")
      .select("hotel_id, hotels(id,code,name_en,name_ar,star_rating,city_id)")
      .order("hotel_id");
    return { rows: data ?? [] };
  });

export const listMyRates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("rates")
      .select("id,code,hotel_id,room_type_id,currency,status,valid_from,valid_to,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    return { rows: data ?? [] };
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("booking_rooms")
      .select("id,booking_id,hotel_id,check_in,check_out,nights,rooms,total_cost,confirmation_status")
      .order("check_in", { ascending: false })
      .limit(200);
    return { rows: data ?? [] };
  });

export const listMyPayables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("supplier_payables")
      .select("*")
      .order("due_date", { ascending: true })
      .limit(200);
    return { rows: data ?? [] };
  });
