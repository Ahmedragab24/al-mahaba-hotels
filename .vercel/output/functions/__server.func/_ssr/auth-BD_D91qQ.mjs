import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { T as ThemeToggle, L as LangSwitcher } from "./theme-toggle-Cg8iWw4X.mjs";
import { l as logoUrl } from "./daleel-logo-transparent-BMZzokD7.mjs";
import { l as logoDarkUrl } from "./daleel-logo-dark-BSN_jYAz.mjs";
import { c as createSsrRpc } from "./createSsrRpc-BABjPGaI.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const ensureDemoUsers = createServerFn({
  method: "POST"
}).handler(createSsrRpc("459a24fc04eeb742e6c61d0b4e68d543bd96e6dcb74a2a62253595402388f04f"));
const DEMO_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent", "viewer"];
const DEFAULT_DOMAIN = "uat-hrs.sa";
function normalizeDigits(raw) {
  return raw.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 1632)).replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 1776));
}
function LoginPage() {
  const {
    t,
    dir
  } = useI18n();
  const navigate = useNavigate();
  const [role, setRole] = reactExports.useState("super_admin");
  const [password, setPassword] = reactExports.useState("12345678");
  const [error, setError] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  const [seeding, setSeeding] = reactExports.useState(true);
  reactExports.useEffect(() => {
    ensureDemoUsers().catch(() => void 0).finally(() => setSeeding(false));
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const {
        error: err
      } = await supabase.auth.signInWithPassword({
        email: `${role}@${DEFAULT_DOMAIN}`,
        password: normalizeDigits(password)
      });
      if (err) {
        setError(err.message.includes("Invalid") ? t("auth.invalid") : err.message);
        return;
      }
      navigate({
        to: "/",
        replace: true
      });
    } catch {
      setError(t("auth.conn_error"));
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-10", dir, style: {
    background: "radial-gradient(1200px 600px at 50% -10%, color-mix(in oklab, var(--brand-gold) 18%, transparent), transparent 60%), linear-gradient(180deg, var(--background), color-mix(in oklab, var(--brand-gold) 6%, var(--background)))"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-40 -end-40 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-gold)]/15 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-40 -start-40 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-gold-deep)]/15 blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute end-4 top-4 z-10 flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LangSwitcher, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex flex-col items-center text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex h-28 w-28 items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: t("brand.name"), className: "h-full w-full object-contain drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--brand-gold-deep)_35%,transparent)] dark:hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoDarkUrl, alt: t("brand.name"), className: "hidden h-full w-full object-contain drop-shadow-[0_8px_24px_color-mix(in_oklab,var(--brand-gold)_30%,transparent)] dark:block" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold leading-tight tracking-tight text-foreground", children: t("brand.name") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-px w-20", style: {
          background: "var(--gradient-brand)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-base font-medium text-foreground", children: t("auth.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t("auth.subtitle") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", style: {
        boxShadow: "var(--shadow-brand)"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", dir, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: t("auth.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: role, onValueChange: setRole, disabled: seeding, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "role", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DEMO_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: t(`role.${r}`) }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: t("auth.password") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", autoComplete: "current-password", dir: "ltr", className: "text-start", value: password, onChange: (e) => setPassword(e.target.value), required: true })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive", role: "alert", children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: busy || seeding, className: "h-10 w-full border-0 font-semibold text-white", style: {
          background: "var(--gradient-brand)"
        }, children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          t("auth.signing_in")
        ] }) : t("auth.signin") })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/supplier-apply", className: "text-sm font-medium text-[var(--brand-gold-deep)] hover:underline", children: [
        t("supplier.apply_cta"),
        " ←"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        t("brand.name")
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
