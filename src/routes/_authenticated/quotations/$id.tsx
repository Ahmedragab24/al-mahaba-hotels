import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Send, Check, X, Undo2, Printer, Ban, Clock, RotateCcw, MessageCircle, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { QuotationForm } from "./-form";
import { ItemsTab, useQuotationItems } from "./-items";
import { openQuotationPrint } from "./-print";
import { DOC_LANG_LIST, DOC_LANGS, toDocLang, renderWaTemplate, waTemplateExists, missingDocKeys, type DocLang } from "@/lib/doc-lang";
import { EntityAttachments } from "@/components/entity-attachments";
import { ApprovalWorkflow } from "@/components/approval-workflow";
import { EntityHistory } from "@/components/entity-history";
import { QStatusBadge } from "./index";

export default function QuotationDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const canWrite = hasAnyRole(auth, ["super_admin", "admin", "sales_manager", "sales_agent"]);
  const canApprove = hasAnyRole(auth, ["super_admin", "admin", "sales_manager"]);
  const [editing, setEditing] = useState(searchParams.get('edit') === '1');
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      const response = await apiClient.quotations.getById(id);
      return response;
    },
  });
  const items = useQuotationItems(id || "");

  const creator = useQuery({
    queryKey: ["profile-mini", q.data?.created_by],
    enabled: !!q.data?.created_by,
    queryFn: async () => (await apiClient.users.getById(q.data.created_by)).data as any,
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
    onError: (e: any) => { setConfirmStatus(null); toast.error(dbErrorMessage(e)); },
  });

  const doPrint = async (printLang: DocLang) => {
    if (!q.data) return;
    if ((q.data.items?.length ?? 0) === 0) { toast.error(t("quotes.err_no_items")); return; }
    if (missingDocKeys(printLang, "quotation").length > 0) { toast.error(t("doc.missing_translations")); return; }
    const customerName = DOC_LANGS[printLang].dir === "rtl"
      ? (q.data.customer?.name_ar || q.data.customer?.name_en)
      : (q.data.customer?.name_en || q.data.customer?.name_ar);

    // Transform items to match print format
    const printItems = (q.data.items ?? []).map((item: any) => {
      const checkIn = item.price_details?.valid_from || q.data.start_date;
      const checkOut = item.price_details?.valid_to || q.data.end_date;
      const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 1;

      return {
        hotel: item.price_details?.hotel || q.data.hotel,
        room_type: item.price_details?.room,
        occupancy_type: "standard",
        check_in: checkIn,
        check_out: checkOut,
        nights: nights,
        rooms: item.room_count,
        selling_price: item.night_price,
        taxes: 0,
        fees: 0,
        total_selling: item.subtotal,
        total_cost: item.subtotal_sar / (q.data.exchange_rate || 1),
        margin: item.subtotal - (item.subtotal_sar / (q.data.exchange_rate || 1)),
      };
    });

    const ok = await openQuotationPrint({
      lang: printLang,
      quotation: {
        ...q.data,
        quotation_no: q.data.code,
        quotation_date: q.data.start_date,
        travel_date: q.data.start_date,
        expiry_date: q.data.end_date,
        currency: typeof q.data.currency === 'object' ? q.data.currency.code : q.data.currency,
      },
      customerName: customerName ?? "—",
      items: printItems
    });
    if (ok) {
      toast.success(t("quotes.pdf_ok"));
      qc.invalidateQueries({ queryKey: ["entity-history", "quotations", id] });
    }
  };

  // WhatsApp sending — language defaults to customer preferred language (BR-WA)
  const sendWhatsApp = async (waLang: DocLang) => {
    if (!q.data) return;
    if ((q.data.items?.length ?? 0) === 0) { toast.error(t("quotes.err_no_items")); return; }
    if (!waTemplateExists("quotation", waLang)) { toast.error(t("wa.no_template")); return; }
    const r = q.data;
    const rtl = DOC_LANGS[waLang].dir === "rtl";
    const cName = (rtl ? r.customer?.name_ar || r.customer?.name_en : r.customer?.name_en || r.customer?.name_ar) ?? "—";
    const hotels = (r.items ?? [])
      .map((i: any) => `• ${(rtl ? i.price_details?.hotel?.name_ar || i.price_details?.hotel?.name_en : i.price_details?.hotel?.name_en || i.price_details?.hotel?.name_ar) ?? "—"} (${i.room_count} rooms)`)
      .join("\n");
    const total = r.total_value || 0;
    const currencyCode = typeof r.currency === 'object' ? r.currency.code : r.currency;
    const tpl = renderWaTemplate("quotation", waLang, {
      customer: cName,
      quotation_no: r.code,
      hotels,
      total: total.toLocaleString("en-US", { minimumFractionDigits: 2 }),
      currency: currencyCode,
      valid_until: new Date(r.end_date + "T00:00:00").toLocaleDateString(DOC_LANGS[waLang].locale),
      company: waLang === "ar" ? "دليل المعالم" : waLang === "ur" ? "دلیل المعالم" : "Dalil Al-Maalem",
    });
    if (!tpl) { toast.error(t("wa.no_template")); return; }
    // BR-WA-003: store sent copy with language + template in the communication log
    try {
      await apiClient.customerCommunications.create({
        customer_id: r.customer_id, channel: "whatsapp", direction: "outbound",
        subject: `${tpl.name} [${waLang}] — ${r.code}`, body: tpl.body,
      });
      await db.rpc("log_audit", {
        _action: "whatsapp_send", _entity_type: "quotations", _entity_id: r.id,
        _metadata: { lang: waLang, template: tpl.name, quotation_no: r.quotation_no },
      });
    } catch { /* logging must not block sending */ }
    const phone = String(r.customer?.phone ?? "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(tpl.body)}`, "_blank");
    toast.success(t("wa.sent"));
  };

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!q.data) return <div className="p-6 text-muted-foreground">{t("quotes.no_found")}</div>;

  const r = q.data;
  const customerName = lang === "ar" ? (r.customer?.name_ar || r.customer?.name_en) : (r.customer?.name_en || r.customer?.name_ar);
  const editable = canWrite && (r.status === "draft" || r.status === "rejected") && !r.deleted_at;
  const preferredLang = toDocLang(r.customer?.preferred_language);
  const langOrder: DocLang[] = [preferredLang, ...DOC_LANG_LIST.filter((l) => l !== preferredLang)];

  // Workflow buttons per status
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
        title={`${r.code} — ${customerName ?? ""}`}
        subtitle={`${formatDate(r.start_date)} → ${formatDate(r.end_date)} · ${typeof r.currency === 'object' ? r.currency?.code : r.currency} · ${t("quotes.creator")}: ${(lang === "ar" ? creator.data?.full_name_ar : creator.data?.full_name_en) || creator.data?.email || "—"} (${formatDateTime(r.created_at, lang)})`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/quotations")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {/* <QStatusBadge status={r.status} t={t} /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline"><Printer className="h-4 w-4" /> {t("quotes.print")}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {langOrder.map((l) => (
                  <DropdownMenuItem key={l} onClick={() => doPrint(l)}>
                    {DOC_LANGS[l].native} PDF{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /> {t("quotes.send_whatsapp")}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {langOrder.map((l) => (
                  <DropdownMenuItem key={l} onClick={() => sendWhatsApp(l)}>
                    {DOC_LANGS[l].native}{l === preferredLang ? " ★" : ""}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {editable && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />{t("actions.edit")}
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6">
        {editing ? (
          <QuotationForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["quotation", id] }); }} />
        ) : (
          <Card>
            <CardContent className="grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
              <KV k={t("quotes.number")} v={<span dir="ltr">{r.code}</span>} />
              <KV k={t("quotes.customer")} v={`${customerName ?? "—"} — ${t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")}`} />
              <KV k={t("label.currency")} v={typeof r.currency === 'object' ? r.currency?.code : r.currency} />
              <KV k={t("quotes.start_date")} v={formatDate(r.start_date)} />
              <KV k={t("quotes.end_date")} v={formatDate(r.end_date)} />
              <KV k={lang === "ar" ? "حجم المجموعة" : "Group Size"} v={r.group_size ?? "—"} />
              <KV k={lang === "ar" ? "اللغة" : "Language"} v={lang === "ar" ? r.language?.name_ar : r.language?.name_en} />
              <KV k={lang === "ar" ? "الفندق" : "Hotel"} v={lang === "ar" ? r.hotel?.name_ar : r.hotel?.name_en} />
              <KV k={lang === "ar" ? "القيمة الإجمالية" : "Total Value"} v={`${r.total_value || 0} ${typeof r.currency === 'object' ? r.currency?.code : r.currency}`} />
              <KV k={lang === "ar" ? "القيمة بالريال" : "Total Value (SAR)"} v={`${r.total_value_sar || 0} SAR`} />
              <KV k={lang === "ar" ? "سعر الصرف" : "Exchange Rate"} v={r.exchange_rate ?? "—"} />
              <KV k={lang === "ar" ? "منتهي الصلاحية" : "Is Expired"} v={r.is_expired ? (lang === "ar" ? "نعم" : "Yes") : (lang === "ar" ? "لا" : "No")} />
              <KV k={lang === "ar" ? "توصية الشركة" : "Company Recommendation"} v={r.is_recommended ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 w-fit">
                  <ThumbsUp className="h-3 w-3 fill-current" />
                  {lang === "ar" ? "عرض موصى به للعميل" : "Recommended Offer for Customer"}
                </Badge>
              ) : (
                lang === "ar" ? "عرض عادي" : "Standard Offer"
              )} />
              <KV k={t("label.notes")} v={r.notes ?? "—"} />
              <KV k={lang === "ar" ? "تم الإنشاء بواسطة" : "Created By"} v={r.creator?.name ?? "—"} />
              <KV k={lang === "ar" ? "تاريخ الإنشاء" : "Created At"} v={formatDateTime(r.created_at, lang)} />
              <KV k={lang === "ar" ? "آخر تحديث" : "Updated At"} v={formatDateTime(r.updated_at, lang)} />
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
        title={t("quotes.confirm_status")}
        description={confirmStatus ? t(`qstatus.${confirmStatus}`) : ""}
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

function PricingTab({ items, currency, t }: { items: any[]; currency: string; t: (k: string, f?: string) => string }) {
  const money = (n: number) => `${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  const totalCost = items.reduce((a, i) => a + Number(i.total_cost), 0);
  const roomsSelling = items.reduce((a, i) => a + Number(i.selling_price ?? 0) * i.nights * i.rooms, 0);
  const taxes = items.reduce((a, i) => a + Number(i.taxes), 0);
  const fees = items.reduce((a, i) => a + Number(i.fees), 0);
  const margin = items.reduce((a, i) => a + Number(i.margin), 0);
  const grand = items.reduce((a, i) => a + Number(i.total_selling), 0);
  const marginPct = totalCost > 0 ? (margin / totalCost) * 100 : 0;

  const rows: [string, string, boolean?][] = [
    [t("quotes.pricing.total_cost"), money(totalCost)],
    [t("quotes.pricing.room_total"), money(roomsSelling)],
    [t("quotes.pricing.margin"), money(margin)],
    [t("quotes.items.margin") + " %", `${marginPct.toFixed(2)} %`],
    [t("quotes.pricing.taxes"), money(taxes)],
    [t("quotes.pricing.fees"), money(fees)],
    [t("quotes.pricing.grand_total"), money(grand), true],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value, highlight], i) => (
        <Card key={i} className={highlight ? "border-primary bg-primary/5" : undefined}>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div dir="ltr" className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
