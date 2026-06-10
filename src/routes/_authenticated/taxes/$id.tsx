import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { EntityHistory } from "@/components/entity-history";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/status-pill";
import { TaxDialog } from "./-dialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/taxes/$id")({
  component: TaxDetail,
});

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function TaxDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent"]);
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: ["tax", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_taxes")
        .select("*, hotel:hotels(id,name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("taxes.no_found")}</div>;
  const x = q.data;
  const name = lang === "ar" ? (x.name_ar || x.name_en) : (x.name_en || x.name_ar);

  return (
    <>
      <PageHeader
        title={name}
        subtitle={`${x.code} · ${t(`taxtype.${x.tax_type}`)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/taxes" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !x.deleted_at && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {x.deleted_at
              ? <Badge variant="secondary">{t("status.archived")}</Badge>
              : <StatusPill status={x.is_active ? "active" : "inactive"} />}
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("room_types.tab.profile")}</TabsTrigger>
            <TabsTrigger value="history">{t("room_types.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
              <KV label={t("label.code")} value={x.code} mono />
              <KV label={t("label.name_en")} value={x.name_en} />
              <KV label={t("label.name_ar")} value={x.name_ar} />
              <KV label={t("filter.hotel")} value={x.hotel ? (lang === "ar" ? (x.hotel.name_ar || x.hotel.name_en) : (x.hotel.name_en || x.hotel.name_ar)) : ""} />
              <KV label={t("label.tax_type")} value={t(`taxtype.${x.tax_type}`)} />
              <KV label={t("taxes.calc_method")} value={t(`calc.${x.calc_method}`)} />
              <KV label={t("label.tax_value")} value={x.calc_method === "percentage" ? `${x.value}%` : `${x.value} ${x.currency ?? ""}`} />
              <KV label={t("taxes.apply_scope")} value={x.apply_scope ? t(`scope.${x.apply_scope}`) : ""} />
              <KV label={t("label.inclusive")} value={x.is_inclusive ? t("status.active") : t("status.inactive")} />
              <KV label={t("taxes.effective_date")} value={x.effective_date ? formatDate(x.effective_date, lang) : ""} />
              <KV label={t("taxes.expiry_date")} value={x.expiry_date ? formatDate(x.expiry_date, lang) : ""} />
              <KV label={t("label.created_at")} value={formatDateTime(x.created_at, lang)} />
              {x.notes && (
                <div className="md:col-span-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{t("label.notes")}</div>
                  <div className="whitespace-pre-wrap">{x.notes}</div>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="hotel_taxes" entityId={id} />
          </TabsContent>
        </Tabs>
      </div>

      <TaxDialog open={editing} onOpenChange={setEditing} initial={x}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["tax", id] }); qc.invalidateQueries({ queryKey: ["taxes"] }); }} />
    </>
  );
}
