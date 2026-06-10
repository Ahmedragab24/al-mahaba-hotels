// Export services — CSV / Excel / PDF for all reports (Section 17).
export type ReportColumn = { key: string; label: string; numeric?: boolean };
export type ReportRow = Record<string, string | number | null | undefined>;

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const cell = (v: string | number | null | undefined) => (v == null ? "" : String(v));

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** CSV export with UTF-8 BOM so Arabic opens correctly in Excel. */
export function exportCSV(filename: string, columns: ReportColumn[], rows: ReportRow[]) {
  const quote = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [
    columns.map((c) => quote(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => quote(cell(r[c.key]))).join(",")),
  ];
  download(`${filename}.csv`, new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }));
}

/** Excel export — HTML table workbook readable by Excel with full Unicode support. */
export function exportExcel(filename: string, columns: ReportColumn[], rows: ReportRow[], title?: string) {
  const head = columns.map((c) => `<th style="background:#1f2937;color:#fff;padding:6px 10px;border:1px solid #ccc">${esc(c.label)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${columns
          .map((c) => `<td style="padding:4px 10px;border:1px solid #ddd;${c.numeric ? "mso-number-format:'#,##0.00';text-align:right" : ""}">${esc(cell(r[c.key]))}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${
    title ? `<h3>${esc(title)}</h3>` : ""
  }<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  download(`${filename}.xls`, new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8" }));
}

/** PDF export — opens a styled printable document (bilingual / RTL aware). */
export function exportPDF(opts: {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  dir: "rtl" | "ltr";
  footer?: string;
}) {
  const { title, subtitle, columns, rows, dir, footer } = opts;
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td class="${c.numeric ? "num" : ""}">${esc(cell(r[c.key]))}</td>`).join("")}</tr>`)
    .join("");
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
<script>window.onload=function(){window.print()}</script>
</body></html>`;
  const w = window.open("", "_blank", "width=1000,height=720");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
