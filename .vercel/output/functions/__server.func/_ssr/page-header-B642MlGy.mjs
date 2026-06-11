import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState } from "../_libs/tanstack__react-router.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
const PATH_DESC = [
  ["/customers", "pagedesc.customers"],
  ["/hotels", "pagedesc.hotels"],
  ["/suppliers", "pagedesc.suppliers"],
  ["/supplier-applications", "pagedesc.supplier_applications"],
  ["/supplier-portal", "pagedesc.supplier_portal"],
  ["/rates/compare", "pagedesc.rates_compare"],
  ["/rates", "pagedesc.rates"],
  ["/contracts", "pagedesc.contracts"],
  ["/rfqs", "pagedesc.rfqs"],
  ["/quotations", "pagedesc.quotations"],
  ["/bookings", "pagedesc.bookings"],
  ["/invoices", "pagedesc.invoices"],
  ["/receipts", "pagedesc.receipts"],
  ["/payables", "pagedesc.payables"],
  ["/reports/financial", "pagedesc.reports_financial"],
  ["/reports/operational", "pagedesc.reports_operational"],
  ["/reports/tax", "pagedesc.reports_tax"],
  ["/reports/templates", "pagedesc.reports_templates"],
  ["/reports", "pagedesc.reports"],
  ["/room-types", "pagedesc.room_types"],
  ["/seasons", "pagedesc.seasons"],
  ["/taxes", "pagedesc.taxes"],
  ["/users", "pagedesc.users"],
  ["/audit", "pagedesc.audit"],
  ["/settings", "pagedesc.settings"],
  ["/approval-thresholds", "pagedesc.approval_thresholds"]
];
function lookupKey(pathname) {
  if (pathname === "/" || pathname === "") return "pagedesc.dashboard";
  const match = PATH_DESC.sort((a, b) => b[0].length - a[0].length).find(([p]) => pathname === p);
  return match?.[1];
}
function PageHeader({
  title,
  subtitle,
  description,
  actions
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const autoKey = lookupKey(pathname);
  const autoDesc = autoKey ? t(autoKey, "") : "";
  const desc = description ?? (autoDesc && autoDesc !== autoKey ? autoDesc : void 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 border-b bg-background/60 px-6 py-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "break-words text-2xl font-semibold leading-tight text-foreground", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 break-words text-base text-muted-foreground", children: subtitle }),
      desc && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-3xl text-sm text-muted-foreground/90", children: desc })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
  ] });
}
export {
  PageHeader as P
};
