import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, L as Link } from "./_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "./_libs/tanstack__react-query.mjs";
import { s as supabase } from "./_ssr/client-BdL2Ylqo.mjs";
import { s as Route$5, u as useI18n, e as useAuth, B as Badge } from "./_ssr/router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./_ssr/page-header-B642MlGy.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./_ssr/card-D3oUK5Qe.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./_ssr/tabs-uBlCHUHs.mjs";
import { B as Button } from "./_ssr/button-D2X9i3zo.mjs";
import { I as Input } from "./_ssr/input-B9Lwb7ES.mjs";
import { T as Textarea } from "./_ssr/textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./_ssr/select-CiTC5spL.mjs";
import { C as Checkbox } from "./_ssr/checkbox-Co4oTAVV.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./_ssr/table-BQwhu8us.mjs";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./_ssr/dialog-B3U_60pZ.mjs";
import { C as CustomerForm } from "./_ssr/-form-Bkbn1G63.mjs";
import { r as readSync, u as utils, w as writeFileSync } from "./_libs/xlsx.mjs";
import { f as formatDateTime } from "./_ssr/format-CMnhdgFc.mjs";
import { t as toast } from "./_libs/sonner.mjs";
import { S as StatusPill } from "./_ssr/status-pill-B67QFpI4.mjs";
import { C as ConfirmDialog } from "./_ssr/confirm-dialog-BkZsgNXk.mjs";
import { A as ArrowLeft, _ as Pencil, Z as Plus, V as Trash2, F as FileSpreadsheet, aA as Upload, aB as Download, C as CircleCheck, z as CircleX, U as Users } from "./_libs/lucide-react.mjs";
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
import "./_ssr/lookups-DjTAjyZF.mjs";
import "./_ssr/form-BepQWxLA.mjs";
import "./_ssr/label-BWkpBOCr.mjs";
import "./_libs/radix-ui__react-label.mjs";
import "./_libs/radix-ui__react-alert-dialog.mjs";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
function norm(s) {
  return String(s ?? "").trim();
}
function headerKey(h) {
  const x = h.toLowerCase().replace(/[\s_-]+/g, "");
  if (/(الاسمبالعربي|الاسمعربي|اسمعربي|namear|arabicname|الاسمالكامل|الاسم|^name$|fullname)/.test(x)) return "name_ar";
  if (/(الاسمبالانجليزي|اسمانجليزي|nameen|englishname)/.test(x)) return "name_en";
  if (/(البريد|الايميل|الإيميل|email|mail)/.test(x)) return "email";
  if (/(الجوال|جوال|موبايل|mobile|cell)/.test(x)) return "mobile";
  if (/(الهاتف|هاتف|phone|tel)/.test(x)) return "phone";
  if (/(الهوية|هوية|رقمالهوية|nationalid|iqama|اقامة|الإقامة|id(number)?$|passport|جوازالسفر|جواز)/.test(x)) return "national_id";
  return null;
}
function MembersTab({ customerId, canWrite }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [rows, setRows] = reactExports.useState(null);
  const [fileName, setFileName] = reactExports.useState("");
  const members = useQuery({
    queryKey: ["customer-members", customerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, code, name_ar, name_en, email, mobile, phone, status, created_at").eq("parent_customer_id", customerId).is("deleted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
  const parseFile = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = readSync(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = utils.sheet_to_json(ws, { defval: "" });
      if (raw.length === 0) {
        toast.error(t("members.empty_file"));
        return;
      }
      const headerMap = {};
      for (const h of Object.keys(raw[0])) {
        const k = headerKey(h);
        if (k && !Object.values(headerMap).includes(k)) headerMap[h] = k;
      }
      if (!Object.values(headerMap).includes("name_ar") && !Object.values(headerMap).includes("name_en")) {
        toast.error(t("members.no_name_column"));
        return;
      }
      const parsed = raw.map((r) => {
        const o = {};
        for (const [h, k] of Object.entries(headerMap)) o[k] = norm(r[h]);
        const nameAr = o.name_ar || o.name_en || "";
        const nameEn = o.name_en || o.name_ar || "";
        const email = o.email && EMAIL_RE.test(o.email) ? o.email.toLowerCase() : null;
        const row = {
          name_ar: nameAr.slice(0, 200),
          name_en: nameEn.slice(0, 200),
          email,
          mobile: o.mobile ? o.mobile.slice(0, 40) : null,
          phone: o.phone ? o.phone.slice(0, 40) : null,
          national_id: o.national_id ? o.national_id.slice(0, 50) : null,
          valid: !!nameAr
        };
        if (!row.valid) row.reason = t("members.missing_name");
        return row;
      }).filter((r) => r.name_ar || r.email || r.mobile);
      if (parsed.length === 0) {
        toast.error(t("members.empty_file"));
        return;
      }
      setRows(parsed);
      setFileName(file.name);
    } catch {
      toast.error(t("members.parse_error"));
    }
  };
  const importMut = useMutation({
    mutationFn: async (valid) => {
      let inserted = 0;
      for (let i = 0; i < valid.length; i += 100) {
        const chunk = valid.slice(i, i + 100).map((r) => ({
          customer_type: "individual",
          parent_customer_id: customerId,
          name_ar: r.name_ar,
          name_en: r.name_en,
          email: r.email,
          mobile: r.mobile,
          phone: r.phone,
          notes: r.national_id ? `ID: ${r.national_id}` : null,
          status: "active",
          preferred_language: "ar"
        }));
        const { error } = await supabase.from("customers").insert(chunk);
        if (error) throw error;
        inserted += chunk.length;
      }
      return inserted;
    },
    onSuccess: (n) => {
      toast.success(`${t("members.imported")}: ${n}`);
      setRows(null);
      setFileName("");
      qc.invalidateQueries({ queryKey: ["customer-members", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e) => toast.error(e.message ?? t("toast.error"))
  });
  const downloadTemplate = () => {
    const ws = utils.aoa_to_sheet([
      ["الاسم بالعربي", "الاسم بالانجليزي", "البريد الإلكتروني", "الجوال", "الهاتف", "رقم الهوية"],
      ["محمد أحمد", "Mohammed Ahmed", "m.ahmed@example.com", "0501234567", "", "1098765432"]
    ]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Individuals");
    writeFileSync(wb, "individuals-template.xlsx");
  };
  const validRows = rows?.filter((r) => r.valid) ?? [];
  const invalidRows = rows?.filter((r) => !r.valid) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-5 w-5 text-primary" }),
        " ",
        t("members.import_title")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("members.import_hint") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: ".xlsx,.xls,.csv",
              className: "hidden",
              onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) parseFile(f);
                e.target.value = "";
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => fileRef.current?.click(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
            " ",
            t("members.choose_file")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: downloadTemplate, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            " ",
            t("members.download_template")
          ] })
        ] }),
        rows && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: fileName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
              " ",
              validRows.length,
              " ",
              t("members.valid_rows")
            ] }),
            invalidRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5" }),
              " ",
              invalidRows.length,
              " ",
              t("members.invalid_rows")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-64 overflow-auto rounded border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name_ar") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name_en") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.mobile") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.slice(0, 50).map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: r.valid ? "" : "opacity-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.name_ar || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: r.name_en || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: r.email || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: r.mobile || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: r.valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("members.ready") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: r.reason }) })
              ] }, i)) })
            ] }),
            rows.length > 50 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "p-2 text-center text-xs text-muted-foreground", children: [
              "+",
              rows.length - 50,
              " ",
              t("members.more_rows")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                disabled: validRows.length === 0 || importMut.isPending,
                onClick: () => importMut.mutate(validRows),
                children: importMut.isPending ? t("actions.saving") : `${t("members.import_now")} (${validRows.length})`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => {
              setRows(null);
              setFileName("");
            }, children: t("actions.cancel") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary" }),
        " ",
        t("members.list_title"),
        " (",
        members.data?.length ?? 0,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: members.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("label.loading") }) : (members.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("members.none") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.code") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.mobile") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.created_at") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: members.data.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/customers/$id", params: { id: m.id }, className: "text-primary hover:underline", children: m.code }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: lang === "ar" ? m.name_ar || m.name_en : m.name_en || m.name_ar }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: m.email || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: m.mobile || m.phone || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`status.${m.status}`) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs text-muted-foreground", children: formatDateTime(m.created_at, lang) })
        ] }, m.id)) })
      ] }) })
    ] })
  ] });
}
function CustomerDetail() {
  const {
    id
  } = Route$5.useParams();
  const search = Route$5.useSearch();
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager"]);
  const [editing, setEditing] = reactExports.useState(!!search.edit);
  const cust = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("customers").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const contacts = useQuery({
    queryKey: ["customer-contacts", id],
    queryFn: async () => (await supabase.from("customer_contacts").select("*").eq("customer_id", id).order("is_primary", {
      ascending: false
    })).data ?? []
  });
  const attachments = useQuery({
    queryKey: ["customer-attachments", id],
    queryFn: async () => (await supabase.from("customer_attachments").select("*").eq("customer_id", id).order("created_at", {
      ascending: false
    })).data ?? []
  });
  const comms = useQuery({
    queryKey: ["customer-comms", id],
    queryFn: async () => (await supabase.from("customer_communications").select("*").eq("customer_id", id).order("occurred_at", {
      ascending: false
    })).data ?? []
  });
  if (cust.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.loading") });
  if (!cust.data) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground", children: t("label.no_results") });
  const c = cust.data;
  const displayName = lang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar;
  const isEntity = c.customer_type !== "individual";
  const isIndividual = c.customer_type === "individual";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: displayName, subtitle: `${c.code} · ${t(`ctype.${c.customer_type}`)}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
        to: "/customers"
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
        t("actions.back")
      ] }),
      canWrite && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setEditing(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
        t("actions.edit")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: c.status })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: t("customers.overview") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "contacts", children: [
          t("customers.contacts"),
          " (",
          contacts.data?.length ?? 0,
          ")"
        ] }),
        isEntity && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "members", children: t("customers.members") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "attachments", children: [
          t("customers.attachments"),
          " (",
          attachments.data?.length ?? 0,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "communications", children: [
          t("customers.communications"),
          " (",
          comms.data?.length ?? 0,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerForm, { initial: c, onSaved: () => {
        setEditing(false);
        qc.invalidateQueries({
          queryKey: ["customer", id]
        });
      } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-3 p-6 md:grid-cols-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.code"), value: c.code, mono: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("filter.type"), value: t(`ctype.${c.customer_type}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.language"), value: c.preferred_language === "ar" ? "العربية" : "English" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: isIndividual ? t("label.personal_name_en") : t("label.name_en"), value: c.name_en }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: isIndividual ? t("label.personal_name_ar") : t("label.name_ar"), value: c.name_ar }),
        !isIndividual && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.tax_number"), value: c.tax_number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.cr"), value: c.commercial_registration })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.email"), value: c.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.phone"), value: c.phone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.mobile"), value: c.mobile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.website"), value: c.website }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.country"), value: c.country ? lang === "ar" ? c.country.name_ar : c.country.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.city"), value: c.city ? lang === "ar" ? c.city.name_ar : c.city.name_en : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.address"), value: [c.address_line1, c.address_line2, c.postal_code].filter(Boolean).join(", ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.currency"), value: c.preferred_currency }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.credit_limit"), value: Number(c.credit_limit).toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.credit_days"), value: c.credit_days }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.payment_terms"), value: c.payment_terms }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.rating"), value: c.rating ? "★".repeat(c.rating) : "" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.created_at"), value: formatDateTime(c.created_at, lang) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KV, { label: t("label.updated_at"), value: formatDateTime(c.updated_at, lang) }),
        c.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t("label.notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap", children: c.notes })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contacts", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactsTab, { customerId: id, canWrite }) }),
      isEntity && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "members", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MembersTab, { customerId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "attachments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AttachmentsTab, { customerId: id, canWrite }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "communications", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommunicationsTab, { customerId: id, canWrite }) })
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
function ContactsTab({
  customerId,
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
    queryKey: ["customer-contacts", customerId],
    queryFn: async () => (await supabase.from("customer_contacts").select("*").eq("customer_id", customerId).order("is_primary", {
      ascending: false
    })).data ?? []
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("customer_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["customer-contacts", customerId]
      });
      setDelId(null);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("customers.contacts") }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.is_primary") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
          q.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: c.full_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: c.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: c.phone || c.mobile }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.is_primary && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("label.is_primary") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
                setEditing(c);
                setOpen(true);
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] }) })
          ] }, c.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ContactDialog, { open, onOpenChange: setOpen, customerId, initial: editing, onSaved: () => qc.invalidateQueries({
      queryKey: ["customer-contacts", customerId]
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v) => !v && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] });
}
function ContactDialog({
  open,
  onOpenChange,
  customerId,
  initial,
  onSaved
}) {
  const {
    t
  } = useI18n();
  const [v, setV] = reactExports.useState({});
  const isEdit = !!initial?.id;
  reactExports.useState(() => {
    setV(initial ?? {
      is_primary: false,
      preferred_language: "ar"
    });
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload = {
        ...v,
        customer_id: customerId
      };
      delete payload.created_at;
      delete payload.updated_at;
      if (isEdit) {
        const {
          error
        } = await supabase.from("customer_contacts").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("customer_contacts").insert(payload);
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
      is_primary: false
    });
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: isEdit ? t("actions.edit") : t("actions.add") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.full_name")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.full_name ?? "", onChange: (e) => setV({
        ...v,
        full_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.title_position"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.title ?? "", onChange: (e) => setV({
        ...v,
        title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.language"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.preferred_language ?? "ar", onValueChange: (x) => setV({
          ...v,
          preferred_language: x
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ar", children: "العربية" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "en", children: "English" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: !!v.is_primary, onCheckedChange: (x) => setV({
          ...v,
          is_primary: !!x
        }) }),
        t("label.is_primary")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.notes"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: v.notes ?? "", onChange: (e) => setV({
        ...v,
        notes: e.target.value
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: t("actions.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: save.isPending ? t("actions.saving") : t("actions.save") })
    ] })
  ] }) });
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
function AttachmentsTab({
  customerId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [v, setV] = reactExports.useState({});
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["customer-attachments", customerId],
    queryFn: async () => (await supabase.from("customer_attachments").select("*").eq("customer_id", customerId).order("created_at", {
      ascending: false
    })).data ?? []
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.file_name?.trim() || !v.file_path?.trim()) throw new Error(t("label.required"));
      const {
        error
      } = await supabase.from("customer_attachments").insert({
        ...v,
        customer_id: customerId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["customer-attachments", customerId]
      });
      setOpen(false);
      setV({});
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("customer_attachments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["customer-attachments", customerId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("customers.attachments") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (o) setV({});
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("actions.add")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("customers.attachments") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.file_name")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.file_name ?? "", onChange: (e) => setV({
              ...v,
              file_name: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `${t("label.file_url")} *`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: v.file_path ?? "", onChange: (e) => setV({
              ...v,
              file_path: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.category"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.category ?? "", onChange: (e) => setV({
              ...v,
              category: e.target.value
            }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.file_name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.category") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.created_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.file_path, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline", children: a.file_name }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: a.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateTime(a.created_at, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(a.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
        ] }, a.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v2) => !v2 && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
function CommunicationsTab({
  customerId,
  canWrite
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [v, setV] = reactExports.useState({});
  const [delId, setDelId] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["customer-comms", customerId],
    queryFn: async () => (await supabase.from("customer_communications").select("*").eq("customer_id", customerId).order("occurred_at", {
      ascending: false
    })).data ?? []
  });
  const staff = useQuery({
    queryKey: ["lookup-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id,email,full_name_ar,full_name_en")).data ?? []
  });
  const staffName = (id) => {
    const p = staff.data?.find((x) => x.id === id);
    if (!p) return "—";
    return (lang === "ar" ? p.full_name_ar : p.full_name_en) || p.email || "—";
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!v.channel) throw new Error(t("label.required"));
      const payload = {
        ...v,
        customer_id: customerId,
        occurred_at: v.occurred_at || (/* @__PURE__ */ new Date()).toISOString()
      };
      const {
        error
      } = await supabase.from("customer_communications").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({
        queryKey: ["customer-comms", customerId]
      });
      setOpen(false);
      setV({});
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("customer_communications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({
        queryKey: ["customer-comms", customerId]
      });
      setDelId(null);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: t("customers.communications") }),
      canWrite && /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
        setOpen(o);
        if (o) setV({
          channel: "note",
          direction: "outbound"
        });
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          t("actions.add")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("customers.communications") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.channel"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.channel ?? "note", onValueChange: (x) => setV({
                ...v,
                channel: x
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["email", "phone", "whatsapp", "meeting", "note", "other"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: t(`channel.${c}`) }, c)) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.direction"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: v.direction ?? "outbound", onValueChange: (x) => setV({
                ...v,
                direction: x
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "inbound", children: t("direction.inbound") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "outbound", children: t("direction.outbound") })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.subject"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: v.subject ?? "", onChange: (e) => setV({
              ...v,
              subject: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.message"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: v.body ?? "", onChange: (e) => setV({
              ...v,
              body: e.target.value
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t("label.occurred_at"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: v.occurred_at?.slice(0, 16) ?? "", onChange: (e) => setV({
              ...v,
              occurred_at: e.target.value ? new Date(e.target.value).toISOString() : ""
            }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), disabled: save.isPending, children: t("actions.save") })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.occurred_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.channel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.direction") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.subject") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.employee") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        q.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-10 text-center text-muted-foreground", children: t("empty.title") }) }),
        q.data?.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: formatDateTime(c.occurred_at, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`channel.${c.channel}`) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: c.direction ? t(`direction.${c.direction}`) : "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.subject }),
            c.body && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-2", children: c.body })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: staffName(c.created_by) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { dir: "ltr", className: "text-muted-foreground", children: formatDateTime(c.created_at, lang) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: canWrite && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setDelId(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
        ] }, c.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmDialog, { open: !!delId, onOpenChange: (v2) => !v2 && setDelId(null), title: t("actions.delete"), description: t("toast.confirm_delete"), destructive: true, onConfirm: () => delId && del.mutate(delId) })
  ] }) });
}
export {
  CustomerDetail as component
};
