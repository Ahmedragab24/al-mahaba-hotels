import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useDebounce } from "./use-debounce-BYIrrWKj.mjs";
import { b as useCountries, d as useCities } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Skeleton } from "./skeleton-BMJ61lxQ.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { S as StatusPill$1 } from "./status-pill-B67QFpI4.mjs";
import { K as KpiCard, S as StatusPill } from "./list-toolkit-DQE3lAjc.mjs";
import { D as DataPagination } from "./data-pagination-RlANDSCw.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { h as hotelImg1, a as hotelImg2, b as hotelImg3, c as hotelImg4, d as hotelImg5, e as hotelImg6 } from "./hotel-6-CnuuPipU.mjs";
import { Z as Plus, k as Hotel, C as CircleCheck, ap as Crown, a2 as Archive, a4 as Calendar, $ as Search, a5 as Star, ab as MapPin, K as Phone, a0 as Eye, _ as Pencil, a1 as RotateCcw, V as Trash2 } from "../_libs/lucide-react.mjs";
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
const PAGE_SIZE = 12;
const STATUSES = ["active", "inactive", "archived"];
const STARS = [1, 2, 3, 4, 5];
const HOTEL_IMAGES = [hotelImg1, hotelImg2, hotelImg3, hotelImg4, hotelImg5, hotelImg6];
function hotelImage(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
  return HOTEL_IMAGES[h % HOTEL_IMAGES.length];
}
function HotelsList() {
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
  const [country, setCountry] = reactExports.useState("all");
  const [stars, setStars] = reactExports.useState("all");
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [page, setPage] = reactExports.useState(1);
  const [confirm, setConfirm] = reactExports.useState(null);
  const dSearch = useDebounce(search, 300);
  const countries = useCountries();
  const cities = useCities();
  const cityMap = reactExports.useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    cities.data?.forEach((c) => m.set(c.id, c));
    return m;
  }, [cities.data]);
  const metrics = useQuery({
    queryKey: ["hotels-metrics"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("hotels").select("status,star_rating,created_at,deleted_at");
      const rows = data ?? [];
      const monthStart = /* @__PURE__ */ new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      return {
        total: rows.filter((r) => !r.deleted_at).length,
        active: rows.filter((r) => r.status === "active" && !r.deleted_at).length,
        archived: rows.filter((r) => r.deleted_at).length,
        luxury: rows.filter((r) => Number(r.star_rating) === 5 && !r.deleted_at).length,
        thisMonth: rows.filter((r) => new Date(r.created_at) >= monthStart && !r.deleted_at).length
      };
    }
  });
  const list = useQuery({
    queryKey: ["hotels", {
      dSearch,
      status,
      country,
      stars,
      showArchived,
      page
    }],
    queryFn: async () => {
      let q = supabase.from("hotels").select("id,code,name_en,name_ar,brand,star_rating,country_code,city_id,district,phone,email,status,created_at,deleted_at", {
        count: "exact"
      });
      if (!showArchived) q = q.is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status);
      if (country !== "all") q = q.eq("country_code", country);
      if (stars !== "all") q = q.eq("star_rating", Number(stars));
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},brand.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
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
        } = await supabase.from("hotels").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const {
          error
        } = await supabase.from("hotels").update({
          deleted_at: (/* @__PURE__ */ new Date()).toISOString(),
          status: "archived"
        }).eq("id", id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("hotels").update({
          deleted_at: null,
          status: "active"
        }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["hotels"]
      });
      qc.invalidateQueries({
        queryKey: ["lookup", "hotels-lite"]
      });
      setConfirm(null);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const total = list.data?.count ?? 0;
  const actions = reactExports.useMemo(() => canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
    to: "/hotels/new"
  }), size: "sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
    " ",
    t("hotels.new")
  ] }), [canWrite, navigate, t]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("hotels.title"), subtitle: `${total} ${t("label.total")}`, actions }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Hotel, tone: "primary", label: t("kpi.total"), value: metrics.data?.total ?? "—", active: status === "all" && !showArchived, onClick: () => {
          setStatus("all");
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: CircleCheck, tone: "success", label: t("kpi.active"), value: metrics.data?.active ?? "—", active: status === "active", onClick: () => {
          setStatus("active");
          setShowArchived(false);
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Crown, tone: "warning", label: t("kpi.luxury"), value: metrics.data?.luxury ?? "—", active: stars === "5", onClick: () => {
          setStars(stars === "5" ? "all" : "5");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Archive, tone: "muted", label: t("kpi.archived"), value: metrics.data?.archived ?? "—", active: showArchived, onClick: () => {
          setShowArchived(true);
          setStatus("all");
          setPage(1);
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { icon: Calendar, tone: "info", label: t("kpi.this_month"), value: metrics.data?.thisMonth ?? "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: t("filter.all"), tone: "primary", active: stars === "all", onClick: () => {
          setStars("all");
          setPage(1);
        } }),
        STARS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { label: "★".repeat(n), tone: "warning", active: stars === String(n), onClick: () => {
          setStars(String(n));
          setPage(1);
        } }, n))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[220px] flex-1", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: stars, onValueChange: (v) => {
          setStars(v);
          setPage(1);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("label.stars") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            STARS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: "★".repeat(n) }, n))
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3", children: list.data?.rows.map((h) => {
        const name = lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar;
        const city = h.city_id ? cityMap.get(h.city_id) : null;
        const cityName = city ? lang === "ar" ? city.name_ar : city.name_en : null;
        const countryName = countries.data?.find((c) => c.code === h.country_code);
        const location = [cityName, countryName ? lang === "ar" ? countryName.name_ar : countryName.name_en : h.country_code].filter(Boolean).join("، ");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${h.deleted_at ? "opacity-60" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/hotels/$id", params: {
            id: h.id
          }, className: "relative block aspect-[3/2] overflow-hidden bg-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: hotelImage(h.id), alt: name, width: 768, height: 512, loading: "lazy", className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/60 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 start-3 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill$1, { status: h.status }) }),
            h.star_rating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "absolute top-3 end-3 gap-1 bg-card/90 text-amber-500 shadow backdrop-blur hover:bg-card/90", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: h.star_rating })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 start-3 end-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[11px] text-background/90", children: h.code }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/hotels/$id", params: {
              id: h.id
            }, className: "line-clamp-1 text-base font-semibold hover:underline", children: name }) }),
            h.brand && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-primary", children: h.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: location || "—" })
            ] }),
            h.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", children: h.phone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-amber-500 text-sm", children: h.star_rating ? "★".repeat(h.star_rating) : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/hotels/$id", params: {
                  id: h.id
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }),
                canWrite && !h.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.edit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/hotels/$id", params: {
                  id: h.id
                }, search: {
                  edit: 1
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) }),
                auth.isAdmin && (h.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.restore"), onClick: () => setConfirm({
                  id: h.id,
                  action: "restore"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.archive"), onClick: () => setConfirm({
                  id: h.id,
                  action: "archive"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) })),
                auth.isAdmin && h.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", title: t("actions.delete"), onClick: () => setConfirm({
                  id: h.id,
                  action: "delete"
                }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
              ] })
            ] })
          ] })
        ] }, h.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataPagination, { page, pageSize: PAGE_SIZE, total, onPage: setPage }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirm, onOpenChange: (v) => !v && setConfirm(null), title: confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive"), description: confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive"), destructive: confirm?.action !== "restore", onConfirm: () => confirm && archiveMut.mutate(confirm) })
  ] });
}
export {
  HotelsList as component
};
