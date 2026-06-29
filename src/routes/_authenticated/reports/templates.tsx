// Saved report templates & scheduling (Section 17).
import { useState } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";

function nextRun(frequency: string): string {
  const d = new Date();
  if (frequency === "daily") d.setDate(d.getDate() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  else d.setMonth(d.getMonth() + 1, 1);
  d.setHours(6, 0, 0, 0);
  return d.toISOString();
}

export default function TemplatesPage() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [schedFor, setSchedFor] = useState<string | null>(null);
  const [frequency, setFrequency] = useState("weekly");
  const [format, setFormat] = useState("pdf");
  const [recipients, setRecipients] = useState("");

  const templates = useQuery({
    queryKey: ["rpt-templates"],
    queryFn: async () => {
      const { data, error } = await db
        .from("report_templates")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const schedules = useQuery({
    queryKey: ["rpt-schedules"],
    queryFn: async () => {
      const { data, error } = await db
        .from("report_schedules")
        .select("*, template:report_templates(name_ar, name_en, report_key)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const name = (r: { name_ar: string; name_en: string }) => (lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar);

  const openTemplate = (tpl: { report_key: string; config: unknown }) => {
    const cfg = (tpl.config ?? {}) as { from?: string; to?: string; status?: string };
    const searchParams = new URLSearchParams();
    if (cfg.from) searchParams.set("from", cfg.from);
    if (cfg.to) searchParams.set("to", cfg.to);
    if (cfg.status) searchParams.set("status", cfg.status);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";

    if (tpl.report_key === "operational") navigate(`/reports/operational${qs}`);
    else if (tpl.report_key === "financial") navigate(`/reports/financial${qs}`);
    else if (tpl.report_key === "tax") navigate(`/reports/tax${qs}`);
    else navigate("/reports");
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await db.from("report_templates").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(t("rpt.deleted")); qc.invalidateQueries({ queryKey: ["rpt-templates"] }); }
  };

  const addSchedule = async () => {
    if (!schedFor) return;
    const { error } = await db.from("report_schedules").insert({
      template_id: schedFor,
      frequency,
      export_format: format,
      recipients: recipients.trim() || null,
      next_run_at: nextRun(frequency),
      created_by: auth.user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(t("rpt.schedule_saved"));
    setSchedFor(null);
    setRecipients("");
    qc.invalidateQueries({ queryKey: ["rpt-schedules"] });
  };

  const toggleSchedule = async (id: string, active: boolean) => {
    const { error } = await db.from("report_schedules").update({ active }).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["rpt-schedules"] });
  };

  const deleteSchedule = async (id: string) => {
    const { error } = await db.from("report_schedules").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(t("rpt.deleted")); qc.invalidateQueries({ queryKey: ["rpt-schedules"] }); }
  };

  return (
    <>
      <PageHeader title={t("rpt.templates_title")} subtitle={t("rpt.templates_sub")} />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("rpt.templates")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("rpt.report_type")}</TableHead>
                  <TableHead>{t("rpt.shared")}</TableHead>
                  <TableHead>{t("label.created_at")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.isLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                ) : (templates.data?.length ?? 0) === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{t("rpt.no_templates")}</TableCell></TableRow>
                ) : (
                  templates.data!.map((tpl: any) => (
                    <TableRow key={tpl.id}>
                      <TableCell className="font-medium">{name(tpl)}</TableCell>
                      <TableCell><Badge variant="outline">{t(`nav.rpt_${tpl.report_key}`, tpl.report_key)}</Badge></TableCell>
                      <TableCell>{tpl.is_shared ? <Badge>{t("rpt.shared")}</Badge> : <Badge variant="secondary">{t("rpt.private")}</Badge>}</TableCell>
                      <TableCell>{formatDateTime(tpl.created_at, lang)}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openTemplate(tpl)} title={t("rpt.open")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSchedFor(tpl.id)} title={t("rpt.add_schedule")}>
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteTemplate(tpl.id)} title={t("actions.delete")}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("rpt.schedules")}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("rpt.frequency")}</TableHead>
                  <TableHead>{t("rpt.format")}</TableHead>
                  <TableHead>{t("rpt.recipients")}</TableHead>
                  <TableHead>{t("rpt.next_run")}</TableHead>
                  <TableHead>{t("rpt.active")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.isLoading ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                ) : (schedules.data?.length ?? 0) === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">{t("rpt.no_schedules")}</TableCell></TableRow>
                ) : (
                  schedules.data!.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.template ? name(s.template as { name_ar: string; name_en: string }) : "—"}</TableCell>
                      <TableCell>{t(`rpt.freq_${s.frequency}`, s.frequency)}</TableCell>
                      <TableCell className="uppercase">{s.export_format}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{s.recipients ?? "—"}</TableCell>
                      <TableCell>{formatDateTime(s.next_run_at, lang)}</TableCell>
                      <TableCell><Switch checked={s.active} onCheckedChange={(v) => toggleSchedule(s.id, v)} /></TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="sm" onClick={() => deleteSchedule(s.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!schedFor} onOpenChange={(o) => !o && setSchedFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("rpt.add_schedule")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("rpt.frequency")}</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("rpt.freq_daily")}</SelectItem>
                  <SelectItem value="weekly">{t("rpt.freq_weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("rpt.freq_monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("rpt.format")}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("rpt.recipients")}</Label>
              <Input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder={t("rpt.recipients_ph")} maxLength={500} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedFor(null)}>{t("actions.cancel")}</Button>
            <Button onClick={addSchedule}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
