import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { g as Route$n, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { a as useHotelsLite, u as useCurrencies, b as useCountries } from "./_ssr/lookups-DjTAjyZF.mjs";
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
import { S as SupplierForm } from "./_ssr/-form-at4fzHiM.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { A as ArrowLeft, _ as Pencil, Z as Plus, V as Trash2, a5 as Star } from "./_libs/lucide-react.mjs";
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
import "./_libs/react-hook-form.mjs";
import "./_libs/hookform__resolvers.mjs";
import "./_libs/zod.mjs";
import "./_ssr/form-BepQWxLA.mjs";
import "./_ssr/label-BWkpBOCr.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
const CONTRACT_STATUSES = ["draft", "active", "expired", "terminated"];
function SupplierDetail() {
  const {
    id
  } = Route$n.useParams();
  const search = Route$n.useSearch();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = reactExports.useState(!!search.edit);
  const supplier = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("suppliers").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar), currency:currencies(code,name_en,name_ar,symbol)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const counts = useQuery({
    queryKey: ["supplier-counts", id],
    queryFn: async () => {
      const tables = ["supplier_contacts", "supplier_contracts", "supplier_bank_accounts", "supplier_ratings", "hotel_suppliers"];
      const out = {};
      await Promise.all(tables.map(async (tb) => {
        const {
          count
        } = await supabase.from(tb).select("*", {
          count: "exact",
          head: true
        }).eq("supplier_id", id);
        out[tb] = count ?? 0;
      }));
      return out;
    }
  });
  if (supplier.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!supplier.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.no_results") });
  const s = supplier.data;
  const displayName = lang === "ar" ? s.name_ar || s.name_en : s.name_en || s.name_ar;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: displayName, subtitle: `${s.code} · ${t(`stype.${s.supplier_type}`, s.supplier_type)}${s.rating ? " · ★ " + Number(s.rating).toFixed(1) : ""}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/suppliers"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      canWrite && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: s.status })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("suppliers.profile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "contacts", children: [
          t("suppliers.contacts"),
          " (",
          counts.data?.supplier_contacts ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "contracts", children: [
          t("suppliers.contracts"),
          " (",
          counts.data?.supplier_contracts ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "banks", children: [
          t("suppliers.banks"),
          " (",
          counts.data?.supplier_bank_accounts ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "ratings", children: [
          t("suppliers.ratings"),
          " (",
          counts.data?.supplier_ratings ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "hotels", children: [
          t("suppliers.hotels"),
          " (",
          counts.data?.hotel_suppliers ?? 0,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(SupplierForm, { initial: s, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["supplier", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.code"), value: s.code, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("filter.type"), value: t(`stype.${s.supplier_type}`, s.supplier_type) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.status"), value: t(`status.${s.status}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_en"), value: s.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.name_ar"), value: s.name_ar }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.legal_name"), value: s.legal_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.tax_number"), value: s.tax_number }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.cr"), value: s.commercial_registration }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.currency"), value: s.currency ? `${s.currency.code} ${s.currency.symbol ?? ""}` : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.credit_days"), value: s.credit_days }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.payment_terms"), value: s.payment_terms }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.rating"), value: s.rating ? Number(s.rating).toFixed(2) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.country"), value: s.country ? lang === "ar" ? s.country.name_ar : s.country.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.city"), value: s.city ? lang === "ar" ? s.city.name_ar : s.city.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.address"), value: [s.address_line1, s.address_line2].filter(Boolean).join(", ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.phone"), value: s.phone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.mobile"), value: s.mobile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.email"), value: s.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.website"), value: s.website }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(s.created_at, lang) }),
        s.tags?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: t("label.tags") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: s.tags.map((tg) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: tg }, tg)) })
        ] }) : null,
        s.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: s.notes })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contacts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactsTab, { supplierId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contracts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContractsTab, { supplierId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "banks", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BanksTab, { supplierId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "ratings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RatingsTab, { supplierId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hotels", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HotelsTab, { supplierId: id, canWrite }) })
    ] }) })
  ] });
}
function KV({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: mono ? "font-mono text-sm" : "text-sm", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
function ContactsTab({
  supplierId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["supplier-contacts", supplierId],
    queryFn: async () => (await supabase.from("supplier_contacts").select("*").eq("supplier_id", supplierId).order("is_primary", {
      ascending: false
    })).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("supplier_contacts").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["supplier-contacts", supplierId]
      });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("suppliers.contacts") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.full_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.title_position") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.phone") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.mobile") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_primary") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.full_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.phone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs", children: r.mobile }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_primary && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("label.is_primary") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContactDialog, { open, onOpenChange: setOpen, supplierId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["supplier-contacts", supplierId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function ContactDialog({
  open,
  onOpenChange,
  supplierId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload = {
        supplier_id: supplierId,
        full_name: v.full_name.trim(),
        title: v.title || null,
        email: v.email || null,
        phone: v.phone || null,
        mobile: v.mobile || null,
        is_primary: !!v.is_primary,
        notes: v.notes || null
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("supplier_contacts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("supplier_contacts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {});
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("suppliers.contacts")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.full_name")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.full_name ?? "", onChange: (e) => setV({
        ...v,
        full_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.title_position"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.title ?? "", onChange: (e) => setV({
        ...v,
        title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.email"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", value: v.email ?? "", onChange: (e) => setV({
        ...v,
        email: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.phone"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.phone ?? "", onChange: (e) => setV({
        ...v,
        phone: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.mobile"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.mobile ?? "", onChange: (e) => setV({
        ...v,
        mobile: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_primary, onCheckedChange: (x) => setV({
          ...v,
          is_primary: !!x
        }) }),
        t("label.is_primary")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
        ...v,
        notes: e.target.value
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function ContractsTab({
  supplierId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["supplier-contracts", supplierId],
    queryFn: async () => (await supabase.from("supplier_contracts").select("*").eq("supplier_id", supplierId).order("start_date", {
      ascending: false
    })).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("supplier_contracts").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["supplier-contracts", supplierId]
      });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("suppliers.contracts") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.contract_number") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.start_date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.end_date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.commission_pct") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.contract_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.start_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.end_date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: r.currency }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.commission_pct ?? "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.status === "active" ? "default" : "secondary", children: t(`suppliers.contract_status.${r.status}`, r.status) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContractDialog, { open, onOpenChange: setOpen, supplierId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["supplier-contracts", supplierId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function ContractDialog({
  open,
  onOpenChange,
  supplierId,
  initial,
  onSaved
}) {
  const {
    t,
    lang
  } = useI18n();
  const currencies = useCurrencies();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.contract_number?.trim() || !v.start_date || !v.end_date) throw new Error(t("label.required"));
      if (new Date(v.end_date) < new Date(v.start_date)) throw new Error("End date must be ≥ start date");
      const payload = {
        supplier_id: supplierId,
        contract_number: v.contract_number.trim(),
        title: v.title || null,
        start_date: v.start_date,
        end_date: v.end_date,
        currency: v.currency || null,
        commission_pct: v.commission_pct ? Number(v.commission_pct) : null,
        payment_terms: v.payment_terms || null,
        cancellation_terms: v.cancellation_terms || null,
        file_path: v.file_path || null,
        notes: v.notes || null,
        status: v.status || "draft"
      };
      if (isEdit) {
        const {
          error
        } = await supabase.from("supplier_contracts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("supplier_contracts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {
      status: "draft"
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("suppliers.contracts")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.contract_number")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.contract_number ?? "", onChange: (e) => setV({
        ...v,
        contract_number: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.name"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.title ?? "", onChange: (e) => setV({
        ...v,
        title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.status"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.status ?? "draft", onValueChange: (x) => setV({
        ...v,
        status: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONTRACT_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: t(`suppliers.contract_status.${s}`) }, s)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.start_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.start_date ?? "", onChange: (e) => setV({
        ...v,
        start_date: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.end_date")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: v.end_date ?? "", onChange: (e) => setV({
        ...v,
        end_date: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.currency"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.currency ?? "", onValueChange: (x) => setV({
        ...v,
        currency: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.code, children: [
          c.code,
          " — ",
          lang === "ar" ? c.name_ar : c.name_en
        ] }, c.code)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.commission_pct"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: 0, max: 100, value: v.commission_pct ?? "", onChange: (e) => setV({
        ...v,
        commission_pct: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.file"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.file_path ?? "", onChange: (e) => setV({
        ...v,
        file_path: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.payment_terms"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.payment_terms ?? "", onChange: (e) => setV({
        ...v,
        payment_terms: e.target.value
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("rates.cancellation"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.cancellation_terms ?? "", onChange: (e) => setV({
        ...v,
        cancellation_terms: e.target.value
      }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
        ...v,
        notes: e.target.value
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function BanksTab({
  supplierId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["supplier-banks", supplierId],
    queryFn: async () => (await supabase.from("supplier_bank_accounts").select("*").eq("supplier_id", supplierId).order("is_default", {
      ascending: false
    })).data ?? []
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("supplier_bank_accounts").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["supplier-banks", supplierId]
      });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("suppliers.banks") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.bank_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.account_holder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.account_number") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.iban") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.swift") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.currency") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_default") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 8, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: r.bank_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.account_holder }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-mono text-xs", children: r.account_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-mono text-xs", children: r.iban }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "font-mono text-xs", children: r.swift }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: r.currency }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("label.is_default") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
              setEditing(r);
              setOpen(true);
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
          ] }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BankDialog, { open, onOpenChange: setOpen, supplierId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["supplier-banks", supplierId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function BankDialog({
  open,
  onOpenChange,
  supplierId,
  initial,
  onSaved
}) {
  const {
    t,
    lang
  } = useI18n();
  const countries = useCountries();
  const currencies = useCurrencies();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.bank_name?.trim() || !v.account_holder?.trim() || !v.account_number?.trim()) throw new Error(t("label.required"));
      const payload = {
        supplier_id: supplierId,
        bank_name: v.bank_name.trim(),
        branch: v.branch || null,
        account_holder: v.account_holder.trim(),
        account_number: v.account_number.trim(),
        iban: v.iban || null,
        swift: v.swift || null,
        currency: v.currency || null,
        country_code: v.country_code || null,
        is_default: !!v.is_default,
        notes: v.notes || null
      };
      if (payload.is_default) {
        await supabase.from("supplier_bank_accounts").update({
          is_default: false
        }).eq("supplier_id", supplierId);
      }
      if (isEdit) {
        const {
          error
        } = await supabase.from("supplier_bank_accounts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("supplier_bank_accounts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV(initial ?? {});
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      isEdit ? t("actions.edit") : t("actions.add"),
      " — ",
      t("suppliers.banks")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.bank_name")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.bank_name ?? "", onChange: (e) => setV({
        ...v,
        bank_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.branch"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.branch ?? "", onChange: (e) => setV({
        ...v,
        branch: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.country"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.country_code ?? "", onValueChange: (x) => setV({
        ...v,
        country_code: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: lang === "ar" ? c.name_ar : c.name_en }, c.code)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.account_holder")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.account_holder ?? "", onChange: (e) => setV({
        ...v,
        account_holder: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.account_number")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.account_number ?? "", onChange: (e) => setV({
        ...v,
        account_number: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.currency"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.currency ?? "", onValueChange: (x) => setV({
        ...v,
        currency: x
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: currencies.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: c.code }, c.code)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.iban"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.iban ?? "", onChange: (e) => setV({
        ...v,
        iban: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.swift"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.swift ?? "", onChange: (e) => setV({
        ...v,
        swift: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm self-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_default, onCheckedChange: (x) => setV({
          ...v,
          is_default: !!x
        }) }),
        t("label.is_default")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
        ...v,
        notes: e.target.value
      }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function RatingsTab({
  supplierId,
  canWrite
}) {
  const {
    t
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["supplier-ratings", supplierId],
    queryFn: async () => (await supabase.from("supplier_ratings").select("*").eq("supplier_id", supplierId).order("created_at", {
      ascending: false
    })).data ?? []
  });
  const avg = reactExports.useMemo(() => {
    const rows = q.data ?? [];
    if (!rows.length) return 0;
    return rows.reduce((a, r) => a + Number(r.score), 0) / rows.length;
  }, [q.data]);
  const refreshAvg = useMutation({
    mutationFn: async (newAvg) => {
      await supabase.from("suppliers").update({
        rating: Number(newAvg.toFixed(2))
      }).eq("id", supplierId);
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["supplier", supplierId]
    })
  });
  const del = useMutation({
    mutationFn: async (rid) => {
      const {
        error
      } = await supabase.from("supplier_ratings").delete().eq("id", rid);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success(t("toast.deleted"));
      const r = await supabase.from("supplier_ratings").select("score").eq("supplier_id", supplierId);
      const rows = r.data ?? [];
      const v = rows.length ? rows.reduce((a, x) => a + Number(x.score), 0) / rows.length : 0;
      await refreshAvg.mutateAsync(v);
      qc.invalidateQueries({
        queryKey: ["supplier-ratings", supplierId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("suppliers.ratings") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          t("suppliers.avg_rating"),
          ": ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-500 font-medium", children: [
            "★ ",
            avg.toFixed(2)
          ] })
        ] })
      ] }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("suppliers.add_rating")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.score") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.category") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.comment") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.created_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-10 text-center text-muted-foreground", children: t("suppliers.no_ratings") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-amber-500 font-medium flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-current" }),
            Number(r.score).toFixed(1)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: r.comment }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: formatDateTime(r.created_at, "en") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
        ] }, r.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RatingDialog, { open, onOpenChange: setOpen, supplierId, onSaved: async () => {
      const r = await supabase.from("supplier_ratings").select("score").eq("supplier_id", supplierId);
      const rows = r.data ?? [];
      const v = rows.length ? rows.reduce((a, x) => a + Number(x.score), 0) / rows.length : 0;
      await refreshAvg.mutateAsync(v);
      qc.invalidateQueries({
        queryKey: ["supplier-ratings", supplierId]
      });
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function RatingDialog({
  open,
  onOpenChange,
  supplierId,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({
    score: 5
  });
  const save = useMutation({
    mutationFn: async () => {
      const score = Number(v.score);
      if (!score || score < 1 || score > 5) throw new Error("Score 1-5");
      const {
        error
      } = await supabase.from("supplier_ratings").insert({
        supplier_id: supplierId,
        score,
        category: v.category || null,
        comment: v.comment || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    onOpenChange(o);
    if (o) setV({
      score: 5
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("suppliers.add_rating") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.score")} (1-5) *`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(v.score ?? 5), onValueChange: (x) => setV({
        ...v,
        score: Number(x)
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(n), children: "★".repeat(n) }, n)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.category"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.category ?? "", onChange: (e) => setV({
        ...v,
        category: e.target.value
      }), placeholder: "quality / service / pricing" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.comment"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: v.comment ?? "", onChange: (e) => setV({
        ...v,
        comment: e.target.value
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
function HotelsTab({
  supplierId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const [open, setOpen] = reactExports.useState(false);
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["supplier-hotels", supplierId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("hotel_suppliers").select("hotel_id, supplier_id, is_preferred, contract_id, notes, hotel:hotels(id,code,name_en,name_ar,country_code,star_rating)").eq("supplier_id", supplierId);
      if (error) throw error;
      return data ?? [];
    }
  });
  const togglePreferred = useMutation({
    mutationFn: async ({
      hotel_id,
      value
    }) => {
      const {
        error
      } = await supabase.from("hotel_suppliers").update({
        is_preferred: value
      }).eq("supplier_id", supplierId).eq("hotel_id", hotel_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["supplier-hotels", supplierId]
    }),
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async ({
      hotel_id
    }) => {
      const {
        error
      } = await supabase.from("hotel_suppliers").delete().eq("supplier_id", supplierId).eq("hotel_id", hotel_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["supplier-hotels", supplierId]
      });
      setDelId(null);
    }
  });
  const linkedIds = new Set((q.data ?? []).map((r) => r.hotel_id));
  const availableHotels = (hotels.data ?? []).filter((h) => !linkedIds.has(h.id));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("suppliers.hotels") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setOpen(true), disabled: !availableHotels.length, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("actions.add")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.country") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.stars") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_preferred") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.hotel?.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/hotels/$id", params: {
            id: r.hotel_id
          }, className: "hover:underline", children: lang === "ar" ? r.hotel?.name_ar || r.hotel?.name_en : r.hotel?.name_en || r.hotel?.name_ar }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: r.hotel?.country_code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-amber-500", children: r.hotel?.star_rating ? "★".repeat(r.hotel.star_rating) : "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!r.is_preferred, disabled: !canWrite, onCheckedChange: (x) => togglePreferred.mutate({
            hotel_id: r.hotel_id,
            value: !!x
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId({
            supplier_id: supplierId,
            hotel_id: r.hotel_id
          }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
        ] }, r.hotel_id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LinkHotelDialog, { open, onOpenChange: setOpen, supplierId, available: availableHotels, onSaved: () => qc.invalidateQueries({
      queryKey: ["supplier-hotels", supplierId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function LinkHotelDialog({
  open,
  onOpenChange,
  supplierId,
  available,
  onSaved
}) {
  const {
    t,
    lang
  } = useI18n();
  const [hotelId, setHotelId] = reactExports.useState("");
  const [preferred, setPreferred] = reactExports.useState(false);
  const save = useMutation({
    mutationFn: async () => {
      if (!hotelId) throw new Error(t("label.required"));
      const {
        error
      } = await supabase.from("hotel_suppliers").insert({
        supplier_id: supplierId,
        hotel_id: hotelId,
        is_preferred: preferred
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
      setHotelId("");
      setPreferred(false);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
      t("actions.add"),
      " — ",
      t("suppliers.hotels")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("rates.hotel"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: hotelId, onValueChange: setHotelId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: available?.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: h.id, children: [
          h.code,
          " — ",
          lang === "ar" ? h.name_ar : h.name_en
        ] }, h.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: preferred, onCheckedChange: (v) => setPreferred(!!v) }),
        t("label.is_preferred")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending || !hotelId, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
}
export {
  SupplierDetail as component
};
