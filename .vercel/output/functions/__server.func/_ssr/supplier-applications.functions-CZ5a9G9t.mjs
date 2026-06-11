import { c as createSsrRpc } from "./createSsrRpc-BABjPGaI.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DICWdMih.mjs";
const submitSupplierApplication = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("b8611767573173fcab9afceb879ad874727f709ad3c6f451d8e9c48ecb7b10d8"));
const listSupplierApplications = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("959bea8a9a4718b339e568ae92c3741ddd3beecdec5ad3ab1c8251835521451e"));
const approveSupplierApplication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("b9e8df6b4da1f46baf3f4ba6ba73f427d34a2dd678fa07a13cc244b245dd1434"));
const rejectSupplierApplication = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(createSsrRpc("233e72260b6dbc6ca6df3cee8afd16ad27f16278b1d044ae8aa1e0f2a00eb8f3"));
const getApplyLookups = createServerFn({
  method: "GET"
}).handler(createSsrRpc("72b5ac57297d225585f74c049f8d4e24bfefb63a9841732baf2ccf597a526432"));
export {
  approveSupplierApplication as a,
  getApplyLookups as g,
  listSupplierApplications as l,
  rejectSupplierApplication as r,
  submitSupplierApplication as s
};
