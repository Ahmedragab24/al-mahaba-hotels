import { useState } from "react";
import { apiClient } from "@/lib/api/api-client";
import { db } from "@/lib/api/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const OCCUPANCY_TYPES = ["SGL", "DBL", "TPL", "QUAD", "CHD", "INF"] as const;
type OccType = (typeof OCCUPANCY_TYPES)[number];

type Row = {
  id: string;
  rate_id: string;
  occupancy_type: OccType;
  cost_price: number;
  selling_price: number | null;
  markup_percent: number | null;
  currency: string | null;
  active: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function OccupancyTab({
  rateId,
  currency,
  canWrite,
}: {
  rateId: string;
  currency: string;
  canWrite: boolean;
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const blank = {
    occupancy_type: "" as string,
    cost_price: "" as any,
    markup_percent: "" as any,
    selling_price: "" as any,
    active: true,
  };
  const [form, setForm] = useState<any>(blank);

  const list = useQuery({
    queryKey: ["rate-occupancy", rateId],
    queryFn: async () => {
      const { data, error } = await db
        .from("rate_occupancy_prices")
        .select("*")
        .eq("rate_id", rateId);
      if (error) throw error;
      const rows = (data ?? []) as Row[];
      return rows.sort(
        (a, b) =>
          OCCUPANCY_TYPES.indexOf(a.occupancy_type) - OCCUPANCY_TYPES.indexOf(b.occupancy_type),
      );
    },
  });

  const used = new Set(
    (list.data ?? []).filter((r: any) => r.id !== editId).map((r: any) => r.occupancy_type),
  );

  function validate(): string | null {
    if (!form.occupancy_type) return t("occupancy.err_type_required");
    if (used.has(form.occupancy_type)) return t("occupancy.err_duplicate");
    const cost = Number(form.cost_price);
    if (form.cost_price === "" || isNaN(cost) || cost < 0) return t("occupancy.err_negative");
    if (form.selling_price !== "") {
      const sell = Number(form.selling_price);
      if (isNaN(sell) || sell < 0) return t("occupancy.err_negative");
      if (sell < cost) return t("occupancy.err_sell_below_cost");
    }
    if (form.markup_percent !== "" && Number(form.markup_percent) < 0)
      return t("occupancy.err_negative");
    return null;
  }

  const save = useMutation({
    mutationFn: async () => {
      const err = validate();
      if (err) throw new Error(err);
      const payload: any = {
        rate_id: rateId,
        occupancy_type: form.occupancy_type,
        cost_price: Number(form.cost_price),
        selling_price: form.selling_price === "" ? null : Number(form.selling_price),
        markup_percent: form.markup_percent === "" ? null : Number(form.markup_percent),
        currency: currency || null,
        active: !!form.active,
      };
      if (editId) {
        await apiClient.rateOccupancyPrices.update(editId, payload);
      } else {
        await apiClient.rateOccupancyPrices.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["rate-occupancy", rateId] });
      setOpen(false);
      setEditId(null);
      setForm(blank);
    },
    onError: (e: any) => toast.error(friendlyDbError(e.message, t)),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.rateOccupancyPrices.delete(id);
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["rate-occupancy", rateId] });
      setDelId(null);
    },
    onError: (e: any) => toast.error(e.message ?? t("toast.error")),
  });

  // Markup recalculation helpers
  function onCost(v: string) {
    const next = { ...form, cost_price: v };
    if (v !== "" && form.markup_percent !== "") {
      next.selling_price = String(round2(Number(v) * (1 + Number(form.markup_percent) / 100)));
    }
    setForm(next);
  }
  function onMarkup(v: string) {
    const next = { ...form, markup_percent: v };
    if (v !== "" && form.cost_price !== "") {
      next.selling_price = String(round2(Number(form.cost_price) * (1 + Number(v) / 100)));
    }
    setForm(next);
  }
  function onSelling(v: string) {
    const next = { ...form, selling_price: v };
    const cost = Number(form.cost_price);
    if (v !== "" && form.cost_price !== "" && cost > 0) {
      next.markup_percent = String(round2(((Number(v) - cost) / cost) * 100));
    }
    setForm(next);
  }

  const missingCore = ["SGL", "DBL"].filter(
    (o) => !(list.data ?? []).some((r: any) => r.occupancy_type === o && r.active),
  );

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {missingCore.length > 0 && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("occupancy.core_required")} ({missingCore.join(", ")})
          </p>
        )}
        {canWrite && (
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={used.size >= OCCUPANCY_TYPES.length}
              onClick={() => {
                setEditId(null);
                setForm(blank);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("actions.add")}
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap">
              <TableHead>{t("occupancy.type")}</TableHead>
              <TableHead className="text-end">{t("rates.cost")}</TableHead>
              <TableHead className="text-end">{t("rates.markup")}</TableHead>
              <TableHead className="text-end">{t("rates.selling")}</TableHead>
              <TableHead>{t("label.currency")}</TableHead>
              <TableHead>{t("label.status")}</TableHead>
              <TableHead className="text-end">{t("label.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  {t("label.loading")}
                </TableCell>
              </TableRow>
            )}
            {!list.isLoading && (list.data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  {t("label.no_results")}
                </TableCell>
              </TableRow>
            )}
            {(Array.isArray(list.data) ? list.data : Array.isArray(list.data?.data) ? list.data.data : [])?.map((r: any) => (
              <TableRow key={r.id} className="whitespace-nowrap">
                <TableCell className="font-medium">{t(`occupancy.${r.occupancy_type}`)}</TableCell>
                <TableCell className="text-end font-mono">
                  {Number(r.cost_price).toFixed(2)}
                </TableCell>
                <TableCell className="text-end font-mono">
                  {r.markup_percent != null ? Number(r.markup_percent).toFixed(2) + " %" : "—"}
                </TableCell>
                <TableCell className="text-end font-mono">
                  {r.selling_price != null ? Number(r.selling_price).toFixed(2) : "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">{r.currency ?? "—"}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${r.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {r.active ? t("occupancy.active") : t("occupancy.inactive")}
                  </span>
                </TableCell>
                <TableCell className="text-end">
                  {canWrite && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("actions.edit")}
                        onClick={() => {
                          setEditId(r.id);
                          setForm({
                            occupancy_type: r.occupancy_type,
                            cost_price: String(r.cost_price),
                            markup_percent:
                              r.markup_percent != null ? String(r.markup_percent) : "",
                            selling_price: r.selling_price != null ? String(r.selling_price) : "",
                            active: r.active,
                          });
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("actions.delete")}
                        onClick={() => setDelId(r.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditId(null);
              setForm(blank);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("rates.tab.occupancy")}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs">{t("occupancy.type")} *</label>
                <Select
                  value={form.occupancy_type}
                  onValueChange={(v) => setForm({ ...form, occupancy_type: v })}
                  disabled={!!editId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("occupancy.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPANCY_TYPES.map((o) => (
                      <SelectItem key={o} value={o} disabled={used.has(o)}>
                        {t(`occupancy.${o}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs">{t("rates.cost")} *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price}
                  onChange={(e) => onCost(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs">{t("rates.markup")}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.markup_percent}
                  onChange={(e) => onMarkup(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs">{t("rates.selling")}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.selling_price}
                  onChange={(e) => onSelling(e.target.value)}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: !!v })}
                  />
                  {t("occupancy.active")}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("actions.cancel")}
              </Button>
              <Button disabled={save.isPending} onClick={() => save.mutate()}>
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!delId}
          onOpenChange={(v) => !v && setDelId(null)}
          title={t("actions.delete")}
          description={t("toast.confirm_delete")}
          destructive
          onConfirm={() => delId && del.mutate(delId)}
        />
      </CardContent>
    </Card>
  );
}

function friendlyDbError(msg: string | undefined, t: (k: string, f?: string) => string): string {
  if (!msg) return t("toast.error");
  if (msg.includes("OCCUPANCY_SELLING_BELOW_COST")) return t("occupancy.err_sell_below_cost");
  if (
    msg.includes("rate_occupancy_prices_rate_id_occupancy_type_key") ||
    msg.includes("duplicate key")
  )
    return t("occupancy.err_duplicate");
  if (msg.includes("RATE_MISSING_OCCUPANCY")) return t("occupancy.core_required");
  return msg;
}
