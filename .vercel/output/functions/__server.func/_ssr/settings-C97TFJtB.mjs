import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D3oUK5Qe.mjs";
import "../_libs/sonner.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__react-router.mjs";
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
function SettingsPage() {
  const {
    t
  } = useI18n();
  const q = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("system_settings").select("*").order("key");
      return data ?? [];
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("settings.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: t("settings.title") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "divide-y", children: q.data?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-medium text-muted-foreground", children: s.key }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "col-span-2 font-mono", children: JSON.stringify(s.value) })
      ] }, s.key)) }) })
    ] }) })
  ] });
}
export {
  SettingsPage as component
};
