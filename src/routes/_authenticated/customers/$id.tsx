import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomerForm } from "./-form";
import { MembersTab } from "./-members";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Plus, Trash2, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customers/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ edit: s.edit ? 1 : undefined }) as { edit?: 1 },
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent","operations_manager"]);
  const [editing, setEditing] = useState(!!search.edit);

  const cust = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const contacts = useQuery({
    queryKey: ["customer-contacts", id],
    queryFn: async () => (await supabase.from("customer_contacts").select("*").eq("customer_id", id).order("is_primary", { ascending: false })).data ?? [],
  });
  const attachments = useQuery({
    queryKey: ["customer-attachments", id],
    queryFn: async () => (await supabase.from("customer_attachments").select("*").eq("customer_id", id).order("created_at", { ascending: false })).data ?? [],
  });
  const comms = useQuery({
    queryKey: ["customer-comms", id],
    queryFn: async () => (await supabase.from("customer_communications").select("*").eq("customer_id", id).order("occurred_at", { ascending: false })).data ?? [],
  });

  if (cust.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!cust.data) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;

  const c = cust.data;
  const displayName = lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar);
  const isEntity = c.customer_type !== "individual";

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${c.code} · ${t(`ctype.${c.customer_type}`)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/customers" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            <StatusPill status={c.status} />
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("customers.overview")}</TabsTrigger>
            <TabsTrigger value="contacts">{t("customers.contacts")} ({contacts.data?.length ?? 0})</TabsTrigger>
            {isEntity && <TabsTrigger value="members">{t("customers.members")}</TabsTrigger>}
            <TabsTrigger value="attachments">{t("customers.attachments")} ({attachments.data?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="communications">{t("customers.communications")} ({comms.data?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <CustomerForm initial={c} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["customer", id] }); }} />
            ) : (
              <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
                <KV label={t("label.code")} value={c.code} mono />
                <KV label={t("filter.type")} value={t(`ctype.${c.customer_type}`)} />
                <KV label={t("label.language")} value={c.preferred_language === "ar" ? "العربية" : "English"} />
                <KV label={isIndividual ? t("label.personal_name_en") : t("label.name_en")} value={c.name_en} />
                <KV label={isIndividual ? t("label.personal_name_ar") : t("label.name_ar")} value={c.name_ar} />
                {!isIndividual && (
                  <>
                    <KV label={t("label.tax_number")} value={c.tax_number} />
                    <KV label={t("label.cr")} value={c.commercial_registration} />
                  </>
                )}
                <KV label={t("label.email")} value={c.email} />
                <KV label={t("label.phone")} value={c.phone} />
                <KV label={t("label.mobile")} value={c.mobile} />
                <KV label={t("label.website")} value={c.website} />
                <KV label={t("label.country")} value={c.country ? (lang === "ar" ? c.country.name_ar : c.country.name_en) : ""} />
                <KV label={t("label.city")} value={c.city ? (lang === "ar" ? c.city.name_ar : c.city.name_en) : ""} />
                <KV label={t("label.address")} value={[c.address_line1, c.address_line2, c.postal_code].filter(Boolean).join(", ")} />
                <KV label={t("label.currency")} value={c.preferred_currency} />
                <KV label={t("label.credit_limit")} value={Number(c.credit_limit).toLocaleString()} />
                <KV label={t("label.credit_days")} value={c.credit_days} />
                <KV label={t("label.payment_terms")} value={c.payment_terms} />
                <KV label={t("label.rating")} value={c.rating ? "★".repeat(c.rating) : ""} />
                <KV label={t("label.created_at")} value={formatDateTime(c.created_at, lang)} />
                <KV label={t("label.updated_at")} value={formatDateTime(c.updated_at, lang)} />
                {c.notes && <div className="md:col-span-3"><div className="text-xs text-muted-foreground">{t("label.notes")}</div><div className="whitespace-pre-wrap">{c.notes}</div></div>}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="contacts"><ContactsTab customerId={id} canWrite={canWrite} /></TabsContent>
          {isEntity && <TabsContent value="members"><MembersTab customerId={id} canWrite={canWrite} /></TabsContent>}
          <TabsContent value="attachments"><AttachmentsTab customerId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="communications"><CommunicationsTab customerId={id} canWrite={canWrite} /></TabsContent>
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

function ContactsTab({ customerId, canWrite }: { customerId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["customer-contacts", customerId],
    queryFn: async () => (await supabase.from("customer_contacts").select("*").eq("customer_id", customerId).order("is_primary", { ascending: false })).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("customer_contacts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["customer-contacts", customerId] }); setDelId(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">{t("customers.contacts")}</h3>
          {canWrite && (
            <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>
          )}
        </div>
        <Table>
          <TableHeader><TableRow>
            <TableHead>{t("label.full_name")}</TableHead><TableHead>{t("label.title_position")}</TableHead>
            <TableHead>{t("label.email")}</TableHead><TableHead>{t("label.phone")}</TableHead>
            <TableHead>{t("label.is_primary")}</TableHead><TableHead></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {q.data?.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
            {q.data?.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.full_name}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell dir="ltr">{c.email}</TableCell>
                <TableCell dir="ltr">{c.phone || c.mobile}</TableCell>
                <TableCell>{c.is_primary && <Badge>{t("label.is_primary")}</Badge>}</TableCell>
                <TableCell className="text-end">
                  {canWrite && <>
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ContactDialog open={open} onOpenChange={setOpen} customerId={customerId} initial={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["customer-contacts", customerId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </Card>
  );
}

function ContactDialog({ open, onOpenChange, customerId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  useState(() => { setV(initial ?? { is_primary: false, preferred_language: "ar" }); });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload = { ...v, customer_id: customerId };
      delete payload.created_at; delete payload.updated_at;
      if (isEdit) { const { error } = await supabase.from("customer_contacts").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("customer_contacts").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { is_primary: false }); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label={`${t("label.full_name")} *`}><Input value={v.full_name ?? ""} onChange={e => setV({ ...v, full_name: e.target.value })} /></Field>
          <Field label={t("label.title_position")}><Input value={v.title ?? ""} onChange={e => setV({ ...v, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("label.email")}><Input type="email" dir="ltr" value={v.email ?? ""} onChange={e => setV({ ...v, email: e.target.value })} /></Field>
            <Field label={t("label.phone")}><Input dir="ltr" value={v.phone ?? ""} onChange={e => setV({ ...v, phone: e.target.value })} /></Field>
            <Field label={t("label.mobile")}><Input dir="ltr" value={v.mobile ?? ""} onChange={e => setV({ ...v, mobile: e.target.value })} /></Field>
            <Field label={t("label.language")}>
              <Select value={v.preferred_language ?? "ar"} onValueChange={x => setV({ ...v, preferred_language: x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ar">العربية</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_primary} onCheckedChange={x => setV({ ...v, is_primary: !!x })} />{t("label.is_primary")}</label>
          <Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={e => setV({ ...v, notes: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: any) { return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>; }

function AttachmentsTab({ customerId, canWrite }: { customerId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<any>({});
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["customer-attachments", customerId],
    queryFn: async () => (await supabase.from("customer_attachments").select("*").eq("customer_id", customerId).order("created_at", { ascending: false })).data ?? [],
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.file_name?.trim() || !v.file_path?.trim()) throw new Error(t("label.required"));
      const { error } = await supabase.from("customer_attachments").insert({ ...v, customer_id: customerId });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["customer-attachments", customerId] }); setOpen(false); setV({}); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("customer_attachments").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["customer-attachments", customerId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("customers.attachments")}</h3>
        {canWrite && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setV({}); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />{t("actions.add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("customers.attachments")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Field label={`${t("label.file_name")} *`}><Input value={v.file_name ?? ""} onChange={e => setV({ ...v, file_name: e.target.value })} /></Field>
                <Field label={`${t("label.file_url")} *`}><Input dir="ltr" value={v.file_path ?? ""} onChange={e => setV({ ...v, file_path: e.target.value })} /></Field>
                <Field label={t("label.category")}><Input value={v.category ?? ""} onChange={e => setV({ ...v, category: e.target.value })} /></Field>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.file_name")}</TableHead><TableHead>{t("label.category")}</TableHead>
          <TableHead>{t("label.created_at")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((a: any) => (
            <TableRow key={a.id}>
              <TableCell><a href={a.file_path} target="_blank" rel="noreferrer" className="text-primary hover:underline">{a.file_name}</a></TableCell>
              <TableCell>{a.category}</TableCell>
              <TableCell>{formatDateTime(a.created_at, lang)}</TableCell>
              <TableCell className="text-end">{canWrite && <Button variant="ghost" size="icon" onClick={() => setDelId(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}

function CommunicationsTab({ customerId, canWrite }: { customerId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<any>({});
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["customer-comms", customerId],
    queryFn: async () => (await supabase.from("customer_communications").select("*").eq("customer_id", customerId).order("occurred_at", { ascending: false })).data ?? [],
  });
  const staff = useQuery({
    queryKey: ["lookup-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("id,email,full_name_ar,full_name_en")).data ?? [],
  });
  const staffName = (id: string | null) => {
    const p: any = staff.data?.find((x: any) => x.id === id);
    if (!p) return "—";
    return (lang === "ar" ? p.full_name_ar : p.full_name_en) || p.email || "—";
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!v.channel) throw new Error(t("label.required"));
      const payload: any = { ...v, customer_id: customerId, occurred_at: v.occurred_at || new Date().toISOString() };
      const { error } = await supabase.from("customer_communications").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["customer-comms", customerId] }); setOpen(false); setV({}); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("customer_communications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["customer-comms", customerId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("customers.communications")}</h3>
        {canWrite && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setV({ channel: "note", direction: "outbound" }); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />{t("actions.add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("customers.communications")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("label.channel")}>
                    <Select value={v.channel ?? "note"} onValueChange={x => setV({ ...v, channel: x })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["email","phone","whatsapp","meeting","note","other"].map(c => <SelectItem key={c} value={c}>{t(`channel.${c}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("label.direction")}>
                    <Select value={v.direction ?? "outbound"} onValueChange={x => setV({ ...v, direction: x })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="inbound">{t("direction.inbound")}</SelectItem><SelectItem value="outbound">{t("direction.outbound")}</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label={t("label.subject")}><Input value={v.subject ?? ""} onChange={e => setV({ ...v, subject: e.target.value })} /></Field>
                <Field label={t("label.message")}><Textarea rows={4} value={v.body ?? ""} onChange={e => setV({ ...v, body: e.target.value })} /></Field>
                <Field label={t("label.occurred_at")}>
                  <Input type="datetime-local" value={v.occurred_at?.slice(0,16) ?? ""} onChange={e => setV({ ...v, occurred_at: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
                </Field>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.occurred_at")}</TableHead><TableHead>{t("label.channel")}</TableHead>
          <TableHead>{t("label.direction")}</TableHead><TableHead>{t("label.subject")}</TableHead>
          <TableHead>{t("label.employee")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="text-xs">{formatDateTime(c.occurred_at, lang)}</TableCell>
              <TableCell><Badge variant="outline">{t(`channel.${c.channel}`)}</Badge></TableCell>
              <TableCell><Badge variant="secondary">{c.direction ? t(`direction.${c.direction}`) : "—"}</Badge></TableCell>
              <TableCell>
                <div className="font-medium">{c.subject}</div>
                {c.body && <div className="text-xs text-muted-foreground line-clamp-2">{c.body}</div>}
              </TableCell>
              <TableCell className="text-xs">
                <div>{staffName(c.created_by)}</div>
                <div dir="ltr" className="text-muted-foreground">{formatDateTime(c.created_at, lang)}</div>
              </TableCell>
              <TableCell className="text-end">{canWrite && <Button variant="ghost" size="icon" onClick={() => setDelId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
