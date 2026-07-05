import { db } from "@/store/queryBridge";
import { getCurrentUserId } from "@/store/queryBridge";

export async function getMySupplierProfile() {
  const userData = { user: { id: getCurrentUserId() } };
  const userId = userData.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const { data: profile } = await db
    .from("profiles")
    .select("id,supplier_id,must_change_password,full_name_ar,full_name_en,email")
    .eq("id", userId)
    .maybeSingle();

  const supplierId = (profile as { supplier_id?: string | null } | null)?.supplier_id ?? null;
  if (!supplierId) return { profile, supplier: null, stats: null };

  const { data: supplier } = await db
    .from("suppliers")
    .select("*")
    .eq("id", supplierId)
    .maybeSingle();

  const [{ count: hotels }, { count: contracts }, { count: rates }, { count: bookings }, { data: payables }] =
    await Promise.all([
      db.from("hotel_suppliers").select("hotel_id", { count: "exact", head: true }).eq("supplier_id", supplierId),
      db.from("supplier_contracts").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
      db.from("rates").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
      db.from("booking_rooms").select("id", { count: "exact", head: true }).eq("supplier_id", supplierId),
      db.from("supplier_payables").select("amount,status").eq("supplier_id", supplierId),
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
}

export async function listMyHotels() {
  const { data } = await db
    .from("hotel_suppliers")
    .select("hotel_id, hotels(id,code,name_en,name_ar,star_rating,city_id)")
    .order("hotel_id");
  return { rows: data ?? [] };
}

export async function listMyRates() {
  const { data } = await db
    .from("rates")
    .select("id,code,hotel_id,room_type_id,currency,status,valid_from,valid_to,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return { rows: data ?? [] };
}

export async function listMyBookings() {
  const { data } = await db
    .from("booking_rooms")
    .select("id,booking_id,hotel_id,check_in,check_out,nights,rooms,total_cost,confirmation_status")
    .order("check_in", { ascending: false })
    .limit(200);
  return { rows: data ?? [] };
}

export async function listMyPayables() {
  const { data } = await db
    .from("supplier_payables")
    .select("*")
    .order("due_date", { ascending: true })
    .limit(200);
  return { rows: data ?? [] };
}
