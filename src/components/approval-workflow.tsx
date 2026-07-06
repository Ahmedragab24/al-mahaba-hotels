import { useState } from "react";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule, canApproveModule } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Check, X, Undo2, Archive } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { dbErrorMessage } from "@/store/queryBridge";
import { toast } from "sonner";
import type { AttachmentEntityType } from "@/components/entity-attachments";

const SUBMIT_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent"] as const;
const APPROVER_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager", "finance_manager"] as const;
const OPEN = new Set(["draft", "submitted", "returned"]);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  submitted: "default",
  approved: "default",
  rejected: "destructive",
  returned: "secondary",
  archived: "secondary",
};

export function ApprovalWorkflow({ entityType, entityId }: { entityType: AttachmentEntityType; entityId: string }) {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const [notesAction, setNotesAction] = useState<"rejected" | "returned" | null>(null);
  const [notes, setNotes] = useState("");

  // Any user who is authenticated can submit; approval requires manager level
  const canSubmit = auth.isAuthenticated;
  const canApprove = canApproveModule(auth, null);

  const list = useQuery({
    queryKey: ["approval-requests", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await db
        .from("approval_requests")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const userIds = Array.from(new Set((list.data ?? []).flatMap((r: any) => [r.submitted_by, r.approved_by, r.rejected_by]).filter(Boolean))) as string[];
  const profiles = useQuery({
    queryKey: ["approval-profiles", userIds.join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await db.from("profiles").select("id,email").in("id", userIds);
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: any) => { map[p.id] = p.email; });
      return map;
    },
  });
  const who = (id: string | null) => (id ? profiles.data?.[id] ?? "—" : "—");

  const open = (list.data ?? []).find((r: any) => OPEN.has(r.status));

  const createMut = useMutation({
    mutationFn: async () => {
      await apiClient.approvalRequests.create({
        entity_type: entityType,
        entity_id: entityId,
        status: "submitted",
      });
    },
    onSuccess: () => { toast.success(t("approval.submitted_ok")); qc.invalidateQueries({ queryKey: ["approval-requests", entityType, entityId] }); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const transitionMut = useMutation({
    mutationFn: async ({ id, status, withNotes }: { id: string; status: string; withNotes?: string }) => {
      const patch: any = { status };
      if (withNotes !== undefined) patch.approval_notes = withNotes;
      await apiClient.approvalRequests.update(id, patch);
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setNotesAction(null);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["approval-requests", entityType, entityId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  function statusBadge(s: string) {
    return <Badge variant={STATUS_VARIANT[s] ?? "outline"} className={s === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}>{t(`approval.status.${s}`)}</Badge>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{t("approval.current")}</span>
            {open ? statusBadge(open.status) : (list.data?.[0] ? statusBadge(list.data[0].status) : <Badge variant="outline">—</Badge>)}
          </div>
          <div className="flex flex-wrap gap-2">
            {!open && canSubmit && (
              <Button size="sm" className="gap-1.5" disabled={createMut.isPending} onClick={() => createMut.mutate()}>
                <Send className="h-4 w-4" />{t("approval.submit")}
              </Button>
            )}
            {open && (open.status === "draft" || open.status === "returned") && canSubmit && (
              <Button size="sm" className="gap-1.5" onClick={() => transitionMut.mutate({ id: open.id, status: "submitted" })}>
                <Send className="h-4 w-4" />{open.status === "returned" ? t("approval.resubmit") : t("approval.submit")}
              </Button>
            )}
            {open && open.status === "submitted" && canApprove && (
              <>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => transitionMut.mutate({ id: open.id, status: "approved" })}>
                  <Check className="h-4 w-4" />{t("approval.approve")}
                </Button>
                <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => { setNotes(""); setNotesAction("rejected"); }}>
                  <X className="h-4 w-4" />{t("approval.reject")}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setNotes(""); setNotesAction("returned"); }}>
                  <Undo2 className="h-4 w-4" />{t("approval.return")}
                </Button>
              </>
            )}
            {open && (open.status === "draft" || open.status === "returned") && canApprove && (
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => transitionMut.mutate({ id: open.id, status: "archived" })}>
                <Archive className="h-4 w-4" />{t("label.archive")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("label.status")}</TableHead>
                <TableHead>{t("approval.submitted_by")}</TableHead>
                <TableHead>{t("approval.submitted_at")}</TableHead>
                <TableHead>{t("approval.decided_by")}</TableHead>
                <TableHead>{t("approval.decided_at")}</TableHead>
                <TableHead>{t("approval.notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
              )}
              {!list.isLoading && (list.data?.length ?? 0) === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{t("approval.empty")}</TableCell></TableRow>
              )}
              {(Array.isArray(list.data) ? list.data : Array.isArray(list.data?.data) ? list.data.data : [])?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-xs">{who(r.submitted_by)}</TableCell>
                  <TableCell dir="ltr" className="text-xs whitespace-nowrap">{r.submitted_at ? formatDateTime(r.submitted_at, lang) : "—"}</TableCell>
                  <TableCell className="text-xs">{who(r.approved_by ?? r.rejected_by)}</TableCell>
                  <TableCell dir="ltr" className="text-xs whitespace-nowrap">
                    {r.approved_at ? formatDateTime(r.approved_at, lang) : r.rejected_at ? formatDateTime(r.rejected_at, lang) : "—"}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs" title={r.approval_notes ?? ""}>{r.approval_notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!notesAction} onOpenChange={(v) => !v && setNotesAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{notesAction === "rejected" ? t("approval.reject") : t("approval.return")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">{t("approval.notes")} *</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={t("approval.notes_placeholder")} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesAction(null)}>{t("label.cancel")}</Button>
            <Button
              variant={notesAction === "rejected" ? "destructive" : "default"}
              disabled={!notes.trim() || transitionMut.isPending}
              onClick={() => open && notesAction && transitionMut.mutate({ id: open.id, status: notesAction, withNotes: notes.trim() })}
            >
              {notesAction === "rejected" ? t("approval.reject") : t("approval.return")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
