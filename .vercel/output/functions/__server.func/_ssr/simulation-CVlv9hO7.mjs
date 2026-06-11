import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useRouter } from "../_libs/tanstack__react-router.mjs";
import { m as isRedirect } from "../_libs/tanstack__router-core.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Switch } from "./switch-BwRKxUkF.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CiTC5spL.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as createSsrRpc } from "./createSsrRpc-BABjPGaI.mjs";
import { b as createServerFn } from "./server-BR2a3ZJC.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-DICWdMih.mjs";
import "../_libs/seroval.mjs";
import { i as Activity, Q as Play, V as Trash2, Y as RefreshCw } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-label.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const getSimulationSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5d821f56f5902eb1a268d00a3c0a6a5f474bf57b0cbbb221329d75f71f8301a4"));
const updateSimulationSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((i) => i).handler(createSsrRpc("8e45bbe7e67b9acc1c494c0ac19f0c2baff7818c13fc4000ed8ad25f311580ff"));
const runSimulationNow = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("13a2f9a76bf5d33bf7e6116377d6b1e86f86f21db2818697c98f58e59f946a36"));
const purgeSimulatedData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("614e8a025382547325883cfa13b59a50196cb833abc4320c2a249868410f5cd8"));
function SimulationPage() {
  const {
    dir
  } = useI18n();
  const qc = useQueryClient();
  const fetchSettings = useServerFn(getSimulationSettings);
  const updateFn = useServerFn(updateSimulationSettings);
  const runFn = useServerFn(runSimulationNow);
  const purgeFn = useServerFn(purgeSimulatedData);
  const q = useQuery({
    queryKey: ["simulation-settings"],
    queryFn: () => fetchSettings(),
    refetchInterval: 1e4
  });
  const update = useMutation({
    mutationFn: (input) => updateFn({
      data: {
        id: q.data.settings.id,
        ...input
      }
    }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      qc.invalidateQueries({
        queryKey: ["simulation-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "فشل الحفظ")
  });
  const runNow = useMutation({
    mutationFn: () => runFn(),
    onSuccess: (r) => {
      toast.success(`تم تشغيل دورة محاكاة — ${JSON.stringify(r.created ?? {})}`);
      qc.invalidateQueries({
        queryKey: ["simulation-settings"]
      });
    },
    onError: (e) => toast.error(e?.message ?? "فشل التشغيل")
  });
  const purge = useMutation({
    mutationFn: () => purgeFn(),
    onSuccess: (r) => {
      toast.success(`تم حذف البيانات الاصطناعية`);
      qc.invalidateQueries({
        queryKey: ["simulation-settings"]
      });
      console.log("purge result", r);
    },
    onError: (e) => toast.error(e?.message ?? "فشل الحذف")
  });
  const s = q.data?.settings;
  const counts = q.data?.counts ?? {};
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", dir, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "وضع المحاكاة الحية", description: "تشغيل نشاط تلقائي على المنصة (RFQs، حجوزات، فواتير، سندات) لإظهار المنصة بحالة عمل حقيقي. جميع البيانات الناتجة موسومة وقابلة للحذف بضغطة واحدة." }),
    q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "جارٍ التحميل..." }),
    s && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-5 w-5" }),
          "إعدادات المحاكاة"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-base", children: "تفعيل المحاكاة التلقائية" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "عند التفعيل سيقوم النظام بإنشاء نشاط تلقائي حسب التردد والشدة المحددين." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.enabled, onCheckedChange: (v) => update.mutate({
              enabled: v
            }), disabled: update.isPending })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "تردد التشغيل (بالدقائق)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 1440, defaultValue: s.interval_minutes, onBlur: (e) => {
                const v = parseInt(e.target.value);
                if (v && v !== s.interval_minutes) update.mutate({
                  interval_minutes: v
                });
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "ملاحظة: المهمة المجدولة تعمل كل 5 دقائق وتفحص هذا الإعداد." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "شدة المحاكاة" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.intensity, onValueChange: (v) => update.mutate({
                intensity: v
              }), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "منخفضة (~2 حدث/دورة)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "متوسطة (~4 أحداث/دورة)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "عالية (~8 أحداث/دورة)" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 border-t pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => runNow.mutate(), disabled: runNow.isPending, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 me-2" }),
              "تشغيل دورة الآن"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => {
              if (confirm("سيتم حذف جميع البيانات الاصطناعية. متابعة؟")) purge.mutate();
            }, disabled: purge.isPending, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 me-2" }),
              "حذف جميع البيانات الاصطناعية"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => q.refetch(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 me-2" }),
              "تحديث"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "حالة آخر تشغيل" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "آخر تشغيل" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: s.last_run_at ? new Date(s.last_run_at).toLocaleString("ar-SA") : "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "الحالة" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                s.last_run_status === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: "ناجح" }),
                s.last_run_status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "فشل" }),
                !s.last_run_status && "—"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "عدد الدورات الإجمالي" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: s.total_runs ?? 0 })
            ] })
          ] }),
          s.last_run_summary && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-4 max-h-48 overflow-auto rounded bg-muted p-3 text-xs", children: JSON.stringify(s.last_run_summary, null, 2) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "البيانات الاصطناعية الموجودة" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "الجدول" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: "عدد السجلات" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: Object.entries(counts).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: k }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: v })
          ] }, k)) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  SimulationPage as component
};
