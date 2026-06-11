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
function clean(s) {
  if (!s) return null;
  const v = s.trim();
  return v.length ? v : null;
}
const submitSupplierApplication_createServerFn_handler = createServerRpc({
  id: "b8611767573173fcab9afceb879ad874727f709ad3c6f451d8e9c48ecb7b10d8",
  name: "submitSupplierApplication",
  filename: "src/lib/supplier-applications.functions.ts"
}, (opts) => submitSupplierApplication.__executeServer(opts));
const submitSupplierApplication = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(submitSupplierApplication_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const required = ["name_en", "name_ar", "supplier_type", "contact_name", "contact_email", "contact_phone"];
  for (const k of required) {
    if (!data[k] || String(data[k]).trim().length === 0) {
      throw new Error(`MISSING_FIELD:${k}`);
    }
  }
  const email = data.contact_email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("INVALID_EMAIL");
  const {
    data: existing
  } = await supabaseAdmin.from("supplier_applications").select("id,status").eq("contact_email", email).in("status", ["pending", "under_review", "approved"]).limit(1).maybeSingle();
  if (existing) throw new Error("DUPLICATE_APPLICATION");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("supplier_applications").insert({
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
    status: "pending"
  }).select("id").single();
  if (error) throw error;
  return {
    id: row.id
  };
});
const listSupplierApplications_createServerFn_handler = createServerRpc({
  id: "959bea8a9a4718b339e568ae92c3741ddd3beecdec5ad3ab1c8251835521451e",
  name: "listSupplierApplications",
  filename: "src/lib/supplier-applications.functions.ts"
}, (opts) => listSupplierApplications.__executeServer(opts));
const listSupplierApplications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listSupplierApplications_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await context.supabase.from("supplier_applications").select("id,name_en,name_ar,supplier_type,contact_name,contact_email,contact_phone,country_code,city_id,status,submitted_at,reviewed_at,rejection_reason,created_supplier_id,created_user_id").order("submitted_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    rows: data ?? []
  };
});
const approveSupplierApplication_createServerFn_handler = createServerRpc({
  id: "b9e8df6b4da1f46baf3f4ba6ba73f427d34a2dd678fa07a13cc244b245dd1434",
  name: "approveSupplierApplication",
  filename: "src/lib/supplier-applications.functions.ts"
}, (opts) => approveSupplierApplication.__executeServer(opts));
const approveSupplierApplication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(approveSupplierApplication_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: app,
    error: aerr
  } = await context.supabase.from("supplier_applications").select("id,name_en,name_ar,contact_name,contact_email,status").eq("id", data.id).single();
  if (aerr || !app) throw new Error("APP_NOT_FOUND");
  if (app.status === "approved") throw new Error("ALREADY_APPROVED");
  const email = app.contact_email.toLowerCase();
  const tempPassword = `Supp-${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 9e3 + 1e3)}`;
  let userId;
  const {
    data: list
  } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email);
  if (existing) {
    userId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: tempPassword
    });
  } else {
    const {
      data: created,
      error: cerr
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        display_name: app.contact_name,
        supplier_application_id: app.id
      }
    });
    if (cerr) throw cerr;
    userId = created.user?.id;
  }
  if (!userId) throw new Error("USER_CREATE_FAILED");
  await supabaseAdmin.from("profiles").upsert({
    id: userId,
    email,
    username: email.split("@")[0],
    full_name_ar: app.contact_name,
    full_name_en: app.contact_name,
    must_change_password: true
  }, {
    onConflict: "id"
  });
  const {
    data: result,
    error: ferr
  } = await context.supabase.rpc("finalize_supplier_application", {
    _app_id: data.id,
    _user_id: userId
  });
  if (ferr) throw ferr;
  return {
    ok: true,
    email,
    password: tempPassword,
    supplier: result
  };
});
const rejectSupplierApplication_createServerFn_handler = createServerRpc({
  id: "233e72260b6dbc6ca6df3cee8afd16ad27f16278b1d044ae8aa1e0f2a00eb8f3",
  name: "rejectSupplierApplication",
  filename: "src/lib/supplier-applications.functions.ts"
}, (opts) => rejectSupplierApplication.__executeServer(opts));
const rejectSupplierApplication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(rejectSupplierApplication_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!data.reason?.trim()) throw new Error("REASON_REQUIRED");
  const {
    error
  } = await context.supabase.rpc("reject_supplier_application", {
    _app_id: data.id,
    _reason: data.reason.trim()
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const getApplyLookups_createServerFn_handler = createServerRpc({
  id: "72b5ac57297d225585f74c049f8d4e24bfefb63a9841732baf2ccf597a526432",
  name: "getApplyLookups",
  filename: "src/lib/supplier-applications.functions.ts"
}, (opts) => getApplyLookups.__executeServer(opts));
const getApplyLookups = createServerFn({
  method: "GET"
}).handler(getApplyLookups_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const [{
    data: countries
  }, {
    data: cities
  }] = await Promise.all([supabaseAdmin.from("countries").select("code,name_en,name_ar").order("name_en"), supabaseAdmin.from("cities").select("id,country_code,name_en,name_ar").order("name_en")]);
  return {
    countries: countries ?? [],
    cities: cities ?? []
  };
});
export {
  approveSupplierApplication_createServerFn_handler,
  getApplyLookups_createServerFn_handler,
  listSupplierApplications_createServerFn_handler,
  rejectSupplierApplication_createServerFn_handler,
  submitSupplierApplication_createServerFn_handler
};
