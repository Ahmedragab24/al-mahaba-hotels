import { c as createServerRpc } from "./createServerRpc-CjnVr-4i.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DICWdMih.mjs";
import { r as runSimulationTick } from "./simulation-engine.server-CqcvilV1.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
async function assertAdmin(ctx) {
  const {
    data: isAdmin
  } = await ctx.supabase.rpc("has_any_role", {
    _user_id: ctx.userId,
    _roles: ["super_admin", "admin"]
  });
  if (!isAdmin) throw new Error("Forbidden");
}
const getSimulationSettings_createServerFn_handler = createServerRpc({
  id: "5d821f56f5902eb1a268d00a3c0a6a5f474bf57b0cbbb221329d75f71f8301a4",
  name: "getSimulationSettings",
  filename: "src/lib/simulation.functions.ts"
}, (opts) => getSimulationSettings.__executeServer(opts));
const getSimulationSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getSimulationSettings_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("simulation_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  const counts = {};
  for (const table of ["customers", "suppliers", "rfqs", "quotations", "bookings", "invoices", "receipts", "supplier_payments", "rates"]) {
    const {
      count
    } = await supabaseAdmin.from(table).select("*", {
      count: "exact",
      head: true
    }).eq("is_simulated", true);
    counts[table] = count ?? 0;
  }
  return {
    settings: data,
    counts
  };
});
const updateSimulationSettings_createServerFn_handler = createServerRpc({
  id: "8e45bbe7e67b9acc1c494c0ac19f0c2baff7818c13fc4000ed8ad25f311580ff",
  name: "updateSimulationSettings",
  filename: "src/lib/simulation.functions.ts"
}, (opts) => updateSimulationSettings.__executeServer(opts));
const updateSimulationSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => i).handler(updateSimulationSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const patch = {};
  if (data.enabled !== void 0) patch.enabled = data.enabled;
  if (data.interval_minutes !== void 0) patch.interval_minutes = data.interval_minutes;
  if (data.intensity !== void 0) patch.intensity = data.intensity;
  const {
    error
  } = await supabaseAdmin.from("simulation_settings").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const runSimulationNow_createServerFn_handler = createServerRpc({
  id: "13a2f9a76bf5d33bf7e6116377d6b1e86f86f21db2818697c98f58e59f946a36",
  name: "runSimulationNow",
  filename: "src/lib/simulation.functions.ts"
}, (opts) => runSimulationNow.__executeServer(opts));
const runSimulationNow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(runSimulationNow_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const result = await runSimulationTick({
    force: true
  });
  return result;
});
const purgeSimulatedData_createServerFn_handler = createServerRpc({
  id: "614e8a025382547325883cfa13b59a50196cb833abc4320c2a249868410f5cd8",
  name: "purgeSimulatedData",
  filename: "src/lib/simulation.functions.ts"
}, (opts) => purgeSimulatedData.__executeServer(opts));
const purgeSimulatedData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(purgeSimulatedData_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context);
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const deletions = [];
  for (const table of ["receipts", "supplier_payments", "invoices", "bookings", "quotations", "rfqs", "rates", "customers", "suppliers"]) {
    const {
      count,
      error
    } = await supabaseAdmin.from(table).delete({
      count: "exact"
    }).eq("is_simulated", true);
    if (error) {
      deletions.push([table, -1]);
    } else {
      deletions.push([table, count ?? 0]);
    }
  }
  return {
    deletions
  };
});
export {
  getSimulationSettings_createServerFn_handler,
  purgeSimulatedData_createServerFn_handler,
  runSimulationNow_createServerFn_handler,
  updateSimulationSettings_createServerFn_handler
};
