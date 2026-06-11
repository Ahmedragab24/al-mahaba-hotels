import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { R as Route$p, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { a as TaxDialog } from "./_ssr/-dialog-BwkmvjJS.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import "./_libs/sonner.mjs";
import { A as ArrowLeft, _ as Pencil } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/supabase__supabase-js.mjs";
import "./_libs/supabase__postgrest-js.mjs";
import "./_libs/supabase__realtime-js.mjs";
import "./_libs/supabase__phoenix.mjs";
import "./_libs/supabase__storage-js.mjs";
import "./_libs/iceberg-js.mjs";
import "./_libs/supabase__auth-js.mjs";
import "tslib";
import "./_libs/supabase__functions-js.mjs";
import "./_libs/radix-ui__react-direction.mjs";
import "./_libs/radix-ui__react-tooltip.mjs";
import "./_libs/radix-ui__primitive.mjs";
import "./_libs/radix-ui__react-compose-refs.mjs";
import "./_libs/radix-ui__react-context.mjs";
import "./_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "./_libs/radix-ui__react-primitive.mjs";
import "./_libs/radix-ui__react-slot.mjs";
import "./_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "./_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "./_libs/radix-ui__react-id.mjs";
import "./_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "./_libs/radix-ui__react-popper.mjs";
import "./_libs/floating-ui__react-dom.mjs";
import "./_libs/floating-ui__dom.mjs";
import "./_libs/floating-ui__core.mjs";
import "./_libs/floating-ui__utils.mjs";
import "./_libs/radix-ui__react-arrow.mjs";
import "./_libs/radix-ui__react-use-size.mjs";
import "./_libs/radix-ui__react-portal.mjs";
import "./_libs/radix-ui__react-presence.mjs";
import "./_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "./_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "./_libs/clsx.mjs";
import "./_libs/tailwind-merge.mjs";
import "./_libs/class-variance-authority.mjs";
import "./_ssr/simulation-engine.server-CqcvilV1.mjs";
import "./_ssr/table-BQwhu8us.mjs";
import "./_libs/radix-ui__react-tabs.mjs";
import "./_libs/radix-ui__react-roving-focus.mjs";
import "./_libs/radix-ui__react-collection.mjs";
import "./_ssr/lookups-DjTAjyZF.mjs";
import "./_ssr/db-errors-CH7zwDRs.mjs";
import "./_ssr/dialog-B3U_60pZ.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/aria-hidden.mjs";
import "./_ssr/input-B9Lwb7ES.mjs";
import "./_ssr/textarea-BvXe9TDs.mjs";
import "./_ssr/checkbox-Co4oTAVV.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_ssr/select-CiTC5spL.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
function KV({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: mono ? "font-mono text-sm" : "text-sm", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function TaxDetail() {
  const {
    id
  } = Route$p.useParams();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent"]);
  const [editing, setEditing] = reactExports.useState(false);
  const q = useQuery({
    queryKey: ["tax", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("hotel_taxes").select("*, hotel:hotels(id,name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("taxes.no_found") });
  const x = q.data;
  const name = lang === "ar" ? x.name_ar || x.name_en : x.name_en || x.name_ar;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: name, subtitle: `${x.code} · ${t(`taxtype.${x.tax_type}`)}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/taxes"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      canWrite && !x.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      x.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: x.is_active ? "active" : "inactive" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("room_types.tab.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("room_types.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.code"), value: x.code, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_en"), value: x.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_ar"), value: x.name_ar }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("filter.hotel"), value: x.hotel ? lang === "ar" ? x.hotel.name_ar || x.hotel.name_en : x.hotel.name_en || x.hotel.name_ar : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.tax_type"), value: t(`taxtype.${x.tax_type}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("taxes.calc_method"), value: t(`calc.${x.calc_method}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.tax_value"), value: x.calc_method === "percentage" ? `${x.value}%` : `${x.value} ${x.currency ?? ""}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("taxes.apply_scope"), value: x.apply_scope ? t(`scope.${x.apply_scope}`) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.inclusive"), value: x.is_inclusive ? t("status.active") : t("status.inactive") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("taxes.effective_date"), value: x.effective_date ? formatDate(x.effective_date, lang) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("taxes.expiry_date"), value: x.expiry_date ? formatDate(x.expiry_date, lang) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(x.created_at, lang) }),
        x.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: x.notes })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "hotel_taxes", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TaxDialog, { open: editing, onOpenChange: setEditing, initial: x, onSaved: () => {
      qc.invalidateQueries({
        queryKey: ["tax", id]
      });
      qc.invalidateQueries({
        queryKey: ["taxes"]
      });
    } })
  ] });
}
export {
  TaxDetail as component
};
