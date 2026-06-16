import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
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

export const Route = createFileRoute("/_authenticated/quotations/$id")({
  component: QuotationDetail,
});

function QuotationDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "sales_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "sales_manager"]);
  const [editing, setEditing] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*, customer:customers(name_en,name_ar,customer_type,email,phone,preferred_language)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const items = useQuotationItems(id);

  const creator = useQuery({
    queryKey: ["profile-mini", q.data?.created_by],
    enabled: !!q.data?.created_by,
    queryFn: async () => (await supabase.from("profiles").select("email,full_name_ar,full_name_en").eq("id", q.data.created_by).maybeSingle()).data as any,
  });

  const statusMut = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("quotations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null);
      qc.invalidateQueries({ queryKey: ["quotation", id] });
      qc.invalidateQueries({ queryKey: ["approval-requests", "quotation", id] });
      qc.invalidateQueries({ queryKey: ["quotes-metrics"] });
    },
    onError: (e: any) => { setConfirmStatus(null); toast.error(dbErrorMessage(e, t)); },
  });

  const doPrint = async (printLang: DocLang) => {
    if (!q.data) return;
    if ((items.data?.length ?? 0) === 0) { toast.error(t("quotes.err_no_items")); return; }
    if (missingDocKeys(printLang, "quotation").length > 0) { toast.error(t("doc.missing_translations")); return; }
    const customerName = DOC_LANGS[printLang].dir === "rtl"
      ? (q.data.customer?.name_ar || q.data.customer?.name_en)
      : (q.data.customer?.name_en || q.data.customer?.name_ar);
    const ok = await openQuotationPrint({ lang: printLang, quotation: q.data, customerName: customerName ?? "—", items: (items.data ?? []) as any });
    if (ok) {
      toast.success(t("quotes.pdf_ok"));
      qc.invalidateQueries({ queryKey: ["entity-history", "quotations", id] });
    }
  };

  // WhatsApp sending — language defaults to customer preferred language (BR-WA)
  const sendWhatsApp = async (waLang: DocLang) => {
    if (!q.data) return;
    if ((items.data?.length ?? 0) === 0) { toast.error(t("quotes.err_no_items")); return; }
    if (!waTemplateExists("quotation", waLang)) { toast.error(t("wa.no_template")); return; }
    const r = q.data;
    const rtl = DOC_LANGS[waLang].dir === "rtl";
    const cName = (rtl ? r.customer?.name_ar || r.customer?.name_en : r.customer?.name_en || r.customer?.name_ar) ?? "—";
    const hotels = (items.data ?? [])
      .map((i: any) => `• ${(rtl ? i.hotel?.name_ar || i.hotel?.name_en : i.hotel?.name_en || i.hotel?.name_ar) ?? "—"} (${i.nights} × ${i.rooms})`)
      .join("\n");
    const total = (items.data ?? []).reduce((a: number, i: any) => a + Number(i.total_selling), 0);
    const tpl = renderWaTemplate("quotation", waLang, {
      customer: cName,
      quotation_no: r.quotation_no,
      hotels,
      total: total.toLocaleString("en-US", { minimumFractionDigits: 2 }),
      currency: r.currency,
      valid_until: new Date(r.expiry_date + "T00:00:00").toLocaleDateString(DOC_LANGS[waLang].locale),
      company: waLang === "ar" ? "دليل للسفر والسياحة" : waLang === "ur" ? "دلیل ٹریول اینڈ ٹورازم" : "Daleel Travel & Tourism",
    });
    if (!tpl) { toast.error(t("wa.no_template")); return; }
    // BR-WA-003: store sent copy with language + template in the communication log
    try {
      await supabase.from("customer_communications").insert({
        customer_id: r.customer_id, channel: "whatsapp", direction: "outbound",
        subject: `${tpl.name} [${waLang}] — ${r.quotation_no}`, body: tpl.body,
      });
      await (supabase.rpc as any)("log_audit", {
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
        title={`${r.quotation_no} — ${customerName ?? ""}`}
        subtitle={`${formatDate(r.quotation_date)} → ${formatDate(r.expiry_date)} · ${r.currency} · ${t("quotes.creator")}: ${(lang === "ar" ? creator.data?.full_name_ar : creator.data?.full_name_en) || creator.data?.email || "—"} (${formatDateTime(r.created_at, lang)})`}
        children={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/quotations" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <QStatusBadge status={r.status} t={t} />
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
            {actions.filter((a) => a.show).map((a) => (
              <Button key={a.key} size="sm" variant={(a.variant as any) ?? "default"} onClick={() => setConfirmStatus(a.status)}>
                <a.icon className="h-4 w-4" />{a.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="general">{t("quotes.tab.general")}</TabsTrigger>
            <TabsTrigger value="items">{t("quotes.tab.items")}</TabsTrigger>
            <TabsTrigger value="pricing">{t("quotes.tab.pricing")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="approval">{t("tab.approval")}</TabsTrigger>
            <TabsTrigger value="history">{t("quotes.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {editing ? (
              <QuotationForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["quotation", id] }); }} />
            ) : (
              <Card>
                <CardContent className="grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <KV k={t("quotes.number")} v={<span dir="ltr">{r.quotation_no}</span>} />
                  <KV k={t("quotes.customer")} v={`${customerName ?? "—"} — ${t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")}`} />
                  <KV k={t("filter.status")} v={<QStatusBadge status={r.status} t={t} />} />
                  <KV k={t("label.currency")} v={r.currency} />
                  <KV k={t("quotes.quotation_date")} v={formatDate(r.quotation_date)} />
                  <KV k={t("quotes.travel_date")} v={r.travel_date ? formatDate(r.travel_date) : "—"} />
                  <KV k={t("quotes.expiry_date")} v={formatDate(r.expiry_date)} />
                  <KV k={lang === "ar" ? "توصية الشركة" : "Company Recommendation"} v={r.is_recommended ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1 w-fit">
                      <ThumbsUp className="h-3 w-3 fill-current" />
                      {lang === "ar" ? "عرض موصى به للعميل" : "Recommended Offer for Customer"}
                    </Badge>
                  ) : (
                    lang === "ar" ? "عرض عادي" : "Standard Offer"
                  )} />
                  <KV k={t("label.notes")} v={r.notes ?? "—"} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items">
            <ItemsTab quotationId={id} currency={r.currency} editable={editable} />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTab items={(items.data ?? []) as any[]} currency={r.currency} t={t} />
          </TabsContent>

          <TabsContent value="attachments"><EntityAttachments entityType="quotation" entityId={id} /></TabsContent>
          <TabsContent value="approval"><ApprovalWorkflow entityType="quotation" entityId={id} /></TabsContent>
          <TabsContent value="history"><EntityHistory entityType="quotations" entityId={id} /></TabsContent>
        </Tabs>
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
