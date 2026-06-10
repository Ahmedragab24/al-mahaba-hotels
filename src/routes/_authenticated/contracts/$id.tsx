import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { EntityHistory } from "@/components/entity-history";
import { EntityAttachments } from "@/components/entity-attachments";
import { ApprovalWorkflow } from "@/components/approval-workflow";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ContractForm } from "./-form";
import { ArrowLeft, Pencil, Play, Pause, CheckCircle2, XCircle, Lock } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contracts/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ edit: s.edit ? 1 : undefined }) as { edit?: 1 },
  component: ContractDetail,
});

type CStatus = "draft" | "active" | "suspended" | "expired" | "terminated" | "closed";

const TRANSITIONS: Record<CStatus, { to: CStatus; labelKey: string; icon: any }[]> = {
  draft: [{ to: "active", labelKey: "contracts.activate", icon: Play }],
  active: [
    { to: "suspended", labelKey: "contracts.suspend", icon: Pause },
    { to: "expired", labelKey: "contracts.mark_expired", icon: XCircle },
    { to: "terminated", labelKey: "contracts.terminate", icon: XCircle },
    { to: "closed", labelKey: "contracts.close", icon: Lock },
  ],
  suspended: [
    { to: "active", labelKey: "contracts.resume", icon: CheckCircle2 },
    { to: "terminated", labelKey: "contracts.terminate", icon: XCircle },
  ],
  expired: [],
  terminated: [],
  closed: [],
};

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function ContractDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "operations_manager"]);
  const [editing, setEditing] = useState(!!search.edit);
  const [pendingStatus, setPendingStatus] = useState<CStatus | null>(null);

  const q = useQuery({
    queryKey: ["contract", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("supplier_contracts")
        .select("*, supplier:suppliers(id,name_en,name_ar), hotel:hotels(id,name_en,name_ar)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const rates = useQuery({
    queryKey: ["contract-rates", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("rates")
        .select("id,code,valid_from,valid_to,currency,selling_price,status,deleted_at,room_type:hotel_room_types(name_en,name_ar)")
        .eq("contract_id", id).order("valid_from", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMut = useMutation({
    mutationFn: async (to: CStatus) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("supplier_contracts")
        .update({ status: to, updated_by: u.user?.id ?? null } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["contract", id] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      setPendingStatus(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e, t)); setPendingStatus(null); },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("contracts.no_found")}</div>;
  const c = q.data;
  const transitions = c.deleted_at ? [] : (TRANSITIONS[c.status as CStatus] ?? []);

  return (
    <>
      <PageHeader
        title={c.title || c.contract_number}
        subtitle={`${c.contract_number} · ${t(`ctrtype.${c.contract_type}`)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/contracts" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !editing && !c.deleted_at && c.status === "draft" && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {canApprove && transitions.map((tr) => (
              <Button key={tr.to} size="sm" variant={tr.to === "active" ? "default" : "outline"} onClick={() => setPendingStatus(tr.to)}>
                <tr.icon className="h-4 w-4" />{t(tr.labelKey)}
              </Button>
            ))}
            {c.deleted_at ? <Badge variant="secondary">{t("status.archived")}</Badge> : <StatusPill status={c.status} />}
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("contracts.tab.profile")}</TabsTrigger>
            <TabsTrigger value="rates">{t("contracts.tab.rates")} ({rates.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="approval">{t("tab.approval")}</TabsTrigger>
            <TabsTrigger value="history">{t("contracts.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <ContractForm initial={c} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["contract", id] }); }} />
            ) : (
              <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
                <KV label={t("label.contract_number")} value={c.contract_number} mono />
                <KV label={t("contracts.name")} value={c.title} />
                <KV label={t("contracts.type")} value={t(`ctrtype.${c.contract_type}`)} />
                <KV label={t("contracts.supplier")} value={c.supplier ? (lang === "ar" ? (c.supplier.name_ar || c.supplier.name_en) : (c.supplier.name_en || c.supplier.name_ar)) : ""} />
                <KV label={t("contracts.hotel")} value={c.hotel ? (lang === "ar" ? (c.hotel.name_ar || c.hotel.name_en) : (c.hotel.name_en || c.hotel.name_ar)) : ""} />
                <KV label={t("label.status")} value={t(`status.${c.status}`)} />
                <KV label={t("label.start_date")} value={formatDate(c.start_date, lang)} />
                <KV label={t("label.end_date")} value={formatDate(c.end_date, lang)} />
                <KV label={t("label.currency")} value={c.currency} />
                <KV label={t("contracts.commission_type")} value={c.commission_type === "fixed" ? t("calc.fixed") : t("calc.percentage")} />
                <KV label={c.commission_type === "fixed" ? t("label.tax_value") : t("label.commission_pct")} value={c.commission_pct} />
                <KV label={t("label.credit_days")} value={c.credit_days} />
                <KV label={t("label.payment_terms")} value={c.payment_terms} />
                <KV label={t("label.created_at")} value={formatDateTime(c.created_at, lang)} />
                <KV label={t("label.updated_at")} value={formatDateTime(c.updated_at, lang)} />
                {c.cancellation_terms && (
                  <div className="md:col-span-3 space-y-1">
                    <div className="text-xs text-muted-foreground">{t("label.penalty_type")}</div>
                    <div className="whitespace-pre-wrap">{c.cancellation_terms}</div>
                  </div>
                )}
                {c.notes && (
                  <div className="md:col-span-3 space-y-1">
                    <div className="text-xs text-muted-foreground">{t("label.notes")}</div>
                    <div className="whitespace-pre-wrap">{c.notes}</div>
                  </div>
                )}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="rates">
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("nav.room_types")}</TableHead>
                  <TableHead>{t("filter.from")}</TableHead>
                  <TableHead>{t("filter.to")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(rates.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("contracts.no_rates")}</TableCell></TableRow>}
                  {rates.data?.map((x: any) => (
                    <TableRow key={x.id} className={x.deleted_at ? "opacity-60" : ""}>
                      <TableCell className="font-mono text-xs">
                        <Link to="/rates/$id" params={{ id: x.id }} className="hover:underline">{x.code}</Link>
                      </TableCell>
                      <TableCell className="text-sm">{x.room_type ? (lang === "ar" ? (x.room_type.name_ar || x.room_type.name_en) : (x.room_type.name_en || x.room_type.name_ar)) : "—"}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(x.valid_from, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(x.valid_to, lang)}</TableCell>
                      <TableCell className="text-xs">{x.currency}</TableCell>
                      <TableCell><StatusPill status={x.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="attachments">
            <EntityAttachments entityType="contract" entityId={id} />
          </TabsContent>

          <TabsContent value="approval">
            <ApprovalWorkflow entityType="contract" entityId={id} />
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="supplier_contracts" entityId={id} />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={!!pendingStatus}
        onOpenChange={(v) => !v && setPendingStatus(null)}
        title={t("contracts.confirm_status")}
        description={pendingStatus ? `${t(`status.${c.status}`)} → ${t(`status.${pendingStatus}`)}` : ""}
        destructive={pendingStatus === "terminated"}
        onConfirm={() => pendingStatus && statusMut.mutate(pendingStatus)}
      />
    </>
  );
}
