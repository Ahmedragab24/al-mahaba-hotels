import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Pencil, Send, Check, Undo2, LogIn, LogOut, Ban, UserX,
  Printer, Building2, User, CalendarDays, BedDouble, Wallet, Receipt,
  CreditCard, Phone, Mail, MapPin, FileText, Clock, CheckCircle2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { BookingForm } from "./-form";
import { RoomsTab, useBookingRooms } from "./-rooms";
import { GuestsTab } from "./-guests";
import { EntityAttachments } from "@/components/entity-attachments";
import { EntityHistory } from "@/components/entity-history";
import { BkStatusBadge, BK_WRITE_ROLES } from "./index";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  component: BookingDetail,
});

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
  const ar = (a: string, e: string) => (lang === "ar" ? a : e);
  const customerName =
    lang === "ar"
      ? booking.customer?.name_ar || booking.customer?.name_en
      : booking.customer?.name_en || booking.customer?.name_ar;

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
            {ar("إيصال / فاتورة حجز", "Booking Receipt / Invoice")}
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
        <div style={{ padding: "1.5mm 4mm", borderRadius: "4px", background: booking.status === "confirmed" || booking.status === "checked_in" || booking.status === "checked_out" ? "#d1fae5" : "#fef3c7", border: `1px solid ${booking.status === "confirmed" || booking.status === "checked_in" || booking.status === "checked_out" ? "#6ee7b7" : "#fcd34d"}`, color: booking.status === "confirmed" || booking.status === "checked_in" || booking.status === "checked_out" ? "#065f46" : "#92400e", fontSize: "9pt", fontWeight: "bold" }}>
          {ar(`الحالة: ${booking.status}`, `Status: ${booking.status}`)}
        </div>
        <div style={{ padding: "1.5mm 4mm", borderRadius: "4px", background: "#e0e7ff", border: "1px solid #c7d2fe", color: "#3730a3", fontSize: "9pt", fontWeight: "bold" }}>
          {ar(`العملة: ${booking.currency}`, `Currency: ${booking.currency}`)}
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
      {(booking.hotel_id || rooms.length > 0) && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "6mm" }}>
          <div style={{ background: "#f8f4ed", borderBottom: "1px solid #e5e7eb", padding: "2mm 4mm", fontSize: "9pt", fontWeight: "bold", color: "#7c5e14" }}>
            {ar("تفاصيل الغرفة والفندق", "Hotel & Room Details")}
          </div>
          {rooms.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[ar("الفندق", "Hotel"), ar("نوع الغرفة", "Room Type"), ar("الإشغال", "Occupancy"), ar("الوصول", "Check-in"), ar("المغادرة", "Check-out"), ar("الليالي", "Nights"), ar("الغرف", "Rooms"), ar("المبلغ", "Amount")].map((h, i) => (
                    <th key={i} style={{ padding: "2mm 3mm", textAlign: lang === "ar" ? "right" : "left", borderBottom: "1px solid #e5e7eb", fontWeight: "600", color: "#374151" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: any, i: number) => {
                  const rn = (o: any) => (lang === "ar" ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "2mm 3mm" }}>{rn(room.hotel)}</td>
                      <td style={{ padding: "2mm 3mm" }}>{rn(room.room_type)}</td>
                      <td style={{ padding: "2mm 3mm" }}>{room.occupancy_type}</td>
                      <td style={{ padding: "2mm 3mm", direction: "ltr" }}>{formatDate(room.check_in)}</td>
                      <td style={{ padding: "2mm 3mm", direction: "ltr" }}>{formatDate(room.check_out)}</td>
                      <td style={{ padding: "2mm 3mm", textAlign: "center" }}>{room.nights}</td>
                      <td style={{ padding: "2mm 3mm", textAlign: "center" }}>{room.rooms}</td>
                      <td style={{ padding: "2mm 3mm", direction: "ltr", fontWeight: "600" }}>{fmt(room.total_selling)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "3mm 4mm", fontSize: "9pt", lineHeight: 2 }}>
              {booking.room_type_id && <div><strong>{ar("نوع الغرفة:", "Room Type:")}</strong> {booking.room_type_id}</div>}
              {booking.occupancy_type && <div><strong>{ar("نوع الإشغال:", "Occupancy:")}</strong> {booking.occupancy_type}</div>}
              {booking.room_rate && <div><strong>{ar("سعر الغرفة/ليلة:", "Rate/Night:")}</strong> {fmt(booking.room_rate)} {booking.currency}</div>}
            </div>
          )}
        </div>
      )}

      {/* Financial summary */}
      <div style={{ border: "2px solid #b5862b", borderRadius: "6px", overflow: "hidden", marginBottom: "6mm" }}>
        <div style={{ background: "#7c5e14", padding: "2mm 4mm", fontSize: "9pt", fontWeight: "bold", color: "#fff" }}>
          {ar("ملخص المدفوعات", "Payment Summary")}
        </div>
        <div style={{ padding: "3mm 4mm" }}>
          <table style={{ width: "100%", fontSize: "10pt" }}>
            <tbody>
              <tr>
                <td style={{ padding: "1.5mm 0", color: "#374151" }}>{ar("المبلغ الإجمالي للحجز:", "Total Booking Amount:")}</td>
                <td style={{ textAlign: lang === "ar" ? "left" : "right", fontWeight: "bold", direction: "ltr" }}>{fmt(total)} {booking.currency}</td>
              </tr>
              <tr>
                <td style={{ padding: "1.5mm 0", color: "#065f46" }}>{ar("المبلغ المدفوع:", "Amount Paid:")}</td>
                <td style={{ textAlign: lang === "ar" ? "left" : "right", fontWeight: "bold", color: "#065f46", direction: "ltr" }}>{fmt(paid)} {booking.currency}</td>
              </tr>
              <tr style={{ borderTop: "1.5px solid #e5e7eb" }}>
                <td style={{ padding: "2mm 0", fontWeight: "bold", fontSize: "11pt", color: remaining > 0 ? "#dc2626" : "#065f46" }}>
                  {ar(remaining > 0 ? "المبلغ المتبقي:" : "الحالة:", remaining > 0 ? "Remaining Balance:" : "Status:")}
                </td>
                <td style={{ textAlign: lang === "ar" ? "left" : "right", fontWeight: "bold", fontSize: "11pt", color: remaining > 0 ? "#dc2626" : "#065f46", direction: "ltr" }}>
                  {remaining > 0 ? `${fmt(remaining)} ${booking.currency}` : (ar("✓ مدفوع بالكامل", "✓ Fully Paid"))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
          <div>{ar("هذه الوثيقة تمثل إيصال الحجز الرسمي", "This document represents the official booking receipt")}</div>
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
function BookingDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const canWrite = auth.hasAnyRole([...BK_WRITE_ROLES]);
  const canManage = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "operations_manager"]);
  const [editing, setEditing] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState<"cancelled" | "no_show" | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const b = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customer:customers(name_en,name_ar,customer_type,email,phone),
          quotation:quotations(quotation_no),
          hotel:hotels(name_en,name_ar,star_rating),
          room_type:hotel_room_types(name_en,name_ar),
          view:hotel_views(name_en,name_ar)
        `)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const rooms = useBookingRooms(id);

  const history = useQuery({
    queryKey: ["booking-status-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status_history")
        .select("*")
        .eq("booking_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMut = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      const patch: any = { status };
      if (reason !== undefined) patch.cancellation_reason = reason;
      const { error } = await supabase.from("bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      setCancelOpen(null);
      setCancelReason("");
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["booking-status-history", id] });
      qc.invalidateQueries({ queryKey: ["bookings-metrics"] });
      qc.invalidateQueries({ queryKey: ["entity-history", "bookings", id] });
    },
    onError: (e: any) => {
      setConfirmStatus(null);
      toast.error(dbErrorMessage(e, t));
    },
  });

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

  const r = b.data;
  const customerName =
    lang === "ar"
      ? r.customer?.name_ar || r.customer?.name_en
      : r.customer?.name_en || r.customer?.name_ar;
  const hotelName =
    lang === "ar"
      ? r.hotel?.name_ar || r.hotel?.name_en
      : r.hotel?.name_en || r.hotel?.name_ar;
  const roomTypeName =
    lang === "ar"
      ? r.room_type?.name_ar || r.room_type?.name_en
      : r.room_type?.name_en || r.room_type?.name_ar;
  const viewName =
    lang === "ar"
      ? r.view?.name_ar || r.view?.name_en
      : r.view?.name_en || r.view?.name_ar;

  const editableHeader = canWrite && r.status === "draft" && !r.deleted_at;
  const editableRooms = canWrite && r.status === "draft" && !r.deleted_at;
  const confirmableRooms = canWrite && ["draft", "pending_confirmation"].includes(r.status) && !r.deleted_at;
  const editableGuests = canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status) && !r.deleted_at;

  const total = Number(r.total_amount) || rooms.data?.reduce((s: number, rm: any) => s + Number(rm.total_selling), 0) || 0;
  const paid = Number(r.amount_paid) || 0;
  const remaining = Math.max(total - paid, 0);
  const nights = r.check_in && r.check_out
    ? Math.max((new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 86400000, 0)
    : null;

  const actions: {
    key: string;
    label: string;
    status: string;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "destructive" | "outline";
    show: boolean;
    needsReason?: boolean;
  }[] = [
    { key: "submit", label: t("bk.submit"), status: "pending_confirmation", icon: Send, show: canWrite && r.status === "draft" },
    { key: "return", label: t("bk.return_draft"), status: "draft", icon: Undo2, variant: "outline", show: canWrite && r.status === "pending_confirmation" },
    { key: "confirm", label: t("bk.confirm"), status: "confirmed", icon: Check, show: canManage && r.status === "pending_confirmation" },
    { key: "check_in", label: t("bk.check_in"), status: "checked_in", icon: LogIn, show: canWrite && r.status === "confirmed" },
    { key: "check_out", label: t("bk.check_out"), status: "checked_out", icon: LogOut, show: canWrite && r.status === "checked_in" },
    { key: "no_show", label: t("bk.no_show_action"), status: "no_show", icon: UserX, variant: "destructive", show: canManage && r.status === "confirmed", needsReason: true },
    { key: "cancel", label: t("bk.cancel"), status: "cancelled", icon: Ban, variant: "destructive", show: canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status), needsReason: true },
  ];

  return (
    <>
      <PageHeader
        title={`${r.booking_no} — ${customerName ?? ""}`}
        subtitle={`${formatDate(r.booking_date)} · ${r.currency}${r.quotation ? ` · ${t("bk.source_quotation")}: ${r.quotation.quotation_no}` : ""}`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/bookings" })}>
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
              {ar("إصدار فاتورة", "Print Invoice")}
            </Button>
            {actions.filter((a) => a.show).map((a) => (
              <Button
                key={a.key}
                size="sm"
                variant={(a.variant as any) ?? "default"}
                onClick={() => (a.needsReason ? setCancelOpen(a.status as any) : setConfirmStatus(a.status))}
              >
                <a.icon className="h-4 w-4" />
                {a.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="general">{t("bk.tab.general")}</TabsTrigger>
            <TabsTrigger value="rooms">{t("bk.tab.rooms")}</TabsTrigger>
            <TabsTrigger value="guests">{t("bk.tab.guests")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("bk.tab.timeline")}</TabsTrigger>
            <TabsTrigger value="history">{t("bk.tab.history")}</TabsTrigger>
          </TabsList>

          {/* ── General Tab ── */}
          <TabsContent value="general">
            {editing ? (
              <BookingForm
                initial={r}
                onSaved={() => {
                  setEditing(false);
                  qc.invalidateQueries({ queryKey: ["booking", id] });
                }}
              />
            ) : (
              <div className="space-y-4">
                {/* Top row: 3 detail cards */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {/* Customer Info */}
                  <DetailSection icon={User} title={ar("بيانات العميل", "Customer Info")}>
                    <div className="divide-y divide-border/40">
                      <KV k={t("bk.customer")} v={customerName} icon={User} />
                      <KV k={ar("نوع العميل", "Customer Type")} v={t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")} />
                      {r.customer?.email && <KV k={ar("البريد الإلكتروني", "Email")} v={<a href={`mailto:${r.customer.email}`} className="text-primary hover:underline">{r.customer.email}</a>} icon={Mail} />}
                      {r.customer?.phone && <KV k={ar("الهاتف", "Phone")} v={<a href={`tel:${r.customer.phone}`} className="text-primary hover:underline">{r.customer.phone}</a>} icon={Phone} />}
                    </div>
                  </DetailSection>

                  {/* Booking Status */}
                  <DetailSection icon={FileText} title={ar("معلومات الحجز", "Booking Info")}>
                    <div className="divide-y divide-border/40">
                      <KV k={t("bk.number")} v={<span dir="ltr" className="font-mono text-primary">{r.booking_no}</span>} />
                      <KV k={t("filter.status")} v={<BkStatusBadge status={r.status} t={t} />} />
                      <KV k={t("label.currency")} v={r.currency} />
                      <KV k={t("bk.booking_date")} v={formatDate(r.booking_date)} icon={CalendarDays} />
                      <KV
                        k={t("bk.source")}
                        v={
                          r.quotation_id ? (
                            <Link to="/quotations/$id" params={{ id: r.quotation_id }} className="text-primary hover:underline">
                              {t("bk.source_quotation")} — {r.quotation?.quotation_no}
                            </Link>
                          ) : (
                            t("bk.source_direct")
                          )
                        }
                      />
                    </div>
                  </DetailSection>

                  {/* Hotel & Room */}
                  {(hotelName || roomTypeName || r.check_in) && (
                    <DetailSection icon={BedDouble} title={ar("الفندق والغرفة", "Hotel & Room")}>
                      <div className="divide-y divide-border/40">
                        {hotelName && (
                          <KV
                            k={ar("الفندق", "Hotel")}
                            v={
                              <span>
                                {hotelName}
                                {r.hotel?.star_rating ? " " + "★".repeat(r.hotel.star_rating) : ""}
                              </span>
                            }
                            icon={Building2}
                          />
                        )}
                        {roomTypeName && <KV k={ar("نوع الغرفة", "Room Type")} v={roomTypeName} icon={BedDouble} />}
                        {viewName && <KV k={ar("الإطلالة", "View")} v={viewName} icon={MapPin} />}
                        {r.occupancy_type && <KV k={ar("نوع الإشغال", "Occupancy")} v={r.occupancy_type} />}
                        {r.rooms && <KV k={ar("عدد الغرف", "Rooms")} v={r.rooms} />}
                      </div>
                    </DetailSection>
                  )}
                </div>

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
                          <p className="text-sm font-bold text-green-700 dark:text-green-300 tabular-nums">{Number(r.room_rate).toFixed(2)} {r.currency}</p>
                        </div>
                      )}
                    </div>
                  </DetailSection>
                )}

                {/* Payment Section */}
                {(total > 0 || paid > 0) && (
                  <DetailSection icon={Wallet} title={ar("الدفع والمالية", "Payment & Finance")}>
                    <PaymentProgress total={total} paid={paid} currency={r.currency} lang={lang} />
                    {r.payment_mode && (
                      <div className="mt-3 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ar("طريقة الدفع: ", "Payment mode: ")}</span>
                        <Badge variant="outline" className="text-xs">
                          {r.payment_mode === "full" ? ar("دفع كامل", "Full Payment") : r.payment_mode === "partial" ? ar("دفع جزئي", "Partial") : ar("مؤجل", "Deferred")}
                        </Badge>
                      </div>
                    )}
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
          </TabsContent>

          {/* ── Rooms Tab ── */}
          <TabsContent value="rooms">
            <RoomsTab
              bookingId={id}
              currency={r.currency}
              editable={editableRooms}
              confirmable={confirmableRooms}
            />
          </TabsContent>

          {/* ── Guests Tab ── */}
          <TabsContent value="guests">
            <GuestsTab bookingId={id} editable={editableGuests} />
          </TabsContent>

          <TabsContent value="attachments">
            <EntityAttachments entityType="booking" entityId={id} />
          </TabsContent>

          {/* ── Timeline Tab ── */}
          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("bk.history.from")}</TableHead>
                      <TableHead>{t("bk.history.to")}</TableHead>
                      <TableHead>{t("history.time")}</TableHead>
                      <TableHead>{t("label.notes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(history.data?.length ?? 0) === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          {t("bk.history.empty")}
                        </TableCell>
                      </TableRow>
                    )}
                    {history.data?.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          {h.from_status ? <Badge variant="outline">{t(`bkstatus.${h.from_status}`)}</Badge> : "—"}
                        </TableCell>
                        <TableCell>
                          <BkStatusBadge status={h.to_status} t={t} />
                        </TableCell>
                        <TableCell dir="ltr" className="text-xs whitespace-nowrap">
                          {formatDateTime(h.created_at, lang)}
                        </TableCell>
                        <TableCell className="text-xs">{h.reason ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="bookings" entityId={id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Invoice Dialog ── */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              {ar("فاتورة / إيصال الحجز", "Booking Invoice / Receipt")}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {ar("معاينة الفاتورة — جاهزة للطباعة", "Invoice Preview — Ready to print")}
            </span>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {ar("طباعة", "Print")}
            </Button>
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

      {/* ── Status Confirm Dialog ── */}
      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
        title={t("bk.confirm_status")}
        description={confirmStatus ? t(`bkstatus.${confirmStatus}`) : ""}
        onConfirm={() => confirmStatus && statusMut.mutate({ status: confirmStatus })}
      />

      {/* ── Cancel/No-show Dialog ── */}
      <Dialog
        open={!!cancelOpen}
        onOpenChange={(v) => {
          if (!v) {
            setCancelOpen(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-sm">{t("bk.cancel_reason")} *</label>
            <Textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim() || statusMut.isPending}
              onClick={() =>
                cancelOpen && statusMut.mutate({ status: cancelOpen, reason: cancelReason.trim() })
              }
            >
              {cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
