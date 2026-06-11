import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { a as useHotelsLite, e as useHotelRoomTypes } from "./lookups-DjTAjyZF.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as StatusPill } from "./status-pill-B67QFpI4.mjs";
import { a as formatDate, f as formatDateTime } from "./format-CMnhdgFc.mjs";
import "../_libs/sonner.mjs";
import { az as Trophy, I as Building2, a0 as Eye } from "../_libs/lucide-react.mjs";
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
function CompareRates() {
  const {
    t,
    lang
  } = useI18n();
  const hotels = useHotelsLite();
  const [hotelId, setHotelId] = reactExports.useState("");
  const [roomTypeId, setRoomTypeId] = reactExports.useState("all");
  const [checkIn, setCheckIn] = reactExports.useState("");
  const [checkOut, setCheckOut] = reactExports.useState("");
  const roomTypes = useHotelRoomTypes(hotelId || null);
  const list = useQuery({
    queryKey: ["rates-compare", {
      hotelId,
      roomTypeId,
      checkIn,
      checkOut
    }],
    enabled: !!hotelId,
    queryFn: async () => {
      let q = supabase.from("rates").select("id,code,hotel_id,supplier_id,room_type_id,meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,is_direct,version,created_at,created_by,supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar),hotel:hotels(name_en,name_ar)").eq("hotel_id", hotelId).is("deleted_at", null).is("superseded_at", null);
      if (roomTypeId !== "all") q = q.eq("room_type_id", roomTypeId);
      if (checkIn) q = q.gte("valid_to", checkIn);
      if (checkOut) q = q.lte("valid_from", checkOut);
      const {
        data,
        error
      } = await q.order("cost_per_night", {
        ascending: true
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const rows = reactExports.useMemo(() => list.data ?? [], [list.data]);
  const bestId = rows[0]?.id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rates.compare_title"), subtitle: t("rates.compare_hint") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotelId, onValueChange: (v) => {
          setHotelId(v);
          setRoomTypeId("all");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rates.hotel") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: lang === "ar" ? h.name_ar || h.name_en : h.name_en || h.name_ar }, h.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: roomTypeId, onValueChange: setRoomTypeId, disabled: !hotelId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rates.room_type") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: t("filter.all") }),
            roomTypes.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar }, r.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: checkIn, onChange: (e) => setCheckIn(e.target.value), placeholder: t("rates.valid_from") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: checkOut, onChange: (e) => setCheckOut(e.target.value), placeholder: t("rates.valid_to") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.source") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.room_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.meal_plan") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.cost") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.selling") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.entered_at") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.entered_by") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          !hotelId && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 13, className: "text-center text-muted-foreground py-10", children: t("rates.compare_hint") }) }),
          hotelId && list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 13, className: "text-center text-muted-foreground py-10", children: t("label.loading") }) }),
          hotelId && !list.isLoading && rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 13, className: "text-center text-muted-foreground py-10", children: t("label.no_results") }) }),
          rows.map((r) => {
            const isBest = r.id === bestId;
            const sourceName = r.is_direct ? t("rates.source.direct") : lang === "ar" ? r.supplier?.name_ar || r.supplier?.name_en : r.supplier?.name_en || r.supplier?.name_ar;
            const enteredBy = r.creator ? (lang === "ar" ? r.creator.full_name_ar || r.creator.full_name_en : r.creator.full_name_en || r.creator.full_name_ar) || r.creator.email : "—";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: isBest ? "bg-primary/5" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: isBest && /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                r.is_direct && /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sourceName }),
                isBest && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: "text-[10px]", children: t("rates.best_price") }),
                r.is_direct && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px]", children: t("rates.is_direct_short") })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: lang === "ar" ? r.room_type?.name_ar || r.room_type?.name_en : r.room_type?.name_en || r.room_type?.name_ar }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: t(`board.${r.meal_plan}`, r.meal_plan) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: Number(r.cost_per_night).toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: r.selling_price ? Number(r.selling_price).toFixed(2) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: r.currency }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDate(r.valid_from) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDate(r.valid_to) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDateTime(r.created_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: enteredBy }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "icon", title: t("actions.view"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/rates/$id", params: {
                id: r.id
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }) }) })
            ] }, r.id);
          })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  CompareRates as component
};
