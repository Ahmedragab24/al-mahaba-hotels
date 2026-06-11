import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { T as ThemeToggle, L as LangSwitcher } from "./theme-toggle-Cg8iWw4X.mjs";
import { s as submitSupplierApplication, g as getApplyLookups } from "./supplier-applications.functions-CZ5a9G9t.mjs";
import { l as logoUrl } from "./daleel-logo-transparent-BMZzokD7.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { C as CircleCheck, A as ArrowLeft, L as LoaderCircle } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
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
import "../_libs/radix-ui__react-direction.mjs";
import "./client-BdL2Ylqo.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
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
import "./createSsrRpc-BABjPGaI.mjs";
import "./server-BR2a3ZJC.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "./auth-middleware-DICWdMih.mjs";
const DRAFT_KEY = "supplier_apply_draft_v1";
function ApplyPage() {
  const {
    t,
    dir,
    lang
  } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [submitted, setSubmitted] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [form, setForm] = reactExports.useState({
    name_ar: "",
    name_en: "",
    supplier_type: "direct_hotel",
    legal_name: "",
    tax_number: "",
    commercial_registration: "",
    country_code: "",
    city_id: "",
    address_line1: "",
    website: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_position: ""
  });
  reactExports.useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({
        ...form,
        ...JSON.parse(saved)
      });
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
    }
  }, [form]);
  const {
    data: lookups
  } = useQuery({
    queryKey: ["apply-lookups"],
    queryFn: () => getApplyLookups()
  });
  const countries = lookups?.countries ?? [];
  const cities = reactExports.useMemo(() => (lookups?.cities ?? []).filter((c) => !form.country_code || c.country_code === form.country_code), [lookups, form.country_code]);
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  const validStep0 = form.name_ar.trim() && form.name_en.trim() && form.supplier_type;
  const validStep2 = form.contact_name.trim() && form.contact_email.trim() && form.contact_phone.trim();
  async function handleSubmit() {
    setError(null);
    setBusy(true);
    try {
      const res = await submitSupplierApplication({
        data: form
      });
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted({
        id: res.id
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("DUPLICATE")) setError(t("supplier.apply.err_duplicate"));
      else if (msg.includes("INVALID_EMAIL")) setError(t("supplier.apply.err_email"));
      else if (msg.includes("MISSING_FIELD")) setError(t("supplier.apply.err_missing"));
      else setError(msg);
    } finally {
      setBusy(false);
    }
  }
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center p-6", dir, style: {
      background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), var(--background)"
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-lg w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-10 pb-8 flex flex-col items-center text-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-16 w-16 text-emerald-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: t("supplier.apply.success_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: t("supplier.apply.success_desc") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "#",
        submitted.id.slice(0, 8)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
        to: "/auth"
      }), className: "mt-2", children: t("supplier.apply.back_to_signin") })
    ] }) }) });
  }
  const steps = [t("supplier.apply.step_company"), t("supplier.apply.step_details"), t("supplier.apply.step_contact"), t("supplier.apply.step_review")];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-4 py-8", dir, style: {
    background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), var(--background)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute end-4 top-4 z-10 flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitcher, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "", className: "h-12 w-12 object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: t("supplier.apply.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: t("supplier.apply.subtitle") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mb-6", children: steps.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i <= step ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30 text-muted-foreground"}`, children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${i === step ? "font-semibold" : "text-muted-foreground"} hidden sm:inline`, children: label }),
        i < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}` })
      ] }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: steps[step] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: t(`supplier.apply.step${step}_desc`) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  t("label.name_ar"),
                  " *"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name_ar, onChange: (e) => set("name_ar", e.target.value), required: true })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  t("label.name_en"),
                  " *"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name_en, onChange: (e) => set("name_en", e.target.value), required: true })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                t("supplier.apply.type"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplier_type, onValueChange: (v) => set("supplier_type", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "direct_hotel", children: t("supplier.type.direct_hotel") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "wholesaler", children: t("supplier.type.wholesaler") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "dmc", children: t("supplier.type.dmc") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "hotel_supplier", children: t("supplier.type.hotel_supplier") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "other", children: t("supplier.type.other") })
                ] })
              ] })
            ] })
          ] }),
          step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.tax_number") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.tax_number, onChange: (e) => set("tax_number", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.cr") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.commercial_registration, onChange: (e) => set("commercial_registration", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.country") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.country_code, onValueChange: (v) => {
                set("country_code", v);
                set("city_id", "");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.code, children: lang === "ar" ? c.name_ar : c.name_en }, c.code)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.city") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.city_id, onValueChange: (v) => set("city_id", v), disabled: !form.country_code, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: cities.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: lang === "ar" ? c.name_ar : c.name_en }, c.id)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.address") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: form.address_line1, onChange: (e) => set("address_line1", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.website") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.website, onChange: (e) => set("website", e.target.value), placeholder: "https://" })
            ] })
          ] }) }),
          step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                t("supplier.apply.contact_name"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contact_name, onChange: (e) => set("contact_name", e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("supplier.apply.contact_position") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.contact_position, onChange: (e) => set("contact_position", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                t("label.email"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", dir: "ltr", value: form.contact_email, onChange: (e) => set("contact_email", e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                t("label.phone"),
                " *"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { dir: "ltr", value: form.contact_phone, onChange: (e) => set("contact_phone", e.target.value), required: true })
            ] })
          ] }),
          step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-2", children: t("supplier.apply.step_company") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("label.name_ar"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: form.name_ar }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("label.name_en"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: form.name_en }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("supplier.apply.type"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: t(`supplier.type.${form.supplier_type}`) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-2", children: t("supplier.apply.step_contact") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("supplier.apply.contact_name"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: form.contact_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("label.email"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: form.contact_email }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  t("label.phone"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: form.contact_phone })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("supplier.apply.review_note") })
          ] }),
          error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm", children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-4 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => step === 0 ? navigate({
              to: "/auth"
            }) : setStep(step - 1), disabled: busy, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 me-1" }),
              step === 0 ? t("supplier.apply.back_to_signin") : t("actions.back")
            ] }),
            step < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setStep(step + 1), disabled: step === 0 && !validStep0 || step === 1 && false || step === 2 && !validStep2, children: t("supplier.apply.next") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: busy, style: {
              background: "var(--gradient-brand)"
            }, className: "text-white border-0", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 me-2 animate-spin" }),
              t("actions.saving")
            ] }) : t("supplier.apply.submit") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "hover:underline", children: t("supplier.apply.have_account") }) })
    ] })
  ] });
}
export {
  ApplyPage as component
};
