import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite, useSuppliersLite } from "@/lib/lookups";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/status-pill";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/contracts/")({
  component: ContractsList,
});

const PAGE_SIZE = 20;
const STATUSES = ["draft", "active", "suspended", "expired", "terminated", "closed"] as const;
const TYPES = ["allotment", "free_sale", "on_request", "commitment", "other"] as const;

function ContractsList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [hotel, setHotel] = useState("all");
  const [type, setType] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const suppliers = useSuppliersLite();
  const hotels = useHotelsLite();

  const list = useQuery({
    queryKey: ["contracts", { dSearch, status, supplier, hotel, type, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("supplier_contracts").select(
        "id,contract_number,title,contract_type,status,start_date,end_date,currency,commission_pct,deleted_at,created_at,supplier:suppliers(name_en,name_ar),hotel:hotels(name_en,name_ar)",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (status !== "all") q = q.eq("status", status as any);
      if (supplier !== "all") q = q.eq("supplier_id", supplier);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (type !== "all") q = q.eq("contract_type", type);
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`contract_number.ilike.${s},title.ilike.${s}`);
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
        const { error } = await supabase.from("supplier_contracts").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("supplier_contracts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("supplier_contracts").update({ deleted_at: null }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["contracts"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e, t)); setConfirm(null); },
  });

  const total = list.data?.count ?? 0;

  return (
    <>
      <PageHeader
        title={t("contracts.title")}
        subtitle={`${total} ${t("label.total")}`}
        actions={canWrite && (
          <Button size="sm" onClick={() => navigate({ to: "/contracts/new" })}>
            <Plus className="h-4 w-4" /> {t("contracts.new")}
          </Button>
        )}
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("actions.search")} className="ps-8" />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={supplier} onValueChange={(v) => { setSupplier(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter.supplier")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {suppliers.data?.map((s) => <SelectItem key={s.id} value={s.id}>{lang === "ar" ? (s.name_ar || s.name_en) : (s.name_en || s.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {hotels.data?.map((h) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder={t("contracts.type")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                {TYPES.map((c) => <SelectItem key={c} value={c}>{t(`ctrtype.${c}`)}</SelectItem>)}
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
                  <TableHead>{t("label.contract_number")}</TableHead>
                  <TableHead>{t("contracts.name")}</TableHead>
                  <TableHead>{t("contracts.supplier")}</TableHead>
                  <TableHead>{t("contracts.hotel")}</TableHead>
                  <TableHead>{t("contracts.type")}</TableHead>
                  <TableHead>{t("contracts.period")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((c: any) => (
                  <TableRow key={c.id} className={c.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">
                      <Link to="/contracts/$id" params={{ id: c.id }} className="hover:underline">{c.contract_number}</Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{c.title ?? "—"}</TableCell>
                    <TableCell className="text-sm">{c.supplier ? (lang === "ar" ? (c.supplier.name_ar || c.supplier.name_en) : (c.supplier.name_en || c.supplier.name_ar)) : "—"}</TableCell>
                    <TableCell className="text-sm">{c.hotel ? (lang === "ar" ? (c.hotel.name_ar || c.hotel.name_en) : (c.hotel.name_en || c.hotel.name_ar)) : "—"}</TableCell>
                    <TableCell className="text-xs">{t(`ctrtype.${c.contract_type}`)}</TableCell>
                    <TableCell dir="ltr" className="text-xs whitespace-nowrap">{formatDate(c.start_date, lang)} → {formatDate(c.end_date, lang)}</TableCell>
                    <TableCell className="text-xs">{c.currency ?? "—"}</TableCell>
                    <TableCell><StatusPill status={c.status} /></TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/contracts/$id" params={{ id: c.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !c.deleted_at && c.status === "draft" && (
                          <Button asChild variant="ghost" size="icon" title={t("actions.edit")}>
                            <Link to="/contracts/$id" params={{ id: c.id }} search={{ edit: 1 } as any}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                        )}
                        {auth.isAdmin && (c.deleted_at
                          ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: c.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                          : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: c.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {auth.isAdmin && c.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirm({ id: c.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
