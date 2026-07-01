// Invoice detail — Section 15 (BR-INV). Items, status workflow, payments, sharing, history.
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "@/store/api";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasAnyRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logoUrl from "@/assets/daleel-logo-transparent.png";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, Mail, MessageCircle, FileEdit, Eye } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { toast } from "sonner";
import { InvStatusBadge, FINANCE_WRITE } from "./index";

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = hasAnyRole(auth, [...FINANCE_WRITE]);

  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("unpaid");
  const [editNotes, setEditNotes] = useState("");
  const [editInvoiceImage, setEditInvoiceImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: invoiceData, isLoading: isInvoiceLoading, refetch: refetchInvoice } = useGetInvoiceByIdQuery({ id: id || "", lang });
  const [updateInvoiceMutation] = useUpdateInvoiceMutation();

  if (isInvoiceLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  const x = invoiceData;
  if (!x) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;
  const items = invoiceData?.items ?? [];
  const allocs: any[] = [];
  const custName = x.customer ? (lang === "ar" ? x.customer.name_ar || x.customer.name_en : x.customer.name_en || x.customer.name_ar) : "—";
  const balance = Number(x.total_amount) - Number(x.paid_amount);
  const isDraft = x.status === "draft";
  const currencyCode = typeof x.currency === "object" ? x.currency?.code : (x.currency ?? "SAR");

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const printInvoice = () => {
    const logoSrc = window.location.origin + logoUrl;
    let itemsListHtml = "";
    if (items.length > 0) {
      itemsListHtml = items.map((i, index) => {
        const desc = lang === "ar" ? i.description_ar || i.description_en || i.description : i.description_en || i.description_ar || i.description;
        const taxesVal = i.taxes ?? 0;
        const totalVal = i.line_total ?? i.total_price ?? (Number(i.quantity) * Number(i.unit_price));
        return `<tr>
          <td>${index + 1}</td>
          <td>${desc || "—"}</td>
          <td style="text-align: end;">${i.quantity}</td>
          <td style="text-align: end;">${Number(i.unit_price).toLocaleString()}</td>
          <td style="text-align: end;">${x.tax_percent ? `${x.tax_percent}%` : "—"}</td>
          <td style="text-align: end;">${Number(taxesVal).toLocaleString()}</td>
          <td style="text-align: end; font-weight: 600;">${Number(totalVal).toLocaleString()} ${currencyCode}</td>
        </tr>`;
      }).join("");
    } else {
      itemsListHtml = `<tr>
        <td>1</td>
        <td>${ar("حجز خدمات عامة / فندقية", "General Services / Hotel Booking")} - ${x.invoice_number || x.invoice_no}</td>
        <td style="text-align: end;">1</td>
        <td style="text-align: end;">${Number(x.subtotal ?? x.sub_total).toLocaleString()}</td>
        <td style="text-align: end;">${x.tax_percent ? `${x.tax_percent}%` : "—"}</td>
        <td style="text-align: end;">${Number(x.tax_amount ?? x.taxes).toLocaleString()}</td>
        <td style="text-align: end; font-weight: 600;">${Number(x.total_amount).toLocaleString()} ${currencyCode}</td>
      </tr>`;
    }

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <title>${x.invoice_number || x.invoice_no}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap');
    
    body {
      font-family: 'Cairo', 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1f2937;
      background-color: #ffffff;
      line-height: 1.5;
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .company-logo {
      font-size: 24px;
      font-weight: 700;
      color: #047857;
    }
    
    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      text-transform: uppercase;
    }
    
    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .details-block h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #6b7280;
      margin: 0 0 10px 0;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
      font-weight: 600;
    }
    
    .details-block p {
      margin: 4px 0;
      font-size: 14px;
    }
    
    .details-block .strong {
      font-weight: 600;
      color: #111827;
    }
    
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    table.items-table th {
      background-color: #f3f4f6;
      color: #374151;
      font-weight: 600;
      text-align: start;
      padding: 12px;
      font-size: 13px;
      border-bottom: 2px solid #d1d5db;
    }
    
    table.items-table td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid #e5e7eb;
      color: #4b5563;
    }
    
    table.items-table tr:last-child td {
      border-bottom: 2px solid #d1d5db;
    }
    
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 40px;
    }
    
    .notes-block {
      flex: 1;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      font-size: 13px;
      color: #4b5563;
      max-width: 50%;
    }
    
    .notes-block h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    
    .totals-block {
      width: 300px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px dashed #e5e7eb;
    }
    
    .total-row:last-child {
      border-bottom: none;
    }
    
    .total-row.grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      border-top: 2px solid #111827;
      border-bottom: 2px solid #111827;
      padding: 10px 0;
      margin-top: 5px;
    }
    
    .total-row.balance-due {
      font-size: 16px;
      font-weight: 700;
      color: #b91c1c;
      padding: 8px 0;
    }
    
    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div style="display: flex; align-items: center; gap: 15px;">
      <img src="${logoSrc}" alt="logo" style="height: 60px; object-fit: contain;" />
      <div>
        <div class="company-logo" style="color: #bf9f53;">${ar("شركة دليل المعالم", "Daleel Elm3alem")}</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          ${ar("الرقم الضريبي: 300123456700003", "Tax Registration: 300123456700003")}
        </div>
      </div>
    </div>
    <div style="text-align: end;">
      <div class="invoice-title">${ar("فاتورة ضريبية", "Tax Invoice")}</div>
      <div style="font-weight: 600; font-size: 16px; margin-top: 5px;">${x.invoice_number || x.invoice_no}</div>
    </div>
  </div>

  <div class="invoice-details">
    <div class="details-block">
      <h3>${ar("العميل", "Bill To")}</h3>
      <p><span class="strong">${custName}</span></p>
      ${x.customer?.email ? `<p>${ar("البريد الإلكتروني", "Email")}: ${x.customer.email}</p>` : ""}
      ${x.customer?.phone ? `<p>${ar("رقم الهاتف", "Phone")}: ${x.customer.phone}</p>` : ""}
    </div>
    <div class="details-block" style="${dir === "rtl" ? "text-align: left;" : "text-align: right;"}">
      <h3>${ar("تفاصيل الفاتورة", "Invoice Details")}</h3>
      <p><span class="strong">${ar("تاريخ الإصدار", "Issue Date")}:</span> ${formatDate(x.invoice_date, lang)}</p>
      <p><span class="strong">${ar("تاريخ الاستحقاق", "Due Date")}:</span> ${formatDate(x.due_date, lang)}</p>
      <p><span class="strong">${ar("رقم الحجز", "Booking Reference")}:</span> ${x.booking?.booking_no || x.booking_id || "—"}</p>
      <p><span class="strong">${ar("العملة", "Currency")}:</span> ${currencyCode}</p>
      <p><span class="strong">${ar("الحالة", "Status")}:</span> ${x.status_text || x.status}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50px;">#</th>
        <th>${t("inv.item_desc")}</th>
        <th style="text-align: end; width: 80px;">${t("inv.qty")}</th>
        <th style="text-align: end; width: 120px;">${t("inv.unit_price")}</th>
        <th style="text-align: end; width: 100px;">${ar("نسبة الضريبة", "Tax %")}</th>
        <th style="text-align: end; width: 120px;">${t("inv.taxes")}</th>
        <th style="text-align: end; width: 140px;">${t("inv.line_total")}</th>
      </tr>
    </thead>
    <tbody>
      ${itemsListHtml}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="notes-block">
      <h4>${ar("ملاحظات وشروط الدفع", "Notes & Terms")}</h4>
      <p style="margin: 0; white-space: pre-wrap;">${x.notes || ar("شكراً لتعاملكم معنا.", "Thank you for your business.")}</p>
    </div>
    <div class="totals-block">
      <div class="total-row">
        <span>${t("inv.subtotal")}</span>
        <span>${formatMoney(Number(x.subtotal ?? x.sub_total), currencyCode, lang)}</span>
      </div>
      <div class="total-row">
        <span>${ar("خصم مباشر", "Discount")}</span>
        <span>${formatMoney(Number(x.discount), currencyCode, lang)}</span>
      </div>
      <div class="total-row">
        <span>${ar("ضريبة القيمة المضافة", "VAT")}${x.tax_percent ? ` (${x.tax_percent}%)` : ""}</span>
        <span>${formatMoney(Number(x.tax_amount ?? x.taxes), currencyCode, lang)}</span>
      </div>
      <div class="total-row grand-total">
        <span>${ar("الإجمالي", "Grand Total")}</span>
        <span>${formatMoney(Number(x.total_amount), currencyCode, lang)}</span>
      </div>
      ${x.total_amount_sar ? `
      <div class="total-row" style="color: #4b5563; font-size: 13px;">
        <span>${ar("الإجمالي بالريال", "Total (SAR)")}</span>
        <span>${formatMoney(Number(x.total_amount_sar), "SAR", lang)}</span>
      </div>
      ` : ""}
      <div class="total-row">
        <span>${ar("المبلغ المدفوع", "Paid Amount")}</span>
        <span>${formatMoney(Number(x.paid_amount), currencyCode, lang)}</span>
      </div>
      <div class="total-row balance-due">
        <span>${ar("المبلغ المتبقي", "Balance Due")}</span>
        <span>${formatMoney(Number(x.remaining_amount ?? balance), currencyCode, lang)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>${ar("هذه فاتورة ضريبية معتمدة تم إنشاؤها تلقائياً.", "This is a certified tax invoice generated automatically.")}</p>
    <p style="margin-top: 4px; font-size: 10px;">${ar("مجموعة فنادق دليل المعلم - جميع الحقوق محفوظة © 2026", "Daleel Elm3alem Hotels Group - All Rights Reserved © 2026")}</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`);
    w.document.close();
  };

  const invoiceNo = x.invoice_number || x.invoice_no;
  const totalStr = formatMoney(Number(x.total_amount), currencyCode, lang);
  const remainingStr = formatMoney(Number(x.remaining_amount ?? balance), currencyCode, lang);
  const dateStr = formatDate(x.invoice_date, lang);
  const dueDateStr = formatDate(x.due_date, lang);
  const statusStr = x.status_text || t(`invstatus.${x.status}`, x.status);

  // WhatsApp Message
  const waMessage = ar(
    `*فاتورة ضريبية - شركة دليل المعالم*

*رقم الفاتورة:* ${invoiceNo}
*العميل:* ${custName}
*تاريخ الفاتورة:* ${dateStr}
*تاريخ الاستحقاق:* ${dueDateStr}
*إجمالي المبلغ:* ${totalStr}
*المبلغ المدفوع:* ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
*المبلغ المتبقي:* ${remainingStr}
*حالة السداد:* ${statusStr}

شكراً لتعاملكم معنا.`,
    `*Tax Invoice - Daleel Elm3alem*

*Invoice No:* ${invoiceNo}
*Customer:* ${custName}
*Invoice Date:* ${dateStr}
*Due Date:* ${dueDateStr}
*Total Amount:* ${totalStr}
*Paid Amount:* ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
*Balance Due:* ${remainingStr}
*Payment Status:* ${statusStr}

Thank you for your business.`
  );

  // Email Message
  const emailSubject = ar(
    `فاتورة ضريبية رقم ${invoiceNo} - شركة دليل المعالم`,
    `Tax Invoice #${invoiceNo} - Daleel Elm3alem`
  );

  const emailBody = ar(
    `تحية طيبة،

مرفق تفاصيل الفاتورة الضريبية الصادرة لكم من شركة دليل المعالم:

- رقم الفاتورة: ${invoiceNo}
- تاريخ الإصدار: ${dateStr}
- تاريخ الاستحقاق: ${dueDateStr}
- إجمالي قيمة الفاتورة: ${totalStr}
- المبلغ المدفوع: ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
- المبلغ المتبقي: ${remainingStr}
- حالة السداد: ${statusStr}

شكراً لتعاملكم معنا.
شركة دليل المعالم`,
    `Dear Customer,

Please find the details of the tax invoice issued to you by Daleel Elm3alem:

- Invoice Number: ${invoiceNo}
- Issue Date: ${dateStr}
- Due Date: ${dueDateStr}
- Total Amount: ${totalStr}
- Paid Amount: ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
- Balance Due: ${remainingStr}
- Payment Status: ${statusStr}

Thank you for your business.
Daleel Elm3alem`
  );

  const emailHref = `mailto:${x.customer?.email ?? ""}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const waHref = `https://wa.me/${String(x.customer?.phone ?? "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <PageHeader
        title={x.invoice_no}
        subtitle={`${custName} · ${formatMoney(Number(x.total_amount), currencyCode, lang)}`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/invoices")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <Button variant="outline" size="sm" onClick={printInvoice}><Printer className="h-4 w-4" />{t("inv.pdf")}</Button>
            <Button asChild variant="outline" size="sm"><a href={emailHref}><Mail className="h-4 w-4" />{t("inv.send_email")}</a></Button>
            <Button asChild variant="outline" size="sm"><a href={waHref} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" />{t("inv.send_whatsapp")}</a></Button>
            {canWrite && (
              <Button size="sm" onClick={() => {
                setEditStatus(x.status ?? "unpaid");
                setEditNotes(x.notes ?? "");
                setEditInvoiceImage(null);
                setEditOpen(true);
              }}>
                <FileEdit className="h-4 w-4" />
                {lang === "ar" ? "تعديل الحالة" : "Edit Status"}
              </Button>
            )}
            <InvStatusBadge status={x.status} t={t} />
          </div>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            <KV label={ar("رقم الفاتورة", "Invoice Number")} value={x.invoice_number || x.invoice_no} />
            <KV label={t("inv.customer")} value={custName} />
            <KV label={ar("البريد الإلكتروني للعميل", "Customer Email")} value={x.customer?.email} />
            <KV label={ar("هاتف العميل", "Customer Phone")} value={x.customer?.phone} />
            <KV label={t("inv.booking")} value={x.booking?.booking_no || x.booking_id} />
            <KV label={t("inv.date")} value={formatDate(x.invoice_date, lang)} />
            <KV label={t("inv.due_date")} value={formatDate(x.due_date, lang)} />
            <KV label={t("inv.currency")} value={currencyCode} />
            <KV label={t("inv.exchange_rate")} value={x.exchange_rate} />

            <KV label={t("inv.subtotal")} value={formatMoney(Number(x.subtotal ?? x.sub_total), currencyCode, lang)} />
            <KV label={ar("نسبة الضريبة", "Tax Percent")} value={x.tax_percent ? `${x.tax_percent}%` : "0%"} />
            <KV label={t("inv.taxes")} value={formatMoney(Number(x.tax_amount ?? x.taxes), currencyCode, lang)} />
            <KV label={t("inv.discount")} value={formatMoney(Number(x.discount), currencyCode, lang)} />
            <KV label={t("inv.total")} value={<span className="font-bold">{formatMoney(Number(x.total_amount), currencyCode, lang)}</span>} />
            <KV label={ar("الإجمالي بالريال السعودي", "Total Amount (SAR)")} value={formatMoney(Number(x.total_amount_sar ?? 0), "SAR", lang)} />
            <KV label={t("inv.paid")} value={formatMoney(Number(x.paid_amount), currencyCode, lang)} />
            <KV label={t("inv.balance")} value={<span className="font-bold text-destructive">{formatMoney(Number(x.remaining_amount ?? balance), currencyCode, lang)}</span>} />

            <KV label={t("label.status")} value={<InvStatusBadge status={x.status} t={t} />} />
            <KV label={ar("حالة الدفع", "Payment Status")} value={x.status_text || x.status} />
            <KV label={ar("بواسطة", "Created By")} value={x.creator?.name || "—"} />
            {x.cancellation_reason && <KV label={t("inv.cancel_reason")} value={x.cancellation_reason} />}
            {x.notes && <div className="md:col-span-3"><KV label={t("label.notes")} value={<span className="whitespace-pre-wrap">{x.notes}</span>} /></div>}
            {x.invoice_image && (
              <div className="md:col-span-3">
                <KV
                  label={ar("إيصال السداد / صورة الفاتورة", "Payment Receipt / Invoice Image")}
                  value={
                    <a
                      href={x.invoice_image}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      {ar("عرض المستند / الإيصال المرفق", "View Attached Receipt / Document")}
                    </a>
                  }
                />
              </div>
            )}

            {items && items.length > 0 && (
              <div className="md:col-span-3 border-t pt-5 mt-2 space-y-3">
                <h3 className="font-semibold text-sm text-foreground">{ar("بنود الفاتورة", "Invoice Items")}</h3>
                <div className="border rounded-md overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>{ar("البيان", "Description")}</TableHead>
                        <TableHead className="text-end" style={{ width: "80px" }}>{ar("الكمية", "Qty")}</TableHead>
                        <TableHead className="text-end" style={{ width: "120px" }}>{ar("سعر الوحدة", "Unit Price")}</TableHead>
                        <TableHead className="text-end" style={{ width: "140px" }}>{ar("الإجمالي الفرعي", "Subtotal")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((i: any) => (
                        <TableRow key={i.id}>
                          <TableCell className="text-sm font-medium">{lang === "ar" ? i.description_ar || i.description_en || i.description : i.description_en || i.description_ar || i.description}</TableCell>
                          <TableCell className="text-end tabular-nums">{Number(i.quantity)}</TableCell>
                          <TableCell className="text-end tabular-nums">{Number(i.unit_price).toLocaleString()} {currencyCode}</TableCell>
                          <TableCell className="text-end font-semibold tabular-nums">{Number(i.subtotal ?? (Number(i.quantity) * Number(i.unit_price))).toLocaleString()} {currencyCode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Invoice Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "تعديل حالة الفاتورة" : "Edit Invoice Status"} · {x.invoice_number || x.invoice_no}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lang === "ar" ? "العميل" : "Customer"}</Label>
              <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40">
                {custName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{lang === "ar" ? "رقم الحجز" : "Booking Code"}</Label>
                <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40 font-mono">
                  {x.booking_code || x.booking?.code || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}</Label>
                <div className="text-sm font-semibold p-2 bg-muted/30 rounded border border-border/40 tabular-nums">
                  {formatMoney(Number(x.total_amount), currencyCode, lang)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "حالة الفاتورة" : "Invoice Status"}</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{lang === "ar" ? "غير مدفوعة" : "Unpaid"}</SelectItem>
                  <SelectItem value="paid">{lang === "ar" ? "مدفوعة" : "Paid"}</SelectItem>
                  <SelectItem value="cancelled">{lang === "ar" ? "ملغاة" : "Cancelled"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "ملاحظات الدفع / الفاتورة" : "Payment / Invoice Notes"}</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={lang === "ar" ? "اكتب ملاحظات الدفع أو الفاتورة هنا..." : "Write payment or invoice notes here..."}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{lang === "ar" ? "إيصال السداد / صورة الفاتورة (اختياري)" : "Payment Receipt / Invoice Image (Optional)"}</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setEditInvoiceImage(file || null);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={async () => {
              setBusy(true);
              try {
                const formData = new FormData();
                formData.append("_method", "PUT");
                formData.append("status", editStatus);
                formData.append("notes", editNotes || "");
                if (editInvoiceImage) {
                  formData.append("invoice_image", editInvoiceImage);
                }

                await updateInvoiceMutation({ id: id || "", body: formData }).unwrap();
                toast.success(t("label.saved", "Saved successfully"));
                setEditOpen(false);
                refetchInvoice();
              } catch (e: any) {
                toast.error(e.message || t("label.error", "Error"));
              } finally {
                setBusy(false);
              }
            }} disabled={busy}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
