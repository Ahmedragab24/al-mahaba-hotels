import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useFacilities, useSuppliersLite } from "@/lib/lookups";
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
import { HotelForm } from "./-form";
import { HotelShareActions } from "./-share-actions";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ArrowLeft, Pencil, Plus, Trash2, Star } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hotels/$id")({
  validateSearch: (s: Record<string, unknown>) =>
    ({ edit: s.edit ? 1 : undefined, customer: typeof s.customer === "string" ? s.customer : undefined }) as { edit?: 1; customer?: string },
  component: HotelDetail,
});

const BOARDS = ["RO", "BB", "HB", "FB", "AI", "UAI"] as const;

function HotelDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const [editing, setEditing] = useState(!!search.edit);

  const hotel = useQuery({
    queryKey: ["hotel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("*, country:countries(name_en,name_ar), city:cities(name_en,name_ar)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const counts = useQuery({
    queryKey: ["hotel-counts", id],
    queryFn: async () => {
      const tables = ["hotel_room_types", "hotel_views", "hotel_meal_plans", "hotel_facilities", "hotel_images", "hotel_contacts", "hotel_suppliers", "rates"] as const;
      const out: Record<string, number> = {};
      await Promise.all(tables.map(async (tb) => {
        const { count } = await supabase.from(tb).select("*", { count: "exact", head: true }).eq("hotel_id", id);
        out[tb] = count ?? 0;
      }));
      return out;
    },
  });

  if (hotel.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!hotel.data) return <div className="p-6 text-muted-foreground">{t("label.no_results")}</div>;

  const h = hotel.data;
  const displayName = lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar);

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={`${h.code}${h.brand ? " · " + h.brand : ""}${h.star_rating ? " · " + "★".repeat(h.star_rating) : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/hotels" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <HotelShareActions hotelId={id} contextCustomerId={search.customer} />
            {canWrite && !editing && (
              <Button size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />{t("actions.edit")}</Button>
            )}
            <StatusPill status={h.status} />
          </div>
        }
      />
      <div className="p-6">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="profile">{t("hotels.profile")}</TabsTrigger>
            <TabsTrigger value="rooms">{t("hotels.rooms")} ({counts.data?.hotel_room_types ?? 0})</TabsTrigger>
            <TabsTrigger value="views">{t("hotels.views")} ({counts.data?.hotel_views ?? 0})</TabsTrigger>
            <TabsTrigger value="meals">{t("hotels.meal_plans")} ({counts.data?.hotel_meal_plans ?? 0})</TabsTrigger>
            <TabsTrigger value="facilities">{t("hotels.facilities")} ({counts.data?.hotel_facilities ?? 0})</TabsTrigger>
            <TabsTrigger value="images">{t("hotels.images")} ({counts.data?.hotel_images ?? 0})</TabsTrigger>
            <TabsTrigger value="contacts">{t("hotels.contacts")} ({counts.data?.hotel_contacts ?? 0})</TabsTrigger>
            <TabsTrigger value="suppliers">{t("hotels.suppliers")} ({counts.data?.hotel_suppliers ?? 0})</TabsTrigger>
            <TabsTrigger value="rates">{t("hotels.rates_history")} ({counts.data?.rates ?? 0})</TabsTrigger>
            <TabsTrigger value="bookings">{t("hotels.bookings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {editing ? (
              <HotelForm initial={h} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["hotel", id] }); }} />
            ) : (
              <Card><CardContent className="grid gap-3 p-6 md:grid-cols-3 text-sm">
                <KV label={t("label.code")} value={h.code} mono />
                <KV label={t("label.brand")} value={h.brand} />
                <KV label={t("label.stars")} value={h.star_rating ? "★".repeat(h.star_rating) : ""} />
                <KV label={t("label.name_en")} value={h.name_en} />
                <KV label={t("label.name_ar")} value={h.name_ar} />
                <KV label={t("label.status")} value={t(`status.${h.status}`)} />
                <KV label={t("label.country")} value={h.country ? (lang === "ar" ? h.country.name_ar : h.country.name_en) : ""} />
                <KV label={t("label.city")} value={h.city ? (lang === "ar" ? h.city.name_ar : h.city.name_en) : ""} />
                <KV label={t("label.district")} value={h.district} />
                <KV label={t("label.address")} value={[h.address_line1, h.address_line2, h.postal_code].filter(Boolean).join(", ")} />
                <KV
                  label={t("label.location_url")}
                  value={
                    h.location_url ? (
                      <a
                        href={h.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--brand-gold-deep)] hover:underline truncate max-w-xs block"
                      >
                        {h.location_url}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <KV label={t("label.phone")} value={h.phone} />
                <KV label={t("label.email")} value={h.email} />
                <KV label={t("label.website")} value={h.website} />
                <KV label={t("label.checkin")} value={h.check_in_time?.slice(0, 5)} />
                <KV label={t("label.checkout")} value={h.check_out_time?.slice(0, 5)} />
                <KV label={t("label.created_at")} value={formatDateTime(h.created_at, lang)} />
                {(h.description_en || h.description_ar) && (
                  <div className="md:col-span-3 space-y-1"><div className="text-xs text-muted-foreground">{t("label.description")}</div>
                    <div className="whitespace-pre-wrap">{lang === "ar" ? (h.description_ar || h.description_en) : (h.description_en || h.description_ar)}</div></div>
                )}
                {(h.policies_en || h.policies_ar) && (
                  <div className="md:col-span-3 space-y-1"><div className="text-xs text-muted-foreground">Policies</div>
                    <div className="whitespace-pre-wrap">{lang === "ar" ? (h.policies_ar || h.policies_en) : (h.policies_en || h.policies_ar)}</div></div>
                )}
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="rooms"><RoomsTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="views"><ViewsTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="meals"><MealsTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="facilities"><FacilitiesTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="images"><ImagesTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="contacts"><ContactsTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="suppliers"><SuppliersTab hotelId={id} canWrite={canWrite} /></TabsContent>
          <TabsContent value="rates"><RatesHistoryTab hotelId={id} /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
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
function Field({ label, children }: any) { return <div className="space-y-1"><div className="text-xs text-muted-foreground">{label}</div>{children}</div>; }

/* ---------- Room Types ---------- */
function RoomsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-rooms", hotelId],
    queryFn: async () => (await supabase.from("hotel_room_types").select("*").eq("hotel_id", hotelId).order("sort_order")).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_room_types").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-rooms", hotelId] }); setDelId(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.rooms")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.max_adults")}</TableHead><TableHead>{t("label.max_children")}</TableHead>
          <TableHead>{t("label.bed_type")}</TableHead><TableHead>{t("label.size_sqm")}</TableHead>
          <TableHead>{t("label.is_active")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell>{lang === "ar" ? r.name_ar : r.name_en}</TableCell>
              <TableCell>{r.max_adults}</TableCell>
              <TableCell>{r.max_children}</TableCell>
              <TableCell>{r.bed_type}</TableCell>
              <TableCell>{r.size_sqm}</TableCell>
              <TableCell>{r.is_active ? <Badge>{t("status.active")}</Badge> : <Badge variant="secondary">{t("status.inactive")}</Badge>}</TableCell>
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
      <RoomDialog open={open} onOpenChange={setOpen} hotelId={hotelId} initial={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["hotel-rooms", hotelId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function RoomDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.code?.trim() || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: hotelId,
        code: v.code.trim(), name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        max_adults: Number(v.max_adults ?? 2), max_children: Number(v.max_children ?? 0),
        max_occupancy: Number(v.max_occupancy ?? (Number(v.max_adults ?? 2) + Number(v.max_children ?? 0))),
        bed_type: v.bed_type || null, size_sqm: v.size_sqm ? Number(v.size_sqm) : null,
        description_en: v.description_en || null, description_ar: v.description_ar || null,
        is_active: v.is_active ?? true, sort_order: Number(v.sort_order ?? 0),
      };
      if (isEdit) { const { error } = await supabase.from("hotel_room_types").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("hotel_room_types").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { max_adults: 2, max_children: 0, max_occupancy: 2, is_active: true, sort_order: 0 }); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.rooms")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("label.code")} *`}><Input value={v.code ?? ""} onChange={(e) => setV({ ...v, code: e.target.value })} /></Field>
          <Field label={t("label.bed_type")}><Input value={v.bed_type ?? ""} onChange={(e) => setV({ ...v, bed_type: e.target.value })} /></Field>
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <Field label={t("label.max_adults")}><Input type="number" min={1} value={v.max_adults ?? 2} onChange={(e) => setV({ ...v, max_adults: e.target.value })} /></Field>
          <Field label={t("label.max_children")}><Input type="number" min={0} value={v.max_children ?? 0} onChange={(e) => setV({ ...v, max_children: e.target.value })} /></Field>
          <Field label={t("label.max_occupancy")}><Input type="number" min={1} value={v.max_occupancy ?? 2} onChange={(e) => setV({ ...v, max_occupancy: e.target.value })} /></Field>
          <Field label={t("label.size_sqm")}><Input type="number" step="0.01" value={v.size_sqm ?? ""} onChange={(e) => setV({ ...v, size_sqm: e.target.value })} /></Field>
          <Field label={t("label.sort_order")}><Input type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm self-end"><Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}</label>
          <Field label={`${t("label.description")} (EN)`}><Textarea rows={2} dir="ltr" value={v.description_en ?? ""} onChange={(e) => setV({ ...v, description_en: e.target.value })} /></Field>
          <Field label={`${t("label.description")} (AR)`}><Textarea rows={2} dir="rtl" value={v.description_ar ?? ""} onChange={(e) => setV({ ...v, description_ar: e.target.value })} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Views ---------- */
function ViewsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-views", hotelId],
    queryFn: async () => (await supabase.from("hotel_views").select("*").eq("hotel_id", hotelId).order("name_en")).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_views").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-views", hotelId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.views")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.is_active")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell>{lang === "ar" ? r.name_ar : r.name_en}</TableCell>
              <TableCell>{r.is_active ? <Badge>{t("status.active")}</Badge> : <Badge variant="secondary">{t("status.inactive")}</Badge>}</TableCell>
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
      <ViewDialog open={open} onOpenChange={setOpen} hotelId={hotelId} initial={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["hotel-views", hotelId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function ViewDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.code?.trim() || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload: any = { hotel_id: hotelId, code: v.code.trim(), name_en: v.name_en.trim(), name_ar: v.name_ar.trim(), is_active: v.is_active ?? true };
      if (isEdit) { const { error } = await supabase.from("hotel_views").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("hotel_views").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { is_active: true }); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.views")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label={`${t("label.code")} *`}><Input value={v.code ?? ""} onChange={(e) => setV({ ...v, code: e.target.value })} /></Field>
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Meal Plans ---------- */
function MealsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-meals", hotelId],
    queryFn: async () => (await supabase.from("hotel_meal_plans").select("*").eq("hotel_id", hotelId)).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_meal_plans").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-meals", hotelId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.meal_plans")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.description")}</TableHead>
          <TableHead>{t("label.is_active")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell><Badge variant="outline">{r.board}</Badge> <span className="ms-2 text-xs text-muted-foreground">{t(`board.${r.board}`)}</span></TableCell>
              <TableCell>{lang === "ar" ? r.name_ar : r.name_en}</TableCell>
              <TableCell className="text-xs text-muted-foreground line-clamp-2">{lang === "ar" ? r.description_ar : r.description_en}</TableCell>
              <TableCell>{r.is_active ? <Badge>{t("status.active")}</Badge> : <Badge variant="secondary">{t("status.inactive")}</Badge>}</TableCell>
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
      <MealDialog open={open} onOpenChange={setOpen} hotelId={hotelId} initial={editing} onSaved={() => qc.invalidateQueries({ queryKey: ["hotel-meals", hotelId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function MealDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.board || !v.name_en?.trim() || !v.name_ar?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: hotelId, board: v.board, name_en: v.name_en.trim(), name_ar: v.name_ar.trim(),
        description_en: v.description_en || null, description_ar: v.description_ar || null, is_active: v.is_active ?? true,
      };
      if (isEdit) { const { error } = await supabase.from("hotel_meal_plans").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("hotel_meal_plans").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { board: "BB", is_active: true }); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.meal_plans")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <Field label={`${t("label.type")} *`}>
            <Select value={v.board ?? ""} onValueChange={(x) => setV({ ...v, board: x })} disabled={isEdit}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{BOARDS.map((b) => <SelectItem key={b} value={b}>{b} — {t(`board.${b}`)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label={`${t("label.name_en")} *`}><Input dir="ltr" value={v.name_en ?? ""} onChange={(e) => setV({ ...v, name_en: e.target.value })} /></Field>
          <Field label={`${t("label.name_ar")} *`}><Input dir="rtl" value={v.name_ar ?? ""} onChange={(e) => setV({ ...v, name_ar: e.target.value })} /></Field>
          <Field label={`${t("label.description")} (EN)`}><Textarea rows={2} dir="ltr" value={v.description_en ?? ""} onChange={(e) => setV({ ...v, description_en: e.target.value })} /></Field>
          <Field label={`${t("label.description")} (AR)`}><Textarea rows={2} dir="rtl" value={v.description_ar ?? ""} onChange={(e) => setV({ ...v, description_ar: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_active} onCheckedChange={(x) => setV({ ...v, is_active: !!x })} />{t("label.is_active")}</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Facilities (M2M) ---------- */
function FacilitiesTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const facilities = useFacilities();
  const linked = useQuery({
    queryKey: ["hotel-facilities", hotelId],
    queryFn: async () => (await supabase.from("hotel_facilities").select("facility_id").eq("hotel_id", hotelId)).data ?? [],
  });
  const linkedIds = new Set((linked.data ?? []).map((r: any) => r.facility_id));
  const toggle = useMutation({
    mutationFn: async ({ facilityId, on }: { facilityId: string; on: boolean }) => {
      if (on) {
        const { error } = await supabase.from("hotel_facilities").insert({ hotel_id: hotelId, facility_id: facilityId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotel_facilities").delete().eq("hotel_id", hotelId).eq("facility_id", facilityId);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hotel-facilities", hotelId] }); qc.invalidateQueries({ queryKey: ["hotel-counts", hotelId] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const byCat: Record<string, any[]> = {};
  (facilities.data ?? []).forEach((f: any) => { const c = f.category || "other"; (byCat[c] ??= []).push(f); });
  return (
    <Card><CardContent className="p-6 space-y-6">
      {Object.keys(byCat).length === 0 && <div className="text-center text-muted-foreground py-10">{t("empty.title")}</div>}
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat}>
          <div className="mb-3 text-sm font-medium text-muted-foreground uppercase">{cat}</div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {items.map((f: any) => (
              <label key={f.id} className="flex items-center gap-2 rounded-md border p-2 hover:bg-muted/40">
                <Checkbox checked={linkedIds.has(f.id)} disabled={!canWrite || toggle.isPending}
                  onCheckedChange={(v) => toggle.mutate({ facilityId: f.id, on: !!v })} />
                <span className="text-sm">{lang === "ar" ? f.name_ar : f.name_en}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </CardContent></Card>
  );
}

/* ---------- Images ---------- */
function ImagesTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<any>({});
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-images", hotelId],
    queryFn: async () => (await supabase.from("hotel_images").select("*").eq("hotel_id", hotelId).order("sort_order")).data ?? [],
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.file_path?.trim()) throw new Error(t("label.required"));
      const payload: any = { hotel_id: hotelId, file_path: v.file_path.trim(), caption: v.caption || null, sort_order: Number(v.sort_order ?? 0), is_cover: !!v.is_cover };
      const { error } = await supabase.from("hotel_images").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["hotel-images", hotelId] }); setOpen(false); setV({}); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_images").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-images", hotelId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.images")}</h3>
        {canWrite && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setV({ is_cover: false, sort_order: 0 }); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" />{t("actions.add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("hotels.images")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Field label={`${t("label.file_url")} *`}><Input dir="ltr" value={v.file_path ?? ""} onChange={(e) => setV({ ...v, file_path: e.target.value })} /></Field>
                <Field label={t("label.caption")}><Input value={v.caption ?? ""} onChange={(e) => setV({ ...v, caption: e.target.value })} /></Field>
                <Field label={t("label.sort_order")}><Input type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: e.target.value })} /></Field>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_cover} onCheckedChange={(x) => setV({ ...v, is_cover: !!x })} />{t("label.is_cover")}</label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {q.data?.length === 0 && <div className="col-span-full text-center text-muted-foreground py-10">{t("empty.title")}</div>}
        {q.data?.map((img: any) => (
          <div key={img.id} className="relative rounded-md border overflow-hidden group">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img src={img.file_path} className="aspect-video w-full object-cover bg-muted" loading="lazy" />
            <div className="flex items-center justify-between p-2 text-xs">
              <span className="truncate">{img.caption || "—"}</span>
              {img.is_cover && <Badge>{t("label.is_cover")}</Badge>}
            </div>
            {canWrite && (
              <Button variant="destructive" size="icon" className="absolute top-1 end-1 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={() => setDelId(img.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            )}
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}

/* ---------- Contacts ---------- */
function ContactsTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-contacts", hotelId],
    queryFn: async () => (await supabase.from("hotel_contacts").select("*").eq("hotel_id", hotelId).order("is_primary", { ascending: false })).data ?? [],
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_contacts").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-contacts", hotelId] }); setDelId(null); },
  });
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.contacts")}</h3>
        {canWrite && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" />{t("actions.add")}</Button>}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.full_name")}</TableHead><TableHead>{t("label.title_position")}</TableHead>
          <TableHead>{t("label.department")}</TableHead><TableHead>{t("label.email")}</TableHead>
          <TableHead>{t("label.phone")}</TableHead><TableHead>{t("label.is_primary")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((c: any) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.full_name}</TableCell>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.department}</TableCell>
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
      <ContactDialog open={open} onOpenChange={setOpen} hotelId={hotelId} initial={editing}
        onSaved={() => qc.invalidateQueries({ queryKey: ["hotel-contacts", hotelId] })} />
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}
function ContactDialog({ open, onOpenChange, hotelId, initial, onSaved }: any) {
  const { t } = useI18n();
  const [v, setV] = useState<any>({});
  const isEdit = !!initial?.id;
  const save = useMutation({
    mutationFn: async () => {
      if (!v.full_name?.trim()) throw new Error(t("label.required"));
      const payload: any = {
        hotel_id: hotelId, full_name: v.full_name.trim(),
        title: v.title || null, department: v.department || null,
        email: v.email || null, phone: v.phone || null, mobile: v.mobile || null, whatsapp: v.whatsapp || null,
        is_primary: !!v.is_primary, preferred_language: v.preferred_language || "en", notes: v.notes || null,
      };
      if (isEdit) { const { error } = await supabase.from("hotel_contacts").update(payload).eq("id", initial.id); if (error) throw error; }
      else { const { error } = await supabase.from("hotel_contacts").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success(t("toast.saved")); onSaved(); onOpenChange(false); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setV(initial ?? { is_primary: false, preferred_language: "en" }); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? t("actions.edit") : t("actions.add")} — {t("hotels.contacts")}</DialogTitle></DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={`${t("label.full_name")} *`}><Input value={v.full_name ?? ""} onChange={(e) => setV({ ...v, full_name: e.target.value })} /></Field>
          <Field label={t("label.title_position")}><Input value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label={t("label.department")}><Input value={v.department ?? ""} onChange={(e) => setV({ ...v, department: e.target.value })} /></Field>
          <Field label={t("label.language")}>
            <Select value={v.preferred_language ?? "en"} onValueChange={(x) => setV({ ...v, preferred_language: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="ar">العربية</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
            </Select>
          </Field>
          <Field label={t("label.email")}><Input type="email" dir="ltr" value={v.email ?? ""} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label={t("label.phone")}><Input dir="ltr" value={v.phone ?? ""} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label={t("label.mobile")}><Input dir="ltr" value={v.mobile ?? ""} onChange={(e) => setV({ ...v, mobile: e.target.value })} /></Field>
          <Field label={t("label.whatsapp")}><Input dir="ltr" value={v.whatsapp ?? ""} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} /></Field>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_primary} onCheckedChange={(x) => setV({ ...v, is_primary: !!x })} />{t("label.is_primary")}</label>
          </div>
          <div className="md:col-span-2">
            <Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? t("actions.saving") : t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Linked Suppliers ---------- */
function SuppliersTab({ hotelId, canWrite }: { hotelId: string; canWrite: boolean }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const suppliers = useSuppliersLite();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<any>({});
  const [delId, setDelId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["hotel-suppliers", hotelId],
    queryFn: async () => (await supabase.from("hotel_suppliers").select("*, supplier:suppliers(id,code,name_en,name_ar)").eq("hotel_id", hotelId).order("is_preferred", { ascending: false })).data ?? [],
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!v.supplier_id) throw new Error(t("label.required"));
      const { error } = await supabase.from("hotel_suppliers").insert({ hotel_id: hotelId, supplier_id: v.supplier_id, is_preferred: !!v.is_preferred, notes: v.notes || null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["hotel-suppliers", hotelId] }); setOpen(false); setV({}); },
    onError: (e: any) => toast.error(e.message),
  });
  const togglePref = useMutation({
    mutationFn: async ({ rid, on }: { rid: string; on: boolean }) => {
      const { error } = await supabase.from("hotel_suppliers").update({ is_preferred: on }).eq("id", rid); if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hotel-suppliers", hotelId] }),
  });
  const del = useMutation({
    mutationFn: async (rid: string) => { const { error } = await supabase.from("hotel_suppliers").delete().eq("id", rid); if (error) throw error; },
    onSuccess: () => { toast.success(t("toast.deleted")); qc.invalidateQueries({ queryKey: ["hotel-suppliers", hotelId] }); setDelId(null); },
  });
  const linkedIds = new Set((q.data ?? []).map((r: any) => r.supplier_id));
  const available = (suppliers.data ?? []).filter((s: any) => !linkedIds.has(s.id));
  return (
    <Card><CardContent className="p-0">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">{t("hotels.suppliers")}</h3>
        {canWrite && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setV({ is_preferred: false }); }}>
            <DialogTrigger asChild><Button size="sm" disabled={available.length === 0}><Plus className="h-4 w-4" />{t("actions.add")}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("hotels.suppliers")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <Field label={`${t("filter.supplier")} *`}>
                  <Select value={v.supplier_id ?? ""} onValueChange={(x) => setV({ ...v, supplier_id: x })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {available.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.code} — {lang === "ar" ? s.name_ar : s.name_en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!v.is_preferred} onCheckedChange={(x) => setV({ ...v, is_preferred: !!x })} />{t("label.is_preferred")}</label>
                <Field label={t("label.notes")}><Textarea rows={2} value={v.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("actions.cancel")}</Button>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("label.name")}</TableHead>
          <TableHead>{t("label.is_preferred")}</TableHead><TableHead>{t("label.notes")}</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">{t("empty.title")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.supplier?.code}</TableCell>
              <TableCell>{lang === "ar" ? r.supplier?.name_ar : r.supplier?.name_en}</TableCell>
              <TableCell>
                {canWrite ? (
                  <Checkbox checked={!!r.is_preferred} onCheckedChange={(x) => togglePref.mutate({ rid: r.id, on: !!x })} />
                ) : (r.is_preferred && <Star className="h-4 w-4 text-amber-500" />)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{r.notes}</TableCell>
              <TableCell className="text-end">
                {canWrite && <Button variant="ghost" size="icon" onClick={() => setDelId(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title={t("actions.delete")} description={t("toast.confirm_delete")} destructive onConfirm={() => delId && del.mutate(delId)} />
    </CardContent></Card>
  );
}

/* ---------- Rates history ---------- */
function RatesHistoryTab({ hotelId }: { hotelId: string }) {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["hotel-rates", hotelId],
    queryFn: async () => (await supabase.from("rates")
      .select("id,code,supplier:suppliers(name_en,name_ar),room_type:hotel_room_types(name_en,name_ar),meal_plan,currency,valid_from,valid_to,cost_per_night,selling_price,status,created_at")
      .eq("hotel_id", hotelId).is("deleted_at", null).order("valid_from", { ascending: false })).data ?? [],
  });
  return (
    <Card><CardContent className="p-0">
      <Table>
        <TableHeader><TableRow>
          <TableHead>{t("label.code")}</TableHead><TableHead>{t("filter.supplier")}</TableHead>
          <TableHead>{t("rates.room_type")}</TableHead><TableHead>{t("rates.meal_plan")}</TableHead>
          <TableHead>{t("rates.valid_from")}</TableHead><TableHead>{t("rates.valid_to")}</TableHead>
          <TableHead>{t("rates.cost")}</TableHead><TableHead>{t("label.currency")}</TableHead>
          <TableHead>{t("label.status")}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {q.data?.length === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("hotels.no_rates")}</TableCell></TableRow>}
          {q.data?.map((r: any) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell>{lang === "ar" ? r.supplier?.name_ar : r.supplier?.name_en}</TableCell>
              <TableCell>{lang === "ar" ? r.room_type?.name_ar : r.room_type?.name_en}</TableCell>
              <TableCell><Badge variant="outline">{r.meal_plan}</Badge></TableCell>
              <TableCell className="text-xs">{r.valid_from}</TableCell>
              <TableCell className="text-xs">{r.valid_to}</TableCell>
              <TableCell>{Number(r.cost_per_night).toLocaleString()}</TableCell>
              <TableCell className="text-xs">{r.currency}</TableCell>
              <TableCell><StatusPill status={r.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent></Card>
  );
}

function BookingsTab() {
  const { t } = useI18n();
  return (
    <Card><CardContent className="p-10 text-center text-muted-foreground">
      {t("hotels.no_bookings")}
    </CardContent></Card>
  );
}
