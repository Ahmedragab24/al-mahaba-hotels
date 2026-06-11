import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { S as Switch } from "./switch-BwRKxUkF.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
import { aF as ExternalLink, ad as CalendarClock, V as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
function nextRun(frequency) {
  const d = /* @__PURE__ */ new Date();
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  else d.setMonth(d.getMonth() + 1, 1);
  d.setHours(6, 0, 0, 0);
  return d.toISOString();
}
function TemplatesPage() {
  const {
    t,
    lang,
    dir
  } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [schedFor, setSchedFor] = reactExports.useState(null);
  const [frequency, setFrequency] = reactExports.useState("weekly");
  const [format, setFormat] = reactExports.useState("pdf");
  const [recipients, setRecipients] = reactExports.useState("");
  const templates = useQuery({
    queryKey: ["rpt-templates"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("report_templates").select("*").is("deleted_at", null).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const schedules = useQuery({
    queryKey: ["rpt-schedules"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("report_schedules").select("*, template:report_templates(name_ar, name_en, report_key)").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data ?? [];
    }
  });
  const name = (r) => lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar;
  const openTemplate = (tpl) => {
    const cfg = tpl.config ?? {};
    if (tpl.report_key === "operational") navigate({
      to: "/reports/operational",
      search: cfg
    });
    else if (tpl.report_key === "financial") navigate({
      to: "/reports/financial",
      search: {
        from: cfg.from,
        to: cfg.to
      }
    });
    else if (tpl.report_key === "tax") navigate({
      to: "/reports/tax",
      search: {
        from: cfg.from,
        to: cfg.to
      }
    });
    else navigate({
      to: "/reports"
    });
  };
  const deleteTemplate = async (id) => {
    const {
      error
    } = await supabase.from("report_templates").update({
      deleted_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("rpt.deleted"));
      qc.invalidateQueries({
        queryKey: ["rpt-templates"]
      });
    }
  };
  const addSchedule = async () => {
    if (!schedFor) return;
    const {
      error
    } = await supabase.from("report_schedules").insert({
      template_id: schedFor,
      frequency,
      export_format: format,
      recipients: recipients.trim() || null,
      next_run_at: nextRun(frequency),
      created_by: auth.user?.id
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("rpt.schedule_saved"));
    setSchedFor(null);
    setRecipients("");
    qc.invalidateQueries({
      queryKey: ["rpt-schedules"]
    });
  };
  const toggleSchedule = async (id, active) => {
    const {
      error
    } = await supabase.from("report_schedules").update({
      active
    }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({
      queryKey: ["rpt-schedules"]
    });
  };
  const deleteSchedule = async (id) => {
    const {
      error
    } = await supabase.from("report_schedules").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(t("rpt.deleted"));
      qc.invalidateQueries({
        queryKey: ["rpt-schedules"]
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("rpt.templates_title"), subtitle: t("rpt.templates_sub") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: t("rpt.templates") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.report_type") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.shared") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.created_at") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: templates.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }) : (templates.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-muted-foreground", children: t("rpt.no_templates") }) }) : templates.data.map((tpl) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: name(tpl) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`nav.rpt_${tpl.report_key}`, tpl.report_key) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: tpl.is_shared ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: t("rpt.shared") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("rpt.private") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateTime(tpl.created_at, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => openTemplate(tpl), title: t("rpt.open"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSchedFor(tpl.id), title: t("rpt.add_schedule"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => deleteTemplate(tpl.id), title: t("actions.delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) })
            ] }) })
          ] }, tpl.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: t("rpt.schedules") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.frequency") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.format") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.recipients") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.next_run") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("rpt.active") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: schedules.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }) : (schedules.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 7, className: "py-8 text-center text-muted-foreground", children: t("rpt.no_schedules") }) }) : schedules.data.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: s.template ? name(s.template) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t(`rpt.freq_${s.frequency}`, s.frequency) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "uppercase", children: s.export_format }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate", children: s.recipients ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateTime(s.next_run_at, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.active, onCheckedChange: (v) => toggleSchedule(s.id, v) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => deleteSchedule(s.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) })
          ] }, s.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!schedFor, onOpenChange: (o) => !o && setSchedFor(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rpt.add_schedule") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.frequency") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: frequency, onValueChange: setFrequency, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "daily", children: t("rpt.freq_daily") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "weekly", children: t("rpt.freq_weekly") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "monthly", children: t("rpt.freq_monthly") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.format") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: format, onValueChange: setFormat, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { dir, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "pdf", children: "PDF" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "excel", children: "Excel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "csv", children: "CSV" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.recipients") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: recipients, onChange: (e) => setRecipients(e.target.value), placeholder: t("rpt.recipients_ph"), maxLength: 500 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setSchedFor(null), children: t("actions.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addSchedule, children: t("actions.save") })
      ] })
    ] }) })
  ] });
}
export {
  TemplatesPage as component
};
