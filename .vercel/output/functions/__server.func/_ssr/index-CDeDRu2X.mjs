import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { S as SEASON_TYPES, a as SeasonDialog } from "./-dialog-DXlrXd95.mjs";
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
function SeasonsList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [type, setType] = reactExports.useState("all");
  const [active, setActive] = reactExports.useState("all");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [dialog, setDialog] = reactExports.useState({
    open: false
  });
  const [confirm, setConfirm] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const list = useQuery({
    queryKey: ["seasons", {
      dSearch,
      type,
      active,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("seasons").select("*", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (type !== "all") q = q.eq("season_type", type);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s}`);
      }
      const from = (page - 1) * PAGE_SIZE;
      q = q.order("start_date", {
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
        } = await supabase.from("seasons").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("seasons").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
          is_active: false
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("seasons").update({
          deleted_at: null,
          is_active: true
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["seasons"]
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("seasons.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setDialog({
      open: true
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("seasons.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: t("actions.search"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => {
          setType(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("seasons.type") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            SEASON_TYPES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`season_type.${s}`) }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: active, onValueChange: (v) => {
          setActive(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.season_name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("seasons.type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.start_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.end_date") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            list.data?.rows.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: s.deleted_at ? "opacity-60" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: s.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/seasons/$id", params: {
                id: s.id
              }, className: "hover:underline", children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`season_type.${s.season_type}`) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(s.start_date, lang) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(s.end_date, lang) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: s.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : s.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-transparent", children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/seasons/$id", params: {
                  id: s.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                canWrite && !s.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.edit"), onClick: () => setDialog({
                  open: true,
                  initial: s
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                auth.isAdmin && (s.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.restore"), onClick: () => setConfirm({
                  id: s.id,
                  action: "restore"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.archive"), onClick: () => setConfirm({
                  id: s.id,
                  action: "archive"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                auth.isAdmin && s.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setConfirm({
                  id: s.id,
                  action: "delete"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] }) })
            ] }, s.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SeasonDialog, { open: dialog.open, onOpenChange: (v) => setDialog({
      open: v,
      initial: v ? dialog.initial : void 0
    }), initial: dialog.initial, onSaved: () => qc.invalidateQueries({
      queryKey: ["seasons"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && archiveMut.mutate(confirm) })
  ] });
}
export {
  SeasonsList as component
};
