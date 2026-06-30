// Invoice detail — Section 15 (BR-INV). Items, status workflow, payments, sharing, history.
import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation, useRecordInvoicePaymentMutation } from "@/store/api";
import type { InvoiceStatus } from "@/types/api";
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
import { ArrowLeft, Printer, Mail, MessageCircle, Send, BadgeCheck, CreditCard } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { dbErrorMessage } from "@/lib/db-errors";
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

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [itemOpen, setItemOpen] = useState(false);
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [taxes, setTaxes] = useState("0");
  const [fees, setFees] = useState("0");
  const [busy, setBusy] = useState(false);

  // Payment dialog state
  const [payOpen, setPayOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "bank_transfer" | "credit_card" | "cheque" | "other">("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const { data: invoiceData, isLoading: isInvoiceLoading, refetch: refetchInvoice } = useGetInvoiceByIdQuery({ id: id || "", lang });
  const [updateInvoiceMutation] = useUpdateInvoiceMutation();
  const [recordPayment] = useRecordInvoicePaymentMutation();

  const allocsQuery = useQuery({
    queryKey: ["invoice-allocations", id],
    queryFn: async () => {
      const { data } = await db.from("receipt_allocations").select("*, receipt:receipts(receipt_no,receipt_date,payment_method,status)").eq("invoice_id", id || "").order("created_at");
      return data ?? [];
    }
  });

  const refresh = () => {
    refetchInvoice();
    allocsQuery.refetch();
  };

  const setStatus = async (status: InvoiceStatus, extra?: Record<string, unknown>) => {
    setBusy(true);
    try {
      await updateInvoiceMutation({ id: id || "", body: { status, ...extra } }).unwrap();
      toast.success(t("label.saved", "Saved"));
      setCancelOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error(lang === "ar" ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      await recordPayment({
        id: id || "",
        body: {
          payment_date: payDate,
          amount: Number(payAmount),
          payment_method: payMethod,
          transaction_reference: payRef || undefined,
          notes: payNotes || undefined,
        }
      }).unwrap();
      toast.success(lang === "ar" ? "تم تسجيل الدفعة بنجاح" : "Payment recorded successfully");
      setPayOpen(false);
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      setPayMethod("bank_transfer");
      setPayDate(new Date().toISOString().slice(0, 10));
      refetchInvoice();
    } catch (e: any) {
      toast.error(e.message || t("label.error", "Error"));
    } finally {
      setBusy(false);
    }
  };

  const addItem = async () => {
    setBusy(true);
    try {
      const { error } = await db.from("invoice_items").insert({
        invoice_id: id || "", description_en: descEn, description_ar: descAr || null,
        quantity: Number(qty), unit_price: Number(price), taxes: Number(taxes), fees: Number(fees),
      });
      if (error) throw error;
      setItemOpen(false); setDescEn(""); setDescAr(""); setQty("1"); setPrice(""); setTaxes("0"); setFees("0");
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
  };

  const removeItem = async (itemId?: string | number) => {
    if (!itemId) return;
    try {
      await apiClient.invoiceItems.delete(itemId);
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); }
  };

  if (isInvoiceLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  const x = invoiceData;
  if (!x) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;
  const items = invoiceData?.items ?? [];
  const allocs = allocsQuery.data ?? [];
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
            {canWrite && isDraft && <Button size="sm" disabled={busy} onClick={() => setStatus("issued")}><BadgeCheck className="h-4 w-4" />{t("inv.issue")}</Button>}
            {canWrite && x.status === "issued" && <Button size="sm" disabled={busy} onClick={() => setStatus("sent")}><Send className="h-4 w-4" />{t("inv.mark_sent")}</Button>}
            {canWrite && !(["paid", "cancelled"].includes(x.status)) && Number(x.remaining_amount ?? balance) > 0 && (
              <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950" onClick={() => { setPayAmount(String(Number(x.remaining_amount ?? balance))); setPayOpen(true); }}>
                <CreditCard className="h-4 w-4" />
                {lang === "ar" ? "تسجيل دفعة" : "Record Payment"}
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

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("inv.cancel")}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>{t("inv.cancel_reason")}</Label>
            <Textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>{t("actions.back")}</Button>
            <Button variant="destructive" disabled={busy || !cancelReason.trim()} onClick={() => setStatus("cancelled", { cancellation_reason: cancelReason })}>{t("inv.cancel")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent dir={dir}>
          <DialogHeader><DialogTitle>{t("inv.add_item")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2"><Label>{t("inv.item_desc")}</Label><Input value={descEn} onChange={(e) => setDescEn(e.target.value)} /></div>
            <div className="col-span-2 space-y-2"><Label>{t("inv.item_desc_ar")}</Label><Input dir="rtl" value={descAr} onChange={(e) => setDescAr(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("inv.qty")}</Label><Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("inv.unit_price")}</Label><Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("inv.taxes")}</Label><Input type="number" min="0" value={taxes} onChange={(e) => setTaxes(e.target.value)} /></div>
            <div className="space-y-2"><Label>{t("inv.fees")}</Label><Input type="number" min="0" value={fees} onChange={(e) => setFees(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={addItem} disabled={busy || !descEn.trim() || !price}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-md" dir={dir}>
          <DialogHeader>
            <DialogTitle>
              {lang === "ar" ? "تسجيل عملية دفع" : "Record Payment"}
              {" "}·{" "}
              <span className="text-muted-foreground font-normal text-sm">{x.invoice_number || x.invoice_no}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md text-xs">
              <div>
                <div className="text-muted-foreground mb-0.5">{lang === "ar" ? "إجمالي الفاتورة" : "Invoice Total"}</div>
                <div className="font-semibold">{formatMoney(Number(x.total_amount), currencyCode, lang)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">{lang === "ar" ? "المتبقي للسداد" : "Remaining Balance"}</div>
                <div className="font-semibold text-destructive">{formatMoney(Number(x.remaining_amount ?? balance), currencyCode, lang)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{lang === "ar" ? "تاريخ الدفع" : "Payment Date"}</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{lang === "ar" ? "المبلغ المدفوع" : "Amount"} ({currencyCode})</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={Number(x.remaining_amount ?? balance)}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder={`0.00 ${currencyCode}`}
              />
            </div>

            <div className="space-y-2">
              <Label>{lang === "ar" ? "طريقة الدفع" : "Payment Method"}</Label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as typeof payMethod)}>
                <SelectTrigger dir={dir}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{lang === "ar" ? "نقداً" : "Cash"}</SelectItem>
                  <SelectItem value="bank_transfer">{lang === "ar" ? "تحويل بنكي" : "Bank Transfer"}</SelectItem>
                  <SelectItem value="credit_card">{lang === "ar" ? "بطاقة ائتمان" : "Credit Card"}</SelectItem>
                  <SelectItem value="cheque">{lang === "ar" ? "شيك" : "Cheque"}</SelectItem>
                  <SelectItem value="other">{lang === "ar" ? "أخرى" : "Other"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{lang === "ar" ? "رقم المعاملة / المرجع" : "Transaction Reference"} <span className="text-muted-foreground text-xs">({lang === "ar" ? "اختياري" : "Optional"})</span></Label>
              <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="REF-BANK-0000" />
            </div>

            <div className="space-y-2">
              <Label>{lang === "ar" ? "ملاحظات" : "Notes"} <span className="text-muted-foreground text-xs">({lang === "ar" ? "اختياري" : "Optional"})</span></Label>
              <Textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} rows={2} placeholder={lang === "ar" ? "ملاحظات الدفعة..." : "Payment notes..."} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={handleRecordPayment} disabled={busy || !payAmount || Number(payAmount) <= 0} className="bg-green-600 hover:bg-green-700 text-white">
              <CreditCard className="h-4 w-4" />
              {lang === "ar" ? "تسجيل الدفعة" : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
