// Invoice detail — Section 15 (BR-INV). Items, status workflow, payments, sharing, history.
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation, useGetHotelsQuery } from "@/store/api";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule } from "@/lib/auth-utils";
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
import { ArrowLeft, Printer, Mail, MessageCircle, FileEdit, Eye, Share2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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

const getZatcaQrCode = (sellerName: string, taxNumber: string, timestamp: string, totalAmount: number, vatAmount: number) => {
  try {
    const toTlv = (tag: number, value: string) => {
      const valueBytes = new TextEncoder().encode(value);
      const tagByte = tag;
      const lengthByte = valueBytes.length;
      return new Uint8Array([tagByte, lengthByte, ...valueBytes]);
    };

    const tlv1 = toTlv(1, sellerName);
    const tlv2 = toTlv(2, taxNumber);
    const tlv3 = toTlv(3, timestamp);
    const tlv4 = toTlv(4, totalAmount.toFixed(2));
    const tlv5 = toTlv(5, vatAmount.toFixed(2));

    const totalLength = tlv1.length + tlv2.length + tlv3.length + tlv4.length + tlv5.length;
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    [tlv1, tlv2, tlv3, tlv4, tlv5].forEach(arr => {
      combined.set(arr, offset);
      offset += arr.length;
    });

    let binary = "";
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error("Error generating ZATCA QR TLV:", err);
    return "";
  }
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const canWrite = canWriteModule(auth, "invoices");

  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("unpaid");
  const [editNotes, setEditNotes] = useState("");
  const [editInvoiceImage, setEditInvoiceImage] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: invoiceData, isLoading: isInvoiceLoading, refetch: refetchInvoice } = useGetInvoiceByIdQuery({ id: id || "", lang });
  const [updateInvoiceMutation] = useUpdateInvoiceMutation();
  const { data: hotelsData } = useGetHotelsQuery();

  const [isSharing, setIsSharing] = useState(false);

  const hotelsMap = useMemo(() => {
    const map = new Map<string, any>();
    if (Array.isArray(hotelsData)) {
      hotelsData.forEach((h: any) => {
        if (h.id !== undefined && h.id !== null) {
          map.set(String(h.id), h);
        }
      });
    }
    return map;
  }, [hotelsData]);

  const items = useMemo(() => {
    const list: any[] = [...(invoiceData?.items ?? [])];
    if (list.length === 0 && invoiceData?.bookings && Array.isArray(invoiceData.bookings) && invoiceData.bookings.length > 0) {
      invoiceData.bookings.forEach((b: any) => {
        if (b.items && Array.isArray(b.items)) {
          b.items.forEach((item: any) => {
            const hotelIdStr = b.hotel_id !== undefined && b.hotel_id !== null ? String(b.hotel_id) : "";
            const hotel = hotelsMap.get(hotelIdStr);
            const hotelName = lang === "ar"
              ? b.hotel?.name_ar || b.hotel?.name || b.hotel?.name_en || hotel?.name_ar || hotel?.name || hotel?.name_en
              : b.hotel?.name_en || b.hotel?.name || b.hotel?.name_ar || hotel?.name_en || hotel?.name || hotel?.name_ar;
            
            const roomName = lang === "ar" 
              ? item.price?.room?.name_ar || item.price?.room?.name || item.price?.room?.name_en || "غرفة" 
              : item.price?.room?.name_en || item.price?.room?.name || item.price?.room?.name_ar || "Room";
            
            const viewName = lang === "ar" 
              ? item.price?.room?.view || item.price?.view?.name_ar || item.price?.view?.name || item.price?.view?.name_en 
              : item.price?.room?.view || item.price?.view?.name_en || item.price?.view?.name || item.price?.view?.name_ar;
            
            const dateStr = b.check_in && b.check_out ? ` [${formatDate(b.check_in, lang)} ➔ ${formatDate(b.check_out, lang)}]` : "";
            
            const description = `${hotelName ? hotelName + " - " : ""}${roomName}${viewName ? ` (${viewName})` : ""}${dateStr} (${b.code || b.booking_no})`;
            
            list.push({
              id: `booking-item-${item.id}-${b.id}`,
              description,
              quantity: item.room_count || item.rooms || 1,
              unit_price: Number(item.night_price) || 0,
              subtotal: Number(item.subtotal) || 0,
            });
          });
        }
      });
    }
    return list;
  }, [invoiceData?.items, invoiceData?.bookings, lang, hotelsMap]);

  if (isInvoiceLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  const x = invoiceData;
  if (!x) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;
  const allocs: any[] = [];
  const custName = x.customer ? (lang === "ar" ? x.customer.name_ar || x.customer.name_en : x.customer.name_en || x.customer.name_ar) : "—";
  const balance = Number(x.total_amount ?? 0) - Number(x.paid_amount ?? 0);
  const isDraft = x.status === "draft";
  const hasTaxNumber = !!x.customer?.tax_number;
  const currencyCode = typeof x.currency === "object" ? x.currency?.code : (x.currency ?? "SAR");

  const taxPercent = x.tax_percent !== undefined && x.tax_percent !== null ? Number(x.tax_percent) : 15;
  const totalAmt = Number(x.total_amount) || 0;
  const discountAmt = x.discount !== undefined && x.discount !== null ? Number(x.discount) : (x.discount_amount !== undefined && x.discount_amount !== null ? Number(x.discount_amount) : 0);
  const taxAmt = x.tax_amount !== undefined && x.tax_amount !== null ? Number(x.tax_amount) : (x.taxes !== undefined && x.taxes !== null ? Number(x.taxes) : (totalAmt * taxPercent / (100 + taxPercent)));
  const subTotalAmt = x.subtotal !== undefined && x.subtotal !== null ? Number(x.subtotal) : (x.sub_total !== undefined && x.sub_total !== null ? Number(x.sub_total) : (totalAmt - taxAmt));

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const getInvoiceHtmlString = (forPrint: boolean = false) => {
    const logoSrc = window.location.origin + logoUrl;

    let invoiceTimestamp = x.created_at || (x.invoice_date + "T12:00:00Z");
    if (invoiceTimestamp.length === 19 && invoiceTimestamp.includes(" ")) {
      invoiceTimestamp = invoiceTimestamp.replace(" ", "T") + "Z";
    }

    const qrBase64 = getZatcaQrCode(
      "وكالة دليل المعالم لخدمات المعتمرين",
      "310027358600003",
      invoiceTimestamp,
      totalAmt,
      taxAmt
    );
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrBase64)}`;

    let itemsListHtml = "";
    if (items.length > 0) {
      itemsListHtml = items.map((i: any, index: number) => {
        const desc = i.description || (lang === "ar" ? i.description_ar || i.description_en : i.description_en || i.description_ar);
        const totalVal = i.subtotal || i.line_total || i.total_price || (Number(i.quantity) * Number(i.unit_price));
        return `<tr>
          <td style="text-align: center; font-weight: 600;">${index + 1}</td>
          <td>
            <div style="font-weight: 600; color: #1e293b; white-space: pre-wrap;">${desc || "—"}</div>
          </td>
          <td style="text-align: center; font-weight: 600;">${i.quantity}</td>
          <td style="text-align: end; font-family: monospace; font-weight: 600;">${Number(i.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td style="text-align: end; font-family: monospace; font-weight: 700; color: #0f172a;">${Number(totalVal).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        </tr>`;
      }).join("");
    } else {
      itemsListHtml = `<tr>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td>
          <div style="font-weight: 600; color: #1e293b;">${ar("حجز خدمات عامة / فندقية", "General Services / Hotel Booking")} - ${x.invoice_number || x.invoice_no}</div>
        </td>
        <td style="text-align: center; font-weight: 600;">1</td>
        <td style="text-align: end; font-family: monospace; font-weight: 600;">${Number(subTotalAmt).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
        <td style="text-align: end; font-family: monospace; font-weight: 700; color: #0f172a;">${Number(x.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
      </tr>`;
    }

    return `<!doctype html>
<html dir="${dir}">
<head>
  <meta charset="utf-8">
  <title>${x.invoice_number || x.invoice_no}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Cairo', 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 30px;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.6;
    }
    
    .invoice-title {
      text-align: center;
      margin: 25px 0;
      font-size: 22px;
      font-weight: 700;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      color: #0f172a;
      text-transform: uppercase;
    }
    
    table.items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    table.items-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      padding: 12px 14px;
      font-size: 14px;
      border-bottom: 2px solid #cbd5e1;
      text-align: start;
    }

    table.items-table th.center {
      text-align: center;
    }

    table.items-table th.end {
      text-align: end;
    }
    
    table.items-table td {
      padding: 12px 14px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    
    table.items-table tr:last-child td {
      border-bottom: none;
    }
    
    @media print {
      body {
        padding: 0;
        margin: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page {
        size: A4;
        margin: 1cm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Header Section -->
  <div class="invoice-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 25px;">
    <!-- Left Side: Logo & Company Name -->
    <div style="display: flex; align-items: center; gap: 15px; width: 45%;">
      <img src="${logoSrc}" alt="logo" style="height: 70px; object-fit: contain;" />
      <div>
        <div style="font-size: 18px; font-weight: 700; color: #bf9f53;">وكالة دليل المعالم لخدمات المعتمرين</div>
        <div style="font-size: 13px; font-weight: 600; color: #4b5563; margin-top: 2px;">Daleel Almaalem for Umra Services</div>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">الرقم الضريبي / Tax ID: 310027358600003</div>
      </div>
    </div>

    <!-- Center: QR Code -->
    <div style="display: flex; justify-content: center; align-items: center; width: 20%;">
      <img src="${qrUrl}" alt="QR Code" style="height: 90px; width: 90px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 4px;" />
    </div>

    <!-- Right Side: Invoice Info Table -->
    <div style="width: 35%; display: flex; justify-content: flex-end;">
      <table style="width: 100%; font-size: 12px; border-collapse: collapse; text-align: start;">
        <tr>
          <td style="font-weight: 600; padding: 3px 6px; color: #64748b;">Issue Date</td>
          <td style="padding: 3px 6px; text-align: center; font-weight: 700; color: #1e293b;">${formatDate(x.invoice_date, "en")}</td>
          <td style="font-weight: 600; padding: 3px 6px; text-align: end; color: #64748b;">تاريخ الإصدار</td>
        </tr>
        <tr>
          <td style="font-weight: 600; padding: 3px 6px; color: #64748b;">${isDraft ? 'Draft Invoice' : (hasTaxNumber ? 'Tax Invoice' : 'Simplified Tax Invoice')}</td>
          <td style="padding: 3px 6px; text-align: center; font-weight: 700; color: #bf9f53;">${x.invoice_number || x.invoice_no}</td>
          <td style="font-weight: 600; padding: 3px 6px; text-align: end; color: #64748b;">${isDraft ? 'فاتورة أولية' : (hasTaxNumber ? 'فاتورة ضريبية' : 'فاتورة ضريبية مبسطة')}</td>
        </tr>
        <tr>
          <td style="font-weight: 600; padding: 3px 6px; color: #64748b;">Due Date</td>
          <td style="padding: 3px 6px; text-align: center; font-weight: 700; color: #1e293b;">${formatDate(x.due_date, "en")}</td>
          <td style="font-weight: 600; padding: 3px 6px; text-align: end; color: #64748b;">تاريخ الاستحقاق</td>
        </tr>
        <tr>
          <td style="font-weight: 600; padding: 3px 6px; color: #64748b;">Payment method</td>
          <td style="padding: 3px 6px; text-align: center; font-weight: 700; color: #047857;">${x.booking?.payment_method_text || x.payment_method_text || ar("نقداً", "Cash")}</td>
          <td style="font-weight: 600; padding: 3px 6px; text-align: end; color: #64748b;">طريقة الدفع</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Title Center -->
  <div class="invoice-title">
    ${x.status === 'draft' 
      ? ar('فاتورة أولية / Draft Invoice', 'Draft Invoice') 
      : hasTaxNumber 
        ? ar('فاتورة ضريبية / Tax Invoice', 'Tax Invoice') 
        : ar('فاتورة ضريبية مبسطة / Simplified Tax Invoice', 'Simplified Tax Invoice')}
  </div>

  <!-- Info Section (Buyer / Seller) -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
    <!-- Customer (Issue To) -->
    <div style="width: 48%;">
      <div style="font-weight: 700; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 8px;">
        صادرة إلى Issue To
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 3px 0; width: 100px; font-weight: 600;">Name:</td>
          <td style="color: #0f172a; padding: 3px 0; font-weight: 700;">${custName}</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600; width: 100px;">الاسم:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">VAT Number:</td>
          <td style="color: #0f172a; padding: 3px 0; font-weight: 600;">${x.customer?.tax_number || "—"}</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">الرقم الضريبي:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">Address:</td>
          <td style="color: #0f172a; padding: 3px 0;">${x.customer?.address || x.customer?.country?.name || "—"}</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">العنوان:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">CR Number:</td>
          <td style="color: #0f172a; padding: 3px 0;">${x.customer?.commercial_register || "—"}</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">السجل التجاري:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">Email:</td>
          <td style="color: #0f172a; padding: 3px 0;">${x.customer?.email || "—"}</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">البريد الإلكتروني:</td>
        </tr>
      </table>
    </div>

    <!-- Seller (Issue By) -->
    <div style="width: 48%;">
      <div style="font-weight: 700; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 8px;">
        صادرة من Issue By
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #64748b; padding: 3px 0; width: 100px; font-weight: 600;">Name:</td>
          <td style="color: #0f172a; padding: 3px 0; font-weight: 700;">وكالة دليل المعالم لخدمات المعتمرين</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600; width: 100px;">الاسم:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">VAT Number:</td>
          <td style="color: #0f172a; padding: 3px 0; font-weight: 600;">310027358600003</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">الرقم الضريبي:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">Address:</td>
          <td style="color: #0f172a; padding: 3px 0;">3190 شارع قريش، حي السلامة 6173 - 23524</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">العنوان:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">CR Number:</td>
          <td style="color: #0f172a; padding: 3px 0;">4030296935</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">السجل التجاري:</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 3px 0; font-weight: 600;">Email:</td>
          <td style="color: #0f172a; padding: 3px 0;">info@daleel-alm3alem.com</td>
          <td style="color: #64748b; padding: 3px 0; text-align: end; font-weight: 600;">البريد الإلكتروني:</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 40px; text-align: center;">#</th>
        <th>الوصف Item</th>
        <th style="width: 80px; text-align: center;">العدد Qty</th>
        <th style="width: 120px; text-align: end;">السعر Price</th>
        <th style="width: 140px; text-align: end;">الإجمالي Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsListHtml}
    </tbody>
  </table>

  <!-- Totals Section -->
  <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
    <div style="width: 320px;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr style="border-bottom: 1px dashed #cbd5e1;">
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">المجموع Sub Total</td>
          <td style="padding: 6px 0; text-align: end; font-family: monospace; font-weight: 700; color: #334155;">
            ${Number(subTotalAmt).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </td>
        </tr>
        ${discountAmt > 0 ? `
        <tr style="border-bottom: 1px dashed #cbd5e1;">
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">الخصم Discount</td>
          <td style="padding: 6px 0; text-align: end; font-family: monospace; font-weight: 700; color: #e11d48;">
            -${discountAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </td>
        </tr>` : ""}
        <tr style="border-bottom: 1px dashed #cbd5e1;">
          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">ضريبة القيمة المضافة VAT (15%)</td>
          <td style="padding: 6px 0; text-align: end; font-family: monospace; font-weight: 700; color: #334155;">
            ${Number(taxAmt).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </td>
        </tr>
        <tr style="border-top: 2px solid #1e293b; border-bottom: 2px solid #1e293b; font-size: 16px;">
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">الإجمالي Total</td>
          <td style="padding: 8px 0; text-align: end; font-family: monospace; font-weight: 800; color: #0f172a;">
            ${Number(x.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currencyCode}
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Bank Details Section -->
  <div style="margin-top: 35px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
    <div style="text-align: center; font-weight: 700; color: #0f172a; margin-bottom: 12px; font-size: 14px;">معلومات البنك / Bank Details</div>
    <table style="width: 80%; margin: 0 auto; font-size: 13px; border-collapse: collapse;">
      <tr style="border-bottom: 1px dashed #cbd5e1;">
        <td style="color: #64748b; font-weight: 600; padding: 6px 0; width: 120px;">Bank Name</td>
        <td style="color: #1e293b; font-weight: 700; padding: 6px 0; text-align: center;">بنك الرياض</td>
        <td style="color: #64748b; font-weight: 600; padding: 6px 0; text-align: end; width: 120px;">اسم البنك</td>
      </tr>
      <tr style="border-bottom: 1px dashed #cbd5e1;">
        <td style="color: #64748b; font-weight: 600; padding: 6px 0;">Account Name</td>
        <td style="color: #1e293b; font-weight: 700; padding: 6px 0; text-align: center;">وكالة دليل المعالم لخدمات المعتمرين</td>
        <td style="color: #64748b; font-weight: 600; padding: 6px 0; text-align: end;">اسم الحساب</td>
      </tr>
      <tr style="border-bottom: 1px dashed #cbd5e1;">
        <td style="color: #64748b; font-weight: 600; padding: 6px 0;">Swift Code</td>
        <td style="color: #1e293b; font-weight: 700; padding: 6px 0; text-align: center; font-family: monospace;">RIBLSARI</td>
        <td style="color: #64748b; font-weight: 600; padding: 6px 0; text-align: end;">رمز سويفت</td>
      </tr>
      <tr>
        <td style="color: #64748b; font-weight: 600; padding: 6px 0;">IBAN Number</td>
        <td style="color: #1e293b; font-weight: 700; padding: 6px 0; text-align: center; font-family: monospace;">SA5320000001901068649940</td>
        <td style="color: #64748b; font-weight: 600; padding: 6px 0; text-align: end;">رقم الحساب آيبان</td>
      </tr>
    </table>
  </div>

  <!-- Signature Section -->
  <div style="margin-top: 40px; display: flex; justify-content: flex-end; padding-right: 30px;">
    <div style="text-align: center; width: 200px;">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 35px; font-size: 14px;">التوقيع / Signature</div>
      <div style="border-bottom: 1px dashed #94a3b8; width: 100%;"></div>
    </div>
  </div>

  ${forPrint ? `<script>
    window.onload = function() {
      window.print();
    }
  </script>` : ''}
</body>
</html>`;
  };

  const printInvoice = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(getInvoiceHtmlString(true));
    w.document.close();
  };

  const shareInvoicePdf = async () => {
    setIsSharing(true);
    try {
      const htmlStr = getInvoiceHtmlString(false);
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);
      
      const idoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!idoc) throw new Error("Could not create iframe document");
      
      idoc.open();
      idoc.write(htmlStr);
      idoc.close();

      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(idoc.body, { 
        scale: 2, 
        useCORS: true,
        windowWidth: idoc.body.scrollWidth,
        windowHeight: idoc.body.scrollHeight
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      document.body.removeChild(iframe);

      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `invoice-${x.invoice_number || x.invoice_no}.pdf`, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${x.invoice_number || x.invoice_no}`,
          text: ar(`مرفق الفاتورة رقم ${x.invoice_number || x.invoice_no}`, `Attached is invoice ${x.invoice_number || x.invoice_no}`)
        });
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.info(ar('تم تنزيل الفاتورة لأنه لا يمكن مشاركتها مباشرة على هذا الجهاز.', 'Invoice downloaded as sharing is not supported on this device.'));
      }
    } catch (e: any) {
      console.error(e);
      toast.error(ar("خطأ في إنشاء ملف PDF", "Error generating PDF"));
    } finally {
      setIsSharing(false);
    }
  };

  const invoiceNo = x.invoice_number || x.invoice_no;
  const totalStr = formatMoney(Number(x.total_amount), currencyCode, lang);
  const remainingStr = formatMoney(Number(x.remaining_amount ?? balance), currencyCode, lang);
  const dateStr = formatDate(x.invoice_date, lang);
  const dueDateStr = formatDate(x.due_date, lang);
  const statusStr = x.status_text || t(`invstatus.${x.status}`, x.status);

  // WhatsApp Message
  const waMessage = ar(
    `*${hasTaxNumber ? 'فاتورة ضريبية' : 'فاتورة ضريبية مبسطة'} - شركة دليل المعالم*

*رقم الفاتورة:* ${invoiceNo}
*العميل:* ${custName}
*تاريخ الفاتورة:* ${dateStr}
*تاريخ الاستحقاق:* ${dueDateStr}
*إجمالي المبلغ:* ${totalStr}
*المبلغ المدفوع:* ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
*المبلغ المتبقي:* ${remainingStr}
*حالة السداد:* ${statusStr}

*رابط عرض الفاتورة وطباعتها:* ${window.location.href}

شكراً لتعاملكم معنا.`,
    `*${hasTaxNumber ? 'Tax Invoice' : 'Simplified Tax Invoice'} - Daleel Elm3alem*

*Invoice No:* ${invoiceNo}
*Customer:* ${custName}
*Invoice Date:* ${dateStr}
*Due Date:* ${dueDateStr}
*Total Amount:* ${totalStr}
*Paid Amount:* ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
*Balance Due:* ${remainingStr}
*Payment Status:* ${statusStr}

*Link to view and print invoice:* ${window.location.href}

Thank you for your business.`
  );

  // Email Message
  const emailSubject = ar(
    `${hasTaxNumber ? 'فاتورة ضريبية' : 'فاتورة ضريبية مبسطة'} رقم ${invoiceNo} - شركة دليل المعالم`,
    `${hasTaxNumber ? 'Tax Invoice' : 'Simplified Tax Invoice'} #${invoiceNo} - Daleel Elm3alem`
  );

  const emailBody = ar(
    `تحية طيبة،

مرفق تفاصيل ${hasTaxNumber ? 'الفاتورة الضريبية' : 'الفاتورة الضريبية المبسطة'} الصادرة لكم من شركة دليل المعالم:

- رقم الفاتورة: ${invoiceNo}
- تاريخ الإصدار: ${dateStr}
- تاريخ الاستحقاق: ${dueDateStr}
- إجمالي قيمة الفاتورة: ${totalStr}
- المبلغ المدفوع: ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
- المبلغ المتبقي: ${remainingStr}
- حالة السداد: ${statusStr}

يمكنكم عرض الفاتورة وطباعتها بصيغة PDF عبر الرابط التالي:
${window.location.href}

شكراً لتعاملكم معنا.
شركة دليل المعالم`,
    `Dear Customer,

Please find the details of the ${hasTaxNumber ? 'tax invoice' : 'simplified tax invoice'} issued to you by Daleel Elm3alem:

- Invoice Number: ${invoiceNo}
- Issue Date: ${dateStr}
- Due Date: ${dueDateStr}
- Total Amount: ${totalStr}
- Paid Amount: ${formatMoney(Number(x.paid_amount), currencyCode, lang)}
- Balance Due: ${remainingStr}
- Payment Status: ${statusStr}

You can view and print the PDF invoice online using the following link:
${window.location.href}

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
            <Button variant="outline" size="sm" onClick={shareInvoicePdf} disabled={isSharing}>
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {lang === "ar" ? "مشاركة الـ PDF" : "Share PDF"}
            </Button>
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
            <KV
              label={t("inv.booking")}
              value={
                x.bookings && x.bookings.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {x.bookings.map((b: any) => (
                      <Link
                        key={b.id}
                        to={`/bookings/${b.id}`}
                        className="text-primary hover:underline font-mono text-xs bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                      >
                        {b.code || b.booking_no}
                      </Link>
                    ))}
                  </div>
                ) : (
                  x.booking_code || "—"
                )
              }
            />
            <KV label={t("inv.date")} value={formatDate(x.invoice_date, lang)} />
            <KV label={t("inv.due_date")} value={formatDate(x.due_date, lang)} />
            <KV label={t("inv.currency")} value={currencyCode} />
            <KV label={t("inv.exchange_rate")} value={x.exchange_rate} />

            <KV label={t("inv.subtotal")} value={formatMoney(subTotalAmt, currencyCode, lang)} />
            <KV label={ar("نسبة الضريبة", "Tax Percent")} value={`${taxPercent}%`} />
            <KV label={t("inv.taxes")} value={formatMoney(taxAmt, currencyCode, lang)} />
            <KV label={t("inv.discount")} value={formatMoney(discountAmt, currencyCode, lang)} />
            <KV label={t("inv.total")} value={<span className="font-bold">{formatMoney(totalAmt, currencyCode, lang)}</span>} />
            <KV label={ar("الإجمالي بالريال السعودي", "Total Amount (SAR)")} value={formatMoney(Number(x.total_amount_sar ?? 0), "SAR", lang)} />
            <KV label={t("inv.paid")} value={formatMoney(Number(x.paid_amount ?? 0), currencyCode, lang)} />
            <KV label={t("inv.balance")} value={<span className="font-bold text-destructive">{formatMoney(Number(x.remaining_amount ?? balance ?? 0), currencyCode, lang)}</span>} />

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
