// Hotel Information sharing actions — Preview / Print-PDF / WhatsApp (BRD Hotel Information Sharing).
// Languages: Arabic, English, Indonesian, Urdu. Defaults to customer preferred language in customer context.
import { useMemo, useState, useEffect } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Printer, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DOC_LANGS, DOC_LANG_LIST, toDocLang, renderWaTemplate, waTemplateExists, HOTEL_RES, type DocLang,
} from "@/lib/doc-lang";
import { fetchHotelShareData, buildHotelInfoHtml, openHotelInfoPrint, haramInfo } from "./-share";

export function HotelShareActions({ hotelId, contextCustomerId }: { hotelId: string; contextCustomerId?: string }) {
  const { t, lang: uiLang } = useI18n();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLang, setPreviewLang] = useState<DocLang | null>(null);
  const [waOpen, setWaOpen] = useState(false);
  const [waLang, setWaLang] = useState<DocLang | null>(null);
  const [waCustomerId, setWaCustomerId] = useState<string | undefined>(contextCustomerId);
  const [sending, setSending] = useState(false);

  const share = useQuery({
    queryKey: ["hotel-share", hotelId],
    queryFn: () => fetchHotelShareData(hotelId),
    enabled: previewOpen || waOpen,
  });

  const customers = useQuery({
    queryKey: ["customers-lite-wa"],
    queryFn: async () => {
      const { data, error } = await db
        .from("customers")
        .select("id,name_en,name_ar,phone,preferred_language")
        .is("deleted_at", null)
        .order("name_en")
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
    enabled: waOpen || !!contextCustomerId,
  });

  const contextCustomer = customers.data?.find((c: any) => c.id === contextCustomerId);
  // Default to customer preferred language when launched from a customer/quotation context.
  const preferredLang: DocLang = contextCustomer ? toDocLang(contextCustomer.preferred_language) : toDocLang(uiLang);
  const langOrder: DocLang[] = [preferredLang, ...DOC_LANG_LIST.filter((l) => l !== preferredLang)];
  const effPreviewLang = previewLang ?? preferredLang;
  const effWaLang = waLang ?? preferredLang;

  const previewHtml = useMemo(() => {
    if (!share.data?.hotel) return null;
    return buildHotelInfoHtml(effPreviewLang, share.data);
  }, [share.data, effPreviewLang]);

  const waMessage = useMemo(() => {
    const data = share.data;
    if (!data?.hotel || !waTemplateExists("hotel_info", effWaLang)) return null;
    const h = data.hotel;
    const s = HOTEL_RES[effWaLang];
    const rtl = DOC_LANGS[effWaLang].dir === "rtl";
    const nm = (o: any) => (rtl ? o?.name_ar || o?.name_en : o?.name_en || o?.name_ar) ?? "—";
    return renderWaTemplate("hotel_info", effWaLang, {
      hotel: nm(h),
      city: nm(h.city),
      rating: (h.stars ?? h.star_rating) ? "★".repeat(h.stars ?? h.star_rating) : "—",
      company: s.company,
    });
  }, [share.data, effWaLang]);

  const [editableBody, setEditableBody] = useState<string>("");

  useEffect(() => {
    if (waMessage?.body) {
      setEditableBody(waMessage.body);
    } else {
      setEditableBody("");
    }
  }, [waMessage]);

  const doPrint = async (l: DocLang) => {
    const data = share.data ?? (await fetchHotelShareData(hotelId));
    if (!data.hotel) return;
    const ok = await openHotelInfoPrint(l, data);
    if (!ok) toast.error(t("doc.missing_translations"));
  };

  const doSend = async () => {
    const data = share.data;
    if (!data?.hotel) return;
    if (!waTemplateExists("hotel_info", effWaLang) || !waMessage) { toast.error(t("wa.no_template")); return; }
    const cust = customers.data?.find((c: any) => c.id === waCustomerId);
    if (!cust) { toast.error(t("wa.select_customer")); return; }
    setSending(true);
    // BR-WA: store sent copy with language + template; write success/failure to Audit Log.
    let logged = true;
    try {
      await apiClient.customerCommunications.create({
        customer_id: cust.id, channel: "whatsapp", direction: "outbound",
        subject: `${waMessage.name} [${effWaLang}] — ${data.hotel.code}`, body: editableBody,
      });
    } catch {
      logged = false;
    }
    try {
      await db.rpc("log_audit", {
        _action: "whatsapp_send",
        _entity_type: "hotels",
        _entity_id: data.hotel.id,
        _metadata: {
          lang: effWaLang, template: waMessage.name, doc: "hotel_information",
          hotel_code: data.hotel.code, customer_id: cust.id, status: logged ? "success" : "failed",
        },
      });
    } catch { /* audit failure must not block UI */ }
    setSending(false);
    if (!logged) { toast.error(t("wa.failed")); return; }
    const phone = String(cust.phone ?? "").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(editableBody)}`, "_blank");
    toast.success(t("wa.sent"));
    setWaOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
        <Eye className="h-4 w-4" /> {t("hotels.preview_info")}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm"><Printer className="h-4 w-4" /> {t("hotels.print_info")}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {langOrder.map((l) => (
            <DropdownMenuItem key={l} onClick={() => doPrint(l)}>
              {DOC_LANGS[l].native} PDF{l === preferredLang ? " ★" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={() => setWaOpen(true)}>
        <MessageCircle className="h-4 w-4" /> {t("hotels.send_whatsapp")}
      </Button>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("hotels.info_doc")}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Select value={effPreviewLang} onValueChange={(v) => setPreviewLang(v as DocLang)}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {langOrder.map((l) => (
                  <SelectItem key={l} value={l}>{DOC_LANGS[l].native}{l === preferredLang ? " ★" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {share.isLoading ? (
            <div className="py-12 text-center text-muted-foreground">{t("label.loading")}</div>
          ) : previewHtml ? (
            <iframe title="hotel-info-preview" srcDoc={previewHtml} className="h-[60vh] w-full rounded-md border bg-white" />
          ) : (
            <div className="py-12 text-center text-destructive">{t("doc.missing_translations")}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t("actions.close")}</Button>
            <Button onClick={() => doPrint(effPreviewLang)} disabled={!previewHtml}>
              <Printer className="h-4 w-4" /> {t("hotels.print_info")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp dialog with mandatory message preview */}
      <Dialog open={waOpen} onOpenChange={setWaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("hotels.send_whatsapp")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("wa.language")}</div>
              <Select value={effWaLang} onValueChange={(v) => setWaLang(v as DocLang)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {langOrder.map((l) => (
                    <SelectItem key={l} value={l}>{DOC_LANGS[l].native}{l === preferredLang ? " ★" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("wa.customer")}</div>
              <Select value={waCustomerId} onValueChange={setWaCustomerId}>
                <SelectTrigger><SelectValue placeholder={t("wa.select_customer")} /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(customers.data) ? customers.data : Array.isArray(customers.data?.data) ? customers.data.data : [])?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(uiLang === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar) ?? c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{t("wa.message_preview")}</div>
              {waMessage ? (
                <Textarea
                  dir={DOC_LANGS[effWaLang].dir}
                  className="min-h-[220px] font-sans text-sm resize-y"
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                />
              ) : (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  {t("wa.no_template")}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaOpen(false)}>{t("actions.close")}</Button>
            <Button onClick={doSend} disabled={sending || !editableBody.trim() || !waCustomerId}>
              <MessageCircle className="h-4 w-4" /> {t("wa.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}