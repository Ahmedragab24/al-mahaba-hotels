import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useCurrencies } from "@/lib/lookups";
import { dbErrorMessage } from "@/lib/db-errors";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ENTITY_TYPES = ["payment_order", "supplier_payment", "invoice", "rate"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];

type Threshold = {
  id: string;
  entity_type: EntityType;
  currency: string;
  amount: number;
  requires_second_approver: boolean;
  notes: string | null;
  is_active: boolean;
};

export const Route = createFileRoute("/_authenticated/approval-thresholds")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: ok } = await supabase.rpc("has_any_role", {
      _user_id: data.user.id,
      _roles: ["super_admin", "admin", "finance_manager"],
    });
    if (!ok) throw redirect({ to: "/" });
  },
  component: ApprovalThresholdsPage,
});

function ApprovalThresholdsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const currencies = useCurrencies();
  const [dialog, setDialog] = useState<{ open: boolean; initial?: Partial<Threshold> }>({ open: false });
  const [confirm, setConfirm] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["approval_thresholds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_thresholds")
        .select("*")
        .order("entity_type")
        .order("currency");
      if (error) throw error;
      return (data ?? []) as Threshold[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("approval_thresholds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.deleted"));
      qc.invalidateQueries({ queryKey: ["approval_thresholds"] });
      setConfirm(null);
    },
    onError: (e: any) => { toast.error(dbErrorMessage(e, t)); setConfirm(null); },
  });

  return (
    <>
      <PageHeader
        title={t("thresholds.title")}
        subtitle={t("thresholds.subtitle")}
        actions={
          <Button size="sm" onClick={() => setDialog({ open: true })}>
            <Plus className="h-4 w-4" /> {t("actions.new")}
          </Button>
        }
      />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("thresholds.entity_type")}</TableHead>
                  <TableHead>{t("label.currency")}</TableHead>
                  <TableHead className="text-end">{t("thresholds.amount")}</TableHead>
                  <TableHead>{t("thresholds.requires_second")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  <TableHead className="text-end">{t("label.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.isLoading && (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                )}
                {!list.isLoading && (list.data?.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                )}
                {list.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Badge variant="outline">{t(`thresholds.entity.${row.entity_type}`)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.currency}</TableCell>
                    <TableCell className="text-end font-mono">{Number(row.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      {row.requires_second_approver
                        ? <Badge className="bg-amber-100 text-amber-900 border-transparent">{t("label.yes")}</Badge>
                        : <Badge variant="secondary">{t("label.no")}</Badge>}
                    </TableCell>
                    <TableCell>
                      {row.is_active
                        ? <Badge className="bg-emerald-100 text-emerald-800 border-transparent">{t("status.active")}</Badge>
                        : <Badge variant="secondary">{t("status.inactive")}</Badge>}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setDialog({ open: true, initial: row })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirm(row.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ThresholdDialog
        open={dialog.open}
        initial={dialog.initial}
        currencies={currencies.data ?? []}
        onOpenChange={(v) => setDialog({ open: v, initial: v ? dialog.initial : undefined })}
        onSaved={() => qc.invalidateQueries({ queryKey: ["approval_thresholds"] })}
      />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={t("actions.delete")}
        description={t("toast.confirm_delete")}
        destructive
        onConfirm={() => confirm && del.mutate(confirm)}
      />
    </>
  );
}

function ThresholdDialog({
  open, onOpenChange, initial, currencies, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Threshold>;
  currencies: { code: string }[];
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<Partial<Threshold>>({});

  // Reset when opening
  useState(() => {});
  if (open && form === (undefined as any)) setForm(initial ?? {});

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        entity_type: form.entity_type,
        currency: form.currency,
        amount: Number(form.amount ?? 0),
        requires_second_approver: form.requires_second_approver ?? true,
        notes: form.notes ?? null,
        is_active: form.is_active ?? true,
      };
      if (!payload.entity_type || !payload.currency) throw new Error(t("label.required"));
      if (isEdit) {
        const { error } = await supabase.from("approval_thresholds").update(payload).eq("id", initial!.id!);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("approval_thresholds").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      onSaved();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(dbErrorMessage(e, t)),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) setForm(initial ?? {}); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("actions.edit") : t("actions.new")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>{t("thresholds.entity_type")}</Label>
            <Select value={form.entity_type ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, entity_type: v as EntityType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((e) => (
                  <SelectItem key={e} value={e}>{t(`thresholds.entity.${e}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>{t("label.currency")}</Label>
              <Select value={form.currency ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("thresholds.amount")}</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.amount ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="text-sm">{t("thresholds.requires_second")}</Label>
            <Switch
              checked={form.requires_second_approver ?? true}
              onCheckedChange={(v) => setForm((f) => ({ ...f, requires_second_approver: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="text-sm">{t("status.active")}</Label>
            <Switch
              checked={form.is_active ?? true}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("label.notes")}</Label>
            <Textarea
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
