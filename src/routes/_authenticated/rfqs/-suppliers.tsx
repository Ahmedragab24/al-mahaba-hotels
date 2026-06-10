import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Check, X, Trophy, FileOutput } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { dbErrorMessage } from "@/lib/db-errors";
import { toast } from "sonner";
import { useRfqItems, rfqItemLabel } from "./-items";

const APPROVER_ROLES = ["super_admin", "admin", "sales_manager", "operations_manager"] as const;

function nmOf(x: any, lang: string) {
  return x ? (lang === "ar" ? (x.name_ar || x.name_en) : (x.name_en || x.name_ar)) : "—";
}

export function useRfqResponses(rfqId: string) {
  return useQuery({
    queryKey: ["rfq-responses", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_supplier_responses")
        .select("*, supplier:suppliers(name_en,name_ar), item:rfq_items(*, hotel:hotels(name_en,name_ar), room_type:hotel_room_types(name_en,name_ar))")
        .eq("rfq_id", rfqId)
        .order("responded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ---------------- Supplier Requests ----------------
export function RfqSuppliersTab({ rfqId, editable }: { rfqId: string; editable: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [due, setDue] = useState("");

  const requests = useQuery({
    queryKey: ["rfq-sreqs", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_supplier_requests")
        .select("*, supplier:suppliers(name_en,name_ar)")
        .eq("rfq_id", rfqId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const suppliers = useQuery({
    queryKey: ["lookup-suppliers"],
    queryFn: async () => (await supabase.from("suppliers").select("id,name_en,name_ar").is("deleted_at", null).order("name_en")).data ?? [],
  });

  const addMut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error(t("rfq.resp.supplier") + " *");
      const { error } = await supabase.from("rfq_supplier_requests").insert({
        rfq_id: rfqId, supplier_id: supplierId, response_due_date: due || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false); setSupplierId(""); setDue("");
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfq_supplier_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] }); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{t("rfq.sup.email_note")}</p>
      {editable && (
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> {t("rfq.sup.add")}</Button>
      )}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("rfq.resp.supplier")}</TableHead>
                <TableHead>{t("rfq.sup.sent_at")}</TableHead>
                <TableHead>{t("rfq.sup.due")}</TableHead>
                <TableHead>{t("label.status")}</TableHead>
                {editable && <TableHead className="text-end">{t("label.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(requests.data?.length ?? 0) === 0 && (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("rfq.sup.empty")}</TableCell></TableRow>
              )}
              {requests.data?.map((r: any) => {
                const overdue = r.status === "sent" && r.response_due_date && r.response_due_date < today;
                return (
                  <TableRow key={r.id} className="whitespace-nowrap">
                    <TableCell>{nmOf(r.supplier, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{r.sent_at ? formatDateTime(r.sent_at, lang) : "—"}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{r.response_due_date ? formatDate(r.response_due_date, lang) : "—"}</TableCell>
                    <TableCell className="space-x-1 rtl:space-x-reverse">
                      <Badge variant={r.status === "responded" ? "default" : r.status === "cancelled" ? "destructive" : "outline"}>{t(`reqstatus.${r.status}`)}</Badge>
                      {overdue && <Badge variant="destructive">{t("rfq.sup.overdue")}</Badge>}
                    </TableCell>
                    {editable && (
                      <TableCell className="text-end">
                        <Button variant="ghost" size="icon" onClick={() => removeMut.mutate(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("rfq.sup.add")}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.supplier")} *</label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rfq.resp.supplier")} /></SelectTrigger>
                <SelectContent>
                  {suppliers.data?.map((s: any) => <SelectItem key={s.id} value={s.id}>{nmOf(s, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.sup.due")}</label>
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- Supplier Responses ----------------
export function RfqResponsesTab({ rfqId, rfqStatus, currency }: { rfqId: string; rfqStatus: string; currency: string }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canApprove = auth.hasAnyRole([...APPROVER_ROLES]);
  const canRespond = ["sent", "partial"].includes(rfqStatus);
  const [open, setOpen] = useState(false);
  const empty = { request_id: "", rfq_item_id: "", availability: "available", available_rooms: "", cost_price: "", currency, cancellation_policy: "", release_days: "", remarks: "" };
  const [form, setForm] = useState<any>(empty);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const responses = useRfqResponses(rfqId);
  const items = useRfqItems(rfqId);
  const requests = useQuery({
    queryKey: ["rfq-sreqs", rfqId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_supplier_requests")
        .select("*, supplier:suppliers(name_en,name_ar)")
        .eq("rfq_id", rfqId)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      if (!form.request_id || !form.rfq_item_id) throw new Error(t("toast.error"));
      const supplierId = (requests.data as any[] | undefined)?.find((r: any) => r.id === form.request_id)?.supplier_id as string | undefined;
      if (!supplierId) throw new Error(t("rfq.err_no_supplier"));
      const { error } = await supabase.from("rfq_supplier_responses").insert({
        rfq_id: rfqId,
        request_id: form.request_id,
        rfq_item_id: form.rfq_item_id,
        supplier_id: supplierId,
        availability: form.availability,
        available_rooms: form.available_rooms ? Number(form.available_rooms) : null,
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        currency: form.currency || null,
        cancellation_policy: form.cancellation_policy || null,
        release_days: form.release_days ? Number(form.release_days) : null,
        remarks: form.remarks || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setOpen(false); setForm(empty);
      qc.invalidateQueries({ queryKey: ["rfq-responses", rfqId] });
      qc.invalidateQueries({ queryKey: ["rfq-sreqs", rfqId] });
      qc.invalidateQueries({ queryKey: ["rfq", rfqId] });
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("rfq_supplier_responses").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rfq-responses", rfqId] }); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  const respBadge = (s: string) => (
    <Badge variant={s === "rejected" ? "destructive" : s === "approved" ? "default" : "outline"}
      className={s === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}>
      {t(`respstatus.${s}`)}
    </Badge>
  );

  return (
    <div className="space-y-4">
      {canRespond && (
        <Button size="sm" onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> {t("rfq.resp.add")}</Button>
      )}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="whitespace-nowrap">
                <TableHead>{t("rfq.resp.supplier")}</TableHead>
                <TableHead>{t("rfq.resp.item")}</TableHead>
                <TableHead>{t("rfq.resp.availability")}</TableHead>
                <TableHead>{t("rfq.resp.rooms")}</TableHead>
                <TableHead>{t("rfq.resp.cost")}</TableHead>
                <TableHead>{t("rfq.resp.release")}</TableHead>
                <TableHead>{t("label.status")}</TableHead>
                <TableHead className="text-end">{t("label.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(responses.data?.length ?? 0) === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("rfq.resp.empty")}</TableCell></TableRow>
              )}
              {responses.data?.map((r: any) => (
                <TableRow key={r.id} className="whitespace-nowrap">
                  <TableCell>{nmOf(r.supplier, lang)}</TableCell>
                  <TableCell className="max-w-[280px] truncate text-xs">{r.item ? rfqItemLabel(r.item, lang) : "—"}</TableCell>
                  <TableCell><Badge variant={r.availability === "available" ? "default" : "outline"}>{t(`avail.${r.availability}`)}</Badge></TableCell>
                  <TableCell>{r.available_rooms ?? "—"}</TableCell>
                  <TableCell dir="ltr" className="text-xs">{r.cost_price != null ? `${Number(r.cost_price).toFixed(2)} ${r.currency ?? ""}` : "—"}</TableCell>
                  <TableCell>{r.release_days ?? "—"}</TableCell>
                  <TableCell>{respBadge(r.status)}</TableCell>
                  <TableCell className="text-end">
                    {canApprove && r.status === "submitted" && (
                      <>
                        <Button variant="ghost" size="icon" title={t("actions.approve")} onClick={() => statusMut.mutate({ id: r.id, status: "approved" })}>
                          <Check className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t("actions.reject")} onClick={() => statusMut.mutate({ id: r.id, status: "rejected" })}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t("rfq.resp.add")}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.supplier")} *</label>
              <Select value={form.request_id} onValueChange={(v) => set("request_id", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rfq.resp.supplier")} /></SelectTrigger>
                <SelectContent>
                  {requests.data?.filter((r: any) => r.status !== "cancelled").map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{nmOf(r.supplier, lang)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.item")} *</label>
              <Select value={form.rfq_item_id} onValueChange={(v) => set("rfq_item_id", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("rfq.resp.item")} /></SelectTrigger>
                <SelectContent>
                  {items.data?.map((i: any) => <SelectItem key={i.id} value={i.id}>{rfqItemLabel(i, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.availability")} *</label>
              <Select value={form.availability} onValueChange={(v) => set("availability", v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["available","unavailable","on_request"].map((a) => <SelectItem key={a} value={a}>{t(`avail.${a}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.rooms")}</label>
              <Input type="number" min={0} value={form.available_rooms} onChange={(e) => set("available_rooms", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.cost")}</label>
              <Input type="number" min={0} step="0.01" value={form.cost_price} onChange={(e) => set("cost_price", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("label.currency")}</label>
              <Input value={form.currency} onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.release")}</label>
              <Input type="number" min={0} value={form.release_days} onChange={(e) => set("release_days", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.resp.cancellation")}</label>
              <Input value={form.cancellation_policy} onChange={(e) => set("cancellation_policy", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm">{t("rfq.resp.remarks")}</label>
              <Textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={() => addMut.mutate()} disabled={addMut.isPending}>{t("actions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- Comparison ----------------
export function RfqComparisonTab({ rfqId }: { rfqId: string }) {
  const { t, lang } = useI18n();
  const responses = useRfqResponses(rfqId);
  const items = useRfqItems(rfqId);

  if ((responses.data?.length ?? 0) === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{t("rfq.cmp.empty")}</p>;
  }

  return (
    <div className="space-y-6">
      {items.data?.map((item: any) => {
        const rows = (responses.data ?? []).filter((r: any) => r.rfq_item_id === item.id);
        if (rows.length === 0) return null;
        const avail = rows.filter((r: any) => r.availability === "available" && r.cost_price != null);
        const best = avail.length ? Math.min(...avail.map((r: any) => Number(r.cost_price))) : null;
        return (
          <Card key={item.id}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{rfqItemLabel(item, lang)}</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="whitespace-nowrap">
                    <TableHead>{t("rfq.resp.supplier")}</TableHead>
                    <TableHead>{t("rfq.resp.availability")}</TableHead>
                    <TableHead>{t("rfq.resp.rooms")}</TableHead>
                    <TableHead>{t("rfq.resp.cost")}</TableHead>
                    <TableHead>{t("rfq.resp.cancellation")}</TableHead>
                    <TableHead>{t("rfq.resp.release")}</TableHead>
                    <TableHead>{t("rfq.resp.remarks")}</TableHead>
                    <TableHead>{t("label.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => {
                    const isBest = best != null && r.availability === "available" && Number(r.cost_price) === best;
                    return (
                      <TableRow key={r.id} className={`whitespace-nowrap ${isBest ? "bg-emerald-500/10" : ""}`}>
                        <TableCell className="font-medium">
                          {nmOf(r.supplier, lang)}
                          {isBest && <Badge className="ms-2 bg-emerald-600 text-white hover:bg-emerald-600"><Trophy className="me-1 h-3 w-3" />{t("rfq.cmp.best")}</Badge>}
                        </TableCell>
                        <TableCell>{t(`avail.${r.availability}`)}</TableCell>
                        <TableCell>{r.available_rooms ?? "—"}</TableCell>
                        <TableCell dir="ltr" className={isBest ? "font-bold text-emerald-700 dark:text-emerald-400" : ""}>
                          {r.cost_price != null ? `${Number(r.cost_price).toFixed(2)} ${r.currency ?? ""}` : "—"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs">{r.cancellation_policy ?? "—"}</TableCell>
                        <TableCell>{r.release_days ?? "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs">{r.remarks ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "rejected" ? "destructive" : r.status === "approved" ? "default" : "outline"}
                            className={r.status === "approved" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}>
                            {t(`respstatus.${r.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------------- Create Quotation from approved responses ----------------
export function CreateQuotationButton({ rfq }: { rfq: any }) {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const responses = useRfqResponses(rfq.id);
  const [open, setOpen] = useState(false);
  const [markup, setMarkup] = useState("15");
  const plus7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [expiry, setExpiry] = useState(plus7);
  const canWrite = auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent"]);

  const approved = (responses.data ?? []).filter((r: any) => r.status === "approved" && r.cost_price != null);
  if (!canWrite || rfq.status !== "approved" || approved.length === 0) return null;

  // best approved response per item
  const byItem = new Map<string, any>();
  approved.forEach((r: any) => {
    const cur = byItem.get(r.rfq_item_id);
    if (!cur || Number(r.cost_price) < Number(cur.cost_price)) byItem.set(r.rfq_item_id, r);
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const m = Math.max(0, Number(markup) || 0);
      const { data: quote, error } = await supabase.from("quotations").insert({
        customer_id: rfq.customer_id,
        currency: rfq.currency,
        quotation_date: new Date().toISOString().slice(0, 10),
        travel_date: rfq.travel_start,
        expiry_date: expiry,
        notes: `RFQ ${rfq.rfq_no}`,
        created_by: auth.user?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      const items = Array.from(byItem.values()).map((r: any) => ({
        quotation_id: quote.id,
        hotel_id: r.item.hotel_id,
        room_type_id: r.item.room_type_id,
        occupancy_type: r.item.occupancy_type,
        check_in: r.item.check_in,
        check_out: r.item.check_out,
        rooms: r.item.quantity,
        cost_price: Number(r.cost_price),
        selling_price: Math.round(Number(r.cost_price) * (1 + m / 100) * 100) / 100,
        rfq_response_id: r.id,
      }));
      const { error: e2 } = await supabase.from("quotation_items").insert(items);
      if (e2) throw e2;
      return quote.id as string;
    },
    onSuccess: (id) => { toast.success(t("rfq.to_quote_ok")); setOpen(false); navigate({ to: "/quotations/$id", params: { id } }); },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><FileOutput className="h-4 w-4" /> {t("rfq.to_quote")}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("rfq.to_quote")}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{t("rfq.to_quote_hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.to_quote_markup")} *</label>
              <Input type="number" min={0} step="0.5" value={markup} onChange={(e) => setMarkup(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">{t("rfq.to_quote_expiry")} *</label>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>{t("rfq.to_quote")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
