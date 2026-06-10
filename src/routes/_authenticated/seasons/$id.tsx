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
import { SeasonDialog } from "./-dialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/seasons/$id")({
  component: SeasonDetail,
});

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function SeasonDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: ["season", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("seasons").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("seasons.no_found")}</div>;
  const s = q.data;
  const name = lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar);

  return (
    <>
      <PageHeader
        title={name}
        subtitle={`${s.code} · ${t(`season_type.${s.season_type}`)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/seasons" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !s.deleted_at && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {s.deleted_at
              ? <Badge variant="secondary">{t("status.archived")}</Badge>
              : <StatusPill status={s.is_active ? "active" : "inactive"} />}
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
              <KV label={t("label.code")} value={s.code} mono />
              <KV label={t("label.name_en")} value={s.name_en} />
              <KV label={t("label.name_ar")} value={s.name_ar} />
              <KV label={t("seasons.type")} value={t(`season_type.${s.season_type}`)} />
              <KV label={t("label.start_date")} value={formatDate(s.start_date, lang)} />
              <KV label={t("label.end_date")} value={formatDate(s.end_date, lang)} />
              <KV label={t("label.created_at")} value={formatDateTime(s.created_at, lang)} />
              <KV label={t("label.updated_at")} value={formatDateTime(s.updated_at, lang)} />
              <KV label={t("label.status")} value={s.is_active ? t("status.active") : t("status.inactive")} />
              {s.notes && (
                <div className="md:col-span-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{t("label.notes")}</div>
                  <div className="whitespace-pre-wrap">{s.notes}</div>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="seasons" entityId={id} />
          </TabsContent>
        </Tabs>
      </div>

      <SeasonDialog open={editing} onOpenChange={setEditing} initial={s}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["season", id] }); qc.invalidateQueries({ queryKey: ["seasons"] }); }} />
    </>
  );
}
