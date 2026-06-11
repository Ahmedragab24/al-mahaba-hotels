import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { c as useSuppliersLite, a as useHotelsLite } from "./lookups-DjTAjyZF.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
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
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { Z as Plus, d as FilePenLine, C as CircleCheck, D as Clock, ae as TriangleAlert, ao as FilePen, a2 as Archive, $ as Search, z as CircleX, a0 as Eye, _ as Pencil, a1 as RotateCcw, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const STATUSES = ["draft", "active", "suspended", "expired", "terminated", "closed"];
const TYPES = ["allotment", "free_sale", "on_request", "commitment", "other"];
function ContractsList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("all");
  const [supplier, setSupplier] = reactExports.useState("all");
  const [hotel, setHotel] = reactExports.useState("all");
  const [type, setType] = reactExports.useState("all");
  const [expiring, setExpiring] = reactExports.useState(false);
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [confirm, setConfirm] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const suppliers = useSuppliersLite();
  const hotels = useHotelsLite();
  const metrics = useQuery({
    queryKey: ["contracts-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("supplier_contracts").select("status,end_date,deleted_at");
      const rows = data ?? [];
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      const in30 = /* @__PURE__ */ new Date();
      in30.setDate(in30.getDate() + 30);
      const in30Str = in30.toISOString().slice(0, 10);
      const live = rows.filter((r) => !r.deleted_at);
      return {
        total: live.length,
        active: live.filter((r) => r.status === "active").length,
        draft: live.filter((r) => r.status === "draft").length,
        expiringSoon: live.filter((r) => r.status === "active" && r.end_date && r.end_date >= today && r.end_date <= in30Str).length,
        expired: live.filter((r) => r.status === "expired" || r.end_date && r.end_date < today && r.status !== "draft").length,
        archived: rows.filter((r) => r.deleted_at).length
      };
    }
  });
  const list = useQuery({
    queryKey: ["contracts", {
      dSearch,
      status,
      supplier,
      hotel,
      type,
      expiring,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("supplier_contracts").select("id,contract_number,title,contract_type,status,start_date,end_date,currency,commission_pct,deleted_at,created_at,supplier:suppliers(name_en,name_ar),hotel:hotels(name_en,name_ar)", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status);
      if (supplier !== "all") q = q.eq("supplier_id", supplier);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (type !== "all") q = q.eq("contract_type", type);
      if (expiring) {
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const in30 = /* @__PURE__ */ new Date();
        in30.setDate(in30.getDate() + 30);
        q = q.gte("end_date", today).lte("end_date", in30.toISOString().slice(0, 10)).eq("status", "active");
      }
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`contract_number.ilike.${s},title.ilike.${s}`);
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
        } = await supabase.from("supplier_contracts").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("supplier_contracts").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("supplier_contracts").update({
          deleted_at: null
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["contracts"]
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("contracts.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({
      to: "/contracts/new"
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("contracts.new")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: FilePenLine, tone: "primary", label: t("kpi.total"), value: metrics.data?.total ?? "—", active: status === "all" && !showArchived && !expiring, onClick: () => {
          setStatus("all");
          setExpiring(false);
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "success", label: t("status.active"), value: metrics.data?.active ?? "—", active: status === "active", onClick: () => {
          setStatus("active");
          setExpiring(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Clock, tone: "warning", label: t("kpi.expiring_soon"), value: metrics.data?.expiringSoon ?? "—", active: expiring, onClick: () => {
          setExpiring(!expiring);
          setStatus("all");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: TriangleAlert, tone: "destructive", label: t("kpi.expired"), value: metrics.data?.expired ?? "—", active: status === "expired", onClick: () => {
          setStatus("expired");
          setExpiring(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: FilePen, tone: "muted", label: t("kpi.draft"), value: metrics.data?.draft ?? "—", active: status === "draft", onClick: () => {
          setStatus("draft");
          setExpiring(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Archive, tone: "muted", label: t("kpi.archived"), value: metrics.data?.archived ?? "—", active: showArchived, onClick: () => {
          setShowArchived(true);
          setStatus("all");
          setExpiring(false);
          setPage(1);
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t("filter.all"), tone: "primary", active: type === "all", onClick: () => {
          setType("all");
          setPage(1);
        } }),
        TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t(`ctrtype.${c}`), tone: "info", active: type === c, onClick: () => {
          setType(c);
          setPage(1);
        } }, c))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[200px] flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: t("actions.search"), className: "ps-8" })
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: supplier, onValueChange: (v) => {
          setSupplier(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.supplier") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }, s.id))
          ] })
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("contracts.type") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            TYPES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: t(`ctrtype.${c}`) }, c))
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.contract_number") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("contracts.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("contracts.supplier") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("contracts.hotel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("contracts.type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("contracts.period") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("label.no_results") }) }),
            list.data?.rows.map((c) => {
              const today = /* @__PURE__ */ new Date();
              today.setHours(0, 0, 0, 0);
              const end = c.end_date ? new Date(c.end_date) : null;
              const daysLeft = end ? Math.ceil((end.getTime() - today.getTime()) / 864e5) : null;
              const isExpiringSoon = c.status === "active" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
              const isExpired = daysLeft !== null && daysLeft < 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `${c.deleted_at ? "opacity-60" : ""} ${isExpiringSoon ? "bg-amber-500/5" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contracts/$id", params: {
                  id: c.id
                }, className: "hover:underline", children: c.contract_number }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm font-medium", children: c.title ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: c.supplier ? lang === "ar" ? c.supplier.name_ar || c.supplier.name_en : c.supplier.name_en || c.supplier.name_ar : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: c.hotel ? lang === "ar" ? c.hotel.name_ar || c.hotel.name_en : c.hotel.name_en || c.hotel.name_ar : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`ctrtype.${c.contract_type}`) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    formatDate(c.start_date, lang),
                    " → ",
                    formatDate(c.end_date, lang)
                  ] }),
                  isExpiringSoon && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                    daysLeft,
                    "d"
                  ] }),
                  isExpired && c.status !== "draft" && !c.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                    t("kpi.expired")
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: c.currency ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill$1, { status: c.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contracts/$id", params: {
                    id: c.id
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                  canWrite && !c.deleted_at && c.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contracts/$id", params: {
                    id: c.id
                  }, search: {
                    edit: 1
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) }),
                  auth.isAdmin && (c.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.restore"), onClick: () => setConfirm({
                    id: c.id,
                    action: "restore"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.archive"), onClick: () => setConfirm({
                    id: c.id,
                    action: "archive"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                  auth.isAdmin && c.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setConfirm({
                    id: c.id,
                    action: "delete"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
                ] }) })
              ] }, c.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && archiveMut.mutate(confirm) })
  ] });
}
export {
  ContractsList as component
};
