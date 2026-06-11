import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth, B as Badge } from "./router-v2O1Lq9M.mjs";
import { C as Card, a as CardContent } from "./card-D3oUK5Qe.mjs";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BQwhu8us.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { C as Checkbox } from "./checkbox-Co4oTAVV.mjs";
import { C as ConfirmDialog } from "./confirm-dialog-BkZsgNXk.mjs";
import { f as formatDateTime } from "./format-CMnhdgFc.mjs";
import { d as dbErrorMessage } from "./db-errors-CH7zwDRs.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { aA as Upload, a0 as Eye, aB as Download, a2 as Archive, aC as ArchiveRestore, aD as Image, F as FileSpreadsheet, w as FileText } from "../_libs/lucide-react.mjs";
const MAX_SIZE = 25 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.xlsx,.jpg,.jpeg,.png";
const EXT_MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png"
};
const UPLOAD_ROLES = ["super_admin", "admin", "sales_manager", "sales_agent", "operations_manager", "operations_agent", "finance_manager", "finance_agent"];
const MANAGE_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager", "finance_manager"];
function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function FileIcon({ mime }) {
  if (mime.startsWith("image/")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4 text-muted-foreground" });
  if (mime.includes("spreadsheet")) return /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4 text-muted-foreground" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" });
}
function EntityAttachments({ entityType, entityId }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const inputRef = reactExports.useRef(null);
  const [showArchived, setShowArchived] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [archiveId, setArchiveId] = reactExports.useState(null);
  const canUpload = auth.hasAnyRole([...UPLOAD_ROLES]);
  const canManage = auth.hasAnyRole([...MANAGE_ROLES]);
  const list = useQuery({
    queryKey: ["attachments", entityType, entityId, showArchived],
    queryFn: async () => {
      let q = supabase.from("attachments").select("*").eq("entity_type", entityType).eq("entity_id", entityId).order("uploaded_at", { ascending: false });
      if (!showArchived) q = q.is("deleted_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    }
  });
  async function handleUpload(file) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mime = EXT_MIME[ext];
    if (!mime) {
      toast.error(t("attach.err_type"));
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(t("attach.err_size"));
      return;
    }
    setUploading(true);
    try {
      const storageName = `${crypto.randomUUID()}.${ext}`;
      const path = `${entityType}/${entityId}/${storageName}`;
      const { error: upErr } = await supabase.storage.from("attachments").upload(path, file, { contentType: mime });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("attachments").insert({
        entity_type: entityType,
        entity_id: entityId,
        file_name: storageName,
        original_name: file.name,
        mime_type: mime,
        file_size: file.size,
        storage_path: path,
        uploaded_by: auth.user?.id ?? null
      });
      if (insErr) {
        await supabase.storage.from("attachments").remove([path]);
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
  async function signedUrl(path, download) {
    const { data, error } = await supabase.storage.from("attachments").createSignedUrl(path, 300, download ? { download } : void 0);
    if (error || !data?.signedUrl) {
      toast.error(t("toast.error"));
      return null;
    }
    return data.signedUrl;
  }
  async function handlePreview(row) {
    const url = await signedUrl(row.storage_path);
    if (url) window.open(url, "_blank", "noopener");
  }
  async function handleDownload(row) {
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
    mutationFn: async ({ id, restore }) => {
      const { error } = await supabase.from("attachments").update({ deleted_at: restore ? null : (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setArchiveId(null);
      qc.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });
    },
    onError: (e) => toast.error(dbErrorMessage(e, t))
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: showArchived, onCheckedChange: (v) => setShowArchived(!!v) }),
          t("filter.show_archived")
        ] }) }),
        canUpload && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: inputRef,
              type: "file",
              accept: ACCEPT,
              className: "hidden",
              onChange: (e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: uploading, onClick: () => inputRef.current?.click(), className: "gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
            uploading ? t("attach.uploading") : t("attach.upload")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 pt-3 text-xs text-muted-foreground", children: t("attach.hint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("attach.file") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("attach.size") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("attach.uploaded_at") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: t("label.status") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-end", children: t("label.actions") })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
          list.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-muted-foreground", children: t("label.loading") }) }),
          !list.isLoading && (list.data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 5, className: "py-8 text-center text-muted-foreground", children: t("attach.empty") }) }),
          list.data?.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: row.deleted_at ? "opacity-60" : "", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { mime: row.mime_type }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm break-all", children: row.original_name })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: formatBytes(row.file_size) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { dir: "ltr", className: "text-xs whitespace-nowrap", children: formatDateTime(row.uploaded_at, lang) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.deleted_at ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: t("status.archived") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t("status.active") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("attach.preview"), onClick: () => void handlePreview(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("attach.download"), onClick: () => void handleDownload(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }),
              canManage && !row.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("label.archive"), onClick: () => setArchiveId(row.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) }),
              canManage && row.deleted_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: t("label.restore"), onClick: () => archiveMut.mutate({ id: row.id, restore: true }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArchiveRestore, { className: "h-4 w-4" }) })
            ] }) })
          ] }, row.id))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!archiveId,
        onOpenChange: (v) => !v && setArchiveId(null),
        title: t("attach.confirm_archive"),
        onConfirm: () => archiveId && archiveMut.mutate({ id: archiveId, restore: false })
      }
    )
  ] });
}
export {
  EntityAttachments as E
};
