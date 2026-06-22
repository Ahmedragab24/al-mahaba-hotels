import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/lib/use-debounce";
import { useHotelsLite } from "@/lib/lookups";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/data-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TaxDialog, TAX_TYPES } from "./-dialog";
import { Plus, Search, Eye, Pencil, Archive, RotateCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/taxes/")({
  component: TaxesList,
});

const PAGE_SIZE = 20;

function TaxesList() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent", "finance_manager", "finance_agent"]);

  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("all");
  const [type, setType] = useState("all");
  const [method, setMethod] = useState("all");
  const [active, setActive] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<{ open: boolean; initial?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ id: string; action: "archive" | "restore" | "delete" } | null>(null);

  const dSearch = useDebounce(search, 300);
  const hotels = useHotelsLite();

  const list = useQuery({
    queryKey: ["taxes", { dSearch, hotel, type, method, active, showArchived, page }],
    queryFn: async () => {
      let q = supabase.from("hotel_taxes").select(
        "*, hotel:hotels(name_en,name_ar)",
        { count: "exact" },
      );
      if (!showArchived) q = q.is("deleted_at", null);
      if (hotel !== "all") q = q.eq("hotel_id", hotel);
      if (type !== "all") q = q.eq("tax_type", type);
      if (method !== "all") q = q.eq("calc_method", method);
      if (active !== "all") q = q.eq("is_active", active === "active");
      if (dSearch.trim()) {
        const s = `%${dSearch.trim()}%`;
        q = q.or(`code.ilike.${s},name_en.ilike.${s},name_ar.ilike.${s}`);
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
        const { error } = await supabase.from("hotel_taxes").delete().eq("id", id);
        if (error) throw error;
      } else if (action === "archive") {
        const { error } = await supabase.from("hotel_taxes").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotel_taxes").update({ deleted_at: null, is_active: true }).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "restore" ? t("toast.restored") : t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["taxes"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e, t)); setConfirm(null); },
  });

  const total = list.data?.count ?? 0;

  return (
    <>
      <PageHeader
        title={t("taxes.title")}
        subtitle={`${total} ${t("label.total")}`}
        children={canWrite && (
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            <Plus className="h-4 w-4" /> {t("taxes.new")}
          </Button>
        )}
      />
      <div className="space-y-4 p-6">
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <Label className="text-muted-foreground">{t("actions.search")}</Label>
              <div className="relative w-full">
                <Search className="absolute top-2.5 start-2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("actions.search")} className="ps-8 w-full" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.hotel")}</Label>
              <Select value={hotel} onValueChange={(v) => { setHotel(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.hotel")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {hotels.data?.map((h) => <SelectItem key={h.id} value={h.id}>{lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("label.tax_type")}</Label>
              <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("label.tax_type")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  {TAX_TYPES.map((x) => <SelectItem key={x} value={x}>{t(`taxtype.${x}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("taxes.calc_method")}</Label>
              <Select value={method} onValueChange={(v) => { setMethod(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("taxes.calc_method")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="percentage">{t("calc.percentage")}</SelectItem>
                  <SelectItem value="fixed">{t("calc.fixed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{t("filter.status")}</Label>
              <Select value={active} onValueChange={(v) => { setActive(v); setPage(1); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("filter.status")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filter.all")}</SelectItem>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <label className="flex items-center gap-2 text-sm self-end pb-2 cursor-pointer mt-auto">
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
                  <TableHead>{t("filter.hotel")}</TableHead>
                  <TableHead>{t("label.tax_type")}</TableHead>
                  <TableHead>{t("taxes.calc_method")}</TableHead>
                  <TableHead>{t("label.tax_value")}</TableHead>
                  <TableHead>{t("taxes.effective_date")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!list.isLoading && (list.data?.rows.length ?? 0) === 0 && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {list.data?.rows.map((x: any) => (
                  <TableRow key={x.id} className={x.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-mono text-xs">{x.code}</TableCell>
                    <TableCell className="font-medium">
                      <Link to="/taxes/$id" params={{ id: x.id }} className="hover:underline">
                        {lang === "ar" ? (x.name_ar || x.name_en) : (x.name_en || x.name_ar)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{x.hotel ? (lang === "ar" ? (x.hotel.name_ar || x.hotel.name_en) : (x.hotel.name_en || x.hotel.name_ar)) : "—"}</TableCell>
                    <TableCell><Badge variant="outline">{t(`taxtype.${x.tax_type}`)}</Badge></TableCell>
                    <TableCell className="text-xs">{t(`calc.${x.calc_method}`)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{x.calc_method === "percentage" ? `${x.value}%` : `${x.value} ${x.currency ?? ""}`}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{x.effective_date ? formatDate(x.effective_date, lang) : "—"}</TableCell>
                    <TableCell>
                      {x.deleted_at
                        ? <Badge variant="secondary">{t("status.archived")}</Badge>
                        : x.is_active ? <Badge className="bg-emerald-100 text-emerald-800 border-transparent">{t("status.active")}</Badge>
                          : <Badge variant="secondary">{t("status.inactive")}</Badge>}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title={t("actions.view")}>
                          <Link to="/taxes/$id" params={{ id: x.id }}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        {canWrite && !x.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.edit")} onClick={() => setDialog({ open: true, initial: x })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {auth.isAdmin && (x.deleted_at
                          ? <Button variant="ghost" size="icon" title={t("actions.restore")} onClick={() => setConfirm({ id: x.id, action: "restore" })}><RotateCcw className="h-4 w-4" /></Button>
                          : <Button variant="ghost" size="icon" title={t("actions.archive")} onClick={() => setConfirm({ id: x.id, action: "archive" })}><Archive className="h-4 w-4" /></Button>
                        )}
                        {auth.isAdmin && x.deleted_at && (
                          <Button variant="ghost" size="icon" title={t("actions.delete")} onClick={() => setConfirm({ id: x.id, action: "delete" })}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <TaxDialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, initial: v ? dialog.initial : undefined })}
        initial={dialog.initial} onSaved={() => qc.invalidateQueries({ queryKey: ["taxes"] })} />
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
