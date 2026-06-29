// Shared report toolbar — export buttons (CSV / Excel / PDF) + save-as-template.
import { useState } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, FileSpreadsheet, FileDown, Save } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { exportCSV, exportExcel, exportPDF, type ReportColumn, type ReportRow } from "@/lib/report-export";

export function ReportToolbar({
  reportKey,
  fileName,
  title,
  subtitle,
  columns,
  rows,
  config,
}: {
  reportKey: "operational" | "financial" | "tax";
  fileName: string;
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  config?: Record<string, unknown>;
}) {
  const { t, dir, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const [open, setOpen] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);

  const stamp = new Date().toISOString().slice(0, 10);

  const saveTemplate = async () => {
    if (!nameAr.trim() || !nameEn.trim()) return;
    setSaving(true);
    const { error } = await db.from("report_templates").insert({
      name_ar: nameAr.trim(),
      name_en: nameEn.trim(),
      report_key: reportKey,
      config: (config ?? {}) as never,
      is_shared: shared,
      created_by: auth.user?.id,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("rpt.template_saved"));
    setOpen(false);
    setNameAr("");
    setNameEn("");
    setShared(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => exportCSV(`${fileName}-${stamp}`, columns, rows)}>
        <FileDown className="h-4 w-4" /> {t("rpt.export_csv")}
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportExcel(`${fileName}-${stamp}`, columns, rows, title)}>
        <FileSpreadsheet className="h-4 w-4" /> {t("rpt.export_excel")}
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportPDF({ title, subtitle, columns, rows, dir, footer: `${t("rpt.generated_at")}: ${new Date().toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}` })}>
        <FileText className="h-4 w-4" /> {t("rpt.export_pdf")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <Save className="h-4 w-4" /> {t("rpt.save_template")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rpt.save_template")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("label.name_ar")}</Label>
              <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label>{t("label.name_en")}</Label>
              <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={120} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("rpt.shared")}</Label>
              <Switch checked={shared} onCheckedChange={setShared} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={saveTemplate} disabled={saving || !nameAr.trim() || !nameEn.trim()}>
              {saving ? t("actions.saving") : t("actions.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
