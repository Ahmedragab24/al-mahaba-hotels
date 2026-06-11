import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { i as Route$l, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { R as RoomTypeDialog } from "./_ssr/-dialog-DbuqTlLI.mjs";
import { f as formatDateTime, a as formatDate, b as formatMoney } from "./_ssr/format-CMnhdgFc.mjs";
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
function RoomTypeDetail() {
  const {
    id
  } = Route$l.useParams();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = reactExports.useState(false);
  const q = useQuery({
    queryKey: ["room-type", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("hotel_room_types").select("*, hotel:hotels(id,name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const rates = useQuery({
    queryKey: ["room-type-rates", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rates").select("id,code,valid_from,valid_to,currency,cost_per_night,selling_price,status,deleted_at").eq("room_type_id", id).order("valid_from", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      return data ?? [];
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("room_types.no_found") });
  const r = q.data;
  const name = lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: name, subtitle: `${r.code} · ${r.hotel ? lang === "ar" ? r.hotel.name_ar || r.hotel.name_en : r.hotel.name_en || r.hotel.name_ar : ""}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/room-types"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      canWrite && !r.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      r.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.is_active ? "active" : "inactive" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("room_types.tab.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "rates", children: [
          t("contracts.tab.rates"),
          " (",
          rates.data?.length ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("room_types.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.code"), value: r.code, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_en"), value: r.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_ar"), value: r.name_ar }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("room_types.hotel"), value: r.hotel ? lang === "ar" ? r.hotel.name_ar : r.hotel.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.max_adults"), value: r.max_adults }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.max_children"), value: r.max_children }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.max_occupancy"), value: r.max_occupancy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.bed_type"), value: r.bed_type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.size_sqm"), value: r.size_sqm }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("room_types.smoking"), value: r.smoking_allowed ? t("status.active") : t("status.inactive") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(r.created_at, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.updated_at"), value: formatDateTime(r.updated_at, lang) }),
        (r.description_en || r.description_ar) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.description") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: lang === "ar" ? r.description_ar || r.description_en : r.description_en || r.description_ar })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rates", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.tax_value") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          (rates.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("contracts.no_rates") }) }),
          rates.data?.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: x.deleted_at ? "opacity-60" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
              id: x.id
            }, className: "hover:underline", children: x.code }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(x.valid_from, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(x.valid_to, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: x.currency }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatMoney(x.selling_price ?? x.cost_per_night, x.currency, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: x.status }) })
          ] }, x.id))
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "hotel_room_types", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoomTypeDialog, { open: editing, onOpenChange: setEditing, initial: r, onSaved: () => {
      qc.invalidateQueries({
        queryKey: ["room-type", id]
      });
      qc.invalidateQueries({
        queryKey: ["room-types"]
      });
    } })
  ] });
}
export {
  RoomTypeDetail as component
};
