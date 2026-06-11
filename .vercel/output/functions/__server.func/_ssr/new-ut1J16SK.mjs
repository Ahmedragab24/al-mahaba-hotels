import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-uBlCHUHs.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { B as BookingForm } from "./-form-DF8o5QhD.mjs";
import { A as ArrowLeft } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
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
import "./input-B9Lwb7ES.mjs";
import "./textarea-BvXe9TDs.mjs";
function NewBooking() {
  const {
    t,
    lang
  } = useI18n();
  const navigate = useNavigate();
  const [quoteId, setQuoteId] = reactExports.useState("");
  const quotes = useQuery({
    queryKey: ["accepted-quotes"],
    queryFn: async () => {
      const {
        data: accepted
      } = await supabase.from("quotations").select("id,quotation_no,currency,customer:customers(name_en,name_ar)").eq("status", "accepted").is("deleted_at", null).order("created_at", {
        ascending: false
      });
      const {
        data: converted
      } = await supabase.from("bookings").select("quotation_id").not("quotation_id", "is", null).is("deleted_at", null);
      const used = new Set((converted ?? []).map((b) => b.quotation_id));
      return (accepted ?? []).filter((q) => !used.has(q.id));
    }
  });
  const convert = useMutation({
    mutationFn: async () => {
      if (!quoteId) throw new Error(t("bk.pick_quotation"));
      const {
        data,
        error
      } = await supabase.rpc("create_booking_from_quotation", {
        _quotation_id: quoteId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (id) => {
      toast.success(t("toast.saved"));
      navigate({
        to: "/bookings/$id",
        params: {
          id
        }
      });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("bk.new"), actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => navigate({
      to: "/bookings"
    }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 rtl:rotate-180" }),
      t("actions.back")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "direct", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "direct", children: t("bk.source_direct") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "quotation", children: t("bk.source_quotation") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "direct", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookingForm, { onSaved: (id) => navigate({
        to: "/bookings/$id",
        params: {
          id
        }
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "quotation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            t("bk.quotation"),
            " *"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: quoteId, onValueChange: setQuoteId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: t("bk.pick_quotation") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (quotes.data ?? []).map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: q.id, children: [
              q.quotation_no,
              " — ",
              lang === "ar" ? q.customer?.name_ar || q.customer?.name_en : q.customer?.name_en || q.customer?.name_ar,
              " (",
              q.currency,
              ")"
            ] }, q.id)) })
          ] }),
          !quotes.isLoading && (quotes.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("bk.no_accepted_quotes") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !quoteId || convert.isPending, onClick: () => convert.mutate(), children: t("bk.create_from_quote") })
      ] }) }) })
    ] }) })
  ] });
}
export {
  NewBooking as component
};
