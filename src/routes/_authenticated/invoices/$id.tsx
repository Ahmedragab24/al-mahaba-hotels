// Invoice detail — Section 15 (BR-INV). Items, status workflow, payments, sharing, history.
import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { EntityHistory } from "@/components/entity-history";
import { EntityAttachments } from "@/components/entity-attachments";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Printer, Mail, MessageCircle, Plus, Trash2, Send, BadgeCheck, Ban } from "lucide-react";
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
  const qc = useQueryClient();
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

  const q = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const [{ data: inv, error }, { data: items }, { data: allocs }] = await Promise.all([
        db.from("invoices").select("*, customer:customers(name_en,name_ar,email,phone), booking:bookings(booking_no)").eq("id", id).maybeSingle(),
        db.from("invoice_items").select("*").eq("invoice_id", id).order("created_at"),
        db.from("receipt_allocations").select("*, receipt:receipts(receipt_no,receipt_date,payment_method,status)").eq("invoice_id", id).order("created_at"),
      ]);
      if (error) throw error;
      return { inv, items: items ?? [], allocs: allocs ?? [] };
    },
  });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["invoice", id] }); qc.invalidateQueries({ queryKey: ["invoices"] }); };

  const setStatus = async (status: string, extra?: Record<string, unknown>) => {
    setBusy(true);
    try {
      await apiClient.invoices.update(id || "", { status, ...extra });
      toast.success(t("label.saved", "Saved"));
      setCancelOpen(false);
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); } finally { setBusy(false); }
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

  const removeItem = async (itemId: string) => {
    try {
      await apiClient.invoiceItems.delete(itemId);
      refresh();
    } catch (e) { toast.error(dbErrorMessage(e)); }
  };

  if (q.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  const x = q.data?.inv as any;
  if (!x) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;
  const items = q.data!.items as any[];
  const allocs = q.data!.allocs as any[];
  const custName = x.customer ? (lang === "ar" ? x.customer.name_ar || x.customer.name_en : x.customer.name_en || x.customer.name_ar) : "—";
  const balance = Number(x.total_amount) - Number(x.paid_amount);
  const isDraft = x.status === "draft";

  const printInvoice = () => {
    const rows = items.map((i) => `<tr><td>${lang === "ar" ? i.description_ar || i.description_en : i.description_en}</td><td>${i.quantity}</td><td>${Number(i.unit_price).toLocaleString()}</td><td>${Number(i.taxes).toLocaleString()}</td><td>${Number(i.fees).toLocaleString()}</td><td>${Number(i.line_total).toLocaleString()}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html dir="${dir}"><head><meta charset="utf-8"><title>${x.invoice_no}</title>
<style>body{font-family:system-ui;padding:32px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;font-size:12px;text-align:start}tfoot td{font-weight:700}</style></head><body>
<h1>${t("inv.title")} · ${x.invoice_no}</h1>
<p>${t("inv.customer")}: ${custName}<br/>${t("inv.date")}: ${x.invoice_date} · ${t("inv.due_date")}: ${x.due_date}<br/>${t("label.status")}: ${t(`invstatus.${x.status}`)}</p>
<table><thead><tr><th>${t("inv.item_desc")}</th><th>${t("inv.qty")}</th><th>${t("inv.unit_price")}</th><th>${t("inv.taxes")}</th><th>${t("inv.fees")}</th><th>${t("inv.line_total")}</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="5">${t("inv.subtotal")}</td><td>${Number(x.subtotal).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.discount")}</td><td>${Number(x.discount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.total")} (${x.currency})</td><td>${Number(x.total_amount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.paid")}</td><td>${Number(x.paid_amount).toLocaleString()}</td></tr>
<tr><td colspan="5">${t("inv.balance")}</td><td>${balance.toLocaleString()}</td></tr></tfoot></table>
<script>window.print()</script></body></html>`);
    w.document.close();
  };

  const shareText = `${t("inv.email_subject")} ${x.invoice_no} — ${formatMoney(Number(x.total_amount), x.currency, lang)}`;
  const emailHref = `mailto:${x.customer?.email ?? ""}?subject=${encodeURIComponent(`${t("inv.email_subject")} ${x.invoice_no}`)}&body=${encodeURIComponent(`${t("inv.email_body")}\n${shareText}`)}`;
  const waHref = `https://wa.me/${String(x.customer?.phone ?? "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(shareText)}`;

  return (
    <>
      <PageHeader
        title={x.invoice_no}
        subtitle={`${custName} · ${formatMoney(Number(x.total_amount), x.currency, lang)}`}
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
            {canWrite && !["paid", "cancelled"].includes(x.status) && (
              <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}><Ban className="h-4 w-4" />{t("inv.cancel")}</Button>
            )}
            <InvStatusBadge status={x.status} t={t} />
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">{t("inv.general")}</TabsTrigger>
            <TabsTrigger value="items">{t("inv.items")}</TabsTrigger>
            <TabsTrigger value="payments">{t("inv.payments")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("inv.attachments")}</TabsTrigger>
            <TabsTrigger value="history">{t("inv.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card><CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <KV label={t("inv.customer")} value={custName} />
              <KV label={t("inv.booking")} value={x.booking?.booking_no} />
              <KV label={t("inv.date")} value={formatDate(x.invoice_date, lang)} />
              <KV label={t("inv.due_date")} value={formatDate(x.due_date, lang)} />
              <KV label={t("inv.currency")} value={x.currency} />
              <KV label={t("inv.exchange_rate")} value={x.exchange_rate} />
              <KV label={t("inv.subtotal")} value={formatMoney(Number(x.subtotal), x.currency, lang)} />
              <KV label={t("inv.taxes")} value={formatMoney(Number(x.taxes), x.currency, lang)} />
              <KV label={t("inv.fees")} value={formatMoney(Number(x.fees), x.currency, lang)} />
              <KV label={t("inv.discount")} value={formatMoney(Number(x.discount), x.currency, lang)} />
              <KV label={t("inv.total")} value={<span className="font-bold">{formatMoney(Number(x.total_amount), x.currency, lang)}</span>} />
              <KV label={t("inv.paid")} value={formatMoney(Number(x.paid_amount), x.currency, lang)} />
              <KV label={t("inv.balance")} value={<span className="font-bold">{formatMoney(balance, x.currency, lang)}</span>} />
              {x.cancellation_reason && <KV label={t("inv.cancel_reason")} value={x.cancellation_reason} />}
              {x.notes && <div className="md:col-span-3"><KV label={t("label.notes")} value={<span className="whitespace-pre-wrap">{x.notes}</span>} /></div>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="items">
            <Card><CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="text-sm font-medium">{t("inv.items")} ({items.length})</div>
                {canWrite && isDraft && <Button size="sm" onClick={() => setItemOpen(true)}><Plus className="h-4 w-4" />{t("inv.add_item")}</Button>}
              </div>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("inv.item_desc")}</TableHead>
                  <TableHead className="text-end">{t("inv.qty")}</TableHead>
                  <TableHead className="text-end">{t("inv.unit_price")}</TableHead>
                  <TableHead className="text-end">{t("inv.taxes")}</TableHead>
                  <TableHead className="text-end">{t("inv.fees")}</TableHead>
                  <TableHead className="text-end">{t("inv.line_total")}</TableHead>
                  {canWrite && isDraft && <TableHead />}
                </TableRow></TableHeader>
                <TableBody>
                  {items.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="text-sm">{lang === "ar" ? i.description_ar || i.description_en : i.description_en}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(i.quantity)}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(i.unit_price).toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(i.taxes).toLocaleString()}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(i.fees).toLocaleString()}</TableCell>
                      <TableCell className="text-end font-medium tabular-nums">{Number(i.line_total).toLocaleString()}</TableCell>
                      {canWrite && isDraft && (
                        <TableCell className="text-end">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t("rct.number")}</TableHead>
                  <TableHead>{t("rct.date")}</TableHead>
                  <TableHead>{t("rct.method")}</TableHead>
                  <TableHead className="text-end">{t("rct.amount")}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {allocs.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                  {allocs.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.receipt?.receipt_no}</TableCell>
                      <TableCell className="text-xs">{formatDate(a.receipt?.receipt_date, lang)}</TableCell>
                      <TableCell className="text-xs">{a.receipt ? t(`pm.${a.receipt.payment_method}`, a.receipt.payment_method) : "—"}</TableCell>
                      <TableCell className="text-end tabular-nums">{Number(a.amount).toLocaleString()} {x.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="attachments">
            <EntityAttachments entityType="invoice" entityId={id || ""} />
          </TabsContent>

          <TabsContent value="history">
            <EntityHistory entityType="invoices" entityId={id || ""} />
          </TabsContent>
        </Tabs>
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
    </>
  );
}
