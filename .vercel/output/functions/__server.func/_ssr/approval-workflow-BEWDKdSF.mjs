import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { T as Textarea } from "./textarea-BvXe9TDs.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aw as Send, N as Check, X, aE as Undo2, a2 as Archive } from "../_libs/lucide-react.mjs";
const SUBMIT_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent"];
const APPROVER_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager", "finance_manager"];
const OPEN = /* @__PURE__ */ new Set(["draft", "submitted", "returned"]);
const STATUS_VARIANT = {
  draft: "outline",
  submitted: "default",
  approved: "default",
  rejected: "destructive",
  returned: "secondary",
  archived: "secondary"
};
function ApprovalWorkflow({ entityType, entityId }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const [notesAction, setNotesAction] = reactExports.useState(null);
  const [notes, setNotes] = reactExports.useState("");
  const canSubmit = auth.hasAnyRole([...SUBMIT_ROLES]);
  const canApprove = auth.hasAnyRole([...APPROVER_ROLES]);
  const list = useQuery({
    queryKey: ["approval-requests", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase.from("approval_requests").select("*").eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
  const userIds = Array.from(new Set((list.data ?? []).flatMap((r) => [r.submitted_by, r.approved_by, r.rejected_by]).filter(Boolean)));
  const profiles = useQuery({
    queryKey: ["approval-profiles", userIds.join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id,email").in("id", userIds);
      const map = {};
      (data ?? []).forEach((p) => {
        map[p.id] = p.email;
      });
      return map;
    }
  });
  const who = (id) => id ? profiles.data?.[id] ?? "—" : "—";
  const open = (list.data ?? []).find((r) => OPEN.has(r.status));
  const createMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("approval_requests").insert({
        entity_type: entityType,
        entity_id: entityId,
        status: "submitted"
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("approval.submitted_ok"));
      qc.invalidateQueries({ queryKey: ["approval-requests", entityType, entityId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  const transitionMut = useMutation({
    mutationFn: async ({ id, status, withNotes }) => {
      const patch = { status };
      if (withNotes !== void 0) patch.approval_notes = withNotes;
      const { error } = await supabase.from("approval_requests").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setNotesAction(null);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["approval-requests", entityType, entityId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  function statusBadge(s) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: STATUS_VARIANT[s] ?? "outline", className: s === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : void 0, children: t(`approval.status.${s}`) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center justify-between gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: t("approval.current") }),
        open ? statusBadge(open.status) : list.data?.[0] ? statusBadge(list.data[0].status) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "—" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        !open && canSubmit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", disabled: createMut.isPending, onClick: () => createMut.mutate(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
          t("approval.submit")
        ] }),
        open && (open.status === "draft" || open.status === "returned") && canSubmit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => transitionMut.mutate({ id: open.id, status: "submitted" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
          open.status === "returned" ? t("approval.resubmit") : t("approval.submit")
        ] }),
        open && open.status === "submitted" && canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white", onClick: () => transitionMut.mutate({ id: open.id, status: "approved" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
            t("approval.approve")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", className: "gap-1.5", onClick: () => {
            setNotes("");
            setNotesAction("rejected");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            t("approval.reject")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => {
            setNotes("");
            setNotesAction("returned");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4" }),
            t("approval.return")
          ] })
        ] }),
        open && (open.status === "draft" || open.status === "returned") && canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "gap-1.5", onClick: () => transitionMut.mutate({ id: open.id, status: "archived" }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }),
          t("label.archive")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("approval.submitted_by") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("approval.submitted_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("approval.decided_by") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("approval.decided_at") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("approval.notes") })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }),
        !list.isLoading && (list.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 6, className: "py-8 text-center text-muted-foreground", children: t("approval.empty") }) }),
        list.data?.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: statusBadge(r.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: who(r.submitted_by) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: r.submitted_at ? formatDateTime(r.submitted_at, lang) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: who(r.approved_by ?? r.rejected_by) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: r.approved_at ? formatDateTime(r.approved_at, lang) : r.rejected_at ? formatDateTime(r.rejected_at, lang) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[220px] truncate text-xs", title: r.approval_notes ?? "", children: r.approval_notes ?? "—" })
        ] }, r.id))
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!notesAction, onOpenChange: (v) => !v && setNotesAction(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: notesAction === "rejected" ? t("approval.reject") : t("approval.return") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm text-muted-foreground", children: [
          t("approval.notes"),
          " *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 4, placeholder: t("approval.notes_placeholder") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNotesAction(null), children: t("label.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: notesAction === "rejected" ? "destructive" : "default",
            disabled: !notes.trim() || transitionMut.isPending,
            onClick: () => open && notesAction && transitionMut.mutate({ id: open.id, status: notesAction, withNotes: notes.trim() }),
            children: notesAction === "rejected" ? t("approval.reject") : t("approval.return")
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ApprovalWorkflow as A
};
