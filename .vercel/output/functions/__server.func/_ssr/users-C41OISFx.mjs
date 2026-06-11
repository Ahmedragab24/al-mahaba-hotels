import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { P as PageHeader } from "./page-header-B642MlGy.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { u as useQuery, a as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { S as Switch } from "./switch-BwRKxUkF.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-B3U_60pZ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { M as MODULES } from "./modules-DfpCgJrz.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
import { S as ShieldOff } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
function UsersPage() {
  const {
    t,
    lang
  } = useI18n();
  const auth = useAuth();
  const [permUser, setPermUser] = reactExports.useState(null);
  const q = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const [{
        data: profiles
      }, {
        data: roles
      }] = await Promise.all([supabase.from("profiles").select("*").order("created_at", {
        ascending: false
      }), supabase.from("user_roles").select("user_id, role")]);
      const rolesMap = /* @__PURE__ */ new Map();
      (roles ?? []).forEach((r) => {
        const arr = rolesMap.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesMap.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesMap.get(p.id) ?? []
      }));
    }
  });
  const isSuperAdmin = auth.hasRole("super_admin");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("users.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.name") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.email") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.role") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("users.last_login") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
          isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("perm.manage") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: t("label.loading") }) }),
          !q.isLoading && (q.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: t("label.no_results") }) }),
          q.data?.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: lang === "ar" ? u.full_name_ar || u.full_name_en : u.full_name_en || u.full_name_ar }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", children: u.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: u.roles.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t(`role.${r}`) }, r)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDateTime(u.last_login_at, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: u.locked_until && new Date(u.locked_until) > /* @__PURE__ */ new Date() ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-rose-100 text-rose-800 border-transparent", children: t("users.locked") }) : u.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-emerald-100 text-emerald-800 border-transparent", children: t("status.active") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.inactive") }) }),
            isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: u.roles.includes("super_admin"), onClick: () => setPermUser(u), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { className: "h-4 w-4" }),
              " ",
              t("perm.manage")
            ] }) })
          ] }, u.id))
        ] })
      ] }) }) }),
      isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionsDialog, { user: permUser, onClose: () => setPermUser(null) })
    ] })
  ] });
}
function PermissionsDialog({
  user,
  onClose
}) {
  const {
    t,
    lang
  } = useI18n();
  const qc = useQueryClient();
  const blocks = useQuery({
    queryKey: ["module-blocks", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("user_module_blocks").select("id,module_key").eq("user_id", user.id)).data ?? []
  });
  const toggle = useMutation({
    mutationFn: async ({
      key,
      blocked
    }) => {
      if (blocked) {
        const row = blocks.data?.find((b) => b.module_key === key);
        const {
          error
        } = await supabase.from("user_module_blocks").delete().eq("id", row.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from("user_module_blocks").insert({
          user_id: user.id,
          module_key: key
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["module-blocks", user?.id]
      });
      toast.success(t("toast.saved"));
    },
    onError: (e) => toast.error(e.message)
  });
  const name = user ? (lang === "ar" ? user.full_name_ar : user.full_name_en) || user.email : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!user, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        t("perm.manage"),
        " — ",
        name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: t("perm.dialog_desc") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1", children: MODULES.map((m) => {
      const blocked = !!blocks.data?.some((b) => b.module_key === m.key);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-md border px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t(m.labelKey) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${blocked ? "text-destructive" : "text-muted-foreground"}`, children: blocked ? t("perm.hidden") : t("perm.visible") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: !blocked, disabled: blocks.isLoading || toggle.isPending, onCheckedChange: () => toggle.mutate({
            key: m.key,
            blocked
          }) })
        ] })
      ] }, m.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("perm.super_admin_note") })
  ] }) });
}
export {
  UsersPage as component
};
