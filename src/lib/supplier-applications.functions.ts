import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

/** Public: submit a supplier application (no auth required). */
export const submitSupplierApplication = createServerFn({ method: "POST" })
  .inputValidator((d: SupplierApplicationInput) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const required = ["name_en", "name_ar", "supplier_type", "contact_name", "contact_email", "contact_phone"] as const;
    for (const k of required) {
      if (!data[k] || String(data[k]).trim().length === 0) {
        throw new Error(`MISSING_FIELD:${k}`);
      }
    }
    const email = data.contact_email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_EMAIL");

    // Reject if already has a pending/approved application for this email
    const { data: existing } = await supabaseAdmin
      .from("supplier_applications")
      .select("id,status")
      .eq("contact_email", email)
      .in("status", ["pending", "under_review", "approved"])
      .limit(1)
      .maybeSingle();
    if (existing) throw new Error("DUPLICATE_APPLICATION");

    const { data: row, error } = await supabaseAdmin
      .from("supplier_applications")
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
  });

/** Admin: list all applications. */
export const listSupplierApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("supplier_applications")
      .select(
        "id,name_en,name_ar,supplier_type,contact_name,contact_email,contact_phone,country_code,city_id,status,submitted_at,reviewed_at,rejection_reason,created_supplier_id,created_user_id"
      )
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return { rows: data ?? [] };
  });

/** Admin: approve. Creates auth user, profile, then finalizes (creates supplier + role). */
export const approveSupplierApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: app, error: aerr } = await context.supabase
      .from("supplier_applications")
      .select("id,name_en,name_ar,contact_name,contact_email,status")
      .eq("id", data.id)
      .single();
    if (aerr || !app) throw new Error("APP_NOT_FOUND");
    if (app.status === "approved") throw new Error("ALREADY_APPROVED");

    const email = app.contact_email.toLowerCase();
    const tempPassword = `Supp-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 9000 + 1000)}`;

    // Find or create auth user
    let userId: string | undefined;
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
    if (existing) {
      userId = existing.id;
      await supabaseAdmin.auth.admin.updateUserById(existing.id, { password: tempPassword });
    } else {
      const { data: created, error: cerr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { display_name: app.contact_name, supplier_application_id: app.id },
      });
      if (cerr) throw cerr;
      userId = created.user?.id;
    }
    if (!userId) throw new Error("USER_CREATE_FAILED");

    // Ensure profile row
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        username: email.split("@")[0],
        full_name_ar: app.contact_name,
        full_name_en: app.contact_name,
        must_change_password: true,
      },
      { onConflict: "id" },
    );

    // Call finalize as the admin (uses context.supabase which carries admin auth)
    const { data: result, error: ferr } = await context.supabase.rpc(
      "finalize_supplier_application" as never,
      { _app_id: data.id, _user_id: userId } as never,
    );
    if (ferr) throw ferr;

    return { ok: true, email, password: tempPassword, supplier: result };
  });

/** Admin: reject with reason. */
export const rejectSupplierApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; reason: string }) => d)
  .handler(async ({ data, context }) => {
    if (!data.reason?.trim()) throw new Error("REASON_REQUIRED");
    const { error } = await context.supabase.rpc(
      "reject_supplier_application" as never,
      { _app_id: data.id, _reason: data.reason.trim() } as never,
    );
    if (error) throw error;
    return { ok: true };
  });

/** Public: fetch lookups for the apply form. */
export const getApplyLookups = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: countries }, { data: cities }] = await Promise.all([
    supabaseAdmin.from("countries").select("code,name_en,name_ar").order("name_en"),
    supabaseAdmin.from("cities").select("id,country_code,name_en,name_ar").order("name_en"),
  ]);
  return { countries: countries ?? [], cities: cities ?? [] };
});
