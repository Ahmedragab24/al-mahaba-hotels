import { db } from "@/lib/api/db";

export type SupplierType = "direct_hotel" | "wholesaler" | "dmc" | "hotel_supplier" | "other";

export type SupplierApplicationInput = {
  name_en: string;
  name_ar: string;
  supplier_type: SupplierType;
  legal_name?: string;
  tax_number?: string;
  commercial_registration?: string;
  country_code?: string;
  city_id?: string;
  address_line1?: string;
  website?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_position?: string;
};

function clean(s?: string | null): string | null {
  if (!s) return null;
  const v = s.trim();
  return v.length ? v : null;
}

export async function submitSupplierApplication({ data }: { data: SupplierApplicationInput }) {
  const email = data.contact_email.trim().toLowerCase();
  
  const { data: row, error } = await db
    .from("supplier_applications" as any)
    .insert({
      name_en: data.name_en.trim(),
      name_ar: data.name_ar.trim(),
      supplier_type: data.supplier_type,
      legal_name: clean(data.legal_name),
      tax_number: clean(data.tax_number),
      commercial_registration: clean(data.commercial_registration),
      country_code: clean(data.country_code),
      city_id: clean(data.city_id),
      address_line1: clean(data.address_line1),
      website: clean(data.website),
      contact_name: data.contact_name.trim(),
      contact_email: email,
      contact_phone: data.contact_phone.trim(),
      contact_position: clean(data.contact_position),
      status: "pending",
    })
    .select("id")
    .single();
    
  if (error) throw error;
  return { id: row!.id };
}

export async function listSupplierApplications() {
  const { data, error } = await db
    .from("supplier_applications" as any)
    .select(
      "id,name_en,name_ar,supplier_type,contact_name,contact_email,contact_phone,country_code,city_id,status,submitted_at,reviewed_at,rejection_reason,created_supplier_id,created_user_id"
    )
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return { rows: data ?? [] };
}

export async function approveSupplierApplication({ data }: { data: { id: string } }) {
  // Client side fallback for approval
  const { data: app, error: aerr } = await db
    .from("supplier_applications" as any)
    .select("id,name_en,name_ar,contact_name,contact_email,status")
    .eq("id", data.id)
    .single();
  if (aerr || !app) throw new Error("APP_NOT_FOUND");
  
  const email = app.contact_email.toLowerCase();
  const tempPassword = `Supp-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 9000 + 1000)}`;

  // Best effort profile insert or rpc call
  const { data: result, error: ferr } = await db.rpc(
    "finalize_supplier_application" as never,
    { _app_id: data.id } as never,
  );
  if (ferr) throw ferr;

  return { ok: true, email, password: tempPassword, supplier: result || app };
}

export async function rejectSupplierApplication({ data }: { data: { id: string; reason: string } }) {
  if (!data.reason?.trim()) throw new Error("REASON_REQUIRED");
  const { error } = await db.rpc(
    "reject_supplier_application" as never,
    { _app_id: data.id, _reason: data.reason.trim() } as never,
  );
  if (error) throw error;
  return { ok: true };
}

export async function getApplyLookups() {
  const [{ data: countries }, { data: cities }] = await Promise.all([
    db.from("countries").select("code,name_en,name_ar").order("name_en"),
    db.from("cities").select("id,country_code,name_en,name_ar").order("name_en"),
  ]);
  return { countries: countries ?? [], cities: cities ?? [] };
}
