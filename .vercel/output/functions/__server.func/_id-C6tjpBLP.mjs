import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { v as Route$1, u as useI18n, e as useAuth, f as BK_WRITE_ROLES, w as BkStatusBadge, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as TableFooter } from "./_ssr/table-BQwhu8us.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { d as dbErrorMessage } from "./_ssr/db-errors-CH7zwDRs.mjs";
import { B as BookingForm } from "./_ssr/-form-DF8o5QhD.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { a as OCCUPANCY_TYPES } from "./_ssr/-occupancy-Blvgo2AT.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { aw as Send, aE as Undo2, N as Check, at as LogIn, a as LogOut, ar as UserX, ax as Ban, A as ArrowLeft, _ as Pencil, Z as Plus, X, V as Trash2, a5 as Star } from "./_libs/lucide-react.mjs";
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
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_ssr/checkbox-Co4oTAVV.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
const BLANK$1 = { hotel_id: "", contract_id: "", rate_id: "", occupancy_type: "", check_in: "", check_out: "", rooms: 1 };
function useBookingRooms(bookingId) {
  return useQuery({
    queryKey: ["booking-rooms", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_rooms").select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar), supplier:suppliers(name_en,name_ar)").eq("booking_id", bookingId).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function RoomsTab({ bookingId, currency, editable, confirmable }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const rooms = useBookingRooms(bookingId);
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(BLANK$1);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [confNos, setConfNos] = reactExports.useState({});
  const nm = (o) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const money = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const contracts = useQuery({
    queryKey: ["bk-contracts", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () => (await supabase.from("supplier_contracts").select("id,contract_number,title,start_date").eq("hotel_id", form.hotel_id).eq("status", "active").is("deleted_at", null).order("start_date", { ascending: false })).data ?? []
  });
  const rates = useQuery({
    queryKey: ["bk-rates", form.hotel_id, form.contract_id],
    enabled: !!form.hotel_id && !!form.contract_id,
    queryFn: async () => (await supabase.from("rates").select("id,code,room_type_id,room_type:hotel_room_types(name_en,name_ar)").eq("hotel_id", form.hotel_id).eq("contract_id", form.contract_id).eq("status", "approved").is("deleted_at", null)).data ?? []
  });
  const occPrices = useQuery({
    queryKey: ["bk-occ-prices", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () => (await supabase.from("rate_occupancy_prices").select("occupancy_type,cost_price,selling_price").eq("rate_id", form.rate_id).eq("active", true)).data ?? []
  });
  const occSorted = reactExports.useMemo(
    () => [...occPrices.data ?? []].sort((a, b) => OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type)),
    [occPrices.data]
  );
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const save = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.rate_id || !form.occupancy_type) throw new Error(t("quotes.items.pricing_auto"));
      if (!form.check_in || !form.check_out) throw new Error(t("bk.err_room_dates"));
      const payload = {
        booking_id: bookingId,
        hotel_id: form.hotel_id,
        rate_id: form.rate_id,
        occupancy_type: form.occupancy_type,
        check_in: form.check_in,
        check_out: form.check_out,
        rooms: Math.max(1, Number(form.rooms) || 1),
        cost_price: null,
        selling_price: null
      };
      if (form.id) {
        const { error } = await supabase.from("booking_rooms").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("booking_rooms").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setForm(BLANK$1);
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
      qc.invalidateQueries({ queryKey: ["booking", bookingId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("booking_rooms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const confirmRoom = useMutation({
    mutationFn: async ({ id, status }) => {
      const patch = { confirmation_status: status };
      if (status === "confirmed") patch.supplier_confirmation_no = (confNos[id] ?? "").trim();
      const { error } = await supabase.from("booking_rooms").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["booking-rooms", bookingId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const rows = rooms.data ?? [];
  const sums = rows.reduce(
    (a, i) => ({ cost: a.cost + Number(i.total_cost), margin: a.margin + Number(i.margin), total: a.total + Number(i.total_selling) }),
    { cost: 0, margin: 0, total: 0 }
  );
  const confBadge = (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: s === "confirmed" ? "default" : s === "rejected" ? "destructive" : "outline",
      className: s === "confirmed" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0,
      children: t(`bkconf.${s}`)
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !editable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("bk.rooms.locked") }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("quotes.items.price_hint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(BLANK$1);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " ",
        t("bk.rooms.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.hotel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.room_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.occupancy") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_in") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_out") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: t("quotes.items.nights") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: t("quotes.items.rooms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.total_selling") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.rooms.supplier") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.rooms.confirmation") }),
        (editable || confirmable) && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 11, className: "py-10 text-center text-muted-foreground", children: t("bk.rooms.empty") }) }),
        rows.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: nm(i.hotel) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nm(i.room_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t(`occupancy.${i.occupancy_type}`, i.occupancy_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(i.check_in) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(i.check_out) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: i.nights }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: i.rooms }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-semibold", children: money(i.total_selling) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nm(i.supplier) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            confBadge(i.confirmation_status),
            i.supplier_confirmation_no && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "font-mono text-xs", children: i.supplier_confirmation_no })
          ] }) }),
          (editable || confirmable) && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            confirmable && i.confirmation_status !== "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: confNos[i.id] ?? "",
                  onChange: (e) => setConfNos((m) => ({ ...m, [i.id]: e.target.value })),
                  placeholder: t("bk.rooms.confirmation_no"),
                  className: "h-7 w-32 text-xs",
                  dir: "ltr"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-7 w-7 text-emerald-600",
                  title: t("bk.rooms.confirm_room"),
                  onClick: () => confirmRoom.mutate({ id: i.id, status: "confirmed" }),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-7 w-7 text-destructive",
                  title: t("bk.rooms.reject_room"),
                  onClick: () => confirmRoom.mutate({ id: i.id, status: "rejected" }),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                }
              )
            ] }),
            editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "icon",
                  variant: "ghost",
                  className: "h-7 w-7",
                  onClick: () => {
                    setForm({ id: i.id, hotel_id: i.hotel_id, contract_id: "", rate_id: i.rate_id ?? "", occupancy_type: i.occupancy_type, check_in: i.check_in, check_out: i.check_out, rooms: i.rooms });
                    setOpen(true);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => setDeleteId(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }) })
        ] }, i.id))
      ] }),
      rows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 7, className: "font-semibold", children: [
          t("quotes.pricing.grand_total"),
          " (",
          currency,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-bold", children: money(sums.total) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { colSpan: 2, dir: "ltr", className: "text-emerald-600", children: [
          t("quotes.items.margin"),
          ": ",
          money(sums.margin)
        ] }),
        (editable || confirmable) && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {})
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setForm(BLANK$1);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form.id ? t("bk.rooms.edit") : t("bk.rooms.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.hotel"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.hotel_id, onValueChange: (v) => set({ hotel_id: v, contract_id: "", rate_id: "", occupancy_type: "" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.hotel") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: nm(h) }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.contract"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.contract_id, onValueChange: (v) => set({ contract_id: v, rate_id: "", occupancy_type: "" }), disabled: !form.hotel_id, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.contract") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (contracts.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
              c.contract_number,
              " — ",
              c.title ?? formatDate(c.start_date)
            ] }, c.id)) })
          ] }),
          form.hotel_id && contracts.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: t("quotes.items.no_contracts") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.room_type"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rate_id, onValueChange: (v) => set({ rate_id: v, occupancy_type: "" }), disabled: !form.contract_id, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.room_type") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (rates.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: r.id, children: [
              nm(r.room_type),
              " — ",
              r.code
            ] }, r.id)) })
          ] }),
          form.contract_id && rates.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: t("quotes.items.no_rates") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.occupancy"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.occupancy_type, onValueChange: (v) => set({ occupancy_type: v }), disabled: !form.rate_id, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.occupancy") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: occSorted.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.occupancy_type, children: [
              t(`occupancy.${p.occupancy_type}`, p.occupancy_type),
              " — ",
              Number(p.selling_price ?? p.cost_price).toFixed(2)
            ] }, p.occupancy_type)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.check_in"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.check_in, onChange: (e) => set({ check_in: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.check_out"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.check_out, onChange: (e) => set({ check_out: e.target.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.rooms"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.rooms, onChange: (e) => set({ rooms: Number(e.target.value) }), dir: "ltr" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: t("actions.save") }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!deleteId,
        onOpenChange: (v) => !v && setDeleteId(null),
        title: t("actions.delete"),
        description: t("bk.rooms.edit"),
        onConfirm: () => deleteId && del.mutate(deleteId)
      }
    )
  ] });
}
const BLANK = { full_name: "", guest_type: "adult", nationality: "", passport_no: "", phone: "", email: "", booking_room_id: "" };
function useBookingGuests(bookingId) {
  return useQuery({
    queryKey: ["booking-guests", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.from("booking_guests").select("*").eq("booking_id", bookingId).order("is_lead", { ascending: false }).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function GuestsTab({ bookingId, editable }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const guests = useBookingGuests(bookingId);
  const rooms = useBookingRooms(bookingId);
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(BLANK);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const nm = (o) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const roomLabel = (id) => {
    const r = (rooms.data ?? []).find((x) => x.id === id);
    return r ? `${nm(r.hotel)} · ${t(`occupancy.${r.occupancy_type}`, r.occupancy_type)}` : "—";
  };
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["booking-guests", bookingId] });
    qc.invalidateQueries({ queryKey: ["booking", bookingId] });
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!form.full_name.trim()) throw new Error(t("bk.guests.name") + " *");
      const payload = {
        booking_id: bookingId,
        full_name: form.full_name.trim(),
        guest_type: form.guest_type,
        nationality: form.nationality || null,
        passport_no: form.passport_no || null,
        phone: form.phone || null,
        email: form.email || null,
        booking_room_id: form.booking_room_id || null
      };
      if (form.id) {
        const { error } = await supabase.from("booking_guests").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("booking_guests").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setForm(BLANK);
      invalidate();
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("booking_guests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setDeleteId(null);
      invalidate();
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const setLead = useMutation({
    mutationFn: async (id) => {
      const current = (guests.data ?? []).find((g) => g.is_lead);
      if (current && current.id !== id) {
        const { error: error2 } = await supabase.from("booking_guests").update({ is_lead: false }).eq("id", current.id);
        if (error2) throw error2;
      }
      const { error } = await supabase.from("booking_guests").update({ is_lead: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      invalidate();
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const rows = guests.data ?? [];
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !editable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("bk.guests.locked") }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(BLANK);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("bk.guests.add")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.nationality") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.passport") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.phone") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.room") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.guests.lead") }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("bk.guests.empty") }) }),
        rows.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: g.full_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t(`gtype.${g.guest_type}`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: g.nationality ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-mono text-xs", children: g.passport_no ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: g.phone ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: roomLabel(g.booking_room_id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: g.is_lead ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-amber-500 text-white hover:bg-amber-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3" }),
            " ",
            t("bk.guests.lead")
          ] }) : editable && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: () => setLead.mutate(g.id), children: t("bk.guests.set_lead") }) }),
          editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "h-7 w-7",
                onClick: () => {
                  setForm({ id: g.id, full_name: g.full_name, guest_type: g.guest_type, nationality: g.nationality ?? "", passport_no: g.passport_no ?? "", phone: g.phone ?? "", email: g.email ?? "", booking_room_id: g.booking_room_id ?? "" });
                  setOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => setDeleteId(g.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }) })
        ] }, g.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setForm(BLANK);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form.id ? t("bk.guests.edit") : t("bk.guests.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("bk.guests.name"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.full_name, onChange: (e) => set("full_name", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("bk.guests.type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.guest_type, onValueChange: (v) => set("guest_type", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["adult", "child", "infant"].map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: t(`gtype.${g}`) }, g)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("bk.guests.nationality") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nationality, onChange: (e) => set("nationality", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("bk.guests.passport") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.passport_no, onChange: (e) => set("passport_no", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.phone") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => set("phone", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: form.email, onChange: (e) => set("email", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("bk.guests.room") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.booking_room_id || "none", onValueChange: (v) => set("booking_room_id", v === "none" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "—" }),
              (rooms.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: roomLabel(r.id) }, r.id))
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: t("actions.save") }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!deleteId,
        onOpenChange: (v) => !v && setDeleteId(null),
        title: t("actions.delete"),
        description: t("bk.guests.name"),
        onConfirm: () => deleteId && del.mutate(deleteId)
      }
    )
  ] });
}
function BookingDetail() {
  const {
    id
  } = Route$1.useParams();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole([...BK_WRITE_ROLES]);
  const canManage = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "operations_manager"]);
  const [editing, setEditing] = reactExports.useState(false);
  const [confirmStatus, setConfirmStatus] = reactExports.useState(null);
  const [cancelOpen, setCancelOpen] = reactExports.useState(null);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const b = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("bookings").select("*, customer:customers(name_en,name_ar,customer_type,email,phone), quotation:quotations(quotation_no)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  useBookingRooms(id);
  const history = useQuery({
    queryKey: ["booking-status-history", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("booking_status_history").select("*").eq("booking_id", id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const statusMut = useMutation({
    mutationFn: async ({
      status,
      reason
    }) => {
      const patch = {
        status
      };
      if (reason !== void 0) patch.cancellation_reason = reason;
      const {
        error
      } = await supabase.from("bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      setCancelOpen(null);
      setCancelReason("");
      qc.invalidateQueries({
        queryKey: ["booking", id]
      });
      qc.invalidateQueries({
        queryKey: ["booking-status-history", id]
      });
      qc.invalidateQueries({
        queryKey: ["bookings-metrics"]
      });
      qc.invalidateQueries({
        queryKey: ["entity-history", "bookings", id]
      });
    },
    onError: (e) => {
      setConfirmStatus(null);
      toast.error(dbErrorMessage(e, t));
    }
  });
  if (b.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!b.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("bk.no_found") });
  const r = b.data;
  const customerName = lang === "ar" ? r.customer?.name_ar || r.customer?.name_en : r.customer?.name_en || r.customer?.name_ar;
  const editableHeader = canWrite && r.status === "draft" && !r.deleted_at;
  const editableRooms = canWrite && r.status === "draft" && !r.deleted_at;
  const confirmableRooms = canWrite && ["draft", "pending_confirmation"].includes(r.status) && !r.deleted_at;
  const editableGuests = canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status) && !r.deleted_at;
  const actions = [{
    key: "submit",
    label: t("bk.submit"),
    status: "pending_confirmation",
    icon: Send,
    show: canWrite && r.status === "draft"
  }, {
    key: "return",
    label: t("bk.return_draft"),
    status: "draft",
    icon: Undo2,
    variant: "outline",
    show: canWrite && r.status === "pending_confirmation"
  }, {
    key: "confirm",
    label: t("bk.confirm"),
    status: "confirmed",
    icon: Check,
    show: canManage && r.status === "pending_confirmation"
  }, {
    key: "check_in",
    label: t("bk.check_in"),
    status: "checked_in",
    icon: LogIn,
    show: canWrite && r.status === "confirmed"
  }, {
    key: "check_out",
    label: t("bk.check_out"),
    status: "checked_out",
    icon: LogOut,
    show: canWrite && r.status === "checked_in"
  }, {
    key: "no_show",
    label: t("bk.no_show_action"),
    status: "no_show",
    icon: UserX,
    variant: "destructive",
    show: canManage && r.status === "confirmed",
    needsReason: true
  }, {
    key: "cancel",
    label: t("bk.cancel"),
    status: "cancelled",
    icon: Ban,
    variant: "destructive",
    show: canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status),
    needsReason: true
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: `${r.booking_no} — ${customerName ?? ""}`, subtitle: `${formatDate(r.booking_date)} · ${r.currency}${r.quotation ? ` · ${t("bk.source_quotation")}: ${r.quotation.quotation_no}` : ""}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/bookings"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BkStatusBadge, { status: r.status, t }),
      editableHeader && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      actions.filter((a) => a.show).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: a.variant ?? "default", onClick: () => a.needsReason ? setCancelOpen(a.status) : setConfirmStatus(a.status), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: "h-4 w-4" }),
        a.label
      ] }, a.key))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "general", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: t("bk.tab.general") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rooms", children: t("bk.tab.rooms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "guests", children: t("bk.tab.guests") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("tab.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "timeline", children: t("bk.tab.timeline") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("bk.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "general", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(BookingForm, { initial: r, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["booking", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.number"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", children: r.booking_no }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.customer"), v: `${customerName ?? "—"} — ${t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("filter.status"), v: /* @__PURE__ */ jsxRuntimeExports.jsx(BkStatusBadge, { status: r.status, t }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.currency"), v: r.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.booking_date"), v: formatDate(r.booking_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.source"), v: r.quotation_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/quotations/$id", params: {
          id: r.quotation_id
        }, className: "text-primary hover:underline", children: [
          t("bk.source_quotation"),
          " — ",
          r.quotation?.quotation_no
        ] }) : t("bk.source_direct") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.special_requests"), v: r.special_requests ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.notes"), v: r.notes ?? "—" }),
        r.cancellation_reason && /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.cancel_reason"), v: r.cancellation_reason }),
        r.confirmed_at && /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.confirm"), v: formatDateTime(r.confirmed_at, lang) }),
        r.checked_in_at && /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.check_in"), v: formatDateTime(r.checked_in_at, lang) }),
        r.checked_out_at && /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("bk.check_out"), v: formatDateTime(r.checked_out_at, lang) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rooms", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoomsTab, { bookingId: id, currency: r.currency, editable: editableRooms, confirmable: confirmableRooms }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "guests", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GuestsTab, { bookingId: id, editable: editableGuests }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "booking", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "timeline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.history.from") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("bk.history.to") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("history.time") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.notes") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          (history.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: t("bk.history.empty") }) }),
          history.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: h.from_status ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`bkstatus.${h.from_status}`) }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BkStatusBadge, { status: h.to_status, t }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: formatDateTime(h.created_at, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: h.reason ?? "—" })
          ] }, h.id))
        ] })
      ] }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "bookings", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirmStatus, onOpenChange: (v) => !v && setConfirmStatus(null), title: t("bk.confirm_status"), description: confirmStatus ? t(`bkstatus.${confirmStatus}`) : "", onConfirm: () => confirmStatus && statusMut.mutate({
      status: confirmStatus
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!cancelOpen, onOpenChange: (v) => {
      if (!v) {
        setCancelOpen(null);
        setCancelReason("");
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          t("bk.cancel_reason"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: cancelReason, onChange: (e) => setCancelReason(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: !cancelReason.trim() || statusMut.isPending, onClick: () => cancelOpen && statusMut.mutate({
        status: cancelOpen,
        reason: cancelReason.trim()
      }), children: cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel") }) })
    ] }) })
  ] });
}
function KV({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5 border-b py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: v ?? "—" })
  ] });
}
export {
  BookingDetail as component
};
