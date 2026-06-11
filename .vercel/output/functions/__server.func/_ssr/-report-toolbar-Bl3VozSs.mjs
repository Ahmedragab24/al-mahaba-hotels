import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-D2X9i3zo.mjs";
import { I as Input } from "./input-B9Lwb7ES.mjs";
import { L as Label } from "./label-BWkpBOCr.mjs";
import { S as Switch } from "./switch-BwRKxUkF.mjs";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-B3U_60pZ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-BdL2Ylqo.mjs";
import { u as useI18n, e as useAuth } from "./router-v2O1Lq9M.mjs";
import { aG as FileDown, F as FileSpreadsheet, w as FileText, aH as Save } from "../_libs/lucide-react.mjs";
function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5e3);
}
const cell = (v) => v == null ? "" : String(v);
const esc = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function exportCSV(filename, columns, rows) {
  const quote = (v) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  const lines = [
    columns.map((c) => quote(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => quote(cell(r[c.key]))).join(","))
  ];
  download(`${filename}.csv`, new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }));
}
function exportExcel(filename, columns, rows, title) {
  const head = columns.map((c) => `<th style="background:#1f2937;color:#fff;padding:6px 10px;border:1px solid #ccc">${esc(c.label)}</th>`).join("");
  const body = rows.map(
    (r) => `<tr>${columns.map((c) => `<td style="padding:4px 10px;border:1px solid #ddd;${c.numeric ? "mso-number-format:'#,##0.00';text-align:right" : ""}">${esc(cell(r[c.key]))}</td>`).join("")}</tr>`
  ).join("");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${title ? `<h3>${esc(title)}</h3>` : ""}<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  download(`${filename}.xls`, new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8" }));
}
function exportPDF(opts) {
  const { title, subtitle, columns, rows, dir, footer } = opts;
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join("");
  const body = rows.map((r) => `<tr>${columns.map((c) => `<td class="${c.numeric ? "num" : ""}">${esc(cell(r[c.key]))}</td>`).join("")}</tr>`).join("");
  const html = `<!DOCTYPE html><html dir="${dir}" lang="${dir === "rtl" ? "ar" : "en"}"><head><meta charset="UTF-8"><title>${esc(title)}</title>
<style>
  body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;margin:32px;color:#111827}
  h1{font-size:20px;margin:0 0 4px}
  .sub{color:#6b7280;font-size:12px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#1f2937;color:#fff;padding:7px 9px;text-align:${dir === "rtl" ? "right" : "left"}}
  td{padding:6px 9px;border-bottom:1px solid #e5e7eb}
  td.num{text-align:${dir === "rtl" ? "left" : "right"};font-variant-numeric:tabular-nums}
  tr:nth-child(even) td{background:#f9fafb}
  .footer{margin-top:24px;color:#9ca3af;font-size:10px}
  @media print{body{margin:12mm}}
</style></head><body>
<h1>${esc(title)}</h1>
${subtitle ? `<div class="sub">${esc(subtitle)}</div>` : ""}
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
${footer ? `<div class="footer">${esc(footer)}</div>` : ""}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
  const w = window.open("", "_blank", "width=1000,height=720");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
function ReportToolbar({
  reportKey,
  fileName,
  title,
  subtitle,
  columns,
  rows,
  config
}) {
  const { t, dir, lang } = useI18n();
  const auth = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  const [nameAr, setNameAr] = reactExports.useState("");
  const [nameEn, setNameEn] = reactExports.useState("");
  const [shared, setShared] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const saveTemplate = async () => {
    if (!nameAr.trim() || !nameEn.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("report_templates").insert({
      name_ar: nameAr.trim(),
      name_en: nameEn.trim(),
      report_key: reportKey,
      config: config ?? {},
      is_shared: shared,
      created_by: auth.user?.id
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportCSV(`${fileName}-${stamp}`, columns, rows), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { className: "h-4 w-4" }),
      " ",
      t("rpt.export_csv")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportExcel(`${fileName}-${stamp}`, columns, rows, title), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "h-4 w-4" }),
      " ",
      t("rpt.export_excel")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => exportPDF({ title, subtitle, columns, rows, dir, footer: `${t("rpt.generated_at")}: ${(/* @__PURE__ */ new Date()).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}` }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
      " ",
      t("rpt.export_pdf")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
        " ",
        t("rpt.save_template")
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t("rpt.save_template") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.name_ar") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nameAr, onChange: (e) => setNameAr(e.target.value), maxLength: 120 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("label.name_en") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: nameEn, onChange: (e) => setNameEn(e.target.value), maxLength: 120 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("rpt.shared") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: shared, onCheckedChange: setShared })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: t("actions.cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveTemplate, disabled: saving || !nameAr.trim() || !nameEn.trim(), children: saving ? t("actions.saving") : t("actions.save") })
        ] })
      ] })
    ] })
  ] });
}
export {
  ReportToolbar as R
};
