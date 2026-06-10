import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runSimulationTick } from "./simulation-engine.server";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_any_role", {
    _user_id: ctx.userId,
    _roles: ["super_admin", "admin"],
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const getSimulationSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("simulation_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const counts: Record<string, number> = {};
    for (const table of [
      "customers",
      "suppliers",
      "rfqs",
      "quotations",
      "bookings",
      "invoices",
      "receipts",
      "supplier_payments",
    ]) {
      const { count } = await supabaseAdmin
        .from(table as any)
        .select("*", { count: "exact", head: true })
        .eq("is_simulated", true);
      counts[table] = count ?? 0;
    }

    return { settings: data, counts };
  });

export const updateSimulationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (i: {
      id: string;
      enabled?: boolean;
      interval_minutes?: number;
      intensity?: "low" | "medium" | "high";
    }) => i,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: { enabled?: boolean; interval_minutes?: number; intensity?: string } = {};
    if (data.enabled !== undefined) patch.enabled = data.enabled;
    if (data.interval_minutes !== undefined) patch.interval_minutes = data.interval_minutes;
    if (data.intensity !== undefined) patch.intensity = data.intensity;
    const { error } = await supabaseAdmin
      .from("simulation_settings")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const runSimulationNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const result = await runSimulationTick({ force: true });
    return result;
  });

export const purgeSimulatedData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // delete in dependency order
    const deletions: Array<[string, number]> = [];
    for (const table of [
      "receipts",
      "supplier_payments",
      "invoices",
      "bookings",
      "quotations",
      "rfqs",
      "customers",
      "suppliers",
    ]) {
      const { count, error } = await supabaseAdmin
        .from(table as any)
        .delete({ count: "exact" })
        .eq("is_simulated", true);
      if (error) {
        deletions.push([table, -1]);
      } else {
        deletions.push([table, count ?? 0]);
      }
    }
    return { deletions };
  });
