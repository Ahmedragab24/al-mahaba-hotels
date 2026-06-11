import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { a as useHotelsLite } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { T as TAX_TYPES, a as TaxDialog } from "./-dialog-BwkmvjJS.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, $ as Search, a0 as Eye, _ as Pencil, a1 as RotateCcw, a2 as Archive, V as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-tooltip.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "./simulation-engine.server-CqcvilV1.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "./dialog-B3U_60pZ.mjs";
import "./textarea-BvXe9TDs.mjs";
const PAGE_SIZE = 20;
function TaxesList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [hotel, setHotel] = reactExports.useState("all");
  const [type, setType] = reactExports.useState("all");
  const [method, setMethod] = reactExports.useState("all");
  const [active, setActive] = reactExports.useState("all");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [dialog, setDialog] = reactExports.useState({
    open: false
  });
  const [confirm, setConfirm] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();
  const list = useQuery({
    queryKey: ["taxes", {
      dSearch,
      hotel,
      type,
      method,
      active,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("hotel_taxes").select("*, hotel:hotels(name_en,name_ar)", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (type !== "all") q = q.eq("tax_type", type);
      if (method !== "all") q = q.eq("calc_method", method);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s}`);
      }
      const from = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", {
        ascending: false
      }).range(from, from + PAGE_SIZE - 1);
      const {
        data,
        error,
        count
      } = await q;
      if (error) throw error;
      return {
        rows: data ?? [],
        count: count ?? 0
      };
    }
  });
  const archiveMut = useMutation({
    mutationFn: async ({
      id,
      action
    }) => {
      if (action === "delete") {
        const {
          error
        } = await supabase.from("hotel_taxes").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("hotel_taxes").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
          is_active: false
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_taxes").update({
          deleted_at: null,
          is_active: true
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["taxes"]
      });
      setConfirm(null);
    },
    onError: (e) => {
      toast.error(dbErrorMessage(e, t));
      setConfirm(null);
    }
  });
  const total = list.data?.count ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("taxes.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setDialog({
      open: true
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("taxes.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[200px] flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: t("actions.search"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotel, onValueChange: (v) => {
          setHotel(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.hotel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => {
          setType(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("label.tax_type") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            TAX_TYPES.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: x, children: t(`taxtype.${x}`) }, x))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: method, onValueChange: (v) => {
          setMethod(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("taxes.calc_method") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: t("calc.percentage") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: t("calc.fixed") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: active, onValueChange: (v) => {
          setActive(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: t("status.active") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inactive", children: t("status.inactive") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "ms-auto flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: showArchived, onCheckedChange: (v) => {
            setShowArchived(!!v);
            setPage(1);
          } }),
          t("filter.show_archived")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.hotel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.tax_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("taxes.calc_method") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.tax_value") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("taxes.effective_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            list.data?.rows.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: x.deleted_at ? "opacity-60" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: x.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/taxes/$id", params: {
                id: x.id
              }, className: "hover:underline", children: lang === "ar" ? x.name_ar || x.name_en : x.name_en || x.name_ar }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: x.hotel ? lang === "ar" ? x.hotel.name_ar || x.hotel.name_en : x.hotel.name_en || x.hotel.name_ar : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`taxtype.${x.tax_type}`) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`calc.${x.calc_method}`) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: x.calc_method === "percentage" ? `${x.value}%` : `${x.value} ${x.currency ?? ""}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: x.effective_date ? formatDate(x.effective_date, lang) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: x.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : x.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-transparent", children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/taxes/$id", params: {
                  id: x.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                canWrite && !x.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.edit"), onClick: () => setDialog({
                  open: true,
                  initial: x
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                auth.isAdmin && (x.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.restore"), onClick: () => setConfirm({
                  id: x.id,
                  action: "restore"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.archive"), onClick: () => setConfirm({
                  id: x.id,
                  action: "archive"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                auth.isAdmin && x.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setConfirm({
                  id: x.id,
                  action: "delete"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] }) })
            ] }, x.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TaxDialog, { open: dialog.open, onOpenChange: (v) => setDialog({
      open: v,
      initial: v ? dialog.initial : void 0
    }), initial: dialog.initial, onSaved: () => qc.invalidateQueries({
      queryKey: ["taxes"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && archiveMut.mutate(confirm) })
  ] });
}
export {
  TaxesList as component
};
