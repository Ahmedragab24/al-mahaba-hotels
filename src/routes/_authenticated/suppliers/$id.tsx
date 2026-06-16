import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useCurrencies, useCountries, useHotelsLite } from "@/lib/lookups";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplierForm } from "./-form";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Plus, Trash2, Star } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/suppliers/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ edit: s.edit ? 1 : undefined }) as { edit?: 1 },
  component: SupplierDetail,
});

const CONTRACT_STATUSES = ["draft", "active", "expired", "terminated"] as const;

function SupplierDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = useState(!!search.edit);

  const supplier = useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar), currency:currencies(code,name_en,name_ar,symbol)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const counts = useQuery({
    queryKey: ["supplier-counts", id],
    queryFn: async () => {
      const tables = ["supplier_contacts", "supplier_contracts", "supplier_bank_accounts", "supplier_ratings", "hotel_suppliers"] as const;
      const out: Record<string, number> = {};
      await Promise.all(tables.map(async (tb) => {
        const { count } = await supabase.from(tb).select("*", { count: "exact", head: true }).eq("supplier_id", id);
        out[tb] = count ?? 0;
      }));
      return out;
    },
  });

  if (supplier.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!supplier.data) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;

  const s = supplier.data;
  const displayName = lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar);

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${s.code} · ${t(`stype.${s.supplier_type}`, s.supplier_type)}${s.rating ? " · ★ " + Number(s.rating).toFixed(1) : ""}`}
        children={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/suppliers" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            <StatusPill status={s.status} />
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile">{t("suppliers.profile")}</TabsTrigger>
            <TabsTrigger value="contacts">{t("suppliers.contacts")} ({counts.data?.supplier_contacts ?? 0})</TabsTrigger>
            <TabsTrigger value="contracts">{t("suppliers.contracts")} ({counts.data?.supplier_contracts ?? 0})</TabsTrigger>
            <TabsTrigger value="banks">{t("suppliers.banks")} ({counts.data?.supplier_bank_accounts ?? 0})</TabsTrigger>
            <TabsTrigger value="ratings">{t("suppliers.ratings")} ({counts.data?.supplier_ratings ?? 0})</TabsTrigger>
            <TabsTrigger value="hotels">{t("suppliers.hotels")} ({counts.data?.hotel_suppliers ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <SupplierForm initial={s} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["supplier", id] }); }} />
            ) : (
              <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
                <KV label={t("label.code")} value={s.code} mono />
                <KV label={t("filter.type")} value={t(`stype.${s.supplier_type}`, s.supplier_type)} />
                <KV label={t("label.status")} value={t(`status.${s.status}`)} />
                <KV label={t("label.name_en")} value={s.name_en} />
                <KV label={t("label.name_ar")} value={s.name_ar} />

                <KV label={t("label.tax_number")} value={s.tax_number} />
                <KV label={t("label.cr")} value={s.commercial_registration} />
                <KV label={t("label.currency")} value={s.currency ? `${s.currency.code} ${s.currency.symbol ?? ""}` : ""} />

                <KV label={t("label.rating")} value={s.rating ? Number(s.rating).toFixed(2) : ""} />
                <KV label={t("label.country")} value={s.country ? (lang === "ar" ? s.country.name_ar : s.country.name_en) : ""} />
                <KV label={t("label.city")} value={s.city ? (lang === "ar" ? s.city.name_ar : s.city.name_en) : ""} />
                <KV label={t("label.address")} value={[s.address_line1, s.address_line2].filter(Boolean).join(", ")} />
                <KV label={t("label.phone")} value={s.phone} />

                <KV label={t("label.email")} value={s.email} />
                <KV label={t("label.website")} value={s.website} />
                <KV label={t("label.created_at")} value={formatDateTime(s.created_at, lang)} />

                {s.notes && (
                  <div className="md:col-span-3 space-y-1"><div className="text-xs text-muted-foreground">{t("label.notes")}</div>
                    <div className="whitespace-pre-wrap">{s.notes}</div></div>
                )}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="contacts"><ContactsTab supplierId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="contracts"><ContractsTab supplierId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="banks"><BanksTab supplierId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="ratings"><RatingsTab supplierId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="hotels"><HotelsTab supplierId={id} canWrite={canWrite} /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function KV({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
function Field({ label, children }: any) {
  return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>;
}

/* ---------- Contacts ---------- */
function ContactsTab({ supplierId, canWrite }: { supplierId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["supplier-contacts", supplierId],
    queryFn: async () => (await supabase.from("supplier_contacts").select("*").eq("supplier_id", supplierId).order("is_primary", { ascending: false })).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("supplier_contacts").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["supplier-contacts", supplierId] }); setDelId(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("suppliers.contacts")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.full_name")}</TableHead><TableHead>{t("label.title_position")}</TableHead>
          <TableHead>{t("label.email")}</TableHead><TableHead>{t("label.phone")}</TableHead>
          <TableHead>{t("label.mobile")}</TableHead><TableHead>{t("label.is_primary")}</TableHead>
          <TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.full_name}</TableCell>
              <TableCell className="text-sm">{r.title}</TableCell>
              <TableCell dir="ltr" className="text-xs">{r.email}</TableCell>
              <TableCell dir="ltr" className="text-xs">{r.phone}</TableCell>
              <TableCell dir="ltr" className="text-xs">{r.mobile}</TableCell>
              <TableCell>{r.is_primary && <Badge>{t("label.is_primary")}</Badge>}</TableCell>
              <TableCell className="text-end">
                {canWrite && <>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ContactDialog open={open} onOpenChange={setOpen} supplierId={supplierId} initial={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-contacts", supplierId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function ContactDialog({ open, onOpenChange, supplierId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        supplier_id: supplierId,
        full_name: v.full_name.trim(),
        title: v.title || null,
        email: v.email || null,
        phone: v.phone || null,
        mobile: v.mobile || null,
        is_primary: !!v.is_primary,
        notes: v.notes || null,
      };
      if (isEdit) { const { error } = await supabase.from("supplier_contacts").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("supplier_contacts").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? {}); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("suppliers.contacts")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("label.full_name")} *`}><Input value={v.full_name ?? ""} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></Field>
          <Field label={t("label.title_position")}><Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label={t("label.email")}><Input type="email" dir="ltr" value={v.email ?? ""} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label={t("label.phone")}><Input dir="ltr" value={v.phone ?? ""} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label={t("label.mobile")}><Input dir="ltr" value={v.mobile ?? ""} onChange={(e) => setV({ ...v, mobile: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm self-end"><Checkbox checked={!!v.is_primary} onCheckedChange={(x) => setV({ ...v, is_primary: !!x })} />{t("label.is_primary")}</label>
          <div className="md:col-span-2"><Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Contracts ---------- */
function ContractsTab({ supplierId, canWrite }: { supplierId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["supplier-contracts", supplierId],
    queryFn: async () => (await supabase.from("supplier_contracts").select("*").eq("supplier_id", supplierId).order("start_date", { ascending: false })).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("supplier_contracts").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["supplier-contracts", supplierId] }); setDelId(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("suppliers.contracts")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.contract_number")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.start_date")}</TableHead><TableHead>{t("label.end_date")}</TableHead>
          <TableHead>{t("label.currency")}</TableHead><TableHead>{t("label.commission_pct")}</TableHead>
          <TableHead>{t("label.status")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.contract_number}</TableCell>
              <TableCell>{r.title}</TableCell>
              <TableCell className="text-xs">{r.start_date}</TableCell>
              <TableCell className="text-xs">{r.end_date}</TableCell>
              <TableCell className="text-xs font-mono">{r.currency}</TableCell>
              <TableCell>{r.commission_pct ?? ""}</TableCell>
              <TableCell><Badge variant={r.status === "active" ? "default" : "secondary"}>{t(`suppliers.contract_status.${r.status}`, r.status)}</Badge></TableCell>
              <TableCell className="text-end">
                {canWrite && <>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ContractDialog open={open} onOpenChange={setOpen} supplierId={supplierId} initial={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-contracts", supplierId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function ContractDialog({ open, onOpenChange, supplierId, initial, onSaved }: any) {
  const { t, lang } = useI18n();
  const currencies = useCurrencies();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.contract_number?.trim() || !v.start_date || !v.end_date) throw new Error(t("label.required"));
      if (new Date(v.end_date) < new Date(v.start_date)) throw new Error("End date must be ≥ start date");
      const payload: any = {
        supplier_id: supplierId,
        contract_number: v.contract_number.trim(),
        title: v.title || null,
        start_date: v.start_date,
        end_date: v.end_date,
        currency: v.currency || null,
        commission_pct: v.commission_pct ? Number(v.commission_pct) : null,
        payment_terms: v.payment_terms || null,
        cancellation_terms: v.cancellation_terms || null,
        file_path: v.file_path || null,
        notes: v.notes || null,
        status: v.status || "draft",
      };
      if (isEdit) { const { error } = await supabase.from("supplier_contracts").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("supplier_contracts").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { status: "draft" }); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("suppliers.contracts")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-3 max-h-[70vh] overflow-y-auto">
          <Field label={`${t("label.contract_number")} *`}><Input value={v.contract_number ?? ""} onChange={(e) => setV({ ...v, contract_number: e.target.value })} /></Field>
          <Field label={t("label.name")}><Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label={t("label.status")}>
            <Select value={v.status ?? "draft"} onValueChange={(x) => setV({ ...v, status: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONTRACT_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`suppliers.contract_status.${s}`)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={`${t("label.start_date")} *`}><Input type="date" value={v.start_date ?? ""} onChange={(e) => setV({ ...v, start_date: e.target.value })} /></Field>
          <Field label={`${t("label.end_date")} *`}><Input type="date" value={v.end_date ?? ""} onChange={(e) => setV({ ...v, end_date: e.target.value })} /></Field>
          <Field label={t("label.currency")}>
            <Select value={v.currency ?? ""} onValueChange={(x) => setV({ ...v, currency: x })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{currencies.data?.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("label.commission_pct")}><Input type="number" step="0.01" min={0} max={100} value={v.commission_pct ?? ""} onChange={(e) => setV({ ...v, commission_pct: e.target.value })} /></Field>
          <Field label={t("label.file")}><Input dir="ltr" value={v.file_path ?? ""} onChange={(e) => setV({ ...v, file_path: e.target.value })} /></Field>
          <div />
          <div className="md:col-span-3"><Field label={t("label.payment_terms")}><Textarea rows={2} value={v.payment_terms ?? ""} onChange={(e) => setV({ ...v, payment_terms: e.target.value })} /></Field></div>
          <div className="md:col-span-3"><Field label={t("rates.cancellation")}><Textarea rows={2} value={v.cancellation_terms ?? ""} onChange={(e) => setV({ ...v, cancellation_terms: e.target.value })} /></Field></div>
          <div className="md:col-span-3"><Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Bank accounts ---------- */
function BanksTab({ supplierId, canWrite }: { supplierId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["supplier-banks", supplierId],
    queryFn: async () => (await supabase.from("supplier_bank_accounts").select("*").eq("supplier_id", supplierId).order("is_default", { ascending: false })).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("supplier_bank_accounts").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["supplier-banks", supplierId] }); setDelId(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("suppliers.banks")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.bank_name")}</TableHead><TableHead>{t("label.account_holder")}</TableHead>
          <TableHead>{t("label.account_number")}</TableHead><TableHead>{t("label.iban")}</TableHead>
          <TableHead>{t("label.swift")}</TableHead><TableHead>{t("label.currency")}</TableHead>
          <TableHead>{t("label.is_default")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.bank_name}</TableCell>
              <TableCell>{r.account_holder}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">{r.account_number}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">{r.iban}</TableCell>
              <TableCell dir="ltr" className="font-mono text-xs">{r.swift}</TableCell>
              <TableCell className="text-xs font-mono">{r.currency}</TableCell>
              <TableCell>{r.is_default && <Badge>{t("label.is_default")}</Badge>}</TableCell>
              <TableCell className="text-end">
                {canWrite && <>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <BankDialog open={open} onOpenChange={setOpen} supplierId={supplierId} initial={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-banks", supplierId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function BankDialog({ open, onOpenChange, supplierId, initial, onSaved }: any) {
  const { t, lang } = useI18n();
  const countries = useCountries();
  const currencies = useCurrencies();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.bank_name?.trim() || !v.account_holder?.trim() || !v.account_number?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        supplier_id: supplierId,
        bank_name: v.bank_name.trim(),
        branch: v.branch || null,
        account_holder: v.account_holder.trim(),
        account_number: v.account_number.trim(),
        iban: v.iban || null,
        swift: v.swift || null,
        currency: v.currency || null,
        country_code: v.country_code || null,
        is_default: !!v.is_default,
        notes: v.notes || null,
      };
      if (payload.is_default) {
        await supabase.from("supplier_bank_accounts").update({ is_default: false }).eq("supplier_id", supplierId);
      }
      if (isEdit) { const { error } = await supabase.from("supplier_bank_accounts").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("supplier_bank_accounts").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? {}); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("suppliers.banks")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={`${t("label.bank_name")} *`}><Input value={v.bank_name ?? ""} onChange={(e) => setV({ ...v, bank_name: e.target.value })} /></Field>
          <Field label={t("label.branch")}><Input value={v.branch ?? ""} onChange={(e) => setV({ ...v, branch: e.target.value })} /></Field>
          <Field label={t("label.country")}>
            <Select value={v.country_code ?? ""} onValueChange={(x) => setV({ ...v, country_code: x })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{countries.data?.map((c) => <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={`${t("label.account_holder")} *`}><Input value={v.account_holder ?? ""} onChange={(e) => setV({ ...v, account_holder: e.target.value })} /></Field>
          <Field label={`${t("label.account_number")} *`}><Input dir="ltr" value={v.account_number ?? ""} onChange={(e) => setV({ ...v, account_number: e.target.value })} /></Field>
          <Field label={t("label.currency")}>
            <Select value={v.currency ?? ""} onValueChange={(x) => setV({ ...v, currency: x })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{currencies.data?.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("label.iban")}><Input dir="ltr" value={v.iban ?? ""} onChange={(e) => setV({ ...v, iban: e.target.value })} /></Field>
          <Field label={t("label.swift")}><Input dir="ltr" value={v.swift ?? ""} onChange={(e) => setV({ ...v, swift: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm self-end"><Checkbox checked={!!v.is_default} onCheckedChange={(x) => setV({ ...v, is_default: !!x })} />{t("label.is_default")}</label>
          <div className="md:col-span-3"><Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Ratings ---------- */
function RatingsTab({ supplierId, canWrite }: { supplierId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["supplier-ratings", supplierId],
    queryFn: async () => (await supabase.from("supplier_ratings").select("*").eq("supplier_id", supplierId).order("created_at", { ascending: false })).data ?? [],
  });
  const avg = useMemo(() => {
    const rows = q.data ?? [];
    if (!rows.length) return 0;
    return rows.reduce((a, r: any) => a + Number(r.score), 0) / rows.length;
  }, [q.data]);
  const refreshAvg = useMutation({
    mutationFn: async (newAvg: number) => {
      await supabase.from("suppliers").update({ rating: Number(newAvg.toFixed(2)) }).eq("id", supplierId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier", supplierId] }),
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("supplier_ratings").delete().eq("id", rid); if (error) throw error; },
    onSuccess: async () => {
      toast.success(t("toast.deleted"));
      const r = await supabase.from("supplier_ratings").select("score").eq("supplier_id", supplierId);
      const rows = r.data ?? [];
      const v = rows.length ? rows.reduce((a, x) => a + Number(x.score), 0) / rows.length : 0;
      await refreshAvg.mutateAsync(v);
      qc.invalidateQueries({ queryKey: ["supplier-ratings", supplierId] });
      setDelId(null);
    },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <h3 className="font-medium">{t("suppliers.ratings")}</h3>
          <p className="text-xs text-muted-foreground">{t("suppliers.avg_rating")}: <span className="text-amber-500 font-medium">★ {avg.toFixed(2)}</span></p>
        </div>
        {canWrite && <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />{t("suppliers.add_rating")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.score")}</TableHead><TableHead>{t("label.category")}</TableHead>
          <TableHead>{t("label.comment")}</TableHead><TableHead>{t("label.created_at")}</TableHead>
          <TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("suppliers.no_ratings")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="text-amber-500 font-medium flex items-center gap-0.5"><Star className="h-3 w-3 fill-current" />{Number(r.score).toFixed(1)}</TableCell>
              <TableCell>{r.category}</TableCell>
              <TableCell className="text-sm">{r.comment}</TableCell>
              <TableCell className="text-xs">{formatDateTime(r.created_at, "en")}</TableCell>
              <TableCell className="text-end">
                {canWrite && <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <RatingDialog open={open} onOpenChange={setOpen} supplierId={supplierId}
        onSaved={async () => {
          const r = await supabase.from("supplier_ratings").select("score").eq("supplier_id", supplierId);
          const rows = r.data ?? [];
          const v = rows.length ? rows.reduce((a, x) => a + Number(x.score), 0) / rows.length : 0;
          await refreshAvg.mutateAsync(v);
          qc.invalidateQueries({ queryKey: ["supplier-ratings", supplierId] });
        }} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function RatingDialog({ open, onOpenChange, supplierId, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({ score: 5 });
  const save = useMutation({
    mutationFn: async () => {
      const score = Number(v.score);
      if (!score || score < 1 || score > 5) throw new Error("Score 1-5");
      const { error } = await supabase.from("supplier_ratings").insert({
        supplier_id: supplierId, score, category: v.category || null, comment: v.comment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV({ score: 5 }); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("suppliers.add_rating")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label={`${t("label.score")} (1-5) *`}>
            <Select value={String(v.score ?? 5)} onValueChange={(x) => setV({ ...v, score: Number(x) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{"★".repeat(n)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={t("label.category")}><Input value={v.category ?? ""} onChange={(e) => setV({ ...v, category: e.target.value })} placeholder="quality / service / pricing" /></Field>
          <Field label={t("label.comment")}><Textarea rows={3} value={v.comment ?? ""} onChange={(e) => setV({ ...v, comment: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Linked hotels ---------- */
function HotelsTab({ supplierId, canWrite }: { supplierId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const hotels = useHotelsLite();
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<{ supplier_id: string; hotel_id: string } | null>(null);
  const q = useQuery({
    queryKey: ["supplier-hotels", supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_suppliers")
        .select("hotel_id, supplier_id, is_preferred, contract_id, notes, hotel:hotels(id,code,name_en,name_ar,country_code,star_rating)")
        .eq("supplier_id", supplierId);
      if (error) throw error;
      return data ?? [];
    },
  });
  const togglePreferred = useMutation({
    mutationFn: async ({ hotel_id, value }: { hotel_id: string; value: boolean }) => {
      const { error } = await supabase.from("hotel_suppliers").update({ is_preferred: value })
        .eq("supplier_id", supplierId).eq("hotel_id", hotel_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-hotels", supplierId] }),
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async ({ hotel_id }: { hotel_id: string }) => {
      const { error } = await supabase.from("hotel_suppliers").delete()
        .eq("supplier_id", supplierId).eq("hotel_id", hotel_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["supplier-hotels", supplierId] });
      setDelId(null);
    },
  });
  const linkedIds = new Set((q.data ?? []).map((r: any) => r.hotel_id));
  const availableHotels = (hotels.data ?? []).filter((h) => !linkedIds.has(h.id));

  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("suppliers.hotels")}</h3>
        {canWrite && <Button size="sm" onClick={() => setOpen(true)} disabled={!availableHotels.length}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.country")}</TableHead><TableHead>{t("label.stars")}</TableHead>
          <TableHead>{t("label.is_preferred")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.hotel_id}>
              <TableCell className="font-mono text-xs">{r.hotel?.code}</TableCell>
              <TableCell>
                <Link to="/hotels/$id" params={{ id: r.hotel_id }} className="hover:underline">
                  {lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar)}
                </Link>
              </TableCell>
              <TableCell className="text-xs">{r.hotel?.country_code}</TableCell>
              <TableCell className="text-amber-500">{r.hotel?.star_rating ? "★".repeat(r.hotel.star_rating) : ""}</TableCell>
              <TableCell>
                <Checkbox checked={!!r.is_preferred} disabled={!canWrite}
                  onCheckedChange={(x) => togglePreferred.mutate({ hotel_id: r.hotel_id, value: !!x })} />
              </TableCell>
              <TableCell className="text-end">
                {canWrite && <Button variant="ghost" size="icon" onClick={() => setDelId({ supplier_id: supplierId, hotel_id: r.hotel_id })}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <LinkHotelDialog open={open} onOpenChange={setOpen} supplierId={supplierId} available={availableHotels}
        onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-hotels", supplierId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function LinkHotelDialog({ open, onOpenChange, supplierId, available, onSaved }: any) {
  const { t, lang } = useI18n();
  const [hotelId, setHotelId] = useState<string>("");
  const [preferred, setPreferred] = useState(false);
  const save = useMutation({
    mutationFn: async () => {
      if (!hotelId) throw new Error(t("label.required"));
      const { error } = await supabase.from("hotel_suppliers").insert({ supplier_id: supplierId, hotel_id: hotelId, is_preferred: preferred });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); setHotelId(""); setPreferred(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("actions.add")} — {t("suppliers.hotels")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label={t("rates.hotel")}>
            <Select value={hotelId} onValueChange={setHotelId}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {available?.map((h: any) => <SelectItem key={h.id} value={h.id}>{h.code} — {lang === "ar" ? h.name_ar : h.name_en}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={preferred} onCheckedChange={(v) => setPreferred(!!v)} />
            {t("label.is_preferred")}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || !hotelId}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
