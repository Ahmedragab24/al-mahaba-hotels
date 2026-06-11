import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { a as useHotelsLite, c as useSuppliersLite } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as StatusPill } from "./status-pill-B67QFpI4.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as formatDate } from "./format-CMnhdgFc.mjs";
import { ag as GitCompare, Z as Plus, $ as Search, a0 as Eye, _ as Pencil, a1 as RotateCcw, a2 as Archive, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const STATUSES = ["draft", "pending_approval", "approved", "rejected", "expired"];
const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"];
function RatesList() {
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
  const [hotelId, setHotelId] = reactExports.useState("all");
  const [supplierId, setSupplierId] = reactExports.useState("all");
  const [board, setBoard] = reactExports.useState("all");
  const [from, setFrom] = reactExports.useState("");
  const [to, setTo] = reactExports.useState("");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [latestOnly, setLatestOnly] = reactExports.useState(true);
  const [page, setPage] = reactExports.useState(1);
  const [confirm, setConfirm] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();
  const suppliers = useSuppliersLite();
  const list = useQuery({
    queryKey: ["rates", {
      dSearch,
      status,
      hotelId,
      supplierId,
      board,
      from,
      to,
      showArchived,
      latestOnly,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("rates").select("id,code,hotel_id,supplier_id,room_type_id,meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,deleted_at,is_direct,version,superseded_at,hotel:hotels(name_en,name_ar),supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar)", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (latestOnly) q = q.is("superseded_at", null);
      if (status !== "all") q = q.eq("status", status);
      if (hotelId !== "all") q = q.eq("hotel_id", hotelId);
      if (supplierId !== "all") q = q.eq("supplier_id", supplierId);
      if (board !== "all") q = q.eq("meal_plan", board);
      if (from) q = q.gte("valid_to", from);
      if (to) q = q.lte("valid_from", to);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},notes_en.ilike.${s},notes_ar.ilike.${s}`);
      }
      const off = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", {
        ascending: false
      }).range(off, off + PAGE_SIZE - 1);
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
  const mut = useMutation({
    mutationFn: async ({
      id,
      action
    }) => {
      if (action === "delete") {
        const {
          error
        } = await supabase.from("rates").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("rates").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("rates").update({
          deleted_at: null
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["rates"]
      });
      setConfirm(null);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const total = list.data?.count ?? 0;
  const actions = reactExports.useMemo(() => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/rates/compare", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GitCompare, { className: "h-4 w-4" }),
      t("rates.compare")
    ] }) }),
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
      to: "/rates/new"
    }), size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("rates.new")
    ] })
  ] }), [canWrite, navigate, t]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rates.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative sm:col-span-2 lg:col-span-3 xl:col-span-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          }, placeholder: t("actions.search"), className: "ps-8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotelId, onValueChange: (v) => {
          setHotelId(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.hotel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: supplierId, onValueChange: (v) => {
          setSupplierId(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.supplier") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }, s.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: board, onValueChange: (v) => {
          setBoard(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rates.meal_plan") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            BOARDS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: t(`board.${b}`) }, b))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: status, onValueChange: (v) => {
          setStatus(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.status") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`status.${s}`) }, s))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: from, onChange: (e) => {
          setFrom(e.target.value);
          setPage(1);
        }, className: "w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: to, onChange: (e) => {
          setTo(e.target.value);
          setPage(1);
        }, className: "w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: latestOnly, onCheckedChange: (v) => {
            setLatestOnly(!!v);
            setPage(1);
          } }),
          t("rates.latest_only")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: showArchived, onCheckedChange: (v) => {
            setShowArchived(!!v);
            setPage(1);
          } }),
          t("filter.show_archived")
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.hotel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.supplier") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.room_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.meal_plan") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_from") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_to") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.cost") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.selling") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
            list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 12, className: "text-center text-muted-foreground py-10", children: t("label.loading") }) }),
            !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 12, className: "text-center text-muted-foreground py-10", children: t("label.no_results") }) }),
            list.data?.rows.map((r) => {
              const h = r.hotel ?? {};
              const s = r.supplier ?? {};
              const rt = r.room_type ?? {};
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `whitespace-nowrap ${r.deleted_at ? "opacity-60" : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.code }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
                  id: r.id
                }, className: "hover:underline font-medium", children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: lang === "ar" ? rt.name_ar || rt.name_en : rt.name_en || rt.name_ar }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`board.${r.meal_plan}`, r.meal_plan) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDate(r.valid_from) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDate(r.valid_to) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono text-xs", children: Number(r.cost_per_night).toFixed(2) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono text-xs", children: r.selling_price ? Number(r.selling_price).toFixed(2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: r.currency }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
                    id: r.id
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                  canWrite && !r.deleted_at && r.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
                    id: r.id
                  }, search: {
                    edit: 1
                  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) }),
                  auth.isAdmin && (r.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.restore"), onClick: () => setConfirm({
                    id: r.id,
                    action: "restore"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.archive"), onClick: () => setConfirm({
                    id: r.id,
                    action: "archive"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                  auth.isAdmin && r.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.delete"), onClick: () => setConfirm({
                    id: r.id,
                    action: "delete"
                  }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
                ] }) })
              ] }, r.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && mut.mutate(confirm) })
  ] });
}
export {
  RatesList as component
};
