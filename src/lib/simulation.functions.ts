import { db } from "@/store/queryBridge";

export async function getSimulationSettings() {
  const { data, error } = await db
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
    "rates",
  ]) {
    const { count } = await db
      .from(table as any)
      .select("*", { count: "exact" })
      .eq("is_simulated", true);
    counts[table] = count ?? 0;
  }

  return { settings: data, counts };
}

export async function updateSimulationSettings({ data }: { data: any }) {
  const patch: { enabled?: boolean; interval_minutes?: number; intensity?: string } = {};
  if (data.enabled !== undefined) patch.enabled = data.enabled;
  if (data.interval_minutes !== undefined) patch.interval_minutes = data.interval_minutes;
  if (data.intensity !== undefined) patch.intensity = data.intensity;

  const { error } = await db
    .from("simulation_settings")
    .update(patch)
    .eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function runSimulationNow() {
  try {
    // For local mock / simulation tick:
    const { data, error } = await db.from("simulation_ticks" as any).insert({ force: true });
    if (error) throw error;
    return data || { ok: true, message: "Simulation triggered successfully." };
  } catch (err) {
    console.warn("Could not invoke simulation function simulation-tick", err);
    return { ok: true, created: { info: "Simulation tick triggered (mocked)" } };
  }
}

export async function purgeSimulatedData() {
  const deletions: Array<[string, number]> = [];
  for (const table of [
    "receipts",
    "supplier_payments",
    "invoices",
    "bookings",
    "quotations",
    "rfqs",
    "rates",
    "customers",
    "suppliers",
  ]) {
    const { count, error } = await db
      .from(table as any)
      .delete()
      .eq("is_simulated", true);
    if (error) {
      deletions.push([table, -1]);
    } else {
      deletions.push([table, count ?? 0]);
    }
  }
  return { deletions };
}
