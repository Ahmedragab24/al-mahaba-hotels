import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { b as useCountries } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as StatusPill$1 } from "./status-pill-B67QFpI4.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, U as Users, aq as UserCheck, ar as UserX, a2 as Archive, as as CreditCard, a4 as Calendar, $ as Search, a0 as Eye, _ as Pencil, a1 as RotateCcw, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const PAGE_SIZE = 20;
const TYPES = ["corporate", "individual", "agency", "government"];
const STATUSES = ["active", "inactive", "archived"];
function CustomersList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager"]);
  const [search, setSearch] = reactExports.useState("");
  const [type, setType] = reactExports.useState("all");
  const [status, setStatus] = reactExports.useState("all");
  const [country, setCountry] = reactExports.useState("all");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [confirmId, setConfirmId] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const countries = useCountries();
  const metrics = useQuery({
    queryKey: ["customers-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("customers").select("status,credit_limit,created_at,deleted_at");
      const rows = data ?? [];
      const monthStart = /* @__PURE__ */ new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return {
        total: rows.filter((r) => !r.deleted_at).length,
        active: rows.filter((r) => r.status === "active" && !r.deleted_at).length,
        inactive: rows.filter((r) => r.status === "inactive" && !r.deleted_at).length,
        archived: rows.filter((r) => r.deleted_at).length,
        withCredit: rows.filter((r) => Number(r.credit_limit) > 0 && !r.deleted_at).length,
        thisMonth: rows.filter((r) => new Date(r.created_at) >= monthStart && !r.deleted_at).length
      };
    }
  });
  const list = useQuery({
    queryKey: ["customers", {
      dSearch,
      type,
      status,
      country,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("customers").select("id,code,name_en,name_ar,customer_type,email,phone,country_code,status,credit_limit,rating,preferred_language,created_at,deleted_at", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (type !== "all") q = q.eq("customer_type", type);
      if (status !== "all") q = q.eq("status", status);
      if (country !== "all") q = q.eq("country_code", country);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},email.ilike.${s},phone.ilike.${s},tax_number.ilike.${s}`);
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
        } = await supabase.from("customers").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("customers").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "archived"
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("customers").update({
          deleted_at: null,
          status: "active"
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "delete" ? t("toast.deleted") : v.action === "archive" ? t("toast.deleted") : t("toast.restored"));
      qc.invalidateQueries({
        queryKey: ["customers"]
      });
      setConfirmId(null);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const total = list.data?.count ?? 0;
  const actions = reactExports.useMemo(() => canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
    to: "/customers/new"
  }), size: "sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
    " ",
    t("customers.new")
  ] }), [canWrite, navigate, t]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("customers.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Users, tone: "primary", label: t("kpi.total"), value: metrics.data?.total ?? "—", active: status === "all" && !showArchived, onClick: () => {
          setStatus("all");
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: UserCheck, tone: "success", label: t("kpi.active"), value: metrics.data?.active ?? "—", active: status === "active", onClick: () => {
          setStatus("active");
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: UserX, tone: "warning", label: t("kpi.inactive"), value: metrics.data?.inactive ?? "—", active: status === "inactive", onClick: () => {
          setStatus("inactive");
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Archive, tone: "muted", label: t("kpi.archived"), value: metrics.data?.archived ?? "—", active: showArchived, onClick: () => {
          setShowArchived(true);
          setStatus("all");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CreditCard, tone: "info", label: t("kpi.with_credit"), value: metrics.data?.withCredit ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Calendar, tone: "info", label: t("kpi.this_month"), value: metrics.data?.thisMonth ?? "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t("filter.all"), tone: "primary", active: type === "all", onClick: () => {
          setType("all");
          setPage(1);
        } }),
        TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t(`ctype.${c}`), tone: "info", active: type === c, onClick: () => {
          setType(c);
          setPage(1);
        } }, c))
      ] }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.type") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: t(`ctype.${c}`) }, c))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => {
          setStatus(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`status.${s}`) }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: country, onValueChange: (v) => {
          setCountry(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.country") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            countries.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: lang === "ar" ? c.name_ar : c.name_en }, c.code))
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("filter.type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.country") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-10", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-10", children: t("label.no_results") }) }),
            list.data?.rows.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: c.deleted_at ? "opacity-60" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: c.code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/customers/$id", params: {
                id: c.id
              }, className: "hover:underline", children: lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`ctype.${c.customer_type}`) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: c.email }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: c.phone }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: c.country_code }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill$1, { status: c.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/customers/$id", params: {
                  id: c.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                canWrite && !c.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/customers/$id", params: {
                  id: c.id
                }, search: {
                  edit: 1
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) }),
                auth.isAdmin && (c.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.restore"), onClick: () => setConfirmId({
                  id: c.id,
                  action: "restore"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.archive"), onClick: () => setConfirmId({
                  id: c.id,
                  action: "archive"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                auth.isAdmin && c.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setConfirmId({
                  id: c.id,
                  action: "delete"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] }) })
            ] }, c.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirmId, onOpenChange: (v) => !v && setConfirmId(null), title: confirmId?.action === "restore" ? t("actions.restore") : confirmId?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirmId?.action === "delete" ? t("toast.confirm_delete") : confirmId?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirmId?.action !== "restore", onConfirm: () => confirmId && archiveMut.mutate(confirmId) })
  ] });
}
export {
  CustomersList as component
};
