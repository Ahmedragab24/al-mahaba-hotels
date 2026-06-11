import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { p as Route$a, u as useI18n, e as useAuth, Q as QStatusBadge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./_ssr/dropdown-menu-CvBV4MCF.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { d as dbErrorMessage } from "./_ssr/db-errors-CH7zwDRs.mjs";
import { Q as QuotationForm } from "./_ssr/-form-Dyx0ZEI7.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as TableFooter } from "./_ssr/table-BQwhu8us.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { a as OCCUPANCY_TYPES } from "./_ssr/-occupancy-Blvgo2AT.mjs";
import { l as logoUrl } from "./_ssr/daleel-logo-transparent-BMZzokD7.mjs";
import { t as toDocLang, D as DOC_LANGS, a as DOC_LANG_LIST, m as missingDocKeys, w as waTemplateExists, r as renderWaTemplate, O as OCC_RES, Q as QUOTE_RES } from "./_ssr/doc-lang-Doexz-GC.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { A as ApprovalWorkflow } from "./_ssr/approval-workflow-BEWDKdSF.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { aw as Send, N as Check, X, aE as Undo2, a1 as RotateCcw, D as Clock, ax as Ban, A as ArrowLeft, aI as Printer, aJ as MessageCircle, _ as Pencil, Z as Plus, V as Trash2 } from "./_libs/lucide-react.mjs";
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
import "./_libs/radix-ui__react-dropdown-menu.mjs";
import "./_libs/radix-ui__react-menu.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_ssr/textarea-BvXe9TDs.mjs";
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_ssr/checkbox-Co4oTAVV.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
const BLANK = { hotel_id: "", contract_id: "", rate_id: "", season_id: "", occupancy_type: "", check_in: "", check_out: "", rooms: 1 };
function useQuotationItems(quotationId) {
  return useQuery({
    queryKey: ["quotation-items", quotationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotation_items").select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar), rate:rates(code, contract:supplier_contracts(contract_number,title))").eq("quotation_id", quotationId).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function ItemsTab({ quotationId, currency, editable }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const items = useQuotationItems(quotationId);
  const [open, setOpen] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState(BLANK);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const nm = (o) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
  const money = (n) => `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const contracts = useQuery({
    queryKey: ["q-contracts", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () => (await supabase.from("supplier_contracts").select("id,contract_number,title,start_date,end_date").eq("hotel_id", form.hotel_id).eq("status", "active").is("deleted_at", null).order("start_date", { ascending: false })).data ?? []
  });
  const rates = useQuery({
    queryKey: ["q-rates", form.hotel_id, form.contract_id],
    enabled: !!form.hotel_id && !!form.contract_id,
    queryFn: async () => (await supabase.from("rates").select("id,code,currency,valid_from,valid_to,room_type_id,room_type:hotel_room_types(name_en,name_ar)").eq("hotel_id", form.hotel_id).eq("contract_id", form.contract_id).eq("status", "approved").is("deleted_at", null).order("valid_from", { ascending: false })).data ?? []
  });
  const seasons = useQuery({
    queryKey: ["q-rate-seasons", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () => (await supabase.from("rate_seasons").select("id,name,start_date,end_date").eq("rate_id", form.rate_id).order("start_date")).data ?? []
  });
  const occPrices = useQuery({
    queryKey: ["q-occ-prices", form.rate_id],
    enabled: !!form.rate_id,
    queryFn: async () => (await supabase.from("rate_occupancy_prices").select("occupancy_type,cost_price,selling_price,markup_percent,currency").eq("rate_id", form.rate_id).eq("active", true)).data ?? []
  });
  const hotelTaxes = useQuery({
    queryKey: ["q-hotel-taxes", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () => (await supabase.from("hotel_taxes").select("calc_method,value,apply_scope,is_inclusive,effective_date,expiry_date").eq("hotel_id", form.hotel_id).eq("is_active", true).is("deleted_at", null)).data ?? []
  });
  const occSorted = reactExports.useMemo(
    () => [...occPrices.data ?? []].sort((a, b) => OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type)),
    [occPrices.data]
  );
  const selectedPrice = occSorted.find((p) => p.occupancy_type === form.occupancy_type);
  const selectedRate = (rates.data ?? []).find((r) => r.id === form.rate_id);
  const preview = reactExports.useMemo(() => {
    if (!selectedPrice || !form.check_in || !form.check_out) return null;
    const nights = Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 864e5);
    if (nights <= 0) return null;
    const rooms = Math.max(1, Number(form.rooms) || 1);
    const cost = Number(selectedPrice.cost_price);
    const sell = Number(selectedPrice.selling_price ?? selectedPrice.cost_price);
    let taxes = 0, fees = 0;
    for (const tx of hotelTaxes.data ?? []) {
      if (tx.is_inclusive) continue;
      if (tx.effective_date && tx.effective_date > form.check_in) continue;
      if (tx.expiry_date && tx.expiry_date < form.check_in) continue;
      if (tx.calc_method === "percentage") taxes += sell * nights * rooms * Number(tx.value) / 100;
      else fees += Number(tx.value) * (tx.apply_scope === "per_night" ? nights * rooms : tx.apply_scope === "per_room" || tx.apply_scope === "per_person" ? rooms : 1);
    }
    return {
      nights,
      rooms,
      cost,
      sell,
      markup: Number(selectedPrice.markup_percent ?? 0),
      totalCost: cost * nights * rooms,
      margin: (sell - cost) * nights * rooms,
      taxes,
      fees,
      total: sell * nights * rooms + taxes + fees
    };
  }, [selectedPrice, form.check_in, form.check_out, form.rooms, hotelTaxes.data]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const pickHotel = (v) => set({ hotel_id: v, contract_id: "", rate_id: "", season_id: "", occupancy_type: "" });
  const pickContract = (v) => set({ contract_id: v, rate_id: "", season_id: "", occupancy_type: "" });
  const pickRate = (v) => set({ rate_id: v, season_id: "", occupancy_type: "" });
  const pickSeason = (v) => {
    if (v === "none") {
      set({ season_id: "" });
      return;
    }
    const sn = (seasons.data ?? []).find((x) => x.id === v);
    set({ season_id: v, check_in: form.check_in || sn?.start_date || "", check_out: form.check_out || sn?.end_date || "" });
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.rate_id || !form.occupancy_type) throw new Error(t("quotes.items.pricing_auto"));
      if (!form.check_in || !form.check_out) throw new Error(t("quotes.err_dates"));
      const payload = {
        quotation_id: quotationId,
        hotel_id: form.hotel_id,
        rate_id: form.rate_id,
        room_type_id: selectedRate?.room_type_id ?? null,
        occupancy_type: form.occupancy_type,
        check_in: form.check_in,
        check_out: form.check_out,
        rooms: Math.max(1, Number(form.rooms) || 1),
        // Prices pulled by the DB engine — never typed by the user
        cost_price: null,
        selling_price: null
      };
      if (form.id) {
        const { error } = await supabase.from("quotation_items").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotation_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setForm(BLANK);
      qc.invalidateQueries({ queryKey: ["quotation-items", quotationId] });
      qc.invalidateQueries({ queryKey: ["quotation", quotationId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("quotation_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted", t("toast.saved")));
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["quotation-items", quotationId] });
      qc.invalidateQueries({ queryKey: ["quotation", quotationId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const startEdit = (it) => {
    setForm({
      id: it.id,
      hotel_id: it.hotel_id,
      contract_id: "",
      rate_id: it.rate_id ?? "",
      season_id: "",
      occupancy_type: it.occupancy_type,
      check_in: it.check_in,
      check_out: it.check_out,
      rooms: it.rooms
    });
    setOpen(true);
  };
  const rows = items.data ?? [];
  const sums = rows.reduce(
    (a, i) => ({
      cost: a.cost + Number(i.total_cost),
      taxes: a.taxes + Number(i.taxes),
      fees: a.fees + Number(i.fees),
      margin: a.margin + Number(i.margin),
      total: a.total + Number(i.total_selling)
    }),
    { cost: 0, taxes: 0, fees: 0, margin: 0, total: 0 }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !editable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("quotes.items.locked") }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("quotes.items.price_hint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setForm(BLANK);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " ",
        t("quotes.items.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.hotel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.room_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.occupancy") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_in") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_out") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: t("quotes.items.nights") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-center", children: t("quotes.items.rooms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.cost") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.selling") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.taxes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.fees") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.margin") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.total_selling") }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 14, className: "py-10 text-center text-muted-foreground", children: t("quotes.items.empty") }) }),
        rows.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: nm(i.hotel) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nm(i.room_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t(`occupancy.${i.occupancy_type}`, i.occupancy_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(i.check_in) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(i.check_out) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: i.nights }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: i.rooms }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(i.cost_price) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(i.selling_price) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(i.taxes) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(i.fees) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-emerald-600", children: money(i.margin) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-semibold", children: money(i.total_selling) }),
          editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => startEdit(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive", onClick: () => setDeleteId(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(sums.cost) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(sums.taxes) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: money(sums.fees) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-emerald-600", children: money(sums.margin) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-bold", children: money(sums.total) }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {})
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setForm(BLANK);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: form.id ? t("quotes.items.edit") : t("quotes.items.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.hotel"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.hotel_id, onValueChange: pickHotel, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.hotel") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: nm(h) }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.contract"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.contract_id, onValueChange: pickContract, disabled: !form.hotel_id, children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rate_id, onValueChange: pickRate, disabled: !form.contract_id, children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("quotes.items.season") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.season_id || "none", onValueChange: pickSeason, disabled: !form.rate_id, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.season") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: t("quotes.items.season_any") }),
              (seasons.data ?? []).map((sn) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: sn.id, children: [
                sn.name,
                " (",
                formatDate(sn.start_date),
                " → ",
                formatDate(sn.end_date),
                ")"
              ] }, sn.id))
            ] })
          ] })
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
          ] }),
          form.rate_id && occSorted.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: t("quotes.items.no_occ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.rooms"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.rooms, onChange: (e) => set({ rooms: Number(e.target.value) }) })
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
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("quotes.items.pricing_auto") }),
      preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-sm font-semibold", children: t("quotes.items.preview") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.nights") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: preview.nights })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.cost") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.cost.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("rates.markup") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { dir: "ltr", children: [
              preview.markup.toFixed(2),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.selling") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.sell.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.total_cost") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.totalCost.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.margin") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", className: "text-emerald-600", children: preview.margin.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.taxes") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.taxes.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.fees") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.fees.toFixed(2) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("quotes.items.grand") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { dir: "ltr", children: preview.total.toFixed(2) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: save.isPending || !form.hotel_id || !form.rate_id || !form.occupancy_type || !form.check_in || !form.check_out,
            onClick: () => save.mutate(),
            children: t("actions.save")
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!deleteId,
        onOpenChange: (v) => !v && setDeleteId(null),
        title: t("actions.delete"),
        description: t("toast.confirm_delete"),
        onConfirm: () => deleteId && del.mutate(deleteId)
      }
    )
  ] });
}
const L = QUOTE_RES;
const OCC = OCC_RES;
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function openQuotationPrint(opts) {
  const { lang, quotation: q, customerName, items } = opts;
  if (missingDocKeys(lang, "quotation").length > 0) return false;
  const s = L[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const money = (n) => `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${q.currency}`;
  const d = (v) => v ? (/* @__PURE__ */ new Date(v + "T00:00:00")).toLocaleDateString(locale) : "—";
  const name = (o) => dir === "rtl" ? o?.name_ar || o?.name_en || "—" : o?.name_en || o?.name_ar || "—";
  const roomsTotal = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const fees = items.reduce((a, i) => a + Number(i.fees), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);
  const rows = items.map(
    (i) => `<tr>
        <td>${esc(name(i.hotel))}</td>
        <td>${esc(name(i.room_type))}</td>
        <td>${esc(OCC[lang][i.occupancy_type] ?? i.occupancy_type)} (${esc(i.occupancy_type)})</td>
        <td>${d(i.check_in)}</td>
        <td>${d(i.check_out)}</td>
        <td class="c">${i.nights}</td>
        <td class="c">${i.rooms}</td>
        <td class="n">${money(Number(i.selling_price ?? 0))}</td>
        <td class="n">${money(Number(i.taxes))}</td>
        <td class="n">${money(Number(i.fees))}</td>
        <td class="n b">${money(Number(i.total_selling))}</td>
      </tr>`
  ).join("");
  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} ${esc(q.quotation_no)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${lang === "ar" ? "'Segoe UI', Tahoma, Arial" : "'Segoe UI', Arial"}, sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #14532d; padding-bottom: 16px; }
  .head img { height: 64px; }
  .head .t { text-align: ${dir === "rtl" ? "left" : "right"}; }
  .head h1 { font-size: 26px; color: #14532d; }
  .head .no { font-size: 14px; color: #555; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px 14px; }
  .box .k { font-size: 11px; color: #777; }
  .box .v { font-weight: 600; margin-top: 2px; }
  h2 { font-size: 15px; color: #14532d; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 7px 8px; text-align: ${dir === "rtl" ? "right" : "left"}; }
  th { background: #14532d; color: #fff; font-size: 11px; }
  td.c { text-align: center; } td.n { text-align: ${dir === "rtl" ? "left" : "right"}; direction: ltr; white-space: nowrap; }
  td.b { font-weight: 700; }
  .totals { margin-top: 14px; width: 320px; margin-${dir === "rtl" ? "right" : "left"}: auto; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #eee; }
  .totals .grand { background: #14532d; color: #fff; font-weight: 700; font-size: 15px; border-radius: 6px; margin-top: 6px; }
  .terms { margin-top: 24px; border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; background: #fafafa; line-height: 1.7; }
  .foot { margin-top: 28px; text-align: center; color: #777; font-size: 11px; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 12px; } .noprint { display: none; } }
  .noprint { position: fixed; top: 12px; ${dir === "rtl" ? "left" : "right"}: 12px; }
  .noprint button { background: #14532d; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">🖨 ${lang === "ar" ? "طباعة / حفظ PDF" : "Print / Save PDF"}</button></div>
  <div class="head">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="${esc(location.origin + logoUrl)}" alt="logo" />
      <div style="font-weight:700;font-size:16px;color:#14532d">${esc(s.company)}</div>
    </div>
    <div class="t">
      <h1>${esc(s.title)}</h1>
      <div class="no">${esc(s.quotation_no)}: <b dir="ltr">${esc(q.quotation_no)}</b></div>
    </div>
  </div>

  <div class="meta">
    <div class="box"><div class="k">${esc(s.to)}</div><div class="v">${esc(customerName)}</div></div>
    <div class="box"><div class="k">${esc(s.date)}</div><div class="v" dir="ltr">${d(q.quotation_date)}</div></div>
    <div class="box"><div class="k">${esc(s.valid_until)}</div><div class="v" dir="ltr">${d(q.expiry_date)}</div></div>
    <div class="box"><div class="k">${esc(s.travel_date)}</div><div class="v" dir="ltr">${d(q.travel_date)}</div></div>
    <div class="box"><div class="k">${esc(s.generated)}</div><div class="v" dir="ltr">${(/* @__PURE__ */ new Date()).toLocaleString(locale)}</div></div>
    <div class="box"><div class="k">${esc(s.quotation_no)}</div><div class="v" dir="ltr">${esc(q.quotation_no)}</div></div>
  </div>

  <h2>${esc(s.breakdown)}</h2>
  <table>
    <thead><tr>
      <th>${esc(s.hotel)}</th><th>${esc(s.room)}</th><th>${esc(s.occupancy)}</th>
      <th>${esc(s.check_in)}</th><th>${esc(s.check_out)}</th><th>${esc(s.nights)}</th><th>${esc(s.rooms)}</th>
      <th>${esc(s.unit)}</th><th>${esc(s.taxes)}</th><th>${esc(s.fees)}</th><th>${esc(s.line_total)}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>${esc(s.rooms_total)}</span><b dir="ltr">${money(roomsTotal)}</b></div>
    <div class="row"><span>${esc(s.total_taxes)}</span><b dir="ltr">${money(taxes)}</b></div>
    <div class="row"><span>${esc(s.total_fees)}</span><b dir="ltr">${money(fees)}</b></div>
    <div class="row grand"><span>${esc(s.grand_total)}</span><b dir="ltr">${money(grand)}</b></div>
  </div>

  ${q.notes ? `<h2>${esc(s.notes)}</h2><div class="terms">${esc(q.notes)}</div>` : ""}

  <h2>${esc(s.terms)}</h2>
  <div class="terms">${esc(s.terms_text)}</div>

  <div class="foot">${esc(s.footer)}</div>
</body>
</html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  try {
    await supabase.rpc("log_audit", {
      _action: "pdf_generate",
      _entity_type: "quotations",
      _entity_id: q.id,
      _metadata: { lang, quotation_no: q.quotation_no }
    });
  } catch {
  }
  return true;
}
function QuotationDetail() {
  const {
    id
  } = Route$a.useParams();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "sales_manager"]);
  const [editing, setEditing] = reactExports.useState(false);
  const [confirmStatus, setConfirmStatus] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("quotations").select("*, customer:customers(name_en,name_ar,customer_type,email,phone,preferred_language)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const items = useQuotationItems(id);
  const creator = useQuery({
    queryKey: ["profile-mini", q.data?.created_by],
    enabled: !!q.data?.created_by,
    queryFn: async () => (await supabase.from("profiles").select("email,full_name_ar,full_name_en").eq("id", q.data.created_by).maybeSingle()).data
  });
  const statusMut = useMutation({
    mutationFn: async (status) => {
      const {
        error
      } = await supabase.from("quotations").update({
        status
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      qc.invalidateQueries({
        queryKey: ["quotation", id]
      });
      qc.invalidateQueries({
        queryKey: ["approval-requests", "quotation", id]
      });
      qc.invalidateQueries({
        queryKey: ["quotes-metrics"]
      });
    },
    onError: (e) => {
      setConfirmStatus(null);
      toast.error(dbErrorMessage(e, t));
    }
  });
  const doPrint = async (printLang) => {
    if (!q.data) return;
    if ((items.data?.length ?? 0) === 0) {
      toast.error(t("quotes.err_no_items"));
      return;
    }
    if (missingDocKeys(printLang, "quotation").length > 0) {
      toast.error(t("doc.missing_translations"));
      return;
    }
    const customerName2 = DOC_LANGS[printLang].dir === "rtl" ? q.data.customer?.name_ar || q.data.customer?.name_en : q.data.customer?.name_en || q.data.customer?.name_ar;
    const ok = await openQuotationPrint({
      lang: printLang,
      quotation: q.data,
      customerName: customerName2 ?? "—",
      items: items.data ?? []
    });
    if (ok) {
      toast.success(t("quotes.pdf_ok"));
      qc.invalidateQueries({
        queryKey: ["entity-history", "quotations", id]
      });
    }
  };
  const sendWhatsApp = async (waLang) => {
    if (!q.data) return;
    if ((items.data?.length ?? 0) === 0) {
      toast.error(t("quotes.err_no_items"));
      return;
    }
    if (!waTemplateExists("quotation", waLang)) {
      toast.error(t("wa.no_template"));
      return;
    }
    const r2 = q.data;
    const rtl = DOC_LANGS[waLang].dir === "rtl";
    const cName = (rtl ? r2.customer?.name_ar || r2.customer?.name_en : r2.customer?.name_en || r2.customer?.name_ar) ?? "—";
    const hotels = (items.data ?? []).map((i) => `• ${(rtl ? i.hotel?.name_ar || i.hotel?.name_en : i.hotel?.name_en || i.hotel?.name_ar) ?? "—"} (${i.nights} × ${i.rooms})`).join("\n");
    const total = (items.data ?? []).reduce((a, i) => a + Number(i.total_selling), 0);
    const tpl = renderWaTemplate("quotation", waLang, {
      customer: cName,
      quotation_no: r2.quotation_no,
      hotels,
      total: total.toLocaleString("en-US", {
        minimumFractionDigits: 2
      }),
      currency: r2.currency,
      valid_until: (/* @__PURE__ */ new Date(r2.expiry_date + "T00:00:00")).toLocaleDateString(DOC_LANGS[waLang].locale),
      company: waLang === "ar" ? "دليل للسفر والسياحة" : waLang === "ur" ? "دلیل ٹریول اینڈ ٹورازم" : "Daleel Travel & Tourism"
    });
    if (!tpl) {
      toast.error(t("wa.no_template"));
      return;
    }
    try {
      await supabase.from("customer_communications").insert({
        customer_id: r2.customer_id,
        channel: "whatsapp",
        direction: "outbound",
        subject: `${tpl.name} [${waLang}] — ${r2.quotation_no}`,
        body: tpl.body
      });
      await supabase.rpc("log_audit", {
        _action: "whatsapp_send",
        _entity_type: "quotations",
        _entity_id: r2.id,
        _metadata: {
          lang: waLang,
          template: tpl.name,
          quotation_no: r2.quotation_no
        }
      });
    } catch {
    }
    const phone = String(r2.customer?.phone ?? "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(tpl.body)}`, "_blank");
    toast.success(t("wa.sent"));
  };
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("quotes.no_found") });
  const r = q.data;
  const customerName = lang === "ar" ? r.customer?.name_ar || r.customer?.name_en : r.customer?.name_en || r.customer?.name_ar;
  const editable = canWrite && (r.status === "draft" || r.status === "rejected") && !r.deleted_at;
  const preferredLang = toDocLang(r.customer?.preferred_language);
  const langOrder = [preferredLang, ...DOC_LANG_LIST.filter((l) => l !== preferredLang)];
  const actions = [{
    key: "submit",
    label: t("quotes.submit"),
    status: "pending_approval",
    icon: Send,
    show: canWrite && r.status === "draft"
  }, {
    key: "send_direct",
    label: t("quotes.send"),
    status: "sent",
    icon: Send,
    variant: "outline",
    show: canWrite && r.status === "draft"
  }, {
    key: "approve",
    label: t("actions.approve"),
    status: "approved",
    icon: Check,
    show: canApprove && r.status === "pending_approval"
  }, {
    key: "reject",
    label: t("actions.reject"),
    status: "rejected",
    icon: X,
    variant: "destructive",
    show: canApprove && r.status === "pending_approval"
  }, {
    key: "return",
    label: t("quotes.return"),
    status: "draft",
    icon: Undo2,
    variant: "outline",
    show: canApprove && r.status === "pending_approval"
  }, {
    key: "send",
    label: t("quotes.send"),
    status: "sent",
    icon: Send,
    show: canWrite && r.status === "approved"
  }, {
    key: "reopen",
    label: t("quotes.reopen"),
    status: "draft",
    icon: RotateCcw,
    variant: "outline",
    show: canWrite && r.status === "rejected"
  }, {
    key: "accept",
    label: t("quotes.accept"),
    status: "accepted",
    icon: Check,
    show: canWrite && r.status === "sent"
  }, {
    key: "expire",
    label: t("quotes.expire_action"),
    status: "expired",
    icon: Clock,
    variant: "outline",
    show: canWrite && r.status === "sent"
  }, {
    key: "cancel",
    label: t("quotes.cancel"),
    status: "cancelled",
    icon: Ban,
    variant: "destructive",
    show: canWrite && ["draft", "approved", "rejected", "sent"].includes(r.status)
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: `${r.quotation_no} — ${customerName ?? ""}`, subtitle: `${formatDate(r.quotation_date)} → ${formatDate(r.expiry_date)} · ${r.currency} · ${t("quotes.creator")}: ${(lang === "ar" ? creator.data?.full_name_ar : creator.data?.full_name_en) || creator.data?.email || "—"} (${formatDateTime(r.created_at, lang)})`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/quotations"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QStatusBadge, { status: r.status, t }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
          " ",
          t("quotes.print")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: langOrder.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => doPrint(l), children: [
          DOC_LANGS[l].native,
          " PDF",
          l === preferredLang ? " ★" : ""
        ] }, l)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
          " ",
          t("quotes.send_whatsapp")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: langOrder.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => sendWhatsApp(l), children: [
          DOC_LANGS[l].native,
          l === preferredLang ? " ★" : ""
        ] }, l)) })
      ] }),
      editable && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      actions.filter((a) => a.show).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: a.variant ?? "default", onClick: () => setConfirmStatus(a.status), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: "h-4 w-4" }),
        a.label
      ] }, a.key))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "general", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: t("quotes.tab.general") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "items", children: t("quotes.tab.items") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pricing", children: t("quotes.tab.pricing") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("tab.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approval", children: t("tab.approval") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("quotes.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "general", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(QuotationForm, { initial: r, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["quotation", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("quotes.number"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", children: r.quotation_no }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("quotes.customer"), v: `${customerName ?? "—"} — ${t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("filter.status"), v: /* @__PURE__ */ jsxRuntimeExports.jsx(QStatusBadge, { status: r.status, t }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.currency"), v: r.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("quotes.quotation_date"), v: formatDate(r.quotation_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("quotes.travel_date"), v: r.travel_date ? formatDate(r.travel_date) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("quotes.expiry_date"), v: formatDate(r.expiry_date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.notes"), v: r.notes ?? "—" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "items", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemsTab, { quotationId: id, currency: r.currency, editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pricing", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PricingTab, { items: items.data ?? [], currency: r.currency, t }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "quotation", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approval", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalWorkflow, { entityType: "quotation", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "quotations", entityId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirmStatus, onOpenChange: (v) => !v && setConfirmStatus(null), title: t("quotes.confirm_status"), description: confirmStatus ? t(`qstatus.${confirmStatus}`) : "", onConfirm: () => confirmStatus && statusMut.mutate(confirmStatus) })
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
function PricingTab({
  items,
  currency,
  t
}) {
  const money = (n) => `${Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency}`;
  const totalCost = items.reduce((a, i) => a + Number(i.total_cost), 0);
  const roomsSelling = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const fees = items.reduce((a, i) => a + Number(i.fees), 0);
  const margin = items.reduce((a, i) => a + Number(i.margin), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);
  const marginPct = totalCost > 0 ? margin / totalCost * 100 : 0;
  const rows = [[t("quotes.pricing.total_cost"), money(totalCost)], [t("quotes.pricing.room_total"), money(roomsSelling)], [t("quotes.pricing.margin"), money(margin)], [t("quotes.items.margin") + " %", `${marginPct.toFixed(2)} %`], [t("quotes.pricing.taxes"), money(taxes)], [t("quotes.pricing.fees"), money(fees)], [t("quotes.pricing.grand_total"), money(grand), true]];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: rows.map(([label, value, highlight], i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: highlight ? "border-primary bg-primary/5" : void 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: `mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`, children: value })
  ] }) }, i)) });
}
export {
  QuotationDetail as component
};
