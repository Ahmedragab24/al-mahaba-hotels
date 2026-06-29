// Quotation print / PDF engine — opens a printable bilingual document in a new window.
import logoUrl from "@/assets/daleel-logo-transparent.png";
import { db } from "@/lib/api/db";
import { DOC_LANGS, QUOTE_RES, OCC_RES, missingDocKeys, type DocLang } from "@/lib/doc-lang";

type Lang = DocLang;
const L = QUOTE_RES;
const OCC = OCC_RES;

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type PrintItem = {
  hotel?: { name_en?: string | null; name_ar?: string | null } | null;
  room_type?: { name_en?: string | null; name_ar?: string | null } | null;
  occupancy_type: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  selling_price: number | null;
  taxes: number;
  fees: number;
  total_selling: number;
  total_cost: number;
  margin: number;
};

export async function openQuotationPrint(opts: {
  lang: Lang;
  quotation: {
    id: string;
    quotation_no: string;
    status: string;
    currency: string;
    quotation_date: string;
    travel_date: string | null;
    expiry_date: string;
    notes: string | null;
  };
  customerName: string;
  items: PrintItem[];
}) {
  const { lang, quotation: q, customerName, items } = opts;
  // BR: PDF generation cannot proceed if mandatory translations are missing.
  if (missingDocKeys(lang, "quotation").length > 0) return false;
  const s = L[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const money = (n: number) =>
    `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${q.currency}`;
  const d = (v: string | null) => {
    if (!v) return "—";
    // Handle dates that might already include time
    const dateStr = v.includes(' ') ? v.replace(' ', 'T') : v;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString(locale);
  };
  const name = (o?: { name_en?: string | null; name_ar?: string | null } | null) =>
    dir === "rtl" ? o?.name_ar || o?.name_en || "—" : o?.name_en || o?.name_ar || "—";

  const roomsTotal = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const fees = items.reduce((a, i) => a + Number(i.fees), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);

  const rows = items
    .map(
      (i) => `<tr>
        <td>${esc(name(i.hotel))}</td>
        <td>${esc(name(i.room_type))}</td>
        <td>${esc(OCC[lang][i.occupancy_type] ?? i.occupancy_type)} (${esc(i.occupancy_type)})</td>
        <td>${d(i.check_in)}</td>
        <td>${d(i.check_out)}</td>
        <td class="c">${i.nights}</td>
        <td class="c">${i.rooms}</td>
        <td class="n">${money(Number(i.selling_price ?? 0))}</td>
        <td class="n">${money(Number(i.taxes))}</td>
        <td class="n">${money(Number(i.fees))}</td>
        <td class="n b">${money(Number(i.total_selling))}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} ${esc(q.quotation_no)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${lang === "ar" ? "'Segoe UI', Tahoma, Arial" : "'Segoe UI', Arial"}, sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #14532d; padding-bottom: 16px; }
  .head img { height: 64px; }
  .head .t { text-align: ${dir === "rtl" ? "left" : "right"}; }
  .head h1 { font-size: 26px; color: #14532d; }
  .head .no { font-size: 14px; color: #555; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px 14px; }
  .box .k { font-size: 11px; color: #777; }
  .box .v { font-weight: 600; margin-top: 2px; }
  h2 { font-size: 15px; color: #14532d; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 7px 8px; text-align: ${dir === "rtl" ? "right" : "left"}; }
  th { background: #14532d; color: #fff; font-size: 11px; }
  td.c { text-align: center; } td.n { text-align: ${dir === "rtl" ? "left" : "right"}; direction: ltr; white-space: nowrap; }
  td.b { font-weight: 700; }
  .totals { margin-top: 14px; width: 320px; margin-${dir === "rtl" ? "right" : "left"}: auto; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #eee; }
  .totals .grand { background: #14532d; color: #fff; font-weight: 700; font-size: 15px; border-radius: 6px; margin-top: 6px; }
  .terms { margin-top: 24px; border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; background: #fafafa; line-height: 1.7; }
  .foot { margin-top: 28px; text-align: center; color: #777; font-size: 11px; border-top: 1px solid #eee; padding-top: 12px; }
  @media print { body { padding: 12px; } .noprint { display: none; } }
  .noprint { position: fixed; top: 12px; ${dir === "rtl" ? "left" : "right"}: 12px; }
  .noprint button { background: #14532d; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">🖨 ${lang === "ar" ? "طباعة / حفظ PDF" : "Print / Save PDF"}</button></div>
  <div class="head">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="${esc(location.origin + logoUrl)}" alt="logo" />
      <div style="font-weight:700;font-size:16px;color:#14532d">${esc(s.company)}</div>
    </div>
    <div class="t">
      <h1>${esc(s.title)}</h1>
      <div class="no">${esc(s.quotation_no)}: <b dir="ltr">${esc(q.quotation_no)}</b></div>
    </div>
  </div>

  <div class="meta">
    <div class="box"><div class="k">${esc(s.to)}</div><div class="v">${esc(customerName)}</div></div>
    <div class="box"><div class="k">${esc(s.date)}</div><div class="v" dir="ltr">${d(q.quotation_date)}</div></div>
    <div class="box"><div class="k">${esc(s.valid_until)}</div><div class="v" dir="ltr">${d(q.expiry_date)}</div></div>
    <div class="box"><div class="k">${esc(s.generated)}</div><div class="v" dir="ltr">${new Date().toLocaleString(locale)}</div></div>
    <div class="box"><div class="k">${esc(s.quotation_no)}</div><div class="v" dir="ltr">${esc(q.quotation_no)}</div></div>
  </div>

  <h2>${esc(s.breakdown)}</h2>
  <table>
    <thead><tr>
      <th>${esc(s.hotel)}</th><th>${esc(s.room)}</th><th>${esc(s.occupancy)}</th>
      <th>${esc(s.check_in)}</th><th>${esc(s.check_out)}</th><th>${esc(s.nights)}</th><th>${esc(s.rooms)}</th>
      <th>${esc(s.unit)}</th><th>${esc(s.taxes)}</th><th>${esc(s.fees)}</th><th>${esc(s.line_total)}</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>${esc(s.rooms_total)}</span><b dir="ltr">${money(roomsTotal)}</b></div>
    <div class="row"><span>${esc(s.total_taxes)}</span><b dir="ltr">${money(taxes)}</b></div>
    <div class="row"><span>${esc(s.total_fees)}</span><b dir="ltr">${money(fees)}</b></div>
    <div class="row grand"><span>${esc(s.grand_total)}</span><b dir="ltr">${money(grand)}</b></div>
  </div>

  ${q.notes ? `<h2>${esc(s.notes)}</h2><div class="terms">${esc(q.notes)}</div>` : ""}

  <h2>${esc(s.terms)}</h2>
  <div class="terms">${esc(s.terms_text)}</div>

  <div class="foot">${esc(s.footer)}</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();

  // Audit: PDF generation
  try {
    await db.rpc("log_audit", {
      _action: "pdf_generate",
      _entity_type: "quotations",
      _entity_id: q.id,
      _metadata: { lang, quotation_no: q.quotation_no },
    });
  } catch {
    // audit failure must not block printing
  }
  return true;
}
