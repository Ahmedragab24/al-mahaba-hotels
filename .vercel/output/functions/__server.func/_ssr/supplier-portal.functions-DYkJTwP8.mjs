import { c as createServerRpc } from "./createServerRpc-CjnVr-4i.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DICWdMih.mjs";
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
const getMySupplierProfile_createServerFn_handler = createServerRpc({
  id: "b430ce200499dc048ab7b076e73568074561eb7efabf614ba07ce3ef399dd4bb",
  name: "getMySupplierProfile",
  filename: "src/lib/supplier-portal.functions.ts"
}, (opts) => getMySupplierProfile.__executeServer(opts));
const getMySupplierProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMySupplierProfile_createServerFn_handler, async ({
  context
}) => {
  const {
    data: profile
  } = await context.supabase.from("profiles").select("id,supplier_id,must_change_password,full_name_ar,full_name_en,email").eq("id", context.userId).maybeSingle();
  const supplierId = profile?.supplier_id ?? null;
  if (!supplierId) return {
    profile,
    supplier: null,
    stats: null
  };
  const {
    data: supplier
  } = await context.supabase.from("suppliers").select("*").eq("id", supplierId).maybeSingle();
  const [{
    count: hotels
  }, {
    count: contracts
  }, {
    count: rates
  }, {
    count: bookings
  }, {
    data: payables
  }] = await Promise.all([context.supabase.from("hotel_suppliers").select("hotel_id", {
    count: "exact",
    head: true
  }).eq("supplier_id", supplierId), context.supabase.from("supplier_contracts").select("id", {
    count: "exact",
    head: true
  }).eq("supplier_id", supplierId), context.supabase.from("rates").select("id", {
    count: "exact",
    head: true
  }).eq("supplier_id", supplierId), context.supabase.from("booking_rooms").select("id", {
    count: "exact",
    head: true
  }).eq("supplier_id", supplierId), context.supabase.from("supplier_payables").select("amount,status").eq("supplier_id", supplierId)]);
  const outstanding = (payables ?? []).filter((p) => p.status !== "paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  return {
    profile,
    supplier,
    stats: {
      hotels: hotels ?? 0,
      contracts: contracts ?? 0,
      rates: rates ?? 0,
      bookings: bookings ?? 0,
      outstanding
    }
  };
});
const listMyHotels_createServerFn_handler = createServerRpc({
  id: "057df38c0120ceaae680e3059fe1b092a628089670ccb33b0cd8b78db4502a44",
  name: "listMyHotels",
  filename: "src/lib/supplier-portal.functions.ts"
}, (opts) => listMyHotels.__executeServer(opts));
const listMyHotels = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyHotels_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("hotel_suppliers").select("hotel_id, hotels(id,code,name_en,name_ar,star_rating,city_id)").order("hotel_id");
  return {
    rows: data ?? []
  };
});
const listMyRates_createServerFn_handler = createServerRpc({
  id: "2482d9d18bbbc7ca6d7b5b032f4179a4391105d3e3947316f3d5a4b4046b5083",
  name: "listMyRates",
  filename: "src/lib/supplier-portal.functions.ts"
}, (opts) => listMyRates.__executeServer(opts));
const listMyRates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyRates_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("rates").select("id,code,hotel_id,room_type_id,currency,status,valid_from,valid_to,created_at").order("created_at", {
    ascending: false
  }).limit(200);
  return {
    rows: data ?? []
  };
});
const listMyBookings_createServerFn_handler = createServerRpc({
  id: "8b5cb7eda2a5c859025bea234c7243fbe3aab8f11e0c4a974d6c5e47f489734e",
  name: "listMyBookings",
  filename: "src/lib/supplier-portal.functions.ts"
}, (opts) => listMyBookings.__executeServer(opts));
const listMyBookings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyBookings_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("booking_rooms").select("id,booking_id,hotel_id,check_in,check_out,nights,rooms,total_cost,confirmation_status").order("check_in", {
    ascending: false
  }).limit(200);
  return {
    rows: data ?? []
  };
});
const listMyPayables_createServerFn_handler = createServerRpc({
  id: "6cc532cdca1d2a0cc7e4ba9d96b5f1bcf907bbc9db57b37fc309cfa074c2ed86",
  name: "listMyPayables",
  filename: "src/lib/supplier-portal.functions.ts"
}, (opts) => listMyPayables.__executeServer(opts));
const listMyPayables = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyPayables_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("supplier_payables").select("*").order("due_date", {
    ascending: true
  }).limit(200);
  return {
    rows: data ?? []
  };
});
export {
  getMySupplierProfile_createServerFn_handler,
  listMyBookings_createServerFn_handler,
  listMyHotels_createServerFn_handler,
  listMyPayables_createServerFn_handler,
  listMyRates_createServerFn_handler
};
