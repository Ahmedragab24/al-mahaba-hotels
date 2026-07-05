// Quotation print / PDF engine — opens a printable multilingual document in a new window.
import logoUrl from "@/assets/daleel-logo-transparent.png";
import { db } from "@/store/queryBridge";
import { DOC_LANGS, QUOTE_RES, missingDocKeys, type DocLang } from "@/lib/doc-lang";
import { QUOTE_PRINT_THEME, localizedName, parseApiDate, type MappedPrintItem, type QuotationRecipient } from "./-helpers";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type Lang = DocLang;
const L = QUOTE_RES;
const T = QUOTE_PRINT_THEME;

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type PrintItem = MappedPrintItem;

export async function openQuotationPrint(opts: {
  lang: Lang;
  quotation: {
    id: string | number;
    quotation_no: string;
    status?: string;
    status_text?: string;
    currency: string;
    currency_symbol?: string;
    quotation_date: string;
    travel_date: string | null;
    expiry_date: string;
    check_in?: string | null;
    check_out?: string | null;
    group_size?: number | null;
    notes: string | null;
    is_recommended?: boolean;
    hotel?: any;
  };
  recipientName: string;
  recipient: QuotationRecipient;
  hidePrices: boolean;
  items: PrintItem[];
}) {
  const { lang, quotation: q, recipientName, recipient, hidePrices, items } = opts;
  if (missingDocKeys(lang, "quotation").length > 0) return false;

  const s = L[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const rtl = dir === "rtl";
  const symbol = q.currency_symbol || q.currency;

  const money = (n: number) =>
    `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;

  const d = (v: string | null | undefined) => {
    const parsed = parseApiDate(v ?? null);
    return parsed ? parsed.toLocaleDateString(locale) : "—";
  };

  const dTime = (v: string | null | undefined) => {
    const parsed = parseApiDate(v ?? null);
    return parsed
      ? parsed.toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—";
  };

  const name = (o?: { name_en?: string | null; name_ar?: string | null; name?: string | null } | null) =>
    localizedName(o, rtl);

  const hotel = q.hotel;
  const coverImage = hotel?.cover_image;
  const hotelLocation = [localizedName(hotel?.city, rtl), localizedName(hotel?.country, rtl)].filter((x) => x !== "—").join(" · ");
  const stars = Number(hotel?.stars ?? 0);
  const starsHtml = stars > 0 ? `<span class="stars">${"★".repeat(stars)}</span>` : "";
  const policies = rtl
    ? hotel?.policies_ar || hotel?.policies || hotel?.policies_en
    : hotel?.policies_en || hotel?.policies || hotel?.policies_ar;

  const priceCell = (value: string) => (hidePrices ? "—" : value);

  const rows = items
    .map(
      (i) => `<tr>
        <td>${esc(name(i.hotel))}</td>
        <td>${esc(name(i.room_type))}</td>
        <td>${esc(i.meal_plan)}</td>
        <td>${d(i.check_in)}</td>
        <td>${d(i.check_out)}</td>
        <td class="c">${i.nights}</td>
        <td class="c">${i.rooms}</td>
        ${hidePrices ? "" : `<td class="n">${priceCell(money(Number(i.selling_price ?? 0)))}</td>
        <td class="n">${priceCell(money(Number(i.taxes)))}</td>
        <td class="n b">${priceCell(money(Number(i.total_selling)))}</td>`}
      </tr>`,
    )
    .join("");

  const roomsTotal = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);

  const totalsBlock = hidePrices
    ? `<div class="notice">${esc(rtl ? "هذا المستند لا يتضمن الأسعار." : "This document does not include pricing.")}</div>`
    : `<div class="totals">
    <div class="row"><span>${esc(s.rooms_total)}</span><b dir="ltr">${money(roomsTotal)}</b></div>
    <div class="row"><span>${esc(s.total_taxes)}</span><b dir="ltr">${money(taxes)}</b></div>
    <div class="row grand"><span>${esc(s.grand_total)}</span><b dir="ltr">${money(grand)}</b></div>
  </div>`;

  const recipientLabel = recipient === "supplier"
    ? (rtl ? "مقدم إلى (مورد)" : "Presented To (Supplier)")
    : esc(s.to);

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${esc(s.title)} ${esc(q.quotation_no)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', 'Inter', 'Segoe UI', Tahoma, Arial, sans-serif; color: ${T.dark}; padding: 32px; font-size: 13px; background: #fff; line-height: 1.55; }
  .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid ${T.gold}; padding-bottom: 16px; }
  .head img { height: 64px; object-fit: contain; }
  .head .brand { font-weight: 700; font-size: 16px; color: ${T.goldDeep}; }
  .head .t { text-align: ${rtl ? "left" : "right"}; }
  .head h1 { font-size: 26px; color: ${T.goldDeep}; font-weight: 700; }
  .head .no { font-size: 14px; color: ${T.muted}; margin-top: 4px; }
  .badge { display: inline-block; background: ${T.goldLight}; color: ${T.goldDeep}; border: 1px solid color-mix(in srgb, ${T.gold} 40%, white); border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 600; margin-top: 6px; }
  .hero { margin: 18px 0; display: grid; grid-template-columns: ${coverImage ? "220px 1fr" : "1fr"}; gap: 16px; align-items: stretch; }
  .hero img { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; border: 1px solid ${T.border}; }
  .hero-info { border: 1px solid ${T.border}; border-radius: 10px; padding: 14px 16px; background: ${T.surface}; }
  .hero-info h3 { font-size: 18px; color: ${T.goldDeep}; margin-bottom: 6px; }
  .hero-info .loc { color: ${T.muted}; font-size: 12px; margin-bottom: 8px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; }
  .box { border: 1px solid ${T.border}; border-radius: 8px; padding: 10px 14px; background: ${T.surface}; }
  .box .k { font-size: 11px; color: ${T.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
  .box .v { font-weight: 600; margin-top: 2px; color: ${T.dark}; }
  h2 { font-size: 15px; color: ${T.goldDeep}; margin: 20px 0 8px; font-weight: 700; border-bottom: 1px solid ${T.goldLight}; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid ${T.border}; border-radius: 8px; overflow: hidden; }
  th, td { border-bottom: 1px solid ${T.border}; padding: 8px 9px; text-align: ${rtl ? "right" : "left"}; }
  tr:last-child td { border-bottom: none; }
  th { background: ${T.goldDeep}; color: #fff; font-size: 11px; font-weight: 600; }
  td.c { text-align: center; }
  td.n { text-align: ${rtl ? "left" : "right"}; direction: ltr; white-space: nowrap; }
  td.b { font-weight: 700; }
  .stars { color: ${T.gold}; letter-spacing: 1px; }
  .totals { margin-top: 14px; width: 340px; margin-${rtl ? "right" : "left"}: auto; }
  .totals .row { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid ${T.border}; }
  .totals .grand { background: linear-gradient(135deg, ${T.gold}, ${T.goldDeep}); color: #fff; font-weight: 700; font-size: 15px; border-radius: 8px; margin-top: 8px; border: none; }
  .notice { margin-top: 14px; padding: 12px 16px; border-radius: 8px; background: ${T.goldLight}; color: ${T.goldDeep}; font-weight: 600; text-align: center; }
  .terms { margin-top: 12px; border: 1px solid ${T.border}; border-radius: 8px; padding: 12px 16px; background: ${T.surface}; line-height: 1.75; white-space: pre-wrap; color: #334155; }
  .foot { margin-top: 28px; text-align: center; color: ${T.muted}; font-size: 11px; border-top: 1px solid ${T.border}; padding-top: 12px; }
  @media print {
    body { padding: 12px; }
    .noprint { display: none; }
    th { background: ${T.goldDeep} !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .totals .grand { background: ${T.goldDeep} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .noprint { position: fixed; top: 12px; ${rtl ? "left" : "right"}: 12px; z-index: 9999; }
  .noprint button { background: ${T.goldDeep}; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
  <div class="noprint"><button onclick="window.print()">🖨 ${esc(s.print)}</button></div>
  <div class="head">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="${esc(location.origin + logoUrl)}" alt="logo" />
      <div class="brand">${esc(s.company)}</div>
    </div>
    <div class="t">
      <h1>${esc(s.title)}</h1>
      <div class="no">${esc(s.quotation_no)}: <b dir="ltr">${esc(q.quotation_no)}</b></div>
      ${q.is_recommended ? `<div class="badge">${esc(s.recommended)}</div>` : ""}
    </div>
  </div>

  ${hotel ? `<div class="hero">
    ${coverImage ? `<img src="${esc(coverImage)}" alt="${esc(name(hotel))}" />` : ""}
    <div class="hero-info">
      <h3>${esc(name(hotel))} ${starsHtml}</h3>
      <div class="loc">${esc(hotelLocation)}</div>
      ${hotel.check_in || hotel.check_out ? `<div style="font-size:12px;color:${T.muted}">${esc(s.check_in)}: ${esc(hotel.check_in ?? "—")} · ${esc(s.check_out)}: ${esc(hotel.check_out ?? "—")}</div>` : ""}
    </div>
  </div>` : ""}

  <div class="meta">
    <div class="box"><div class="k">${recipientLabel}</div><div class="v">${esc(recipientName)}</div></div>
    <div class="box"><div class="k">${esc(s.date)}</div><div class="v" dir="ltr">${dTime(q.quotation_date)}</div></div>
    <div class="box"><div class="k">${esc(s.valid_until)}</div><div class="v" dir="ltr">${dTime(q.expiry_date)}</div></div>
    <div class="box"><div class="k">${esc(s.travel_date)}</div><div class="v" dir="ltr">${d(q.check_in || q.travel_date)} → ${d(q.check_out || q.expiry_date)}</div></div>
    ${q.group_size ? `<div class="box"><div class="k">${rtl ? "حجم المجموعة" : "Group Size"}</div><div class="v">${esc(q.group_size)}</div></div>` : ""}
    <div class="box"><div class="k">${esc(s.generated)}</div><div class="v" dir="ltr">${new Date().toLocaleString(locale)}</div></div>
  </div>

  <h2>${esc(s.breakdown)}</h2>
  <table>
    <thead><tr>
      <th>${esc(s.hotel)}</th><th>${esc(s.room)}</th><th>${esc(s.meal)}</th>
      <th>${esc(s.check_in)}</th><th>${esc(s.check_out)}</th><th>${esc(s.nights)}</th><th>${esc(s.rooms)}</th>
      ${hidePrices ? "" : `<th>${esc(s.unit)}</th><th>${esc(s.taxes)}</th><th>${esc(s.line_total)}</th>`}
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="${hidePrices ? 7 : 10}" style="text-align:center;color:${T.muted}">—</td></tr>`}</tbody>
  </table>

  ${totalsBlock}

  ${q.notes ? `<h2>${esc(s.notes)}</h2><div class="terms">${esc(q.notes)}</div>` : ""}

  ${policies ? `<h2>${esc(s.terms)}</h2><div class="terms">${esc(policies)}</div>` : `<h2>${esc(s.terms)}</h2><div class="terms">${esc(s.terms_text)}</div>`}

  <div class="foot">${esc(s.footer)}</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();

  try {
    await db.rpc("log_audit", {
      _action: "pdf_generate",
      _entity_type: "quotations",
      _entity_id: q.id,
      _metadata: { lang, quotation_no: q.quotation_no, recipient, hide_prices: hidePrices },
    });
  } catch {
    /* audit failure must not block printing */
  }
  return true;
}

export async function generateQuotationPdfBlob(opts: {
  lang: Lang;
  quotation: {
    id: string | number;
    quotation_no: string;
    status?: string;
    status_text?: string;
    currency: string;
    currency_symbol?: string;
    quotation_date: string;
    travel_date: string | null;
    expiry_date: string;
    check_in?: string | null;
    check_out?: string | null;
    group_size?: number | null;
    notes: string | null;
    is_recommended?: boolean;
    hotel?: any;
  };
  recipientName: string;
  recipient: QuotationRecipient;
  hidePrices: boolean;
  items: PrintItem[];
}): Promise<Blob> {
  const { lang, quotation: q, recipientName, recipient, hidePrices, items } = opts;

  const s = L[lang];
  const dir = DOC_LANGS[lang].dir;
  const locale = DOC_LANGS[lang].locale;
  const rtl = dir === "rtl";
  const symbol = q.currency_symbol || q.currency;

  const money = (n: number) =>
    `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;

  const d = (v: string | null | undefined) => {
    const parsed = parseApiDate(v ?? null);
    return parsed ? parsed.toLocaleDateString(locale) : "—";
  };

  const dTime = (v: string | null | undefined) => {
    const parsed = parseApiDate(v ?? null);
    return parsed
      ? parsed.toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—";
  };

  const name = (o?: { name_en?: string | null; name_ar?: string | null; name?: string | null } | null) =>
    localizedName(o, rtl);

  const hotel = q.hotel;
  const coverImage = hotel?.cover_image;
  const hotelLocation = [localizedName(hotel?.city, rtl), localizedName(hotel?.country, rtl)].filter((x) => x !== "—").join(" · ");
  const stars = Number(hotel?.stars ?? 0);
  const starsHtml = stars > 0 ? `<span class="stars">${"★".repeat(stars)}</span>` : "";
  const policies = rtl
    ? hotel?.policies_ar || hotel?.policies || hotel?.policies_en
    : hotel?.policies_en || hotel?.policies || hotel?.policies_ar;

  const priceCell = (value: string) => (hidePrices ? "—" : value);

  const rows = items
    .map(
      (i) => `<tr>
        <td>${esc(name(i.hotel))}</td>
        <td>${esc(name(i.room_type))}</td>
        <td>${esc(i.meal_plan)}</td>
        <td>${d(i.check_in)}</td>
        <td>${d(i.check_out)}</td>
        <td class="c">${i.nights}</td>
        <td class="c">${i.rooms}</td>
        ${hidePrices ? "" : `<td class="n">${priceCell(money(Number(i.selling_price ?? 0)))}</td>
        <td class="n">${priceCell(money(Number(i.taxes)))}</td>
        <td class="n b">${priceCell(money(Number(i.total_selling)))}</td>`}
      </tr>`,
    )
    .join("");

  const roomsTotal = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);

  const totalsBlock = hidePrices
    ? `<div class="notice">${esc(rtl ? "هذا المستند لا يتضمن الأسعار." : "This document does not include pricing.")}</div>`
    : `<div class="totals">
    <div class="row"><span>${esc(s.rooms_total)}</span><b dir="ltr">${money(roomsTotal)}</b></div>
    <div class="row"><span>${esc(s.total_taxes)}</span><b dir="ltr">${money(taxes)}</b></div>
    <div class="row grand"><span>${esc(s.grand_total)}</span><b dir="ltr">${money(grand)}</b></div>
  </div>`;

  const recipientLabel = recipient === "supplier"
    ? (rtl ? "مقدم إلى (مورد)" : "Presented To (Supplier)")
    : esc(s.to);

  const logoSrc = location.origin + logoUrl;

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.background = "#ffffff";
  container.style.padding = "32px";
  container.style.fontFamily = "'Cairo', 'Inter', sans-serif";
  container.dir = dir;

  container.innerHTML = `
    <style>
      .pdf-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid ${T.gold}; padding-bottom: 16px; }
      .pdf-head img { height: 64px; object-fit: contain; }
      .pdf-head .brand { font-weight: 700; font-size: 16px; color: ${T.goldDeep}; }
      .pdf-head .t { text-align: ${rtl ? "left" : "right"}; }
      .pdf-head h1 { font-size: 26px; color: ${T.goldDeep}; font-weight: 700; margin: 0; }
      .pdf-head .no { font-size: 14px; color: ${T.muted}; margin-top: 4px; }
      .pdf-badge { display: inline-block; background: ${T.goldLight}; color: ${T.goldDeep}; border: 1px solid color-mix(in srgb, ${T.gold} 40%, white); border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 600; margin-top: 6px; }
      .pdf-hero { margin: 18px 0; display: flex; gap: 16px; align-items: stretch; }
      .pdf-hero img { width: 220px; height: 160px; object-fit: cover; border-radius: 10px; border: 1px solid ${T.border}; }
      .pdf-hero-info { flex: 1; border: 1px solid ${T.border}; border-radius: 10px; padding: 14px 16px; background: ${T.surface}; }
      .pdf-hero-info h3 { font-size: 18px; color: ${T.goldDeep}; margin-bottom: 6px; }
      .pdf-hero-info .loc { color: ${T.muted}; font-size: 12px; margin-bottom: 8px; }
      .pdf-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; }
      .pdf-box { border: 1px solid ${T.border}; border-radius: 8px; padding: 10px 14px; background: ${T.surface}; }
      .pdf-box .k { font-size: 11px; color: ${T.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
      .pdf-box .v { font-weight: 600; margin-top: 2px; color: ${T.dark}; }
      .pdf-h2 { font-size: 15px; color: ${T.goldDeep}; margin: 20px 0 8px; font-weight: 700; border-bottom: 1px solid ${T.goldLight}; padding-bottom: 4px; }
      .pdf-table { width: 100%; border-collapse: collapse; border: 1px solid ${T.border}; border-radius: 8px; overflow: hidden; }
      .pdf-table th, .pdf-table td { border-bottom: 1px solid ${T.border}; padding: 8px 9px; text-align: ${rtl ? "right" : "left"}; }
      .pdf-table tr:last-child td { border-bottom: none; }
      .pdf-table th { background: ${T.goldDeep}; color: #fff; font-size: 11px; font-weight: 600; }
      .pdf-table td.c { text-align: center; }
      .pdf-table td.n { text-align: ${rtl ? "left" : "right"}; direction: ltr; white-space: nowrap; }
      .pdf-table td.b { font-weight: 700; }
      .stars { color: ${T.gold}; letter-spacing: 1px; }
      .totals { margin-top: 14px; width: 340px; margin-${rtl ? "right" : "left"}: auto; }
      .totals .row { display: flex; justify-content: space-between; padding: 7px 12px; border-bottom: 1px solid ${T.border}; }
      .totals .grand { background: linear-gradient(135deg, ${T.gold}, ${T.goldDeep}); color: #fff; font-weight: 700; font-size: 15px; border-radius: 8px; margin-top: 8px; border: none; }
      .notice { margin-top: 14px; padding: 12px 16px; border-radius: 8px; background: ${T.goldLight}; color: ${T.goldDeep}; font-weight: 600; text-align: center; }
      .terms { margin-top: 12px; border: 1px solid ${T.border}; border-radius: 8px; padding: 12px 16px; background: ${T.surface}; line-height: 1.75; white-space: pre-wrap; color: #334155; }
      .pdf-foot { margin-top: 28px; text-align: center; color: ${T.muted}; font-size: 11px; border-top: 1px solid ${T.border}; padding-top: 12px; }
    </style>
    <div class="pdf-head">
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${esc(logoSrc)}" alt="logo" />
        <div class="brand">${esc(s.company)}</div>
      </div>
      <div class="t">
        <h1>${esc(s.title)}</h1>
        <div class="no">${esc(s.quotation_no)}: <b dir="ltr">${esc(q.quotation_no)}</b></div>
        ${q.is_recommended ? `<div class="pdf-badge">${esc(s.recommended)}</div>` : ""}
      </div>
    </div>

    ${hotel ? `<div class="pdf-hero">
      ${coverImage ? `<img src="${esc(coverImage)}" alt="${esc(name(hotel))}" />` : ""}
      <div class="pdf-hero-info">
        <h3>${esc(name(hotel))} ${starsHtml}</h3>
        <div class="loc">${esc(hotelLocation)}</div>
        ${hotel.check_in || hotel.check_out ? `<div style="font-size:12px;color:${T.muted}">${esc(s.check_in)}: ${esc(hotel.check_in ?? "—")} · ${esc(s.check_out)}: ${esc(hotel.check_out ?? "—")}</div>` : ""}
      </div>
    </div>` : ""}

    <div class="pdf-meta">
      <div class="pdf-box"><div class="k">${recipientLabel}</div><div class="v">${esc(recipientName)}</div></div>
      <div class="pdf-box"><div class="k">${esc(s.date)}</div><div class="v" dir="ltr">${dTime(q.quotation_date)}</div></div>
      <div class="pdf-box"><div class="k">${esc(s.valid_until)}</div><div class="v" dir="ltr">${dTime(q.expiry_date)}</div></div>
      <div class="pdf-box"><div class="k">${esc(s.travel_date)}</div><div class="v" dir="ltr">${d(q.check_in || q.travel_date)} → ${d(q.check_out || q.expiry_date)}</div></div>
      ${q.group_size ? `<div class="pdf-box"><div class="k">${rtl ? "حجم المجموعة" : "Group Size"}</div><div class="v">${esc(q.group_size)}</div></div>` : ""}
      <div class="pdf-box"><div class="k">${esc(s.generated)}</div><div class="v" dir="ltr">${new Date().toLocaleString(locale)}</div></div>
    </div>

    <h2 class="pdf-h2">${esc(s.breakdown)}</h2>
    <table class="pdf-table">
      <thead><tr>
        <th>${esc(s.hotel)}</th><th>${esc(s.room)}</th><th>${esc(s.meal)}</th>
        <th>${esc(s.check_in)}</th><th>${esc(s.check_out)}</th><th>${esc(s.nights)}</th><th>${esc(s.rooms)}</th>
        ${hidePrices ? "" : `<th>${esc(s.unit)}</th><th>${esc(s.taxes)}</th><th>${esc(s.line_total)}</th>`}
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="${hidePrices ? 7 : 10}" style="text-align:center;color:${T.muted}">—</td></tr>`}</tbody>
    </table>

    ${totalsBlock}

    ${q.notes ? `<h2 class="pdf-h2">${esc(s.notes)}</h2><div class="terms">${esc(q.notes)}</div>` : ""}

    ${policies ? `<h2 class="pdf-h2">${esc(s.terms)}</h2><div class="terms">${esc(policies)}</div>` : `<h2 class="pdf-h2">${esc(s.terms)}</h2><div class="terms">${esc(s.terms_text)}</div>`}

    <div class="pdf-foot">${esc(s.footer)}</div>
  `;

  document.body.appendChild(container);

  // Wait for images and layouts to render
  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
  const blob = pdf.output("blob");

  try {
    await db.rpc("log_audit", {
      _action: "pdf_generate",
      _entity_type: "quotations",
      _entity_id: q.id,
      _metadata: { lang, quotation_no: q.quotation_no, recipient, hide_prices: hidePrices, format: "pdf_blob" },
    });
  } catch {
    /* audit failure must not block printing */
  }

  return blob;
}
