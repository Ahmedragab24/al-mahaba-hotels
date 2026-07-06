import { useRef, useState } from "react";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canAccessModule } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Upload, Eye, Download, Archive, ArchiveRestore, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { dbErrorMessage } from "@/store/queryBridge";
import { toast } from "sonner";

export type AttachmentEntityType =
  | "hotel" | "supplier" | "customer" | "contract" | "rate"
  | "season" | "tax" | "quotation" | "reservation" | "invoice"
  | "rfq" | "rfq_response" | "booking";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPT = ".pdf,.docx,.xlsx,.jpg,.jpeg,.png";
const EXT_MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};


function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
  if (mime.includes("spreadsheet")) return <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

export function EntityAttachments({ entityType, entityId }: { entityType: AttachmentEntityType; entityId: string }) {
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const canUpload = canAccessModule(auth, "quotations");
  const canManage = canAccessModule(auth, "quotations");

  const list = useQuery({
    queryKey: ["attachments", entityType, entityId, showArchived],
    queryFn: async () => {
      let q = db
        .from("attachments")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("uploaded_at", { ascending: false });
      if (!showArchived) q = q.is("deleted_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleUpload(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mime = EXT_MIME[ext];
    if (!mime) { toast.error(t("attach.err_type")); return; }
    if (file.size > MAX_SIZE) { toast.error(t("attach.err_size")); return; }
    setUploading(true);
    try {
      const storageName = `${crypto.randomUUID()}.${ext}`;
      const path = `${entityType}/${entityId}/${storageName}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);
      await apiClient.attachments.upload(formData);
      const { error: insErr } = await apiClient.attachments.create({
        entity_type: entityType,
        entity_id: entityId,
        file_name: storageName,
        original_name: file.name,
        mime_type: mime,
        file_size: file.size,
        storage_path: path,
        uploaded_by: auth.user?.id ?? null,
      });
      if (insErr) {
        await apiClient.attachments.delete(path);
        throw insErr;
      }
      toast.success(t("attach.uploaded"));
      qc.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });
    } catch (e) {
      toast.error(dbErrorMessage(e, t));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function signedUrl(path: string, download?: string) {
    const { data, error } = await db.storage
      .from("attachments")
      .createSignedUrl(path, 300, download ? { download } : undefined);
    if (error || !data?.signedUrl) { toast.error(t("toast.error")); return null; }
    return data.signedUrl;
  }

  async function handlePreview(row: any) {
    const url = await signedUrl(row.storage_path);
    if (url) window.open(url, "_blank", "noopener");
  }

  async function handleDownload(row: any) {
    const url = await signedUrl(row.storage_path, row.original_name);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = row.original_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  const archiveMut = useMutation({
    mutationFn: async ({ id, restore }: { id: string; restore: boolean }) => {
      const { error } = await db
        .from("attachments")
        .update({ deleted_at: restore ? null : new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setArchiveId(null);
      qc.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={showArchived} onCheckedChange={(v) => setShowArchived(!!v)} />
              {t("filter.show_archived")}
            </label>
          </div>
          {canUpload && (
            <div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUpload(f); }}
              />
              <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="gap-1.5">
                <Upload className="h-4 w-4" />
                {uploading ? t("attach.uploading") : t("attach.upload")}
              </Button>
            </div>
          )}
        </div>
        <p className="px-4 pt-3 text-xs text-muted-foreground">{t("attach.hint")}</p>
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              <TableHead>{t("attach.file")}</TableHead>
              <TableHead>{t("attach.size")}</TableHead>
              <TableHead>{t("attach.uploaded_at")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
              <TableHead className="text-end">{t("label.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
            )}
            {!list.isLoading && (list.data?.length ?? 0) === 0 && (
              <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{t("attach.empty")}</TableCell></TableRow>
            )}
            {(Array.isArray(list.data) ? list.data : Array.isArray(list.data?.data) ? list.data.data : [])?.map((row: any) => (
              <TableRow key={row.id} className={row.deleted_at ? "opacity-60" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon mime={row.mime_type} />
                    <span className="text-sm break-all">{row.original_name}</span>
                  </div>
                </TableCell>
                <TableCell dir="ltr" className="text-xs whitespace-nowrap">{formatBytes(row.file_size)}</TableCell>
                <TableCell dir="ltr" className="text-xs whitespace-nowrap">{formatDateTime(row.uploaded_at, lang)}</TableCell>
                <TableCell>
                  {row.deleted_at
                    ? <Badge variant="secondary">{t("status.archived")}</Badge>
                    : <Badge variant="outline">{t("status.active")}</Badge>}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title={t("attach.preview")} onClick={() => void handlePreview(row)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={t("attach.download")} onClick={() => void handleDownload(row)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {canManage && !row.deleted_at && (
                      <Button variant="ghost" size="icon" title={t("label.archive")} onClick={() => setArchiveId(row.id)}>
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    {canManage && row.deleted_at && (
                      <Button variant="ghost" size="icon" title={t("label.restore")} onClick={() => archiveMut.mutate({ id: row.id, restore: true })}>
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ConfirmDialog
        open={!!archiveId}
        onOpenChange={(v) => !v && setArchiveId(null)}
        title={t("attach.confirm_archive")}
        onConfirm={() => archiveId && archiveMut.mutate({ id: archiveId, restore: false })}
      />
    </Card>
  );
}
