import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { j as Route$j, u as useI18n, e as useAuth, k as RStatusBadge, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { d as dbErrorMessage } from "./_ssr/db-errors-CH7zwDRs.mjs";
import { R as RfqForm } from "./_ssr/-form-W6K-g9dQ.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { A as ApprovalWorkflow } from "./_ssr/approval-workflow-BEWDKdSF.mjs";
import { E as EntityHistory } from "./_ssr/entity-history-xk6DM_Ta.mjs";
import { aw as Send, au as CheckCheck, N as Check, X, D as Clock, a1 as RotateCcw, ax as Ban, A as ArrowLeft, _ as Pencil, ay as FileOutput, Z as Plus, V as Trash2, az as Trophy } from "./_libs/lucide-react.mjs";
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
import "./_libs/radix-ui__react-alert-dialog.mjs";
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
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_ssr/checkbox-Co4oTAVV.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
const OCC = ["SGL", "DBL", "TPL", "QUAD", "CHD", "INF"];
const MEALS = ["RO", "BB", "HB", "FB", "AI", "UAI"];
function useRfqItems(rfqId) {
  return useQuery({
    queryKey: ["rfq-items", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfq_items").select("*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar)").eq("rfq_id", rfqId).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
}
function rfqItemLabel(i, lang) {
  const h = i.hotel ? lang === "ar" ? i.hotel.name_ar || i.hotel.name_en : i.hotel.name_en || i.hotel.name_ar : "—";
  const rt = i.room_type ? lang === "ar" ? i.room_type.name_ar || i.room_type.name_en : i.room_type.name_en || i.room_type.name_ar : "";
  return `${h}${rt ? " · " + rt : ""} · ${i.occupancy_type} · ${i.check_in} → ${i.check_out}`;
}
function RfqItemsTab({ rfqId, editable }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const items = useRfqItems(rfqId);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const empty = { hotel_id: "", room_type_id: "", occupancy_type: "DBL", quantity: "1", check_in: "", check_out: "", meal_plan: "", special_requests: "" };
  const [form, setForm] = reactExports.useState(empty);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const hotels = useQuery({
    queryKey: ["lookup-hotels"],
    queryFn: async () => (await supabase.from("hotels").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const roomTypes = useQuery({
    queryKey: ["lookup-room-types", form.hotel_id],
    enabled: !!form.hotel_id,
    queryFn: async () => (await supabase.from("hotel_room_types").select("id,name_en,name_ar").eq("hotel_id", form.hotel_id).is("deleted_at", null).order("name_en")).data ?? []
  });
  const nm = (x) => x ? lang === "ar" ? x.name_ar || x.name_en : x.name_en || x.name_ar : "—";
  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.hotel_id || !form.check_in || !form.check_out) throw new Error(t("toast.error"));
      const payload = {
        rfq_id: rfqId,
        hotel_id: form.hotel_id,
        room_type_id: form.room_type_id || null,
        occupancy_type: form.occupancy_type,
        quantity: Number(form.quantity) || 1,
        check_in: form.check_in,
        check_out: form.check_out,
        meal_plan: form.meal_plan || null,
        special_requests: form.special_requests || null
      };
      const { error } = editing ? await supabase.from("rfq_items").update(payload).eq("id", editing.id) : await supabase.from("rfq_items").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setEditing(null);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["rfq-items", rfqId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("rfq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["rfq-items", rfqId] });
    },
    onError: (e) => {
      setDeleteId(null);
      toast.error(dbErrorMessage(e, t));
    }
  });
  const startEdit = (i) => {
    setEditing(i);
    setForm({
      hotel_id: i.hotel_id,
      room_type_id: i.room_type_id ?? "",
      occupancy_type: i.occupancy_type,
      quantity: String(i.quantity),
      check_in: i.check_in,
      check_out: i.check_out,
      meal_plan: i.meal_plan ?? "",
      special_requests: i.special_requests ?? ""
    });
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    !editable && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("rfq.items.locked") }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setEditing(null);
      setForm(empty);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("rfq.items.add")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.hotel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.room_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.occupancy") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.items.quantity") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_in") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.check_out") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("quotes.items.nights") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.items.meal_plan") }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (items.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 9, className: "py-10 text-center text-muted-foreground", children: t("rfq.items.empty") }) }),
        items.data?.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nm(i.hotel) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nm(i.room_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: i.occupancy_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: i.quantity }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(i.check_in, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: formatDate(i.check_out, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: i.nights }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: i.meal_plan ?? "—" }),
          editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => startEdit(i), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDeleteId(i.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] })
        ] }, i.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? t("rfq.items.edit") : t("rfq.items.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.hotel"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.hotel_id, onValueChange: (v) => {
            set("hotel_id", v);
            set("room_type_id", "");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.hotel") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: hotels.data?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: h.id, children: nm(h) }, h.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("quotes.items.room_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.room_type_id, onValueChange: (v) => set("room_type_id", v), disabled: !form.hotel_id, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("quotes.items.room_type") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: roomTypes.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: nm(r) }, r.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.occupancy"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.occupancy_type, onValueChange: (v) => set("occupancy_type", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: OCC.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.items.quantity"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: form.quantity, onChange: (e) => set("quantity", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.check_in"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.check_in, onChange: (e) => set("check_in", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("quotes.items.check_out"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.check_out, onChange: (e) => set("check_out", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.items.meal_plan") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.meal_plan || "none", onValueChange: (v) => set("meal_plan", v === "none" ? "" : v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "—" }),
              MEALS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.items.special") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.special_requests, onChange: (e) => set("special_requests", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending, children: t("actions.save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!deleteId,
        onOpenChange: (v) => !v && setDeleteId(null),
        title: t("actions.delete"),
        description: t("confirm.delete", ""),
        onConfirm: () => deleteId && deleteMut.mutate(deleteId)
      }
    )
  ] });
}
const APPROVER_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager"];
function nmOf(x, lang) {
  return x ? lang === "ar" ? x.name_ar || x.name_en : x.name_en || x.name_ar : "—";
}
function useRfqResponses(rfqId) {
  return useQuery({
    queryKey: ["rfq-responses", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfq_supplier_responses").select("*, supplier:suppliers(name_en,name_ar), item:rfq_items(*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar))").eq("rfq_id", rfqId).order("responded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function RfqSuppliersTab({ rfqId, editable }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [supplierId, setSupplierId] = reactExports.useState("");
  const [due, setDue] = reactExports.useState("");
  const requests = useQuery({
    queryKey: ["rfq-sreqs", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfq_supplier_requests").select("*, supplier:suppliers(name_en,name_ar)").eq("rfq_id", rfqId).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
  const suppliers = useQuery({
    queryKey: ["lookup-suppliers"],
    queryFn: async () => (await supabase.from("suppliers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? []
  });
  const addMut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error(t("rfq.resp.supplier") + " *");
      const { error } = await supabase.from("rfq_supplier_requests").insert({
        rfq_id: rfqId,
        supplier_id: supplierId,
        response_due_date: due || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setSupplierId("");
      setDue("");
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const removeMut = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("rfq_supplier_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("rfq.sup.email_note") }),
    editable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("rfq.sup.add")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.supplier") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.sup.sent_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.sup.due") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (requests.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("rfq.sup.empty") }) }),
        requests.data?.map((r) => {
          const overdue = r.status === "sent" && r.response_due_date && r.response_due_date < today;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nmOf(r.supplier, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.sent_at ? formatDateTime(r.sent_at, lang) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.response_due_date ? formatDate(r.response_due_date, lang) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "space-x-1 rtl:space-x-reverse", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "responded" ? "default" : r.status === "cancelled" ? "destructive" : "outline", children: t(`reqstatus.${r.status}`) }),
              overdue && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: t("rfq.sup.overdue") })
            ] }),
            editable && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeMut.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
          ] }, r.id);
        })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rfq.sup.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.resp.supplier"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: supplierId, onValueChange: setSupplierId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rfq.resp.supplier") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: suppliers.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: nmOf(s, lang) }, s.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.sup.due") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: due, onChange: (e) => setDue(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => addMut.mutate(), disabled: addMut.isPending, children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
function RfqResponsesTab({ rfqId, rfqStatus, currency }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canApprove = auth.hasAnyRole([...APPROVER_ROLES]);
  const canRespond = ["sent", "partial"].includes(rfqStatus);
  const [open, setOpen] = reactExports.useState(false);
  const empty = { request_id: "", rfq_item_id: "", availability: "available", available_rooms: "", cost_price: "", currency, cancellation_policy: "", release_days: "", remarks: "" };
  const [form, setForm] = reactExports.useState(empty);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const responses = useRfqResponses(rfqId);
  const items = useRfqItems(rfqId);
  const requests = useQuery({
    queryKey: ["rfq-sreqs", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfq_supplier_requests").select("*, supplier:suppliers(name_en,name_ar)").eq("rfq_id", rfqId).order("created_at");
      if (error) throw error;
      return data ?? [];
    }
  });
  const addMut = useMutation({
    mutationFn: async () => {
      if (!form.request_id || !form.rfq_item_id) throw new Error(t("toast.error"));
      const supplierId = requests.data?.find((r) => r.id === form.request_id)?.supplier_id;
      if (!supplierId) throw new Error(t("rfq.err_no_supplier"));
      const { error } = await supabase.from("rfq_supplier_responses").insert({
        rfq_id: rfqId,
        request_id: form.request_id,
        rfq_item_id: form.rfq_item_id,
        supplier_id: supplierId,
        availability: form.availability,
        available_rooms: form.available_rooms ? Number(form.available_rooms) : null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        currency: form.currency || null,
        cancellation_policy: form.cancellation_policy || null,
        release_days: form.release_days ? Number(form.release_days) : null,
        remarks: form.remarks || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["rfq-responses", rfqId] });
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] });
      qc.invalidateQueries({ queryKey: ["rfq", rfqId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const statusMut = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from("rfq_supplier_responses").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rfq-responses", rfqId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const respBadge = (s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: s === "rejected" ? "destructive" : s === "approved" ? "default" : "outline",
      className: s === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0,
      children: t(`respstatus.${s}`)
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    canRespond && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(empty);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " ",
      t("rfq.resp.add")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.supplier") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.item") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.availability") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.rooms") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.cost") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.release") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (responses.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("rfq.resp.empty") }) }),
        responses.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: nmOf(r.supplier, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[280px] truncate text-xs", children: r.item ? rfqItemLabel(r.item, lang) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.availability === "available" ? "default" : "outline", children: t(`avail.${r.availability}`) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.available_rooms ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.cost_price != null ? `${Number(r.cost_price).toFixed(2)} ${r.currency ?? ""}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.release_days ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: respBadge(r.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canApprove && r.status === "submitted" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.approve"), onClick: () => statusMut.mutate({ id: r.id, status: "approved" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-emerald-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("actions.reject"), onClick: () => statusMut.mutate({ id: r.id, status: "rejected" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rfq.resp.add") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.resp.supplier"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.request_id, onValueChange: (v) => set("request_id", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rfq.resp.supplier") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: requests.data?.filter((r) => r.status !== "cancelled").map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.id, children: nmOf(r.supplier, lang) }, r.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.resp.item"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rfq_item_id, onValueChange: (v) => set("rfq_item_id", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rfq.resp.item") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: items.data?.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i.id, children: rfqItemLabel(i, lang) }, i.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.resp.availability"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.availability, onValueChange: (v) => set("availability", v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["available", "unavailable", "on_request"].map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a, children: t(`avail.${a}`) }, a)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.resp.rooms") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.available_rooms, onChange: (e) => set("available_rooms", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.resp.cost") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.01", value: form.cost_price, onChange: (e) => set("cost_price", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("label.currency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.currency, onChange: (e) => set("currency", e.target.value.toUpperCase().slice(0, 3)), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.resp.release") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: form.release_days, onChange: (e) => set("release_days", e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.resp.cancellation") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.cancellation_policy, onChange: (e) => set("cancellation_policy", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm", children: t("rfq.resp.remarks") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.remarks, onChange: (e) => set("remarks", e.target.value), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => addMut.mutate(), disabled: addMut.isPending, children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
function RfqComparisonTab({ rfqId }) {
  const { t, lang } = useI18n();
  const responses = useRfqResponses(rfqId);
  const items = useRfqItems(rfqId);
  if ((responses.data?.length ?? 0) === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-10 text-center text-sm text-muted-foreground", children: t("rfq.cmp.empty") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: items.data?.map((item) => {
    const rows = (responses.data ?? []).filter((r) => r.rfq_item_id === item.id);
    if (rows.length === 0) return null;
    const avail = rows.filter((r) => r.availability === "available" && r.cost_price != null);
    const best = avail.length ? Math.min(...avail.map((r) => Number(r.cost_price))) : null;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: rfqItemLabel(item, lang) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.supplier") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.availability") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.rooms") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.cost") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.cancellation") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.release") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rfq.resp.remarks") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((r) => {
          const isBest = best != null && r.availability === "available" && Number(r.cost_price) === best;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: `whitespace-nowrap ${isBest ? "bg-emerald-500/10" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-medium", children: [
              nmOf(r.supplier, lang),
              isBest && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "ms-2 bg-emerald-600 text-white hover:bg-emerald-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "me-1 h-3 w-3" }),
                t("rfq.cmp.best")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t(`avail.${r.availability}`) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.available_rooms ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: isBest ? "font-bold text-emerald-700 dark:text-emerald-400" : "", children: r.cost_price != null ? `${Number(r.cost_price).toFixed(2)} ${r.currency ?? ""}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate text-xs", children: r.cancellation_policy ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.release_days ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate text-xs", children: r.remarks ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: r.status === "rejected" ? "destructive" : r.status === "approved" ? "default" : "outline",
                className: r.status === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0,
                children: t(`respstatus.${r.status}`)
              }
            ) })
          ] }, r.id);
        }) })
      ] }) })
    ] }, item.id);
  }) });
}
function CreateQuotationButton({ rfq }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const responses = useRfqResponses(rfq.id);
  const [open, setOpen] = reactExports.useState(false);
  const [markup, setMarkup] = reactExports.useState("15");
  const [customerId, setCustomerId] = reactExports.useState("");
  const plus7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  const [expiry, setExpiry] = reactExports.useState(plus7);
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent"]);
  const customers = useQuery({
    queryKey: ["lookup-customers"],
    queryFn: async () => (await supabase.from("customers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
    enabled: open
  });
  const approved = (responses.data ?? []).filter((r) => r.status === "approved" && r.cost_price != null);
  if (!canWrite || rfq.status !== "approved" || approved.length === 0) return null;
  const byItem = /* @__PURE__ */ new Map();
  approved.forEach((r) => {
    const cur = byItem.get(r.rfq_item_id);
    if (!cur || Number(r.cost_price) < Number(cur.cost_price)) byItem.set(r.rfq_item_id, r);
  });
  const createMut = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error(t("rfq.customer") + " *");
      const m = Math.max(0, Number(markup) || 0);
      const { data: quote, error } = await supabase.from("quotations").insert({
        customer_id: customerId,
        currency: rfq.currency,
        quotation_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        travel_date: rfq.travel_start,
        expiry_date: expiry,
        notes: `RFQ ${rfq.rfq_no}`,
        created_by: auth.user?.id ?? null
      }).select("id").single();
      if (error) throw error;
      const items = Array.from(byItem.values()).map((r) => ({
        quotation_id: quote.id,
        hotel_id: r.item.hotel_id,
        room_type_id: r.item.room_type_id,
        occupancy_type: r.item.occupancy_type,
        check_in: r.item.check_in,
        check_out: r.item.check_out,
        rooms: r.item.quantity,
        cost_price: Number(r.cost_price),
        selling_price: Math.round(Number(r.cost_price) * (1 + m / 100) * 100) / 100,
        rfq_response_id: r.id
      }));
      const { error: e2 } = await supabase.from("quotation_items").insert(items);
      if (e2) throw e2;
      return quote.id;
    },
    onSuccess: (id) => {
      toast.success(t("rfq.to_quote_ok"));
      setOpen(false);
      navigate({ to: "/quotations/$id", params: { id } });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileOutput, { className: "h-4 w-4" }),
      " ",
      t("rfq.to_quote")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rfq.to_quote") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("rfq.to_quote_hint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.customer"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: customerId, onValueChange: setCustomerId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("rfq.customer") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: customers.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.to_quote_markup"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.5", value: markup, onChange: (e) => setMarkup(e.target.value), dir: "ltr" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("rfq.to_quote_expiry"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: expiry, onChange: (e) => setExpiry(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(), disabled: createMut.isPending || !customerId, children: t("rfq.to_quote") })
      ] })
    ] }) })
  ] });
}
function RfqDetail() {
  const {
    id
  } = Route$j.useParams();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "operations_manager"]);
  const [editing, setEditing] = reactExports.useState(false);
  const [confirmStatus, setConfirmStatus] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["rfq", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rfqs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const history = useQuery({
    queryKey: ["rfq-status-history", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rfq_status_history").select("*").eq("rfq_id", id).order("changed_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const statusMut = useMutation({
    mutationFn: async (status) => {
      const {
        error
      } = await supabase.from("rfqs").update({
        status
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      qc.invalidateQueries({
        queryKey: ["rfq", id]
      });
      qc.invalidateQueries({
        queryKey: ["rfq-sreqs", id]
      });
      qc.invalidateQueries({
        queryKey: ["rfq-status-history", id]
      });
      qc.invalidateQueries({
        queryKey: ["rfq-metrics"]
      });
      qc.invalidateQueries({
        queryKey: ["approval-requests", "rfq", id]
      });
    },
    onError: (e) => {
      setConfirmStatus(null);
      toast.error(dbErrorMessage(e, t));
    }
  });
  if (q.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!q.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("rfq.no_found") });
  const r = q.data;
  const editable = canWrite && r.status === "draft" && !r.deleted_at;
  const actions = [{
    key: "send",
    label: t("rfq.send"),
    status: "sent",
    icon: Send,
    show: canWrite && r.status === "draft"
  }, {
    key: "complete",
    label: t("rfq.complete"),
    status: "completed",
    icon: CheckCheck,
    show: canWrite && ["sent", "partial"].includes(r.status)
  }, {
    key: "approve",
    label: t("actions.approve"),
    status: "approved",
    icon: Check,
    show: canApprove && r.status === "completed"
  }, {
    key: "reject",
    label: t("actions.reject"),
    status: "rejected",
    icon: X,
    variant: "destructive",
    show: canApprove && r.status === "completed"
  }, {
    key: "expire",
    label: t("rfq.expire_action"),
    status: "expired",
    icon: Clock,
    variant: "outline",
    show: canWrite && ["sent", "partial", "completed"].includes(r.status)
  }, {
    key: "reopen",
    label: t("rfq.reopen"),
    status: "draft",
    icon: RotateCcw,
    variant: "outline",
    show: canWrite && r.status === "rejected"
  }, {
    key: "cancel",
    label: t("rfq.cancel"),
    status: "cancelled",
    icon: Ban,
    variant: "destructive",
    show: canWrite && ["draft", "sent", "partial", "rejected"].includes(r.status)
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: `${r.rfq_no}${r.destination ? " — " + r.destination : ""}`, subtitle: `${formatDate(r.travel_start)} → ${formatDate(r.travel_end)} · ${r.currency}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/rfqs"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RStatusBadge, { status: r.status, t }),
      editable && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreateQuotationButton, { rfq: r }),
      actions.filter((a) => a.show).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: a.variant ?? "default", onClick: () => setConfirmStatus(a.status), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: "h-4 w-4" }),
        a.label
      ] }, a.key))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "general", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: t("rfq.tab.general") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "items", children: t("rfq.tab.items") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "suppliers", children: t("rfq.tab.suppliers") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "responses", children: t("rfq.tab.responses") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comparison", children: t("rfq.tab.comparison") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("tab.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approval", children: t("tab.approval") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "history", children: t("rfq.tab.history") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "general", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RfqForm, { initial: r, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["rfq", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rfq.number"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", children: r.rfq_no }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("filter.status"), v: /* @__PURE__ */ jsxRuntimeExports.jsx(RStatusBadge, { status: r.status, t }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rfq.destination"), v: r.destination ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rfq.travel_start"), v: formatDate(r.travel_start) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rfq.travel_end"), v: formatDate(r.travel_end) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.currency"), v: r.currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.notes"), v: r.notes ?? "—" })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "items", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RfqItemsTab, { rfqId: id, editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "suppliers", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RfqSuppliersTab, { rfqId: id, editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "responses", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RfqResponsesTab, { rfqId: id, rfqStatus: r.status, currency: r.currency }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comparison", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RfqComparisonTab, { rfqId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "rfq", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approval", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalWorkflow, { entityType: "rfq", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "history", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: t("rfq.status_history") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: (history.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("label.no_results") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y", children: history.data.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3 py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              h.from_status ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                t(`rstatus.${h.from_status}`),
                " ← "
              ] }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t(`rstatus.${h.to_status}`) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { dir: "ltr", className: "text-xs text-muted-foreground", children: formatDateTime(h.changed_at, lang) })
          ] }, h.id)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EntityHistory, { entityType: "rfqs", entityId: id })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!confirmStatus, onOpenChange: (v) => !v && setConfirmStatus(null), title: t("rfq.confirm_status"), description: confirmStatus ? t(`rstatus.${confirmStatus}`) : "", onConfirm: () => confirmStatus && statusMut.mutate(confirmStatus) })
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
  RfqDetail as component
};
