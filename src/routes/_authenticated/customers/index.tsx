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
import { Badge } from "@/components/ui/badge";
import { StatusPill as StatusBadge } from "@/components/status-pill";
import { KpiCard, StatusPill } from "@/components/list-toolkit";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2, Users, UserCheck, UserX, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customers/")({
  component: CustomersList,
});

const PAGE_SIZE = 20;
const TYPES = ["corporate", "individual", "agency", "government"] as const;
const STATUSES = ["active", "inactive", "archived"] as const;

function CustomersList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin","admin","sales_manager","sales_agent","operations_manager"]);

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const countries = useCountries();

  const list = useQuery({
    queryKey: ["customers", { dSearch, type, status, country, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("customers").select(
        "id,code,name_en,name_ar,customer_type,email,phone,country_code,status,credit_limit,rating,preferred_language,created_at,deleted_at",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (type !== "all") q = q.eq("customer_type", type);
      if (status !== "all") q = q.eq("status", status as any);
      if (country !== "all") q = q.eq("country_code", country);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s},email.ilike.${s},phone.ilike.${s},tax_number.ilike.${s}`);
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
        const { error } = await supabase.from("customers").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("customers").update({ deleted_at: new Date().toISOString(), status: "archived" }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").update({ deleted_at: null, status: "active" }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "delete" ? t("toast.deleted") : v.action === "archive" ? t("toast.deleted") : t("toast.restored"));
      qc.invalidateQueries({ queryKey: ["customers"] });
      setConfirmId(null);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  const total = list.data?.count ?? 0;

  const actions = useMemo(() => canWrite && (
    <Button onClick={() => navigate({ to: "/customers/new" })} size="sm">
      <Plus className="h-4 w-4" /> {t("customers.new")}
    </Button>
  ), [canWrite, navigate, t]);

  return (
    <>
      <PageHeader title={t("customers.title")} subtitle={`${total} ${t("label.total")}`} actions={actions} />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("actions.search")} className="ps-8" />
            </div>
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder={t("filter.type")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {TYPES.map(c => <SelectItem key={c} value={c}>{t(`ctype.${c}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={(v) => { setCountry(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter.country")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {countries.data?.map(c => (
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
                  <TableHead>{t("label.email")}</TableHead>
                  <TableHead>{t("label.phone")}</TableHead>
                  <TableHead>{t("label.country")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">{t("label.no_results")}</TableCell></TableRow>
                )}
                {list.data?.rows.map((c: any) => (
                  <TableRow key={c.id} className={c.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to="/customers/$id" params={{ id: c.id }} className="hover:underline">
                        {lang === "ar" ? (c.name_ar || c.name_en) : (c.name_en || c.name_ar)}
                      </Link>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t(`ctype.${c.customer_type}`)}</Badge></TableCell>
                    <TableCell dir="ltr" className="text-xs">{c.email}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{c.phone}</TableCell>
                    <TableCell className="text-xs">{c.country_code}</TableCell>
                    <TableCell><StatusPill status={c.status} /></TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/customers/$id" params={{ id: c.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !c.deleted_at && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to="/customers/$id" params={{ id: c.id }} search={{ edit: 1 } as any}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        {auth.isAdmin && (c.deleted_at
                          ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirmId({ id: c.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                          : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirmId({ id: c.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {auth.isAdmin && c.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirmId({ id: c.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title={confirmId?.action === "restore" ? t("actions.restore") : confirmId?.action === "delete" ? t("actions.delete") : t("actions.archive")}
        description={confirmId?.action === "delete" ? t("toast.confirm_delete") : confirmId?.action === "restore" ? "" : t("toast.confirm_archive")}
        destructive={confirmId?.action !== "restore"}
        onConfirm={() => confirmId && archiveMut.mutate(confirmId)}
      />
    </>
  );
}
