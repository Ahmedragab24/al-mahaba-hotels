// Individuals tab — Excel bulk import of individual customers under a company entity.
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Upload, Download, CheckCircle2, XCircle, Users } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

type ParsedRow = {
  name_ar: string;
  name_en: string;
  email: string | null;
  mobile: string | null;
  phone: string | null;
  national_id: string | null;
  valid: boolean;
  reason?: string;
};

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function norm(s: unknown): string {
  return String(s ?? "").trim();
}

function headerKey(h: string): string | null {
  const x = h.toLowerCase().replace(/[\s_-]+/g, "");
  if (/(الاسمبالعربي|الاسمعربي|اسمعربي|namear|arabicname|الاسمالكامل|الاسم|^name$|fullname)/.test(x)) return "name_ar";
  if (/(الاسمبالانجليزي|اسمانجليزي|nameen|englishname)/.test(x)) return "name_en";
  if (/(البريد|الايميل|الإيميل|email|mail)/.test(x)) return "email";
  if (/(الجوال|جوال|موبايل|mobile|cell)/.test(x)) return "mobile";
  if (/(الهاتف|هاتف|phone|tel)/.test(x)) return "phone";
  if (/(الهوية|هوية|رقمالهوية|nationalid|iqama|اقامة|الإقامة|id(number)?$|passport|جوازالسفر|جواز)/.test(x)) return "national_id";
  return null;
}

export function MembersTab({ customerId, canWrite }: { customerId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const members = useQuery({
    queryKey: ["customer-members", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, code, name_ar, name_en, email, mobile, phone, status, created_at")
        .eq("parent_customer_id", customerId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const parseFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      if (raw.length === 0) {
        toast.error(t("members.empty_file"));
        return;
      }
      const headerMap: Record<string, string> = {};
      for (const h of Object.keys(raw[0])) {
        const k = headerKey(h);
        if (k && !Object.values(headerMap).includes(k)) headerMap[h] = k;
      }
      if (!Object.values(headerMap).includes("name_ar") && !Object.values(headerMap).includes("name_en")) {
        toast.error(t("members.no_name_column"));
        return;
      }
      const parsed: ParsedRow[] = raw.map((r) => {
        const o: Record<string, string> = {};
        for (const [h, k] of Object.entries(headerMap)) o[k] = norm(r[h]);
        const nameAr = o.name_ar || o.name_en || "";
        const nameEn = o.name_en || o.name_ar || "";
        const email = o.email && EMAIL_RE.test(o.email) ? o.email.toLowerCase() : null;
        const row: ParsedRow = {
          name_ar: nameAr.slice(0, 200),
          name_en: nameEn.slice(0, 200),
          email,
          mobile: o.mobile ? o.mobile.slice(0, 40) : null,
          phone: o.phone ? o.phone.slice(0, 40) : null,
          national_id: o.national_id ? o.national_id.slice(0, 50) : null,
          valid: !!nameAr,
        };
        if (!row.valid) row.reason = t("members.missing_name");
        return row;
      }).filter((r) => r.name_ar || r.email || r.mobile);
      if (parsed.length === 0) {
        toast.error(t("members.empty_file"));
        return;
      }
      setRows(parsed);
      setFileName(file.name);
    } catch {
      toast.error(t("members.parse_error"));
    }
  };

  const importMut = useMutation({
    mutationFn: async (valid: ParsedRow[]) => {
      let inserted = 0;
      for (let i = 0; i < valid.length; i += 100) {
        const chunk = valid.slice(i, i + 100).map((r) => ({
          customer_type: "individual",
          parent_customer_id: customerId,
          name_ar: r.name_ar,
          name_en: r.name_en,
          email: r.email,
          mobile: r.mobile,
          phone: r.phone,
          notes: r.national_id ? `ID: ${r.national_id}` : null,
          status: "active" as const,
          preferred_language: "ar" as const,
        }));
        // code is auto-generated by a database trigger on insert
        const { error } = await supabase.from("customers").insert(chunk as never);
        if (error) throw error;
        inserted += chunk.length;
      }
      return inserted;
    },
    onSuccess: (n) => {
      toast.success(`${t("members.imported")}: ${n}`);
      setRows(null);
      setFileName("");
      qc.invalidateQueries({ queryKey: ["customer-members", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast.error(e.message ?? t("toast.error")),
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["الاسم بالعربي", "الاسم بالانجليزي", "البريد الإلكتروني", "الجوال", "الهاتف", "رقم الهوية"],
      ["محمد أحمد", "Mohammed Ahmed", "m.ahmed@example.com", "0501234567", "", "1098765432"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Individuals");
    XLSX.writeFile(wb, "individuals-template.xlsx");
  };

  const validRows = rows?.filter((r) => r.valid) ?? [];
  const invalidRows = rows?.filter((r) => !r.valid) ?? [];

  return (
    <div className="space-y-4">
      {canWrite && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" /> {t("members.import_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("members.import_hint")}</p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) parseFile(f);
                  e.target.value = "";
                }}
              />
              <Button size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /> {t("members.choose_file")}
              </Button>
              <Button size="sm" variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> {t("members.download_template")}
              </Button>
            </div>

            {rows && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{fileName}</span>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {validRows.length} {t("members.valid_rows")}
                  </Badge>
                  {invalidRows.length > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3.5 w-3.5" /> {invalidRows.length} {t("members.invalid_rows")}
                    </Badge>
                  )}
                </div>
                <div className="max-h-64 overflow-auto rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("label.name_ar")}</TableHead>
                        <TableHead>{t("label.name_en")}</TableHead>
                        <TableHead>{t("label.email")}</TableHead>
                        <TableHead>{t("label.mobile")}</TableHead>
                        <TableHead>{t("label.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 50).map((r, i) => (
                        <TableRow key={i} className={r.valid ? "" : "opacity-50"}>
                          <TableCell>{r.name_ar || "—"}</TableCell>
                          <TableCell dir="ltr">{r.name_en || "—"}</TableCell>
                          <TableCell dir="ltr">{r.email || "—"}</TableCell>
                          <TableCell dir="ltr">{r.mobile || "—"}</TableCell>
                          <TableCell>
                            {r.valid
                              ? <Badge variant="secondary">{t("members.ready")}</Badge>
                              : <Badge variant="destructive">{r.reason}</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {rows.length > 50 && (
                    <p className="p-2 text-center text-xs text-muted-foreground">+{rows.length - 50} {t("members.more_rows")}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={validRows.length === 0 || importMut.isPending}
                    onClick={() => importMut.mutate(validRows)}
                  >
                    {importMut.isPending ? t("actions.saving") : `${t("members.import_now")} (${validRows.length})`}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setRows(null); setFileName(""); }}>
                    {t("actions.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" /> {t("members.list_title")} ({members.data?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("label.loading")}</p>
          ) : (members.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{t("members.none")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("label.email")}</TableHead>
                  <TableHead>{t("label.mobile")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead>{t("label.created_at")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.data!.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/customers/$id" params={{ id: m.id }} className="text-primary hover:underline">{m.code}</Link>
                    </TableCell>
                    <TableCell>{lang === "ar" ? (m.name_ar || m.name_en) : (m.name_en || m.name_ar)}</TableCell>
                    <TableCell dir="ltr">{m.email || "—"}</TableCell>
                    <TableCell dir="ltr">{m.mobile || m.phone || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{t(`status.${m.status}`)}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(m.created_at, lang)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}