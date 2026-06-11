import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { o as Route$c, u as useI18n, e as useAuth } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { C as Checkbox } from "./_ssr/checkbox-Co4oTAVV.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { a as formatDate, f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { R as RateForm } from "./_ssr/-form-yWtNuxCY.mjs";
import { O as OccupancyTab } from "./_ssr/-occupancy-Blvgo2AT.mjs";
import { E as EntityAttachments } from "./_ssr/entity-attachments-BwrnOfiv.mjs";
import { A as ArrowLeft, _ as Pencil, aw as Send, N as Check, X, Z as Plus, V as Trash2 } from "./_libs/lucide-react.mjs";
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
import "./_libs/radix-ui__react-select.mjs";
import "./_libs/radix-ui__number.mjs";
import "./_libs/radix-ui__react-focus-guards.mjs";
import "./_libs/radix-ui__react-focus-scope.mjs";
import "./_libs/radix-ui__react-use-previous.mjs";
import "./_libs/aria-hidden.mjs";
import "./_libs/react-remove-scroll.mjs";
import "./_libs/react-remove-scroll-bar.mjs";
import "./_libs/react-style-singleton.mjs";
import "./_libs/get-nonce.mjs";
import "./_libs/use-sidecar.mjs";
import "./_libs/use-callback-ref.mjs";
import "./_libs/radix-ui__react-checkbox.mjs";
import "./_libs/radix-ui__react-dialog.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
import "./_libs/react-hook-form.mjs";
import "./_libs/hookform__resolvers.mjs";
import "./_libs/zod.mjs";
import "./_ssr/lookups-DjTAjyZF.mjs";
import "./_ssr/form-BepQWxLA.mjs";
import "./_ssr/label-BWkpBOCr.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_ssr/db-errors-CH7zwDRs.mjs";
function RateDetail() {
  const {
    id
  } = Route$c.useParams();
  const search = Route$c.useSearch();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "operations_manager"]);
  const [editing, setEditing] = reactExports.useState(!!search.edit);
  const [rejectOpen, setRejectOpen] = reactExports.useState(false);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const [submitConfirm, setSubmitConfirm] = reactExports.useState(false);
  const [approveConfirm, setApproveConfirm] = reactExports.useState(false);
  const rate = useQuery({
    queryKey: ["rate", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rates").select("*, hotel:hotels(name_en,name_ar,code), supplier:suppliers(name_en,name_ar,code), room_type:hotel_room_types(name_en,name_ar), view:hotel_views(name_en,name_ar), contract:supplier_contracts(contract_number,title)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const submitMut = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("rates").update({
        status: "pending_approval",
        submitted_by: auth.user?.id ?? null,
        submitted_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({
        rate_id: id,
        action: "submit",
        performed_by: auth.user.id
      });
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate", id]
      });
      qc.invalidateQueries({
        queryKey: ["rate-approvals", id]
      });
      setSubmitConfirm(false);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const approveMut = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("rates").update({
        status: "approved",
        approved_by: auth.user?.id ?? null,
        approved_at: (/* @__PURE__ */ new Date()).toISOString(),
        rejection_reason: null
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({
        rate_id: id,
        action: "approve",
        performed_by: auth.user.id
      });
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate", id]
      });
      qc.invalidateQueries({
        queryKey: ["rate-approvals", id]
      });
      setApproveConfirm(false);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const rejectMut = useMutation({
    mutationFn: async (reason) => {
      const {
        error
      } = await supabase.from("rates").update({
        status: "rejected",
        rejection_reason: reason
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({
        rate_id: id,
        action: "reject",
        performed_by: auth.user.id,
        comments: reason
      });
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate", id]
      });
      qc.invalidateQueries({
        queryKey: ["rate-approvals", id]
      });
      setRejectOpen(false);
      setRejectReason("");
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  if (rate.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!rate.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("rates.no_rate") });
  const r = rate.data;
  const hotelName = lang === "ar" ? r.hotel?.name_ar || r.hotel?.name_en : r.hotel?.name_en || r.hotel?.name_ar;
  const supplierName = lang === "ar" ? r.supplier?.name_ar || r.supplier?.name_en : r.supplier?.name_en || r.supplier?.name_ar;
  const editable = canWrite && r.status === "draft" && !r.deleted_at;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: `${r.code} — ${hotelName}`, subtitle: `${supplierName} · ${formatDate(r.valid_from)} → ${formatDate(r.valid_to)}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/rates"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.status }),
      editable && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      canWrite && r.status === "draft" && !r.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setSubmitConfirm(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
        t("actions.submit_approval")
      ] }),
      canApprove && r.status === "pending_approval" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setApproveConfirm(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
          t("actions.approve")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => setRejectOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          t("actions.reject")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("rates.tab.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "occupancy", children: t("rates.tab.occupancy") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "seasons", children: t("rates.tab.seasons") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "taxes", children: t("rates.tab.taxes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cxl", children: t("rates.tab.cancellation") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "attachments", children: t("tab.attachments") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approvals", children: t("rates.tab.approvals") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RateForm, { initial: r, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["rate", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileView, { r, lang, t }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "occupancy", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OccupancyTab, { rateId: id, currency: r.currency, canWrite: editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "seasons", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeasonsTab, { rateId: id, canWrite: editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "taxes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaxesTab, { rateId: id, canWrite: editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cxl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CancellationTab, { rateId: id, canWrite: editable }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityAttachments, { entityType: "rate", entityId: id }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approvals", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApprovalsTab, { rateId: id }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: submitConfirm, onOpenChange: setSubmitConfirm, title: t("actions.submit_approval"), description: t("rates.submit_confirm"), onConfirm: () => submitMut.mutate() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: approveConfirm, onOpenChange: setApproveConfirm, title: t("actions.approve"), description: t("rates.approve_confirm"), onConfirm: () => approveMut.mutate() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: rejectOpen, onOpenChange: setRejectOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("actions.reject") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: rejectReason, onChange: (e) => setRejectReason(e.target.value), placeholder: t("rates.reject_reason") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: !rejectReason.trim() || rejectMut.isPending, onClick: () => rejectMut.mutate(rejectReason.trim()), children: t("actions.reject") })
      ] })
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
function ProfileView({
  r,
  lang,
  t
}) {
  const margin = r.selling_price && r.cost_per_night ? ((Number(r.selling_price) - Number(r.cost_per_night)) / Number(r.cost_per_night) * 100).toFixed(2) + " %" : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-1 gap-x-6 p-4 md:grid-cols-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.code"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: r.code }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.hotel"), v: lang === "ar" ? r.hotel?.name_ar || r.hotel?.name_en : r.hotel?.name_en || r.hotel?.name_ar }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.supplier"), v: lang === "ar" ? r.supplier?.name_ar || r.supplier?.name_en : r.supplier?.name_en || r.supplier?.name_ar }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.contract"), v: r.contract ? `${r.contract.contract_number} — ${r.contract.title}` : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.room_type"), v: lang === "ar" ? r.room_type?.name_ar || r.room_type?.name_en : r.room_type?.name_en || r.room_type?.name_ar }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.view"), v: r.view ? lang === "ar" ? r.view.name_ar || r.view.name_en : r.view.name_en || r.view.name_ar : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.meal_plan"), v: t(`board.${r.meal_plan}`, r.meal_plan) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("label.currency"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: r.currency }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.valid_from"), v: formatDate(r.valid_from) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.valid_to"), v: formatDate(r.valid_to) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.cost"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: Number(r.cost_per_night).toFixed(2) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.selling"), v: r.selling_price ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: Number(r.selling_price).toFixed(2) }) : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.markup"), v: r.markup_pct ? Number(r.markup_pct).toFixed(2) + " %" : null }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.margin"), v: margin }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.min_nights"), v: r.min_nights }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.max_nights"), v: r.max_nights }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.release_days"), v: r.release_days }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.allotment"), v: r.allotment }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.notes_en"), v: r.notes_en }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.notes_ar"), v: r.notes_ar }) }),
    r.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { k: t("rates.reject_reason"), v: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: r.rejection_reason }) }) })
  ] }) });
}
function SeasonsTab({
  rateId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const blank = {
    name: "",
    start_date: "",
    end_date: "",
    cost_per_night: 0,
    selling_price: "",
    min_nights: 1,
    notes: ""
  };
  const [form, setForm] = reactExports.useState(blank);
  const list = useQuery({
    queryKey: ["rate-seasons", rateId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_seasons").select("*").eq("rate_id", rateId).order("start_date");
      if (error) throw error;
      return data ?? [];
    }
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        rate_id: rateId,
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        cost_per_night: Number(form.cost_per_night),
        min_nights: Number(form.min_nights),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        notes: form.notes || null
      };
      if (new Date(payload.end_date) < new Date(payload.start_date)) throw new Error("end_date >= start_date");
      if (editId) {
        const {
          error
        } = await supabase.from("rate_seasons").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("rate_seasons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate-seasons", rateId]
      });
      setOpen(false);
      setEditId(null);
      setForm(blank);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const del = useMutation({
    mutationFn: async (sid) => {
      const {
        error
      } = await supabase.from("rate_seasons").delete().eq("id", sid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["rate-seasons", rateId]
      });
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setEditId(null);
      setForm(blank);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      t("actions.add")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.season_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_from") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.valid_to") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.cost") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.selling") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.min_nights") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (list.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-6", children: t("label.no_results") }) }),
        list.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: s.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(s.start_date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: formatDate(s.end_date) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: Number(s.cost_per_night).toFixed(2) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end font-mono", children: s.selling_price ? Number(s.selling_price).toFixed(2) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: s.min_nights }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditId(s.id);
              setForm({
                ...s,
                selling_price: s.selling_price ?? ""
              });
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => del.mutate(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, s.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rates.seasons") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.season_name"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.valid_from"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.start_date, onChange: (e) => setForm({
            ...form,
            start_date: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.valid_to"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.end_date, onChange: (e) => setForm({
            ...form,
            end_date: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.cost"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.cost_per_night, onChange: (e) => setForm({
            ...form,
            cost_per_night: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs", children: t("rates.selling") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.selling_price, onChange: (e) => setForm({
            ...form,
            selling_price: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.min_nights"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", value: form.min_nights, onChange: (e) => setForm({
            ...form,
            min_nights: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes ?? "", onChange: (e) => setForm({
            ...form,
            notes: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.name || !form.start_date || !form.end_date || save.isPending, onClick: () => save.mutate(), children: t("actions.save") })
      ] })
    ] }) })
  ] }) });
}
function TaxesTab({
  rateId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const blank = {
    name: "",
    tax_type: "percentage",
    value: 0,
    is_inclusive: false,
    applies_to: "per_night"
  };
  const [form, setForm] = reactExports.useState(blank);
  const list = useQuery({
    queryKey: ["rate-taxes", rateId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_taxes").select("*").eq("rate_id", rateId).order("name");
      if (error) throw error;
      return data ?? [];
    }
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        rate_id: rateId,
        name: form.name,
        tax_type: form.tax_type,
        value: Number(form.value),
        is_inclusive: !!form.is_inclusive,
        applies_to: form.applies_to
      };
      if (editId) {
        const {
          error
        } = await supabase.from("rate_taxes").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("rate_taxes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate-taxes", rateId]
      });
      setOpen(false);
      setEditId(null);
      setForm(blank);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const del = useMutation({
    mutationFn: async (tid) => {
      const {
        error
      } = await supabase.from("rate_taxes").delete().eq("id", tid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["rate-taxes", rateId]
      });
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setEditId(null);
      setForm(blank);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      t("actions.add")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.tax_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.tax_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.tax_value") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.tax_inclusive") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.tax_applies_to") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (list.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-6", children: t("label.no_results") }) }),
        list.data?.map((x) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: x.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: x.tax_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-end font-mono", children: [
            Number(x.value).toFixed(2),
            x.tax_type === "percentage" ? " %" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: x.is_inclusive ? "✓" : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: x.applies_to }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditId(x.id);
              setForm(x);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => del.mutate(x.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, x.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rates.taxes") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.tax_name"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
            ...form,
            name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.tax_type"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.tax_type, onValueChange: (v) => setForm({
            ...form,
            tax_type: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: "percentage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "fixed" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.tax_value"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.value, onChange: (e) => setForm({
            ...form,
            value: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.tax_applies_to"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.applies_to, onValueChange: (v) => setForm({
            ...form,
            applies_to: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_night", children: "per_night" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_stay", children: "per_stay" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_person", children: "per_person" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "per_person_per_night", children: "per_person_per_night" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "col-span-2 flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!form.is_inclusive, onCheckedChange: (v) => setForm({
            ...form,
            is_inclusive: !!v
          }) }),
          t("rates.tax_inclusive")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.name || save.isPending, onClick: () => save.mutate(), children: t("actions.save") })
      ] })
    ] }) })
  ] }) });
}
function CancellationTab({
  rateId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const blank = {
    days_before_checkin: 0,
    penalty_type: "percentage",
    penalty_value: 0,
    notes: ""
  };
  const [form, setForm] = reactExports.useState(blank);
  const list = useQuery({
    queryKey: ["rate-cxl", rateId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_cancellation_rules").select("*").eq("rate_id", rateId).order("days_before_checkin", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        rate_id: rateId,
        days_before_checkin: Number(form.days_before_checkin),
        penalty_type: form.penalty_type,
        penalty_value: Number(form.penalty_value),
        notes: form.notes || null
      };
      if (editId) {
        const {
          error
        } = await supabase.from("rate_cancellation_rules").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("rate_cancellation_rules").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["rate-cxl", rateId]
      });
      setOpen(false);
      setEditId(null);
      setForm(blank);
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const del = useMutation({
    mutationFn: async (cid) => {
      const {
        error
      } = await supabase.from("rate_cancellation_rules").delete().eq("id", cid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["rate-cxl", rateId]
      });
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 p-4", children: [
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setEditId(null);
      setForm(blank);
      setOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      t("actions.add")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.cxl_days") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.penalty_type") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("rates.penalty_value") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.notes") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        (list.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-6", children: t("label.no_results") }) }),
        list.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.days_before_checkin }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: c.penalty_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-end font-mono", children: [
            Number(c.penalty_value).toFixed(2),
            c.penalty_type === "percentage" ? " %" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: c.notes }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditId(c.id);
              setForm(c);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => del.mutate(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rates.cancellation") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.cxl_days"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: form.days_before_checkin, onChange: (e) => setForm({
            ...form,
            days_before_checkin: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.penalty_type"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.penalty_type, onValueChange: (v) => setForm({
            ...form,
            penalty_type: v
          }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "percentage", children: "percentage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "fixed", children: "fixed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "nights", children: "nights" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "full", children: "full" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs", children: [
            t("rates.penalty_value"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: form.penalty_value, onChange: (e) => setForm({
            ...form,
            penalty_value: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.notes ?? "", onChange: (e) => setForm({
            ...form,
            notes: e.target.value
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: save.isPending, onClick: () => save.mutate(), children: t("actions.save") })
      ] })
    ] }) })
  ] }) });
}
function ApprovalsTab({
  rateId
}) {
  const {
    t
  } = useI18n();
  const list = useQuery({
    queryKey: ["rate-approvals", rateId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("rate_approvals").select("*, performer:profiles!rate_approvals_performed_by_fkey(full_name_en,full_name_ar,email)").eq("rate_id", rateId).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.approval_action") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.full_name") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rates.comments") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.created_at") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      (list.data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-6", children: t("label.no_results") }) }),
      list.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: a.action === "submit" ? "pending_approval" : a.action === "approve" ? "approved" : "rejected" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: a.performer?.full_name_en ?? a.performer?.email ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: a.comments }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", dir: "ltr", children: formatDateTime(a.created_at) })
      ] }, a.id))
    ] })
  ] }) }) });
}
export {
  RateDetail as component
};
