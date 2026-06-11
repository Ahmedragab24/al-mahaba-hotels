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
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Skeleton } from "./skeleton-BMJ61lxQ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { R as RoomTypeDialog } from "./-dialog-DbuqTlLI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { h as hotelImg1, a as hotelImg2, b as hotelImg3, c as hotelImg4, d as hotelImg5, e as hotelImg6 } from "./hotel-6-CnuuPipU.mjs";
import { Z as Plus, $ as Search, a6 as CigaretteOff, U as Users, B as BedDouble, a7 as Ruler, a0 as Eye, _ as Pencil, a1 as RotateCcw, a2 as Archive, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const PAGE_SIZE = 12;
const HOTEL_IMAGES = [hotelImg1, hotelImg2, hotelImg3, hotelImg4, hotelImg5, hotelImg6];
function hotelImage(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
  return HOTEL_IMAGES[h % HOTEL_IMAGES.length];
}
function RoomTypesList() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [search, setSearch] = reactExports.useState("");
  const [hotel, setHotel] = reactExports.useState("all");
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
    queryKey: ["room-types", {
      dSearch,
      hotel,
      active,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("hotel_room_types").select("id,code,name_en,name_ar,max_adults,max_children,max_occupancy,bed_type,size_sqm,smoking_allowed,is_active,deleted_at,created_at,hotel_id,hotel:hotels(name_en,name_ar)", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},bed_type.ilike.${s}`);
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
      if (action !== "restore") {
        const {
          count
        } = await supabase.from("rates").select("*", {
          count: "exact",
          head: true
        }).eq("room_type_id", id).is("deleted_at", null).in("status", ["approved", "pending_approval"]);
        if ((count ?? 0) > 0) throw new Error(t("room_types.err_linked_rates"));
      }
      if (action === "delete") {
        const {
          error
        } = await supabase.from("hotel_room_types").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("hotel_room_types").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
          is_active: false
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotel_room_types").update({
          deleted_at: null,
          is_active: true
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["room-types"]
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("room_types.title"), subtitle: `${total} ${t("label.total")}`, actions: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setDialog({
      open: true
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("room_types.new")
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotel, onValueChange: (v) => {
          setHotel(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("filter.hotel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id))
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
      list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", children: Array.from({
        length: 6
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-[3/2] w-full rounded-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" })
        ] })
      ] }, i)) }),
      !list.isLoading && (list.data?.rows.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-muted-foreground", children: t("label.no_results") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", children: list.data?.rows.map((r) => {
        const name = lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar;
        const hotelName = r.hotel ? lang === "ar" ? r.hotel.name_ar || r.hotel.name_en : r.hotel.name_en || r.hotel.name_ar : "—";
        const occupancy = `${r.max_adults}+${r.max_children} / ${r.max_occupancy}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${r.deleted_at ? "opacity-60" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/room-types/$id", params: {
            id: r.id
          }, className: "relative block aspect-[3/2] overflow-hidden bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: hotelImage(r.id), alt: name, width: 768, height: 512, loading: "lazy", className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/60 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 start-3 flex items-center gap-2", children: r.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : r.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-transparent", children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
            r.smoking_allowed && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "absolute top-3 end-3 gap-1 bg-card/90 text-muted-foreground shadow backdrop-blur hover:bg-card/90", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CigaretteOff, { className: "h-3 w-3" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 start-3 end-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-background/90", children: r.code }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/room-types/$id", params: {
              id: r.id
            }, className: "line-clamp-1 text-base font-semibold hover:underline", children: name }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-primary", children: hotelName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: occupancy })
            ] }),
            r.bed_type && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: r.bed_type })
            ] }),
            r.size_sqm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                r.size_sqm,
                " m²"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: r.smoking_allowed ? t("room_types.smoking") : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/room-types/$id", params: {
                  id: r.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                canWrite && !r.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.edit"), onClick: () => setDialog({
                  open: true,
                  initial: r
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
                auth.isAdmin && (r.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.restore"), onClick: () => setConfirm({
                  id: r.id,
                  action: "restore"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.archive"), onClick: () => setConfirm({
                  id: r.id,
                  action: "archive"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                auth.isAdmin && r.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.delete"), onClick: () => setConfirm({
                  id: r.id,
                  action: "delete"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] })
            ] })
          ] })
        ] }, r.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RoomTypeDialog, { open: dialog.open, onOpenChange: (v) => setDialog({
      open: v,
      initial: v ? dialog.initial : void 0
    }), initial: dialog.initial, onSaved: () => qc.invalidateQueries({
      queryKey: ["room-types"]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && archiveMut.mutate(confirm) })
  ] });
}
export {
  RoomTypesList as component
};
