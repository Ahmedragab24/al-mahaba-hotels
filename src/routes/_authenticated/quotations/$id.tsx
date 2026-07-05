import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { db } from "@/store/queryBridge";
import { apiClient } from "@/store/queryBridge";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasAnyRole } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Send, Check, X, Undo2, Printer, Ban, Clock, RotateCcw, MessageCircle, ThumbsUp, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { dbErrorMessage } from "@/store/queryBridge";
import { QuotationForm } from "./-form";
import { openQuotationPrint, generateQuotationPdfBlob } from "./-print";
import { collectSuppliers, getStayDates, localizedName, mapQuotationItemsForPrint, type QuotationRecipient } from "./-helpers";
import { DOC_LANG_LIST, DOC_LANGS, toDocLang, renderWaTemplate, waTemplateExists, missingDocKeys, type DocLang } from "@/lib/doc-lang";

export default function QuotationDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "sales_manager", "sales_agent"]);
  const canApprove = hasAnyRole(auth, ["super_admin", "admin", "sales_manager"]);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [hidePrices, setHidePrices] = useState(false);
  const [supplierDialog, setSupplierDialog] = useState<{ mode: "print" | "whatsapp"; lang: DocLang; hidePrices: boolean } | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [sendingPdf, setSendingPdf] = useState(false);

  const q = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => apiClient.quotations.getById(id),
  });

  const statusMut = useMutation({
    mutationFn: async (status: string) => {
      await apiClient.quotations.update(id, { status });
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      qc.invalidateQueries({ queryKey: ["quotation", id] });
      qc.invalidateQueries({ queryKey: ["approval-requests", "quotation", id] });
      qc.invalidateQueries({ queryKey: ["quotes-metrics"] });
    },
    onError: (e: any) => {
      setConfirmStatus(null);
      toast.error(dbErrorMessage(e));
    },
  });

  const rtl = lang === "ar";
  const mealLabel = (type: string) => t(`board.${type}`, type);

  const apiItems = useMemo(() => (Array.isArray(q.data?.items) ? q.data.items : []), [q.data?.items]);
  const suppliers = useMemo(() => collectSuppliers(apiItems), [apiItems]);
  const stay = useMemo(() => (q.data ? getStayDates(q.data) : null), [q.data]);

  const buildPrintPayload = (printLang: DocLang) => {
    if (!q.data) return null;
    const printItems = mapQuotationItemsForPrint(q.data, apiItems, printLang, mealLabel);
    const currency = q.data.currency;
    return {
      printItems,
      currencyCode: typeof currency === "object" ? currency.code : currency,
      currencySymbol: DOC_LANGS[printLang].dir === "rtl"
        ? (typeof currency === "object" ? currency.symbol_ar || currency.code : currency)
        : (typeof currency === "object" ? currency.symbol_en || currency.code : currency),
    };
  };

  const doPrint = async (printLang: DocLang, recipient: QuotationRecipient, withPrices: boolean, supplierId?: string) => {
    if (!q.data) return;
    if (apiItems.length === 0) {
      toast.error(t("quotes.err_no_items"));
      return;
    }
    if (missingDocKeys(printLang, "quotation").length > 0) {
      toast.error(t("doc.missing_translations"));
      return;
    }

    const payload = buildPrintPayload(printLang);
    if (!payload) return;

    const hide = recipient === "supplier" || !withPrices;
    let recipientName = localizedName(q.data.customer, DOC_LANGS[printLang].dir === "rtl");

    if (recipient === "supplier") {
      const supplier = suppliers.find((s) => String(s.id) === String(supplierId));
      if (!supplier) {
        toast.error(t("quotes.supplier_required"));
        return;
      }
      recipientName = supplier.name;
    }

    const ok = await openQuotationPrint({
      lang: printLang,
      recipient,
      hidePrices: hide,
      recipientName,
      quotation: {
        id: q.data.id,
        quotation_no: q.data.code,
        status: q.data.status,
        status_text: q.data.status_text,
        quotation_date: q.data.created_at || q.data.start_date,
        travel_date: q.data.check_in || q.data.start_date,
        expiry_date: q.data.end_date,
        check_in: q.data.check_in || q.data.start_date,
        check_out: q.data.check_out || q.data.end_date,
        group_size: q.data.group_size,
        notes: q.data.notes,
        is_recommended: q.data.is_recommended,
        hotel: q.data.hotel,
        currency: payload.currencyCode,
        currency_symbol: payload.currencySymbol,
      },
      items: payload.printItems,
    });

    if (ok) {
      toast.success(t("quotes.pdf_ok"));
      qc.invalidateQueries({ queryKey: ["entity-history", "quotations", id] });
    }
  };

  const startSupplierAction = (mode: "print" | "whatsapp", waLang: DocLang, withPrices: boolean) => {
    if (suppliers.length === 0) {
      toast.error(t("quotes.supplier_required"));
      return;
    }
    if (suppliers.length === 1) {
      if (mode === "print") {
        void doPrint(waLang, "supplier", withPrices, String(suppliers[0].id));
      } else {
        void sendWhatsApp(waLang, "supplier", String(suppliers[0].id));
      }
      return;
    }
    setSelectedSupplierId(String(suppliers[0].id));
    setSupplierDialog({ mode, lang: waLang, hidePrices: withPrices });
  };

  const confirmSupplierAction = async () => {
    if (!supplierDialog || !selectedSupplierId) return;
    const { mode, lang: actionLang, hidePrices: noPrices } = supplierDialog;
    setSupplierDialog(null);
    if (mode === "print") {
      await doPrint(actionLang, "supplier", !noPrices, selectedSupplierId);
    } else {
      await sendWhatsApp(actionLang, "supplier", selectedSupplierId);
    }
  };

  const sendWhatsApp = async (waLang: DocLang, recipient: QuotationRecipient = "customer", supplierId?: string) => {
    if (!q.data) return;
    if (apiItems.length === 0) {
      toast.error(t("quotes.err_no_items"));
      return;
    }
    if (!waTemplateExists("quotation", waLang)) {
      toast.error(t("wa.no_template"));
      return;
    }

    const r = q.data;
    const docRtl = DOC_LANGS[waLang].dir === "rtl";
    const hide = recipient === "supplier";
    const cName = localizedName(r.customer, docRtl);
    const hotels = apiItems
      .map((i: any) => {
        const hotel = i.price_details?.hotel || i.price_details?.room?.hotel || r.hotel;
        const hotelName = localizedName(hotel, docRtl);
        return `• ${hotelName} (${i.room_count} ${docRtl ? "غرف" : "rooms"})`;
      })
      .join("\n");

    const total = r.total_value || 0;
    const currencyCode = typeof r.currency === "object" ? r.currency.code : r.currency;
    const tpl = renderWaTemplate("quotation", waLang, {
      customer: recipient === "supplier"
        ? (suppliers.find((s) => String(s.id) === String(supplierId))?.name ?? cName)
        : cName,
      quotation_no: r.code,
      hotels,
      total: hide ? (docRtl ? "حسب الطلب" : "On request") : total.toLocaleString("en-US", { minimumFractionDigits: 2 }),
      currency: hide ? "" : currencyCode,
      valid_until: formatDate(r.end_date, waLang === "ar" ? "ar" : "en"),
      company: waLang === "ar" ? "دليل المعالم" : waLang === "ur" ? "دلیل المعالم" : "Dalil Al-Maalem",
    });
    if (!tpl) {
      toast.error(t("wa.no_template"));
      return;
    }

    let phone = "";
    if (recipient === "supplier") {
      const supplier = suppliers.find((s) => String(s.id) === String(supplierId));
      if (supplier?.phone) {
        phone = String(supplier.phone).replace(/[^0-9]/g, "");
      } else {
        try {
          const detail = await apiClient.suppliers.getById(supplierId);
          phone = String(detail?.phone ?? detail?.mobile ?? "").replace(/[^0-9]/g, "");
        } catch {
          phone = "";
        }
      }
    } else {
      phone = String(r.customer?.phone ?? "").replace(/[^0-9]/g, "");
    }

    if (!phone) {
      toast.error(recipient === "supplier" ? t("quotes.supplier_required") : t("wa.no_phone", "No phone number"));
      return;
    }

    try {
      if (recipient === "customer") {
        await apiClient.customerCommunications.create({
          customer_id: r.customer_id,
          channel: "whatsapp",
          direction: "outbound",
          subject: `${tpl.name} [${waLang}] — ${r.code}`,
          body: tpl.body,
        });
      }
      await db.rpc("log_audit", {
        _action: "whatsapp_send",
        _entity_type: "quotations",
        _entity_id: r.id,
        _metadata: { lang: waLang, template: tpl.name, quotation_no: r.code, recipient },
      });
    } catch {
      /* logging must not block sending */
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(tpl.body)}`, "_blank");
    toast.success(t("wa.sent"));
  };

  const sendWhatsAppPdf = async (waLang: DocLang, recipient: QuotationRecipient = "customer", withPrices: boolean, supplierId?: string) => {
    if (!q.data) return;
    if (apiItems.length === 0) {
      toast.error(t("quotes.err_no_items"));
      return;
    }

    setSendingPdf(true);
    const toastId = toast.loading(lang === "ar" ? "جاري إنشاء ملف PDF ورفعه..." : "Generating PDF and uploading...");

    try {
      const payload = buildPrintPayload(waLang);
      if (!payload) {
        toast.dismiss(toastId);
        setSendingPdf(false);
        return;
      }

      const hide = recipient === "supplier" || !withPrices;
      let recipientName = localizedName(q.data.customer, DOC_LANGS[waLang].dir === "rtl");

      if (recipient === "supplier") {
        const supplier = suppliers.find((s) => String(s.id) === String(supplierId));
        if (!supplier) {
          toast.error(t("quotes.supplier_required"));
          toast.dismiss(toastId);
          setSendingPdf(false);
          return;
        }
        recipientName = supplier.name;
      }

      // Generate the PDF blob
      const blob = await generateQuotationPdfBlob({
        lang: waLang,
        recipient,
        hidePrices: hide,
        recipientName,
        quotation: {
          id: q.data.id,
          quotation_no: q.data.code,
          status: q.data.status,
          status_text: q.data.status_text,
          quotation_date: q.data.created_at || q.data.start_date,
          travel_date: q.data.check_in || q.data.start_date,
          expiry_date: q.data.end_date,
          check_in: q.data.check_in || q.data.start_date,
          check_out: q.data.check_out || q.data.end_date,
          group_size: q.data.group_size,
          notes: q.data.notes,
          is_recommended: q.data.is_recommended,
          hotel: q.data.hotel,
          currency: payload.currencyCode,
          currency_symbol: payload.currencySymbol,
        },
        items: payload.printItems,
      });

      // Upload to Supabase Storage
      const ext = "pdf";
      const storageName = `quotation-${q.data.code}-${waLang}-${withPrices ? "w" : "wo"}-${crypto.randomUUID()}.${ext}`;
      const path = `quotations/${q.data.id}/${storageName}`;
      const file = new File([blob], storageName, { type: "application/pdf" });

      const { error: upErr } = await db.storage
        .from("attachments")
        .upload(path, file, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: true,
        });

      if (upErr) throw upErr;

      // Register attachment in DB
      const mime = "application/pdf";
      await apiClient.attachments.create({
        entity_type: "quotations",
        entity_id: q.data.id,
        file_name: storageName,
        original_name: `Quotation-${q.data.code}-${waLang}.pdf`,
        mime_type: mime,
        file_size: blob.size,
        storage_path: path,
        uploaded_by: auth.user?.id ?? null,
      });

      // Get public URL
      const { data: urlData } = db.storage.from("attachments").getPublicUrl(path);
      const publicUrl = window.location.origin + urlData.publicUrl;

      // WhatsApp text
      const docRtl = DOC_LANGS[waLang].dir === "rtl";
      const customerName = localizedName(q.data.customer, docRtl);

      let message = "";
      if (docRtl) {
        message = `مرحباً ${customerName}،\nيسعدنا إرسال عرض السعر رقم *${q.data.code}* الخاص بحجزكم.\n\nيمكنكم تحميل العرض كملف PDF من الرابط التالي:\n${publicUrl}\n\nشكراً لتعاملكم معنا.`;
      } else {
        message = `Hello ${customerName},\nWe are pleased to send you the quotation *${q.data.code}* for your booking.\n\nYou can download the PDF from the link below:\n${publicUrl}\n\nThank you for choosing us.`;
      }

      let phone = "";
      if (recipient === "supplier") {
        const supplier = suppliers.find((s) => String(s.id) === String(supplierId));
        if (supplier?.phone) {
          phone = String(supplier.phone).replace(/[^0-9]/g, "");
        } else {
          try {
            const detail = await apiClient.suppliers.getById(supplierId);
            phone = String(detail?.phone ?? detail?.mobile ?? "").replace(/[^0-9]/g, "");
          } catch {
            phone = "";
          }
        }
      } else {
        phone = String(q.data.customer?.phone ?? "").replace(/[^0-9]/g, "");
      }

      if (!phone) {
        toast.error(recipient === "supplier" ? t("quotes.supplier_required") : t("wa.no_phone", "No phone number"));
        toast.dismiss(toastId);
        setSendingPdf(false);
        return;
      }

      // Log communication
      try {
        if (recipient === "customer") {
          await apiClient.customerCommunications.create({
            customer_id: q.data.customer_id,
            channel: "whatsapp",
            direction: "outbound",
            subject: `PDF Quotation [${waLang}] — ${q.data.code}`,
            body: message,
          });
        }
        await db.rpc("log_audit", {
          _action: "whatsapp_send",
          _entity_type: "quotations",
          _entity_id: q.data.id,
          _metadata: { lang: waLang, type: "pdf_link", quotation_no: q.data.code, recipient },
        });
      } catch {
        // ignore
      }

      toast.dismiss(toastId);
      toast.success(lang === "ar" ? "تم تجهيز الرابط وفتح الواتساب!" : "Link generated, opening WhatsApp!");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error(e.message || (lang === "ar" ? "حدث خطأ أثناء إرسال الـ PDF" : "Error sending PDF"));
    } finally {
      setSendingPdf(false);
    }
  };

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("quotes.no_found")}</div>;

  const r = q.data;
  const customerName = localizedName(r.customer, rtl);
  const hotelName = localizedName(r.hotel, rtl);
  const countryName = localizedName(r.hotel?.country, rtl);
  const cityName = localizedName(r.hotel?.city, rtl);
  const currencyCode = typeof r.currency === "object" ? r.currency?.code : r.currency;
  const currencySymbol = rtl
    ? (typeof r.currency === "object" ? r.currency?.symbol_ar || r.currency?.code : r.currency)
    : (typeof r.currency === "object" ? r.currency?.symbol_en || r.currency?.code : r.currency);
  const editable = canWrite && (r.status === "draft" || r.status === "rejected") && !r.deleted_at;
  const preferredLang = toDocLang(r.language?.code || r.customer?.preferred_language);
  const langOrder: DocLang[] = [preferredLang, ...DOC_LANG_LIST.filter((l) => l !== preferredLang)];

  const money = (n: number | null | undefined) =>
    hidePrices
      ? "—"
      : `${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`;

  const actions: { key: string; label: string; status: string; icon: React.ComponentType<{ className?: string }>; variant?: "destructive" | "outline"; show: boolean }[] = [
    { key: "submit", label: t("quotes.submit"), status: "pending_approval", icon: Send, show: canWrite && r.status === "draft" },
    { key: "send_direct", label: t("quotes.send"), status: "sent", icon: Send, variant: "outline", show: canWrite && r.status === "draft" },
    { key: "approve", label: t("actions.approve"), status: "approved", icon: Check, show: canApprove && r.status === "pending_approval" },
    { key: "reject", label: t("actions.reject"), status: "rejected", icon: X, variant: "destructive", show: canApprove && r.status === "pending_approval" },
    { key: "return", label: t("quotes.return"), status: "draft", icon: Undo2, variant: "outline", show: canApprove && r.status === "pending_approval" },
    { key: "send", label: t("quotes.send"), status: "sent", icon: Send, show: canWrite && r.status === "approved" },
    { key: "reopen", label: t("quotes.reopen"), status: "draft", icon: RotateCcw, variant: "outline", show: canWrite && r.status === "rejected" },
    { key: "accept", label: t("quotes.accept"), status: "accepted", icon: Check, show: canWrite && r.status === "sent" },
    { key: "expire", label: t("quotes.expire_action"), status: "expired", icon: Clock, variant: "outline", show: canWrite && r.status === "sent" },
    { key: "cancel", label: t("quotes.cancel"), status: "cancelled", icon: Ban, variant: "destructive", show: canWrite && ["draft", "approved", "rejected", "sent"].includes(r.status) },
  ];

  return (
    <>
      <PageHeader
        title={`${r.code} — ${customerName}`}
        subtitle={`${formatDateTime(r.start_date, lang)} → ${formatDateTime(r.end_date, lang)} · ${currencyCode} · ${r.status_text || r.status} `}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/quotations")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t("actions.back")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setHidePrices((v) => !v)}>
              {hidePrices ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {hidePrices ? t("quotes.show_prices") : t("quotes.hide_prices")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4" /> {t("quotes.print")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t("quotes.print_customer")}</DropdownMenuLabel>
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`c-${l}`} onClick={() => doPrint(l, "customer", true)}>
                    {DOC_LANGS[l].native} · {t("quotes.print_with_prices")}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`cn-${l}`} onClick={() => doPrint(l, "customer", false)}>
                    {DOC_LANGS[l].native} · {t("quotes.print_no_prices")}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t("quotes.print_supplier")}</DropdownMenuLabel>
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`s-${l}`} onClick={() => startSupplierAction("print", l, false)}>
                    {DOC_LANGS[l].native} · {t("quotes.print_no_prices")}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={sendingPdf}>
                  <MessageCircle className="h-4 w-4" /> {t("quotes.send_whatsapp")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t("quotes.send")}</DropdownMenuLabel>
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`wa-c-${l}`} onClick={() => sendWhatsApp(l, "customer")}>
                    {DOC_LANGS[l].native} · {lang === "ar" ? "تفاصيل نصية" : "Text details"}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{lang === "ar" ? "إرسال ملف الـ PDF للعميل" : "Send PDF to Customer"}</DropdownMenuLabel>
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`wa-pdf-c-p-${l}`} onClick={() => sendWhatsAppPdf(l, "customer", true)}>
                    {DOC_LANGS[l].native} · {t("quotes.print_with_prices")}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`wa-pdf-c-np-${l}`} onClick={() => sendWhatsAppPdf(l, "customer", false)}>
                    {DOC_LANGS[l].native} · {t("quotes.print_no_prices")}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t("quotes.send_supplier")}</DropdownMenuLabel>
                {langOrder.map((l) => (
                  <DropdownMenuItem key={`wa-s-${l}`} onClick={() => startSupplierAction("whatsapp", l, false)}>
                    {DOC_LANGS[l].native}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {actions.filter((a) => a.show).map((a) => (
              <Button key={a.key} size="sm" variant={(a.variant as any) ?? "default"} onClick={() => setConfirmStatus(a.status)}>
                <a.icon className="h-4 w-4" />
                {a.label}
              </Button>
            ))}
            {editable && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                {t("actions.edit")}
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {editing ? (
          <QuotationForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["quotation", id] }); }} />
        ) : (
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">{t("quotes.tab.general")}</TabsTrigger>
              <TabsTrigger value="items">{t("quotes.tab.items")} ({apiItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardContent className="grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <KV k={t("quotes.number")} v={<span dir="ltr">{r.code}</span>} />
                  <KV k={t("quotes.customer")} v={`${customerName} — ${t(`ctype.${r.customer?.type}`, r.customer?.type ?? "")}`} />
                  <KV k={rtl ? "دولة العميل" : "Customer Country"} v={localizedName(r.customer?.country, rtl)} />
                  <KV k={rtl ? "رقم هاتف العميل" : "Customer Phone"} v={r.customer?.phone ?? "—"} />
                  <KV k={rtl ? "بريد العميل" : "Customer Email"} v={r.customer?.email ?? "—"} />

                  <KV k={rtl ? "بداية صلاحية العرض" : "Offer Valid From"} v={formatDateTime(r.start_date, lang)} />
                  <KV k={rtl ? "نهاية صلاحية العرض" : "Offer Valid Until"} v={formatDateTime(r.end_date, lang)} />
                  <KV k={rtl ? "تاريخ الوصول" : "Check-in Date"} v={r.check_in ? formatDate(r.check_in, lang) : stay ? formatDate(stay.checkIn, lang) : "—"} />
                  <KV k={rtl ? "تاريخ المغادرة" : "Check-out Date"} v={r.check_out ? formatDate(r.check_out, lang) : stay ? formatDate(stay.checkOut, lang) : "—"} />
                  {stay && stay.nights > 0 && <KV k={rtl ? "عدد الليالي" : "Nights"} v={stay.nights} />}
                  {r.valid_from && <KV k={rtl ? "صالح من" : "Valid From"} v={formatDate(r.valid_from, lang)} />}
                  {r.valid_to && <KV k={rtl ? "صالح حتى" : "Valid To"} v={formatDate(r.valid_to, lang)} />}

                  <KV k={rtl ? "الفندق" : "Hotel"} v={hotelName} />
                  <KV k={rtl ? "الدولة" : "Country"} v={countryName} />
                  <KV k={rtl ? "المدينة" : "City"} v={cityName} />
                  <KV k={rtl ? "نجوم الفندق" : "Hotel Stars"} v={r.hotel?.stars ? "★".repeat(r.hotel.stars) : "—"} />

                  <KV k={rtl ? "حجم المجموعة" : "Group Size"} v={r.group_size ?? "—"} />
                  <KV k={rtl ? "اللغة" : "Language"} v={localizedName(r.language, rtl)} />

                  <KV k={t("label.currency")} v={currencyCode} />
                  <KV k={rtl ? "القيمة الإجمالية" : "Total Value"} v={money(r.total_value)} />
                  <KV k={rtl ? "القيمة بالريال" : "Total Value (SAR)"} v={hidePrices ? "—" : `${Number(r.total_value_sar || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} SAR`} />
                  <KV k={rtl ? "سعر الصرف" : "Exchange Rate"} v={hidePrices ? "—" : (r.exchange_rate ?? "—")} />

                  <KV k={rtl ? "الحالة" : "Status"} v={r.status_text || r.status} />
                  <KV k={rtl ? "منتهي الصلاحية" : "Is Expired"} v={r.is_expired ? (rtl ? "نعم" : "Yes") : (rtl ? "لا" : "No")} />
                  <KV
                    k={rtl ? "توصية الشركة" : "Company Recommendation"}
                    v={
                      r.is_recommended ? (
                        <Badge variant="outline" className="flex w-fit items-center gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                          <ThumbsUp className="h-3 w-3 fill-current" />
                          {rtl ? "عرض موصى به للعميل" : "Recommended Offer for Customer"}
                        </Badge>
                      ) : (
                        rtl ? "عرض عادي" : "Standard Offer"
                      )
                    }
                  />

                  <KV k={t("label.notes")} v={r.notes ?? "—"} />
                  <KV k={rtl ? "تم الإنشاء بواسطة" : "Created By"} v={r.creator?.name ?? "—"} />
                  <KV k={rtl ? "تاريخ الإنشاء" : "Created At"} v={formatDateTime(r.created_at, lang)} />
                  <KV k={rtl ? "آخر تحديث" : "Updated At"} v={formatDateTime(r.updated_at, lang)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items">
              {apiItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">{t("quotes.items.empty")}</CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* ── Items Table ── */}
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40">
                              <TableHead className="w-8 text-center">#</TableHead>
                              <TableHead>{rtl ? "الغرفة" : "Room"}</TableHead>
                              <TableHead>{rtl ? "كود السعر" : "Price Code"}</TableHead>
                              <TableHead className="text-center">{rtl ? "خطة الوجبات" : "Meal Plan"}</TableHead>
                              <TableHead className="text-center">{rtl ? "المصدر" : "Source"}</TableHead>
                              <TableHead className="text-center">{rtl ? "الضريبة" : "Tax"}</TableHead>
                              <TableHead className="text-center">{rtl ? "عدد الغرف" : "Rooms"}</TableHead>
                              <TableHead className="text-center">{rtl ? "الليالي" : "Nights"}</TableHead>
                              <TableHead className="text-center">{rtl ? "سعر الليلة" : "Night Price"}</TableHead>
                              <TableHead className="text-center">{rtl ? "الإجمالي" : "Subtotal"}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {apiItems.map((item: any, idx: number) => {
                              const pd = item.price_details ?? {};
                              const { nights: itemNights } = getStayDates(r);
                              const roomName = localizedName(pd.room, rtl);
                              const mealPlan = pd.meal_plan_type || "inclusive";
                              const taxRate = pd.tax_rate ?? 0;
                              const taxType = pd.tax_type || "";

                              return (
                                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                                  {/* Index */}
                                  <TableCell className="text-center text-muted-foreground text-xs font-mono">
                                    {idx + 1}
                                  </TableCell>

                                  {/* Room Name */}
                                  <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-semibold text-sm">{roomName}</span>
                                      {pd.room?.code && (
                                        <span className="text-[10px] text-muted-foreground font-mono">{pd.room.code}</span>
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Price Code */}
                                  <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-mono text-muted-foreground">{pd.code || "—"}</span>
                                      {pd.valid_from && pd.valid_to && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {pd.valid_from} → {pd.valid_to}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Meal Plan */}
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={`text-[11px] font-medium ${mealPlan === "inclusive"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                        : mealPlan === "room_only"
                                          ? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700"
                                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                                        }`}
                                    >
                                      {mealLabel(mealPlan)}
                                    </Badge>
                                  </TableCell>

                                  {/* Source (Direct / Supplier) */}
                                  <TableCell className="text-center">
                                    {pd.is_direct ? (
                                      <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                                        {rtl ? "مباشر" : "Direct"}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[11px] bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800">
                                        {localizedName(pd.supplier, rtl) || (pd.supplier_id ? `#${pd.supplier_id}` : "—")}
                                      </Badge>
                                    )}
                                  </TableCell>

                                  {/* Tax */}
                                  <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-xs font-medium">{taxRate}%</span>
                                      {taxType && (
                                        <span className="text-[10px] text-muted-foreground">
                                          {taxType === "inclusive_tax"
                                            ? (rtl ? "شامل" : "Incl.")
                                            : taxType === "exclusive_tax"
                                              ? (rtl ? "غير شامل" : "Excl.")
                                              : taxType}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>

                                  {/* Rooms Count */}
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm">
                                      {item.room_count}
                                    </span>
                                  </TableCell>

                                  {/* Nights */}
                                  <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold text-sm">
                                      {itemNights}
                                    </span>
                                  </TableCell>

                                  {/* Night Price */}
                                  <TableCell className="text-center">
                                    <span dir="ltr" className="font-semibold text-sm">
                                      {money(item.night_price)}
                                    </span>
                                  </TableCell>

                                  {/* Subtotal */}
                                  <TableCell className="text-center">
                                    <span dir="ltr" className="font-bold text-sm text-primary">
                                      {money(item.subtotal)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ── Summary Footer ── */}
                  {!hidePrices && (
                    <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-6">
                            {/* Items count */}
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                {rtl ? "عدد البنود" : "Items"}
                              </span>
                              <span className="text-lg font-bold">{apiItems.length}</span>
                            </div>
                            {/* Total Rooms */}
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                {rtl ? "إجمالي الغرف" : "Total Rooms"}
                              </span>
                              <span className="text-lg font-bold">
                                {apiItems.reduce((sum: number, i: any) => sum + (i.room_count || 0), 0)}
                              </span>
                            </div>
                            {/* Nights */}
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                {rtl ? "الليالي" : "Nights"}
                              </span>
                              <span className="text-lg font-bold">{stay?.nights || 0}</span>
                            </div>
                            {/* Average per night */}
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                                {rtl ? "متوسط الليلة" : "Avg/Night"}
                              </span>
                              <span dir="ltr" className="text-lg font-bold text-muted-foreground">
                                {stay && stay.nights > 0
                                  ? `${(Number(r.total_value || 0) / stay.nights).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                          {/* Grand Total */}
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                              {t("quotes.pricing.grand_total")}
                            </span>
                            <span dir="ltr" className="text-2xl font-extrabold text-primary">
                              {Number(r.total_value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} {currencySymbol}
                            </span>
                            {r.total_value_sar && currencyCode !== "SAR" && (
                              <span dir="ltr" className="text-xs text-muted-foreground mt-0.5">
                                ≈ {Number(r.total_value_sar || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} SAR
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={!!supplierDialog} onOpenChange={(open) => !open && setSupplierDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("quotes.select_supplier")}</DialogTitle>
          </DialogHeader>
          <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialog(null)}>{t("actions.cancel")}</Button>
            <Button onClick={confirmSupplierAction}>{t("actions.confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
        title={t("quotes.confirm_status")}
        description={confirmStatus ? t(`qstatus.${confirmStatus}`, confirmStatus) : ""}
        onConfirm={() => confirmStatus && statusMut.mutate(confirmStatus)}
      />
    </>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v ?? "—"}</span>
    </div>
  );
}

export { QuotationDetail as Component };
