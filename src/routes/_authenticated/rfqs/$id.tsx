import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Send, Check, X, Ban, Clock, RotateCcw, CheckCheck } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { RfqForm } from "./-form";
import { RfqItemsTab } from "./-items";
import { RfqSuppliersTab, RfqResponsesTab, RfqComparisonTab, CreateQuotationButton } from "./-suppliers";
import { EntityAttachments } from "@/components/entity-attachments";
import { ApprovalWorkflow } from "@/components/approval-workflow";
import { EntityHistory } from "@/components/entity-history";
import { RStatusBadge } from "./index";

export const Route = createFileRoute("/_authenticated/rfqs/$id")({
  component: RfqDetail,
});

function RfqDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "operations_manager"]);
  const [editing, setEditing] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["rfq", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });


  const history = useQuery({
    queryKey: ["rfq-status-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_status_history")
        .select("*")
        .eq("rfq_id", id)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMut = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("rfqs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      qc.invalidateQueries({ queryKey: ["rfq", id] });
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", id] });
      qc.invalidateQueries({ queryKey: ["rfq-status-history", id] });
      qc.invalidateQueries({ queryKey: ["rfq-metrics"] });
      qc.invalidateQueries({ queryKey: ["approval-requests", "rfq", id] });
    },
    onError: (e: any) => { setConfirmStatus(null); toast.error(dbErrorMessage(e, t)); },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("rfq.no_found")}</div>;

  const r = q.data;
  const editable = canWrite && r.status === "draft" && !r.deleted_at;


  const actions: { key: string; label: string; status: string; icon: React.ComponentType<{ className?: string }>; variant?: "destructive" | "outline"; show: boolean }[] = [
    { key: "send", label: t("rfq.send"), status: "sent", icon: Send, show: canWrite && r.status === "draft" },
    { key: "complete", label: t("rfq.complete"), status: "completed", icon: CheckCheck, show: canWrite && ["sent", "partial"].includes(r.status) },
    { key: "approve", label: t("actions.approve"), status: "approved", icon: Check, show: canApprove && r.status === "completed" },
    { key: "reject", label: t("actions.reject"), status: "rejected", icon: X, variant: "destructive", show: canApprove && r.status === "completed" },
    { key: "expire", label: t("rfq.expire_action"), status: "expired", icon: Clock, variant: "outline", show: canWrite && ["sent", "partial", "completed"].includes(r.status) },
    { key: "reopen", label: t("rfq.reopen"), status: "draft", icon: RotateCcw, variant: "outline", show: canWrite && r.status === "rejected" },
    { key: "cancel", label: t("rfq.cancel"), status: "cancelled", icon: Ban, variant: "destructive", show: canWrite && ["draft", "sent", "partial", "rejected"].includes(r.status) },
  ];

  return (
    <>
      <PageHeader
        title={`${r.rfq_no}${r.destination ? " — " + r.destination : ""}`}
        subtitle={`${formatDate(r.travel_start)} → ${formatDate(r.travel_end)} · ${r.currency}`}

        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/rfqs" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <RStatusBadge status={r.status} t={t} />
            {editable && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />{t("actions.edit")}
              </Button>
            )}
            <CreateQuotationButton rfq={r} />
            {actions.filter((a) => a.show).map((a) => (
              <Button key={a.key} size="sm" variant={(a.variant as any) ?? "default"} onClick={() => setConfirmStatus(a.status)}>
                <a.icon className="h-4 w-4" />{a.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="general">{t("rfq.tab.general")}</TabsTrigger>
            <TabsTrigger value="items">{t("rfq.tab.items")}</TabsTrigger>
            <TabsTrigger value="suppliers">{t("rfq.tab.suppliers")}</TabsTrigger>
            <TabsTrigger value="responses">{t("rfq.tab.responses")}</TabsTrigger>
            <TabsTrigger value="comparison">{t("rfq.tab.comparison")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="approval">{t("tab.approval")}</TabsTrigger>
            <TabsTrigger value="history">{t("rfq.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {editing ? (
              <RfqForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["rfq", id] }); }} />
            ) : (
              <Card>
                <CardContent className="grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <KV k={t("rfq.number")} v={<span dir="ltr">{r.rfq_no}</span>} />
                  <KV k={t("filter.status")} v={<RStatusBadge status={r.status} t={t} />} />

                  <KV k={t("rfq.destination")} v={r.destination ?? "—"} />
                  <KV k={t("rfq.travel_start")} v={formatDate(r.travel_start)} />
                  <KV k={t("rfq.travel_end")} v={formatDate(r.travel_end)} />
                  <KV k={t("label.currency")} v={r.currency} />
                  <KV k={t("label.notes")} v={r.notes ?? "—"} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items"><RfqItemsTab rfqId={id} editable={editable} /></TabsContent>
          <TabsContent value="suppliers"><RfqSuppliersTab rfqId={id} editable={editable} /></TabsContent>
          <TabsContent value="responses"><RfqResponsesTab rfqId={id} rfqStatus={r.status} currency={r.currency} /></TabsContent>
          <TabsContent value="comparison"><RfqComparisonTab rfqId={id} /></TabsContent>
          <TabsContent value="attachments"><EntityAttachments entityType="rfq" entityId={id} /></TabsContent>
          <TabsContent value="approval"><ApprovalWorkflow entityType="rfq" entityId={id} /></TabsContent>
          <TabsContent value="history">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{t("rfq.status_history")}</CardTitle></CardHeader>
                <CardContent>
                  {(history.data?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("label.no_results")}</p>
                  ) : (
                    <ul className="divide-y">
                      {history.data!.map((h: any) => (
                        <li key={h.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span>
                            {h.from_status ? <>{t(`rstatus.${h.from_status}`)} ← </> : null}
                            <span className="font-medium">{t(`rstatus.${h.to_status}`)}</span>
                          </span>
                          <span dir="ltr" className="text-xs text-muted-foreground">{formatDateTime(h.changed_at, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <EntityHistory entityType="rfqs" entityId={id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
        title={t("rfq.confirm_status")}
        description={confirmStatus ? t(`rstatus.${confirmStatus}`) : ""}
        onConfirm={() => confirmStatus && statusMut.mutate(confirmStatus)}
      />
    </>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v ?? "—"}</span>
    </div>
  );
}
