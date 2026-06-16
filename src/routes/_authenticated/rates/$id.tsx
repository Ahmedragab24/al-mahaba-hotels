import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Plus, Trash2, Send, Check, X } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { RateForm } from "./-form";
import { OccupancyTab } from "./-occupancy";
import { EntityAttachments } from "@/components/entity-attachments";

export const Route = createFileRoute("/_authenticated/rates/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ edit: s.edit ? 1 : undefined }) as { edit?: 1 },
  component: RateDetail,
});

function RateDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "operations_manager"]);
  const [editing, setEditing] = useState(!!search.edit);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const rate = useQuery({
    queryKey: ["rate", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rates")
        .select("*, hotel:hotels(name_en,name_ar,code), supplier:suppliers(name_en,name_ar,code), room_type:hotel_room_types(name_en,name_ar), view:hotel_views(name_en,name_ar), contract:supplier_contracts(contract_number,title)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("rates").update({
        status: "pending_approval", submitted_by: auth.user?.id ?? null, submitted_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({ rate_id: id, action: "submit", performed_by: auth.user!.id });
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate", id] }); qc.invalidateQueries({ queryKey: ["rate-approvals", id] }); setSubmitConfirm(false); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const approveMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("rates").update({
        status: "approved", approved_by: auth.user?.id ?? null, approved_at: new Date().toISOString(), rejection_reason: null,
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({ rate_id: id, action: "approve", performed_by: auth.user!.id });
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate", id] }); qc.invalidateQueries({ queryKey: ["rate-approvals", id] }); setApproveConfirm(false); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const rejectMut = useMutation({
    mutationFn: async (reason: string) => {
      const { error } = await supabase.from("rates").update({
        status: "rejected", rejection_reason: reason,
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("rate_approvals").insert({ rate_id: id, action: "reject", performed_by: auth.user!.id, comments: reason });
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate", id] }); qc.invalidateQueries({ queryKey: ["rate-approvals", id] }); setRejectOpen(false); setRejectReason(""); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  if (rate.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!rate.data) return <div className="p-6 text-muted-foreground">{t("rates.no_rate")}</div>;

  const r = rate.data;
  const hotelName = lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar);
  const supplierName = lang === "ar" ? (r.supplier?.name_ar || r.supplier?.name_en) : (r.supplier?.name_en || r.supplier?.name_ar);
  const editable = canWrite && r.status === "draft" && !r.deleted_at;

  return (
    <>
      <PageHeader
        title={`${r.code} — ${hotelName}`}
        subtitle={`${supplierName} · ${formatDate(r.valid_from)} → ${formatDate(r.valid_to)}`}
        children={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/rates" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <StatusPill status={r.status} />
            {editable && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />{t("actions.edit")}
              </Button>
            )}
            {canWrite && r.status === "draft" && !r.deleted_at && (
              <Button size="sm" onClick={() => setSubmitConfirm(true)}>
                <Send className="h-4 w-4" />{t("actions.submit_approval")}
              </Button>
            )}
            {canApprove && r.status === "pending_approval" && (
              <>
                <Button size="sm" onClick={() => setApproveConfirm(true)}>
                  <Check className="h-4 w-4" />{t("actions.approve")}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                  <X className="h-4 w-4" />{t("actions.reject")}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("rates.tab.profile")}</TabsTrigger>
            <TabsTrigger value="occupancy">{t("rates.tab.occupancy")}</TabsTrigger>
            <TabsTrigger value="seasons">{t("rates.tab.seasons")}</TabsTrigger>
            <TabsTrigger value="taxes">{t("rates.tab.taxes")}</TabsTrigger>
            <TabsTrigger value="cxl">{t("rates.tab.cancellation")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="approvals">{t("rates.tab.approvals")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <RateForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["rate", id] }); }} />
            ) : (
              <ProfileView r={r} lang={lang} t={t} />
            )}
          </TabsContent>

          <TabsContent value="occupancy"><OccupancyTab rateId={id} currency={r.currency} canWrite={editable} /></TabsContent>
          <TabsContent value="seasons"><SeasonsTab rateId={id} canWrite={editable} /></TabsContent>
          <TabsContent value="taxes"><TaxesTab rateId={id} canWrite={editable} /></TabsContent>
          <TabsContent value="cxl"><CancellationTab rateId={id} canWrite={editable} /></TabsContent>
          <TabsContent value="attachments"><EntityAttachments entityType="rate" entityId={id} /></TabsContent>
          <TabsContent value="approvals"><ApprovalsTab rateId={id} /></TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={submitConfirm}
        onOpenChange={setSubmitConfirm}
        title={t("actions.submit_approval")}
        description={t("rates.submit_confirm")}
        onConfirm={() => submitMut.mutate()}
      />
      <ConfirmDialog
        open={approveConfirm}
        onOpenChange={setApproveConfirm}
        title={t("actions.approve")}
        description={t("rates.approve_confirm")}
        onConfirm={() => approveMut.mutate()}
      />
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("actions.reject")}</DialogTitle></DialogHeader>
          <Textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t("rates.reject_reason")} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || rejectMut.isPending} onClick={() => rejectMut.mutate(rejectReason.trim())}>
              {t("actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KV({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v ?? "—"}</span>
    </div>
  );
}

function ProfileView({ r, lang, t }: any) {
  const margin = r.selling_price && r.cost_per_night
    ? (((Number(r.selling_price) - Number(r.cost_per_night)) / Number(r.cost_per_night)) * 100).toFixed(2) + " %"
    : null;
  return (
    <Card><CardContent className="grid grid-cols-1 gap-x-6 p-4 md:grid-cols-3">
      <KV k={t("label.code")} v={<span className="font-mono">{r.code}</span>} />
      <KV k={t("rates.hotel")} v={lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar)} />
      <KV k={t("rates.supplier")} v={lang === "ar" ? (r.supplier?.name_ar || r.supplier?.name_en) : (r.supplier?.name_en || r.supplier?.name_ar)} />
      <KV k={t("rates.contract")} v={r.contract ? `${r.contract.contract_number} — ${r.contract.title}` : null} />
      <KV k={t("rates.room_type")} v={lang === "ar" ? (r.room_type?.name_ar || r.room_type?.name_en) : (r.room_type?.name_en || r.room_type?.name_ar)} />
      <KV k={t("rates.view")} v={r.view ? (lang === "ar" ? (r.view.name_ar || r.view.name_en) : (r.view.name_en || r.view.name_ar)) : null} />
      <KV k={t("rates.meal_plan")} v={t(`board.${r.meal_plan}`, r.meal_plan)} />
      <KV k={t("label.currency")} v={<span className="font-mono">{r.currency}</span>} />
      <KV k={t("rates.valid_from")} v={formatDate(r.valid_from)} />
      <KV k={t("rates.valid_to")} v={formatDate(r.valid_to)} />
      <KV k={t("rates.cost")} v={<span className="font-mono">{Number(r.cost_per_night).toFixed(2)}</span>} />
      <KV k={t("rates.selling")} v={r.selling_price ? <span className="font-mono">{Number(r.selling_price).toFixed(2)}</span> : null} />
      <KV k={t("rates.markup")} v={r.markup_pct ? Number(r.markup_pct).toFixed(2) + " %" : null} />
      <KV k={t("rates.margin")} v={margin} />
      <KV k={t("rates.min_nights")} v={r.min_nights} />
      <KV k={t("rates.max_nights")} v={r.max_nights} />
      <KV k={t("rates.release_days")} v={r.release_days} />
      <KV k={t("rates.allotment")} v={r.allotment} />
      <div className="md:col-span-3"><KV k={t("rates.notes_en")} v={r.notes_en} /></div>
      <div className="md:col-span-3"><KV k={t("rates.notes_ar")} v={r.notes_ar} /></div>
      {r.rejection_reason && <div className="md:col-span-3"><KV k={t("rates.reject_reason")} v={<span className="text-destructive">{r.rejection_reason}</span>} /></div>}
    </CardContent></Card>
  );
}

/* ------- Seasons Tab ------- */
function SeasonsTab({ rateId, canWrite }: { rateId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const blank = { name: "", start_date: "", end_date: "", cost_per_night: 0, selling_price: "" as any, min_nights: 1, notes: "" };
  const [form, setForm] = useState<any>(blank);

  const list = useQuery({
    queryKey: ["rate-seasons", rateId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_seasons").select("*").eq("rate_id", rateId).order("start_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        rate_id: rateId, name: form.name, start_date: form.start_date, end_date: form.end_date,
        cost_per_night: Number(form.cost_per_night), min_nights: Number(form.min_nights),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        notes: form.notes || null,
      };
      if (new Date(payload.end_date) < new Date(payload.start_date)) throw new Error("end_date >= start_date");
      if (editId) {
        const { error } = await supabase.from("rate_seasons").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rate_seasons").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate-seasons", rateId] }); setOpen(false); setEditId(null); setForm(blank); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const del = useMutation({
    mutationFn: async (sid: string) => {
      const { error } = await supabase.from("rate_seasons").delete().eq("id", sid);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["rate-seasons", rateId] }); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {canWrite && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditId(null); setForm(blank); setOpen(true); }}>
              <Plus className="h-4 w-4" />{t("actions.add")}
            </Button>
          </div>
        )}
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("rates.season_name")}</TableHead>
            <TableHead>{t("rates.valid_from")}</TableHead>
            <TableHead>{t("rates.valid_to")}</TableHead>
            <TableHead className="text-end">{t("rates.cost")}</TableHead>
            <TableHead className="text-end">{t("rates.selling")}</TableHead>
            <TableHead>{t("rates.min_nights")}</TableHead>
            <TableHead className="text-end">{t("label.actions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {(list.data ?? []).length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">{t("label.no_results")}</TableCell></TableRow>}
            {list.data?.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell dir="ltr">{formatDate(s.start_date)}</TableCell>
                <TableCell dir="ltr">{formatDate(s.end_date)}</TableCell>
                <TableCell className="text-end font-mono">{Number(s.cost_per_night).toFixed(2)}</TableCell>
                <TableCell className="text-end font-mono">{s.selling_price ? Number(s.selling_price).toFixed(2) : "—"}</TableCell>
                <TableCell>{s.min_nights}</TableCell>
                <TableCell className="text-end">
                  {canWrite && <>
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(s.id); setForm({ ...s, selling_price: s.selling_price ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("rates.seasons")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs">{t("rates.season_name")} *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.valid_from")} *</label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.valid_to")} *</label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.cost")} *</label><Input type="number" step="0.01" min="0" value={form.cost_per_night} onChange={(e) => setForm({ ...form, cost_per_night: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.selling")}</label><Input type="number" step="0.01" min="0" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.min_nights")} *</label><Input type="number" min="1" value={form.min_nights} onChange={(e) => setForm({ ...form, min_nights: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs">{t("label.notes")}</label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
              <Button disabled={!form.name || !form.start_date || !form.end_date || save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ------- Taxes Tab ------- */
function TaxesTab({ rateId, canWrite }: { rateId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const blank = { name: "", tax_type: "percentage", value: 0, is_inclusive: false, applies_to: "per_night" };
  const [form, setForm] = useState<any>(blank);

  const list = useQuery({
    queryKey: ["rate-taxes", rateId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_taxes").select("*").eq("rate_id", rateId).order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        rate_id: rateId, name: form.name, tax_type: form.tax_type,
        value: Number(form.value), is_inclusive: !!form.is_inclusive, applies_to: form.applies_to,
      };
      if (editId) { const { error } = await supabase.from("rate_taxes").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("rate_taxes").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate-taxes", rateId] }); setOpen(false); setEditId(null); setForm(blank); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const del = useMutation({
    mutationFn: async (tid: string) => { const { error } = await supabase.from("rate_taxes").delete().eq("id", tid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["rate-taxes", rateId] }); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {canWrite && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditId(null); setForm(blank); setOpen(true); }}>
              <Plus className="h-4 w-4" />{t("actions.add")}
            </Button>
          </div>
        )}
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("rates.tax_name")}</TableHead>
            <TableHead>{t("rates.tax_type")}</TableHead>
            <TableHead className="text-end">{t("rates.tax_value")}</TableHead>
            <TableHead>{t("rates.tax_inclusive")}</TableHead>
            <TableHead>{t("rates.tax_applies_to")}</TableHead>
            <TableHead className="text-end">{t("label.actions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {(list.data ?? []).length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">{t("label.no_results")}</TableCell></TableRow>}
            {list.data?.map((x: any) => (
              <TableRow key={x.id}>
                <TableCell>{x.name}</TableCell>
                <TableCell className="text-xs">{x.tax_type}</TableCell>
                <TableCell className="text-end font-mono">{Number(x.value).toFixed(2)}{x.tax_type === "percentage" ? " %" : ""}</TableCell>
                <TableCell>{x.is_inclusive ? "✓" : "—"}</TableCell>
                <TableCell className="text-xs">{x.applies_to}</TableCell>
                <TableCell className="text-end">
                  {canWrite && <>
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(x.id); setForm(x); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(x.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("rates.taxes")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs">{t("rates.tax_name")} *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.tax_type")} *</label>
                <Select value={form.tax_type} onValueChange={(v) => setForm({ ...form, tax_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">percentage</SelectItem>
                    <SelectItem value="fixed">fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs">{t("rates.tax_value")} *</label><Input type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.tax_applies_to")} *</label>
                <Select value={form.applies_to} onValueChange={(v) => setForm({ ...form, applies_to: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_night">per_night</SelectItem>
                    <SelectItem value="per_stay">per_stay</SelectItem>
                    <SelectItem value="per_person">per_person</SelectItem>
                    <SelectItem value="per_person_per_night">per_person_per_night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <Checkbox checked={!!form.is_inclusive} onCheckedChange={(v) => setForm({ ...form, is_inclusive: !!v })} />
                {t("rates.tax_inclusive")}
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
              <Button disabled={!form.name || save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ------- Cancellation Tab ------- */
function CancellationTab({ rateId, canWrite }: { rateId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const blank = { days_before_checkin: 0, penalty_type: "percentage", penalty_value: 0, notes: "" };
  const [form, setForm] = useState<any>(blank);

  const list = useQuery({
    queryKey: ["rate-cxl", rateId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_cancellation_rules").select("*").eq("rate_id", rateId).order("days_before_checkin", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        rate_id: rateId, days_before_checkin: Number(form.days_before_checkin),
        penalty_type: form.penalty_type, penalty_value: Number(form.penalty_value),
        notes: form.notes || null,
      };
      if (editId) { const { error } = await supabase.from("rate_cancellation_rules").update(payload).eq("id", editId); if (error) throw error; }
      else { const { error } = await supabase.from("rate_cancellation_rules").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["rate-cxl", rateId] }); setOpen(false); setEditId(null); setForm(blank); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const del = useMutation({
    mutationFn: async (cid: string) => { const { error } = await supabase.from("rate_cancellation_rules").delete().eq("id", cid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["rate-cxl", rateId] }); },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {canWrite && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditId(null); setForm(blank); setOpen(true); }}>
              <Plus className="h-4 w-4" />{t("actions.add")}
            </Button>
          </div>
        )}
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("rates.cxl_days")}</TableHead>
            <TableHead>{t("rates.penalty_type")}</TableHead>
            <TableHead className="text-end">{t("rates.penalty_value")}</TableHead>
            <TableHead>{t("label.notes")}</TableHead>
            <TableHead className="text-end">{t("label.actions")}</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {(list.data ?? []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">{t("label.no_results")}</TableCell></TableRow>}
            {list.data?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.days_before_checkin}</TableCell>
                <TableCell className="text-xs">{c.penalty_type}</TableCell>
                <TableCell className="text-end font-mono">{Number(c.penalty_value).toFixed(2)}{c.penalty_type === "percentage" ? " %" : ""}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.notes}</TableCell>
                <TableCell className="text-end">
                  {canWrite && <>
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(c.id); setForm(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("rates.cancellation")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs">{t("rates.cxl_days")} *</label><Input type="number" min="0" value={form.days_before_checkin} onChange={(e) => setForm({ ...form, days_before_checkin: e.target.value })} /></div>
              <div><label className="text-xs">{t("rates.penalty_type")} *</label>
                <Select value={form.penalty_type} onValueChange={(v) => setForm({ ...form, penalty_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">percentage</SelectItem>
                    <SelectItem value="fixed">fixed</SelectItem>
                    <SelectItem value="nights">nights</SelectItem>
                    <SelectItem value="full">full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><label className="text-xs">{t("rates.penalty_value")} *</label><Input type="number" step="0.01" min="0" value={form.penalty_value} onChange={(e) => setForm({ ...form, penalty_value: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs">{t("label.notes")}</label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
              <Button disabled={save.isPending} onClick={() => save.mutate()}>{t("actions.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

/* ------- Approvals History ------- */
function ApprovalsTab({ rateId }: { rateId: string }) {
  const { t } = useI18n();
  const list = useQuery({
    queryKey: ["rate-approvals", rateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_approvals")
        .select("*, performer:profiles!rate_approvals_performed_by_fkey(full_name_en,full_name_ar,email)")
        .eq("rate_id", rateId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("rates.approval_action")}</TableHead>
          <TableHead>{t("label.full_name")}</TableHead>
          <TableHead>{t("rates.comments")}</TableHead>
          <TableHead>{t("label.created_at")}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {(list.data ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t("label.no_results")}</TableCell></TableRow>}
          {list.data?.map((a: any) => (
            <TableRow key={a.id}>
              <TableCell><StatusPill status={a.action === "submit" ? "pending_approval" : a.action === "approve" ? "approved" : "rejected"} /></TableCell>
              <TableCell className="text-xs">{a.performer?.full_name_en ?? a.performer?.email ?? "—"}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{a.comments}</TableCell>
              <TableCell className="text-xs" dir="ltr">{formatDateTime(a.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}
