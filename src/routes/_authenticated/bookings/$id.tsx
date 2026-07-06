import { useNavigate,  useParams } from "react-router-dom";
import { useState, useRef } from "react";
import { useGetBookingByIdQuery, useUpdateBookingMutation } from "@/store/api";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule, canApproveModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ArrowLeft, Pencil, Send, Check, Undo2, LogIn, LogOut, Ban, UserX,
  Printer, Building2, User, CalendarDays, BedDouble, Wallet, Receipt,
  CreditCard, Phone, Mail, MapPin, FileText, Clock, CheckCircle2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { useBookingRooms } from "./-rooms";
import { BkStatusBadge, BK_WRITE_ROLES } from "./index";
import { BookingForm } from "./-form";



// ─────────────────────────────────────────────────────────────────────────────
// KV display component
// ─────────────────────────────────────────────────────────────────────────────
function KV({ k, v, icon: Icon }: { k: string; v: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{k}</span>
      </div>
      <span className="text-sm font-semibold text-foreground mt-0.5">{v ?? "—"}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header for detail cards
// ─────────────────────────────────────────────────────────────────────────────
function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-muted/30 border-b border-border/40">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment progress bar
// ─────────────────────────────────────────────────────────────────────────────
function PaymentProgress({
  total,
  paid,
  currency,
  lang,
}: {
  total: number;
  paid: number;
  currency: string;
  lang: string;
}) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  const remaining = Math.max(total - paid, 0);
  const fmt = (v: number) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
            {lang === "ar" ? "الإجمالي" : "Total"}
          </p>
          <p className="text-sm font-bold text-blue-700 dark:text-blue-300 tabular-nums">
            {fmt(total)} {currency}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            {lang === "ar" ? "المدفوع" : "Paid"}
          </p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {fmt(paid)} {currency}
          </p>
        </div>
        <div className={`rounded-lg border p-3 text-center ${remaining > 0 ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"}`}>
          <p className={`text-xs font-medium mb-1 ${remaining > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {lang === "ar" ? "المتبقي" : "Remaining"}
          </p>
          <p className={`text-sm font-bold tabular-nums ${remaining > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>
            {remaining > 0 ? fmt(remaining) : (lang === "ar" ? "مدفوع" : "Paid")} {remaining > 0 ? currency : "✓"}
          </p>
        </div>
      </div>
      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{lang === "ar" ? "نسبة السداد" : "Payment Progress"}</span>
            <span className="font-medium tabular-nums">{Math.round(pct)}%</span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Print Invoice Component
// ─────────────────────────────────────────────────────────────────────────────
function PrintInvoice({
  booking,
  rooms,
  lang,
}: {
  booking: any;
  rooms: any[];
  lang: string;
}) {
  const { t } = useI18n();
  const ar = (a: string, e: string) => (lang === "ar" ? a : e);
  const customerName =
    lang === "ar"
      ? booking.customer?.name_ar || booking.customer?.name_en
      : booking.customer?.name_en || booking.customer?.name_ar;

  const currency = typeof booking.currency === "object" ? booking.currency?.code : (booking.currency || "SAR");

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);

  const total = Number(booking.total_amount) || rooms.reduce((s: number, r: any) => s + Number(r.total_selling), 0);
  const paid = Number(booking.amount_paid) || 0;
  const remaining = Math.max(total - paid, 0);
  const nights = booking.check_in && booking.check_out
    ? Math.max((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000, 0)
    : null;

  return (
    <div
      id="booking-invoice-print"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        fontFamily: lang === "ar" ? "'Cairo', 'Arial', sans-serif" : "'Inter', 'Arial', sans-serif",
        color: "#1a1a2e",
        background: "#fff",
        maxWidth: "210mm",
        margin: "0 auto",
        padding: "12mm 14mm",
        minHeight: "297mm",
        boxSizing: "border-box",
      }}
    > 
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8mm", paddingBottom: "5mm", borderBottom: "2px solid #b5862b" }}>
        <div>
          <div style={{ fontSize: "18pt", fontWeight: "bold", color: "#7c5e14", marginBottom: "2mm" }}>
            {ar("شركة دليل المعالم للحج والعمرة", "Daleel Almaalem Hajj & Umrah Co.")}
          </div>
          <div style={{ fontSize: "9pt", color: "#666", lineHeight: 1.6 }}>
            {ar("نظام إدارة الحجوزات الفندقية", "Hotel Booking Management System")}
          </div>
        </div>
        <div style={{ textAlign: lang === "ar" ? "left" : "right" }}>
          <div style={{ fontSize: "18pt", fontWeight: "bold", color: "#1a1a2e" }}>
            {ar("تأكيد الحجز", "Booking Confirmation")}
          </div>
          <div style={{ fontSize: "10pt", color: "#444", marginTop: "1mm" }}>
            <span style={{ fontWeight: "bold" }}>
              {ar("رقم الحجز: ", "Booking No: ")}
            </span>
            <span dir="ltr" style={{ fontFamily: "monospace", fontSize: "11pt", color: "#7c5e14" }}>
              {booking.booking_no}
            </span>
          </div>
          <div style={{ fontSize: "9pt", color: "#888", marginTop: "1mm" }}>
            {ar("تاريخ الإصدار: ", "Issue Date: ")}{new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")}
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ display: "flex", gap: "8mm", marginBottom: "6mm" }}>
        <div style={{
          padding: "1.5mm 4mm",
          borderRadius: "4px",
          background: ["confirmed", "checked_in", "checked_out"].includes(booking.status) ? "#d1fae5" : ["cancelled", "no_show"].includes(booking.status) ? "#fee2e2" : "#fef3c7",
          border: `1px solid ${["confirmed", "checked_in", "checked_out"].includes(booking.status) ? "#6ee7b7" : ["cancelled", "no_show"].includes(booking.status) ? "#fca5a5" : "#fcd34d"}`,
          color: ["confirmed", "checked_in", "checked_out"].includes(booking.status) ? "#065f46" : ["cancelled", "no_show"].includes(booking.status) ? "#991b1b" : "#92400e",
          fontSize: "9pt",
          fontWeight: "bold"
        }}>
          {ar(`الحالة: ${t(`bkstatus.${booking.status}`)}`, `Status: ${t(`bkstatus.${booking.status}`)}`)}
        </div>
        <div style={{ padding: "1.5mm 4mm", borderRadius: "4px", background: "#e0e7ff", border: "1px solid #c7d2fe", color: "#3730a3", fontSize: "9pt", fontWeight: "bold" }}>
          {ar(`العملة: ${currency}`, `Currency: ${currency}`)}
        </div>
      </div>

      {/* Two columns: Customer + Booking Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6mm", marginBottom: "6mm" }}>
        {/* Customer info */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ background: "#f8f4ed", borderBottom: "1px solid #e5e7eb", padding: "2mm 4mm", fontSize: "9pt", fontWeight: "bold", color: "#7c5e14" }}>
            {ar("بيانات العميل", "Customer Information")}
          </div>
          <div style={{ padding: "3mm 4mm", fontSize: "9pt", lineHeight: 2 }}>
            <div><strong>{ar("الاسم:", "Name:")}</strong> {customerName}</div>
            <div><strong>{ar("نوع العميل:", "Type:")}</strong> {booking.customer?.customer_type}</div>
            {booking.customer?.phone && <div><strong>{ar("الهاتف:", "Phone:")}</strong> {booking.customer.phone}</div>}
            {booking.customer?.email && <div><strong>{ar("البريد:", "Email:")}</strong> {booking.customer.email}</div>}
          </div>
        </div>

        {/* Booking dates */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ background: "#f8f4ed", borderBottom: "1px solid #e5e7eb", padding: "2mm 4mm", fontSize: "9pt", fontWeight: "bold", color: "#7c5e14" }}>
            {ar("تفاصيل الحجز", "Booking Details")}
          </div>
          <div style={{ padding: "3mm 4mm", fontSize: "9pt", lineHeight: 2 }}>
            <div><strong>{ar("تاريخ الحجز:", "Booking Date:")}</strong> {formatDate(booking.booking_date)}</div>
            {booking.check_in && <div><strong>{ar("الوصول:", "Check-in:")}</strong> {formatDate(booking.check_in)}</div>}
            {booking.check_out && <div><strong>{ar("المغادرة:", "Check-out:")}</strong> {formatDate(booking.check_out)}</div>}
            {nights != null && nights > 0 && <div><strong>{ar("عدد الليالي:", "Nights:")}</strong> {nights}</div>}
            {booking.rooms && <div><strong>{ar("عدد الغرف:", "Rooms:")}</strong> {booking.rooms}</div>}
          </div>
        </div>
      </div>

      {/* Hotel & Room */}
      {(booking.hotel_id || rooms.length > 0 || (booking.items && booking.items.length > 0)) && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "6mm" }}>
          <div style={{ background: "#f8f4ed", borderBottom: "1px solid #e5e7eb", padding: "2mm 4mm", fontSize: "9pt", fontWeight: "bold", color: "#7c5e14" }}>
            {ar("تفاصيل الغرفة والفندق", "Hotel & Room Details")}
          </div>
          {(rooms.length > 0 || (booking.items && booking.items.length > 0)) ? (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {[ar("الفندق", "Hotel"), ar("نوع الغرفة", "Room Type"), ar("الوصول", "Check-in"), ar("المغادرة", "Check-out"), ar("الليالي", "Nights"), ar("الغرف", "Rooms"), ar("سعر الليلة", "Rate/Night"), ar("الإجمالي", "Subtotal")].map((h, i) => (
                      <th key={i} style={{ padding: "2mm 3mm", textAlign: lang === "ar" ? "right" : "left", borderBottom: "1px solid #e5e7eb", fontWeight: "600", color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {((booking.items && booking.items.length > 0) ? booking.items : rooms).map((room: any, i: number) => {
                    const isItem = !!room.price;
                    const hotelName = isItem ? (lang === "ar" ? booking.hotel?.name_ar : booking.hotel?.name_en) : (lang === "ar" ? room.hotel?.name_ar || room.hotel?.name_en : room.hotel?.name_en || room.hotel?.name_ar);
                    const roomTypeName = isItem ? (lang === "ar" ? room.price?.room?.name_ar || room.price?.room?.name || room.price?.room?.name_en : room.price?.room?.name_en || room.price?.room?.name || room.price?.room?.name_ar) : (lang === "ar" ? room.room_type?.name_ar || room.room_type?.name || room.room_type?.name_en : room.room_type?.name_en || room.room_type?.name || room.room_type?.name_ar);
                    const viewName = isItem ? (room.price?.room?.view || room.price?.view?.name_ar || room.price?.view?.name || room.price?.view?.name_en) : (lang === "ar" ? room.view?.name_ar || room.view?.name || room.view?.name_en : room.view?.name_en || room.view?.name || room.view?.name_ar);
                    const roomCheckIn = isItem ? formatDate(booking.check_in) : formatDate(room.check_in);
                    const roomCheckOut = isItem ? formatDate(booking.check_out) : formatDate(room.check_out);
                    const roomNights = isItem ? booking.nights : room.nights;
                    const roomCount = isItem ? room.room_count : room.rooms;
                    const ratePerNight = isItem ? (room.night_price || room.price?.selling_price || 0) : (room.selling_price || 0);
                    const subtotal = isItem ? (room.subtotal || ratePerNight * roomCount * roomNights) : (room.total_selling || ratePerNight * roomCount * roomNights);

                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "2mm 3mm" }}>{hotelName ?? "—"}</td>
                        <td style={{ padding: "2mm 3mm" }}>{roomTypeName ?? "—"} {viewName ? `(${viewName})` : ""}</td>
                        <td style={{ padding: "2mm 3mm", direction: "ltr" }}>{roomCheckIn}</td>
                        <td style={{ padding: "2mm 3mm", direction: "ltr" }}>{roomCheckOut}</td>
                        <td style={{ padding: "2mm 3mm", textAlign: "center" }}>{roomNights}</td>
                        <td style={{ padding: "2mm 3mm", textAlign: "center" }}>{roomCount}</td>
                        <td style={{ padding: "2mm 3mm", textAlign: lang === "ar" ? "left" : "right" }}>{fmt(ratePerNight)} {currency}</td>
                        <td style={{ padding: "2mm 3mm", textAlign: lang === "ar" ? "left" : "right", fontWeight: "bold" }}>{fmt(subtotal)} {currency}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4mm", marginBottom: "4mm" }}>
                <div style={{ width: "65mm", fontSize: "8.5pt", lineHeight: 2, border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 3mm", borderBottom: "1px solid #f3f4f6" }}>
                    <span>{ar("المبلغ الإجمالي:", "Total Amount:")}</span>
                    <span style={{ fontWeight: "bold" }}>{fmt(total)} {currency}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 3mm", borderBottom: "1px solid #f3f4f6", color: "#10b981" }}>
                    <span>{ar("المبلغ المدفوع:", "Amount Paid:")}</span>
                    <span style={{ fontWeight: "bold" }}>{fmt(paid)} {currency}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "1.5mm 3mm", background: remaining > 0 ? "#fee2e2" : "#d1fae5", color: remaining > 0 ? "#b91c1c" : "#047857" }}>
                    <span>{ar("المبلغ المتبقي:", "Remaining:")}</span>
                    <span style={{ fontWeight: "bold" }}>{fmt(remaining)} {currency}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "3mm 4mm", fontSize: "9pt", lineHeight: 2 }}>
              {booking.room_type_id && <div><strong>{ar("نوع الغرفة:", "Room Type:")}</strong> {booking.room_type_id}</div>}
              {booking.occupancy_type && <div><strong>{ar("نوع الإشغال:", "Occupancy:")}</strong> {booking.occupancy_type}</div>}
              {booking.room_rate && <div><strong>{ar("سعر الغرفة/ليلة:", "Rate/Night:")}</strong> {fmt(booking.room_rate)} {currency}</div>}
            </div>
          )}
        </div>
      )}

      {/* Note: Payment summary hidden from booking confirmation */}
      {/* Notes */}
      {(booking.special_requests || booking.notes) && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "3mm 4mm", marginBottom: "6mm", fontSize: "8.5pt", color: "#374151" }}>
          <div style={{ fontWeight: "bold", marginBottom: "1.5mm", color: "#7c5e14" }}>{ar("ملاحظات:", "Notes:")}</div>
          {booking.special_requests && <div>{ar("طلبات خاصة: ", "Special requests: ")}{booking.special_requests}</div>}
          {booking.notes && <div>{ar("ملاحظات: ", "Notes: ")}{booking.notes}</div>}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "4mm", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontSize: "7.5pt", color: "#9ca3af" }}>
          <div>{ar("هذه الوثيقة تمثل تأكيد الحجز الرسمي", "This document represents the official booking confirmation")}</div>
          <div>{ar("شركة دليل المعالم للحج والعمرة — جميع الحقوق محفوظة", "Daleel Almaalem Hajj & Umrah Co. — All rights reserved")}</div>
        </div>
        <div style={{ textAlign: lang === "ar" ? "left" : "right", fontSize: "8pt", color: "#374151" }}>
          <div style={{ fontWeight: "bold", marginBottom: "6mm", borderBottom: "1px solid #9ca3af", paddingBottom: "4mm", width: "40mm" }} />
          <div>{ar("التوقيع المعتمد", "Authorized Signature")}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BookingDetail Component
// ─────────────────────────────────────────────────────────────────────────────
export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const canWrite = canWriteModule(auth, "bookings");
  const canManage = canApproveModule(auth, "bookings");
  const { search } = window.location;
  const hasEditParam = new URLSearchParams(search).get("edit") === "true";
  const [editing, setEditing] = useState(hasEditParam);
  const [showInvoice, setShowInvoice] = useState(false);
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const handleUpdateStatus = async (status: string, notes?: string) => {
    try {
      await updateBooking({
        id: id || "",
        body: {
          status: status as any,
          notes: notes || undefined,
        },
      }).unwrap();
      toast.success(
        status === "cancelled"
          ? ar("تم إلغاء الحجز بنجاح", "Booking cancelled successfully")
          : ar("تم تأكيد الحجز بنجاح", "Booking confirmed successfully")
      );
      setShowCancelDialog(false);
      setShowConfirmDialog(false);
      setCancelReason("");
    } catch (err: any) {
      toast.error(err?.data?.message || ar("حدث خطأ أثناء تحديث حالة الحجز", "Failed to update booking status"));
    }
  };

  const b = useGetBookingByIdQuery({ id: id || "", lang });
  const rooms = useBookingRooms(id || "");





  // Print handler
  const handlePrint = () => {
    const printEl = document.getElementById("booking-invoice-print");
    if (!printEl) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html dir="${lang === "ar" ? "rtl" : "ltr"}" lang="${lang}">
      <head>
        <meta charset="UTF-8"/>
        <title>${ar("فاتورة حجز", "Booking Invoice")} — ${b.data?.booking_no ?? ""}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4; margin: 0; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${printEl.outerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  if (b.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!b.data) return <div className="p-6 text-muted-foreground">{t("bk.no_found")}</div>;

  const r = b.data as any;
  const customerName =
    lang === "ar"
      ? r.customer?.name_ar || r.customer?.name_en
      : r.customer?.name_en || r.customer?.name_ar;
  const currencyCode = typeof r.currency === "object" ? r.currency?.code : (r.currency || "SAR");
  const hotelName =
    lang === "ar"
      ? r.hotel?.name_ar || r.hotel?.name || r.hotel?.name_en
      : r.hotel?.name_en || r.hotel?.name || r.hotel?.name_ar;
  const roomTypeName =
    lang === "ar"
      ? r.room_type?.name_ar || r.room_type?.name || r.room_type?.name_en || r.items?.[0]?.price?.room?.name
      : r.room_type?.name_en || r.room_type?.name || r.room_type?.name_ar || r.items?.[0]?.price?.room?.name;
  const viewName =
    lang === "ar"
      ? r.view?.name_ar || r.view?.name || r.view?.name_en || r.items?.[0]?.price?.room?.view
      : r.view?.name_en || r.view?.name || r.view?.name_ar || r.items?.[0]?.price?.room?.view;

  const editableHeader = canWrite && ["pending", "pending_supplier_confirmation", "draft"].includes(r.status) && !r.deleted_at;
  const editableRooms = canWrite && ["pending", "pending_supplier_confirmation", "draft"].includes(r.status) && !r.deleted_at;
  const confirmableRooms = canWrite && ["pending", "pending_supplier_confirmation", "draft"].includes(r.status) && !r.deleted_at;
  const editableGuests = canWrite && ["pending", "pending_supplier_confirmation", "draft", "confirmed"].includes(r.status) && !r.deleted_at;

  const total = Number(r.total_amount) || rooms.data?.reduce((s: number, rm: any) => s + Number(rm.total_selling), 0) || 0;
  const paid = Number(r.paid_amount) || Number(r.amount_paid) || 0;
  const remaining = r.remaining_amount !== undefined ? Number(r.remaining_amount) : Math.max(total - paid, 0);
  const nights = r.nights || (r.check_in && r.check_out
    ? Math.max((new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 86400000, 0)
    : null);

  const actions: {
    key: string;
    label: string;
    status: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "destructive" | "outline";
    show: boolean;
    needsReason?: boolean;
  }[] = [];

  return (
    <>
      <PageHeader
        title={`${r.code || r.booking_no} — ${customerName ?? ""}`}
        subtitle={`${formatDate(r.booking_date)} · ${currencyCode}${r.quotation ? ` · ${t("bk.source_quotation")}: ${r.quotation.quotation_no}` : ""}`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <BkStatusBadge status={r.status} t={t} />
            {editableHeader && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />{t("actions.edit")}
              </Button>
            )}
            {/* Print Invoice Button */}
            <Button size="sm" variant="outline" onClick={() => setShowInvoice(true)}>
              <Printer className="h-4 w-4" />
              {ar("طباعة", "Print")}
            </Button>
            {actions.filter((a) => a.show).map((a) => (
              <Button
                key={a.key}
                size="sm"
                variant={(a.variant as any) ?? "default"}
                onClick={() => {
                  if (a.key === "cancel") {
                    setShowCancelDialog(true);
                  } else if (a.key === "confirm") {
                    setShowConfirmDialog(true);
                  }
                }}
              >
                <a.icon className="h-4 w-4" />
                {a.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        {editing ? (
          <BookingForm
            initial={r}
            onSaved={() => {
              setEditing(false);
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Top row: 3 detail cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {/* Customer Info */}
              <DetailSection icon={User} title={ar("بيانات العميل", "Customer Info")}>
                <div className="divide-y divide-border/40 text-sm">
                  <KV k={ar("كود العميل", "Customer Code")} v={r.customer?.code || "—"} />
                  <KV k={t("bk.customer")} v={customerName} icon={User} />
                  {r.customer?.legal_name && <KV k={ar("الاسم القانوني", "Legal Name")} v={r.customer.legal_name} />}
                  <KV k={ar("نوع العميل", "Customer Type")} v={r.customer?.type || t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")} />
                  {r.customer?.email && <KV k={ar("البريد الإلكتروني", "Email")} v={<a href={`mailto:${r.customer.email}`} className="text-primary hover:underline">{r.customer.email}</a>} icon={Mail} />}
                  {r.customer?.phone && <KV k={ar("الهاتف", "Phone")} v={<a href={`tel:${r.customer.phone}`} className="text-primary hover:underline">{r.customer.phone}</a>} icon={Phone} />}
                  {r.customer?.country && (
                    <KV
                      k={ar("الدولة", "Country")}
                      v={lang === "ar" ? r.customer.country.name_ar || r.customer.country.name_en : r.customer.country.name_en || r.customer.country.name_ar}
                      icon={MapPin}
                    />
                  )}
                  {r.customer?.tax_number && <KV k={ar("الرقم الضريبي", "Tax Number")} v={r.customer.tax_number} />}
                  {r.customer?.commercial_register && <KV k={ar("السجل التجاري", "Commercial Reg.")} v={r.customer.commercial_register} />}
                  {r.customer?.credit_limit !== undefined && Number(r.customer?.credit_limit) > 0 && (
                    <KV k={ar("الحد الائتماني", "Credit Limit")} v={`${Number(r.customer.credit_limit).toLocaleString()} SAR`} />
                  )}
                  {r.customer?.credit_days !== undefined && Number(r.customer?.credit_days) > 0 && (
                    <KV k={ar("فترة الائتمان (أيام)", "Credit Days")} v={`${r.customer.credit_days} ${ar("يوم", "days")}`} />
                  )}
                  {r.customer?.notes && <KV k={ar("ملاحظات العميل", "Customer Notes")} v={r.customer.notes} />}
                </div>
              </DetailSection>

              {/* Booking Info */}
              <DetailSection icon={FileText} title={ar("معلومات الحجز", "Booking Info")}>
                <div className="divide-y divide-border/40 text-sm">
                  <KV k={t("bk.number")} v={<span dir="ltr" className="font-mono text-primary font-bold">{r.code || r.booking_no}</span>} />
                  <KV k={t("filter.status")} v={r.status_text || <BkStatusBadge status={r.status} t={t} />} />
                  <KV k={t("label.currency")} v={r.currency ? `${r.currency.name_ar || r.currency.name_en} (${r.currency.code})` : currencyCode} />
                  <KV k={t("bk.booking_date")} v={formatDate(r.booking_date)} icon={CalendarDays} />
                  <KV k={ar("نوع الحجز", "Booking Type")} v={r.booking_type_text || r.booking_type} />
                  {/* <KV k={ar("مصدر الحجز", "Booking Source")} v={r.booking_source_text || r.booking_source} /> */}
                  {r.group_size !== undefined && r.group_size !== null && <KV k={ar("عدد الأشخاص", "Number of Persons")} v={`${r.group_size} ${ar("أشخاص", "persons")}`} />}
                  {r.creator?.name && <KV k={ar("بواسطة", "Created By")} v={r.creator.name} icon={User} />}
                </div>
              </DetailSection>

              {/* Hotel & Room */}
              {(hotelName || roomTypeName || r.check_in || r.hotel) && (
                <DetailSection icon={BedDouble} title={ar("الفندق والغرفة", "Hotel & Room")}>
                  <div className="divide-y divide-border/40 text-sm">
                    {r.hotel?.code && <KV k={ar("كود الفندق", "Hotel Code")} v={r.hotel.code} />}
                    {hotelName && (
                      <KV
                        k={ar("الفندق", "Hotel")}
                        v={
                          <span className="font-semibold text-foreground">
                            {hotelName}
                            {(() => {
                              const st = Number(r.hotel?.stars || r.hotel?.star_rating || 0);
                              return st > 0 ? " " + "★".repeat(st) : "";
                            })()}
                          </span>
                        }
                        icon={Building2}
                      />
                    )}
                    {r.hotel?.brand && <KV k={ar("العلامة التجارية", "Hotel Brand")} v={r.hotel.brand} />}
                    {r.hotel && (r.hotel.city || r.hotel.country) && (
                      <KV
                        k={ar("العنوان والمدينة", "Location")}
                        v={`${r.hotel.city ? (lang === "ar" ? r.hotel.city.name_ar : r.hotel.city.name_en) + ", " : ""}${r.hotel.country ? (lang === "ar" ? r.hotel.country.name_ar : r.hotel.country.name_en) : ""}`}
                        icon={MapPin}
                      />
                    )}
                    {roomTypeName && <KV k={ar("نوع الغرفة", "Room Type")} v={roomTypeName} icon={BedDouble} />}
                    {viewName && <KV k={ar("الإطلالة", "View")} v={viewName} icon={MapPin} />}
                    {r.occupancy_type && <KV k={ar("نوع الإشغال", "Occupancy")} v={r.occupancy_type} />}
                    {r.rooms !== undefined && r.rooms !== null && <KV k={ar("عدد الغرف", "Rooms")} v={r.rooms} />}
                  </div>
                </DetailSection>
              )}
            </div>

            {/* Rooms & Pricing Details (Items Table) */}
            {r.items && r.items.length > 0 && (
              <DetailSection icon={BedDouble} title={ar("تفاصيل الغرف والأسعار", "Rooms & Pricing Details")}>
                <div className="overflow-x-auto rounded-lg border border-border/80">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4 text-start">{ar("الغرفة", "Room")}</th>
                        <th className="py-3 px-4 text-center">{ar("الإطلالة", "View")}</th>
                        <th className="py-3 px-4 text-center">{ar("العدد", "Qty")}</th>
                        <th className="py-3 px-4 text-center">{ar("سعر الليلة", "Rate/Night")}</th>
                        <th className="py-3 px-4 text-end">{ar("الإجمالي", "Subtotal")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {r.items.map((item: any, idx: number) => {
                        const roomName = lang === "ar" ? item.price?.room?.name_ar || item.price?.room?.name || item.price?.room?.name_en || "—" : item.price?.room?.name_en || item.price?.room?.name || item.price?.room?.name_ar || "—";
                        const viewName = lang === "ar" ? item.price?.room?.view || item.price?.view?.name_ar || item.price?.view?.name || item.price?.view?.name_en || "—" : item.price?.room?.view || item.price?.view?.name_en || item.price?.view?.name || item.price?.view?.name_ar || "—";
                        return (
                          <tr key={item.id || idx} className="hover:bg-muted/30">
                            <td className="py-3 px-4 font-medium text-foreground">{roomName}</td>
                            <td className="py-3 px-4 text-center text-muted-foreground">{viewName}</td>
                            <td className="py-3 px-4 text-center">{item.room_count}</td>
                            <td className="py-3 px-4 text-center tabular-nums">{Number(item.night_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}</td>
                            <td className="py-3 px-4 text-end font-semibold tabular-nums">{Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </DetailSection>
            )}

            {/* Stay Dates Row */}
            {(r.check_in || r.check_out) && (
              <DetailSection icon={CalendarDays} title={ar("تواريخ الإقامة", "Stay Dates")}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {r.check_in && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-center">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{ar("الوصول", "Check-in")}</p>
                      <p className="text-sm font-bold text-blue-700 dark:text-blue-300" dir="ltr">{formatDate(r.check_in)}</p>
                    </div>
                  )}
                  {r.check_out && (
                    <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-3 text-center">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">{ar("المغادرة", "Check-out")}</p>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300" dir="ltr">{formatDate(r.check_out)}</p>
                    </div>
                  )}
                  {nights != null && nights > 0 && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-center">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">{ar("الليالي", "Nights")}</p>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">{nights}</p>
                    </div>
                  )}
                  {r.room_rate && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-center">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">{ar("سعر الليلة", "Rate/Night")}</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300 tabular-nums">{Number(r.room_rate).toFixed(2)} {currencyCode}</p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {/* Payment Section */}
            {(total > 0 || paid > 0) && (
              <DetailSection icon={Wallet} title={ar("الدفع والمالية", "Payment & Finance")}>
                <PaymentProgress total={total} paid={paid} currency={currencyCode} lang={lang} />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-border/40">
                  <div className="space-y-2">
                    {(r.payment_method || r.payment_mode) && (() => {
                      const payMethod = r.payment_method || r.payment_mode;
                      return (
                        <div className="flex justify-between text-sm py-1 border-b border-border/20">
                          <span className="text-muted-foreground">{ar("طريقة الدفع", "Payment Method")}</span>
                          <span className="font-semibold text-foreground">
                            {r.payment_method_text || (payMethod === "full" ? ar("دفع كامل", "Full Payment") : payMethod === "partial" ? ar("دفع جزئي", "Partial Payment") : ar("مؤجل", "Deferred Payment"))}
                          </span>
                        </div>
                      );
                    })()}
                    {r.second_payment_due_date && (
                      <div className="flex justify-between text-sm py-1 border-b border-border/20">
                        <span className="text-muted-foreground">{ar("تاريخ الدفعة الثانية", "Second Payment Due Date")}</span>
                        <span className="font-semibold text-foreground">
                          {formatDate(r.second_payment_due_date, lang)}
                        </span>
                      </div>
                    )}
                    {r.deferred_payment_due_date && (
                      <div className="flex justify-between text-sm py-1 border-b border-border/20">
                        <span className="text-muted-foreground">{ar("تاريخ الدفعة المؤجلة", "Deferred Payment Due Date")}</span>
                        <span className="font-semibold text-foreground">
                          {formatDate(r.deferred_payment_due_date, lang)}
                        </span>
                      </div>
                    )}
                    {r.exchange_rate && (
                      <div className="flex justify-between text-sm py-1 border-b border-border/20">
                        <span className="text-muted-foreground">{ar("سعر الصرف (ريال)", "Exchange Rate (SAR)")}</span>
                        <span className="font-medium tabular-nums">{r.exchange_rate}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {r.total_amount_sar !== undefined && (
                      <div className="flex justify-between text-sm py-1 border-b border-border/20">
                        <span className="text-muted-foreground">{ar("الإجمالي بالريال", "Total in SAR")}</span>
                        <span className="font-bold tabular-nums text-foreground">{Number(r.total_amount_sar).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR</span>
                      </div>
                    )}
                    {r.remaining_amount !== undefined && (
                      <div className="flex justify-between text-sm py-1 border-b border-border/20">
                        <span className="text-muted-foreground">{ar("المبلغ المتبقي", "Remaining Amount")}</span>
                        <span className="font-bold tabular-nums text-red-600 dark:text-red-400">{Number(r.remaining_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Installments Table if Partial */}
                {((r.payment_method || r.payment_mode) === "partial" && r.installments && r.installments.length > 0) && (
                  <div className="mt-6 space-y-3 border-t pt-4 border-border/40">
                    <p className="text-sm font-semibold text-foreground">{ar("الأقساط / الدفعات المجدولة", "Installments / Scheduled Payments")}</p>
                    <div className="overflow-x-auto rounded-lg border border-border/85">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                            <th className="py-2.5 px-4 text-start">{ar("تاريخ الاستحقاق", "Due Date")}</th>
                            <th className="py-2.5 px-4 text-center">{ar("المبلغ", "Amount")}</th>
                            <th className="py-2.5 px-4 text-center">{ar("الحالة", "Status")}</th>
                            <th className="py-2.5 px-4 text-end">{ar("الفاتورة", "Invoice")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {r.installments.map((inst: any, idx: number) => {
                            const formattedAmount = Number(inst.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                            return (
                              <tr key={inst.id || idx} className="hover:bg-muted/30">
                                <td className="py-2.5 px-4 font-medium" dir="ltr">{formatDate(inst.due_date)}</td>
                                <td className="py-2.5 px-4 text-center font-semibold tabular-nums">{formattedAmount} {currencyCode}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <Badge className={inst.is_paid ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"}>
                                    {inst.is_paid ? ar("تم الدفع", "Paid") : ar("غير مدفوع", "Unpaid")}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-4 text-end">
                                  {inst.invoice_image ? (
                                    <a
                                      href={inst.invoice_image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                      <Receipt className="w-3.5 h-3.5" />
                                      {ar("عرض الفاتورة", "View Invoice")}
                                    </a>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </DetailSection>
            )}

            {/* Invoice Image Preview */}
            {r.invoice_image && (
              <DetailSection icon={Receipt} title={ar("صورة الفاتورة", "Invoice Image")}>
                <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg bg-muted/10">
                  <a href={r.invoice_image} target="_blank" rel="noopener noreferrer" className="relative block group overflow-hidden rounded-lg border max-w-sm">
                    <img src={r.invoice_image} alt="Invoice" className="w-full object-contain max-h-64 group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity duration-200">
                      {ar("عرض الفاتورة بالحجم الكامل", "View Full Size")}
                    </div>
                  </a>
                </div>
              </DetailSection>
            )}

            {/* Workflow Timestamps */}
            {(r.confirmed_at || r.checked_in_at || r.checked_out_at || r.cancelled_at) && (
              <DetailSection icon={Clock} title={ar("سجل الإجراءات", "Action Log")}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {r.confirmed_at && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{t("bk.confirm")}</span>
                      <span className="text-xs font-medium tabular-nums">{formatDateTime(r.confirmed_at, lang)}</span>
                    </div>
                  )}
                  {r.checked_in_at && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><LogIn className="w-3 h-3 text-blue-500" />{t("bk.check_in")}</span>
                      <span className="text-xs font-medium tabular-nums">{formatDateTime(r.checked_in_at, lang)}</span>
                    </div>
                  )}
                  {r.checked_out_at && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><LogOut className="w-3 h-3 text-purple-500" />{t("bk.check_out")}</span>
                      <span className="text-xs font-medium tabular-nums">{formatDateTime(r.checked_out_at, lang)}</span>
                    </div>
                  )}
                  {r.cancelled_at && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Ban className="w-3 h-3 text-red-500" />{t("bk.cancel")}</span>
                      <span className="text-xs font-medium tabular-nums">{formatDateTime(r.cancelled_at, lang)}</span>
                    </div>
                  )}
                </div>
                {r.cancellation_reason && (
                  <div className="mt-3 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                    <p className="text-xs font-medium text-destructive mb-0.5">{t("bk.cancel_reason")}</p>
                    <p className="text-sm text-foreground">{r.cancellation_reason}</p>
                  </div>
                )}
              </DetailSection>
            )}

            {/* Notes */}
            {(r.special_requests || r.notes) && (
              <DetailSection icon={FileText} title={ar("الطلبات والملاحظات", "Requests & Notes")}>
                <div className="grid md:grid-cols-2 gap-4">
                  {r.special_requests && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">{t("bk.special_requests")}</p>
                      <p className="text-sm bg-muted/40 rounded-lg p-3">{r.special_requests}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">{t("label.notes")}</p>
                      <p className="text-sm bg-muted/40 rounded-lg p-3">{r.notes}</p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}
          </div>
        )}
      </div>

      {/* ── Invoice Dialog ── */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              {ar("تأكيد الحجز", "Booking Confirmation")}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">
              {ar("معاينة التأكيد — جاهزة للطباعة والإرسال", "Preview — Ready to print and send")}
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (r.customer?.phone) {
                    const msg = `${ar("تأكيد الحجز - رقم الحجز:", "Booking Confirmation - Booking #")}: ${r.booking_no}`;
                    const phoneNumber = r.customer.phone.replace(/\D/g, '');
                    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`);
                  } else {
                    toast.error(ar("لا يوجد رقم هاتف للعميل", "No phone number for customer"));
                  }
                }}
              >
                <Send className="h-4 w-4" />
                {ar("واتس", "WhatsApp")}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (r.customer?.email) {
                    window.open(`mailto:${r.customer.email}?subject=${encodeURIComponent(ar("تأكيد الحجز", "Booking Confirmation") + " - " + r.booking_no)}`);
                  } else {
                    toast.error(ar("لا يوجد بريد إلكتروني للعميل", "No email for customer"));
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                {ar("بريد", "Email")}
              </Button>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                {ar("طباعة", "Print")}
              </Button>
            </div>
          </div>

          {/* Invoice preview */}
          <div className="p-4 bg-gray-100 dark:bg-gray-900 min-h-[600px]">
            <div className="shadow-xl rounded-lg overflow-hidden">
              <PrintInvoice booking={r} rooms={rooms.data ?? []} lang={lang} />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setShowInvoice(false)}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {ar("طباعة الفاتورة", "Print Invoice")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Booking Dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="w-5 h-5" />
              {ar("إلغاء الحجز", "Cancel Booking")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {ar(
                "الرجاء كتابة سبب إلغاء هذا الحجز لتسجيله في النظام:",
                "Please specify the reason for cancelling this booking:",
              )}
            </p>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={ar("سبب الإلغاء...", "Cancellation reason...")}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateStatus("cancelled", cancelReason)}
              disabled={isUpdating}
            >
              {isUpdating ? t("label.loading") : ar("تأكيد الإلغاء", "Confirm Cancellation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Booking Dialog ── */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={ar("تأكيد الحجز", "Confirm Booking")}
        description={ar("هل أنت متأكد من رغبتك في تأكيد هذا الحجز؟", "Are you sure you want to confirm this booking?")}
        destructive={false}
        onConfirm={() => handleUpdateStatus("confirmed")}
      />
    </>
  );
}
