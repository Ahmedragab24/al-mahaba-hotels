import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { RoomTypeDialog } from "./-dialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { formatDateTime, formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/room-types/$id")({
  component: RoomTypeDetail,
});

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

function RoomTypeDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: ["room-type", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("hotel_room_types")
        .select("*, hotel:hotels(id,name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const rates = useQuery({
    queryKey: ["room-type-rates", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("rates")
        .select("id,code,valid_from,valid_to,currency,cost_per_night,selling_price,status,deleted_at")
        .eq("room_type_id", id).order("valid_from", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("room_types.no_found")}</div>;
  const r = q.data;
  const name = lang === "ar" ? (r.name_ar || r.name_en) : (r.name_en || r.name_ar);

  return (
    <>
      <PageHeader
        title={name}
        subtitle={`${r.code} · ${r.hotel ? (lang === "ar" ? (r.hotel.name_ar || r.hotel.name_en) : (r.hotel.name_en || r.hotel.name_ar)) : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/room-types" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !r.deleted_at && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            {r.deleted_at
              ? <Badge variant="secondary">{t("status.archived")}</Badge>
              : <StatusPill status={r.is_active ? "active" : "inactive"} />}
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("room_types.tab.profile")}</TabsTrigger>
            <TabsTrigger value="rates">{t("contracts.tab.rates")} ({rates.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="history">{t("room_types.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
              <KV label={t("label.code")} value={r.code} mono />
              <KV label={t("label.name_en")} value={r.name_en} />
              <KV label={t("label.name_ar")} value={r.name_ar} />
              <KV label={t("room_types.hotel")} value={r.hotel ? (lang === "ar" ? r.hotel.name_ar : r.hotel.name_en) : ""} />
              <KV label={t("label.max_adults")} value={r.max_adults} />
              <KV label={t("label.max_children")} value={r.max_children} />
              <KV label={t("label.max_occupancy")} value={r.max_occupancy} />
              <KV label={t("label.bed_type")} value={r.bed_type} />
              <KV label={t("label.size_sqm")} value={r.size_sqm} />
              <KV label={t("room_types.smoking")} value={r.smoking_allowed ? t("status.active") : t("status.inactive")} />
              <KV label={t("label.created_at")} value={formatDateTime(r.created_at, lang)} />
              <KV label={t("label.updated_at")} value={formatDateTime(r.updated_at, lang)} />
              {(r.description_en || r.description_ar) && (
                <div className="md:col-span-3 space-y-1">
                  <div className="text-xs text-muted-foreground">{t("label.description")}</div>
                  <div className="whitespace-pre-wrap">{lang === "ar" ? (r.description_ar || r.description_en) : (r.description_en || r.description_ar)}</div>
                </div>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("filter.from")}</TableHead>
                  <TableHead>{t("filter.to")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.tax_value")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(rates.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("contracts.no_rates")}</TableCell></TableRow>}
                  {rates.data?.map((x: any) => (
                    <TableRow key={x.id} className={x.deleted_at ? "opacity-60" : ""}>
                      <TableCell className="font-mono text-xs">
                        <Link to="/rates/$id" params={{ id: x.id }} className="hover:underline">{x.code}</Link>
                      </TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(x.valid_from, lang)}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatDate(x.valid_to, lang)}</TableCell>
                      <TableCell className="text-xs">{x.currency}</TableCell>
                      <TableCell dir="ltr" className="text-xs">{formatMoney(x.selling_price ?? x.cost_per_night, x.currency, lang)}</TableCell>
                      <TableCell><StatusPill status={x.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="hotel_room_types" entityId={id} />
          </TabsContent>
        </Tabs>
      </div>

      <RoomTypeDialog open={editing} onOpenChange={setEditing} initial={r}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["room-type", id] }); qc.invalidateQueries({ queryKey: ["room-types"] }); }} />
    </>
  );
}
