import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, B as Badge } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
const SKIP_FIELDS = /* @__PURE__ */ new Set(["updated_at", "created_at", "id"]);
function changedFields(oldV, newV) {
  if (!oldV && newV) return [];
  if (!oldV || !newV) return [];
  const out = [];
  for (const key of Object.keys(newV)) {
    if (SKIP_FIELDS.has(key)) continue;
    if (JSON.stringify(oldV[key] ?? null) !== JSON.stringify(newV[key] ?? null)) {
      out.push({ field: key, from: oldV[key], to: newV[key] });
    }
  }
  return out;
}
function short(v) {
  if (v === null || v === void 0 || v === "") return "—";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 40 ? s.slice(0, 40) + "…" : s;
}
function EntityHistory({ entityType, entityId }) {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["entity-history", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("id,action,user_email,created_at,old_values,new_values").eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("history.action") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("history.user") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("history.time") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("history.changes") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
      q.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }),
      !q.isLoading && (q.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 4, className: "py-8 text-center text-muted-foreground", children: t("history.empty") }) }),
      q.data?.map((row) => {
        const changes = row.action === "update" ? changedFields(row.old_values, row.new_values) : [];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t(`history.action.${row.action}`, row.action) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: row.user_email ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: formatDateTime(row.created_at, lang) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
            row.action === "create" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t("history.action.create") }),
            row.action === "delete" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: t("history.action.delete") }),
            row.action === "update" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
              changes.slice(0, 6).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-muted-foreground", children: c.field }),
                ": ",
                short(c.from),
                " → ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: short(c.to) })
              ] }, c.field)),
              changes.length > 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "+",
                changes.length - 6
              ] })
            ] })
          ] })
        ] }, row.id);
      })
    ] })
  ] }) }) });
}
export {
  EntityHistory as E
};
