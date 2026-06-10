import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { useCountries } from "@/lib/lookups";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill as StatusBadge } from "@/components/status-pill";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, Star, Building2, CheckCircle2, XCircle, Award, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/suppliers/")({
  component: SuppliersList,
});

const PAGE_SIZE = 20;
const STATUSES = ["active", "inactive", "archived"] as const;
const STYPES = ["hotel_supplier", "dmc", "direct_hotel", "wholesaler", "other"] as const;

function SuppliersList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [stype, setStype] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const countries = useCountries();

  const metrics = useQuery({
    queryKey: ["suppliers-metrics"],
    queryFn: async () => {
      const { data } = await supabase.from("suppliers").select("status,rating,created_at,deleted_at");
      const rows = data ?? [];
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      return {
        total: rows.filter(r => !r.deleted_at).length,
        active: rows.filter(r => r.status === "active" && !r.deleted_at).length,
        inactive: rows.filter(r => r.status === "inactive" && !r.deleted_at).length,
        archived: rows.filter(r => r.deleted_at).length,
        topRated: rows.filter(r => Number(r.rating) >= 4 && !r.deleted_at).length,
        thisMonth: rows.filter(r => new Date(r.created_at) >= monthStart && !r.deleted_at).length,
      };
    },
  });

  const list = useQuery({
    queryKey: ["suppliers", { dSearch, status, country, stype, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("suppliers").select(
        "id,code,name_en,name_ar,supplier_type,country_code,phone,email,rating,preferred_currency,status,created_at,deleted_at",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status as any);
      if (country !== "all") q = q.eq("country_code", country);
      if (stype !== "all") q = q.eq("supplier_type", stype);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},legal_name.ilike.${s},email.ilike.${s},phone.ilike.${s},tax_number.ilike.${s}`);
      }
      const from = (page - 1) * PAGE_SIZE;
      q = q.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const archiveMut = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "archive" | "restore" | "delete" }) => {
      if (action === "delete") {
        const { error } = await supabase.from("suppliers").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("suppliers").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("suppliers").update({ deleted_at: null, status: "active" }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["lookup", "suppliers-lite"] });
      setConfirm(null);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const total = list.data?.count ?? 0;

  const actions = useMemo(() => canWrite && (
    <Button onClick={() => navigate({ to: "/suppliers/new" })} size="sm">
      <Plus className="h-4 w-4" /> {t("suppliers.new")}
    </Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("suppliers.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard icon={Building2} tone="primary" label={t("kpi.total")} value={metrics.data?.total ?? "—"}
            active={status === "all" && !showArchived} onClick={() => { setStatus("all"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={CheckCircle2} tone="success" label={t("kpi.active")} value={metrics.data?.active ?? "—"}
            active={status === "active"} onClick={() => { setStatus("active"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={XCircle} tone="warning" label={t("kpi.inactive")} value={metrics.data?.inactive ?? "—"}
            active={status === "inactive"} onClick={() => { setStatus("inactive"); setShowArchived(false); setPage(1); }} />
          <KpiCard icon={Archive} tone="muted" label={t("kpi.archived")} value={metrics.data?.archived ?? "—"}
            active={showArchived} onClick={() => { setShowArchived(true); setStatus("all"); setPage(1); }} />
          <KpiCard icon={Award} tone="info" label={t("kpi.top_rated")} value={metrics.data?.topRated ?? "—"} />
          <KpiCard icon={Calendar} tone="info" label={t("kpi.this_month")} value={metrics.data?.thisMonth ?? "—"} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={t("filter.all")} tone="primary" active={stype === "all"} onClick={() => { setStype("all"); setPage(1); }} />
          {STYPES.map(s => (
            <StatusPill key={s} label={t(`stype.${s}`, s)} tone="info" active={stype === s} onClick={() => { setStype(s); setPage(1); }} />
          ))}
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("actions.search")} className="ps-8" />
            </div>
            <Select value={stype} onValueChange={(v) => { setStype(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter.type")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STYPES.map((s) => <SelectItem key={s} value={s}>{t(`stype.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={(v) => { setCountry(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter.country")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {countries.data?.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{lang === "ar" ? c.name_ar : c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="ms-auto flex items-center gap-2 text-sm">
              <Checkbox checked={showArchived} onCheckedChange={(v) => { setShowArchived(!!v); setPage(1); }} />
              {t("filter.show_archived")}
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.code")}</TableHead>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("filter.type")}</TableHead>
                  <TableHead>{t("label.country")}</TableHead>
                  <TableHead>{t("label.phone")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.rating")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {list.data?.rows.map((s: any) => (
                  <TableRow key={s.id} className={s.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{s.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to="/suppliers/$id" params={{ id: s.id }} className="hover:underline">
                        {lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs">{t(`stype.${s.supplier_type}`, s.supplier_type)}</TableCell>
                    <TableCell className="text-xs">{s.country_code}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{s.phone}</TableCell>
                    <TableCell className="text-xs font-mono">{s.preferred_currency}</TableCell>
                    <TableCell>{s.rating ? <span className="flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3 fill-current" />{Number(s.rating).toFixed(1)}</span> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/suppliers/$id" params={{ id: s.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !s.deleted_at && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to="/suppliers/$id" params={{ id: s.id }} search={{ edit: 1 } as any}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        {auth.isAdmin && (s.deleted_at
                          ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: s.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                          : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: s.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {auth.isAdmin && s.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirm({ id: s.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataPagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.action === "restore" ? t("actions.restore") : confirm?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirm?.action === "delete" ? t("toast.confirm_delete") : confirm?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirm?.action !== "restore"}
        onConfirm={() => confirm && archiveMut.mutate(confirm)}
      />
    </>
  );
}
