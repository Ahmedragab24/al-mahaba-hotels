import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/status-pill";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Send, Check, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { useGetPriceByIdQuery, useUpdatePriceMutation } from "@/store/services/pricing/pricingService";

export default function RateDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const search = Object.fromEntries(searchParams.entries()) as any;
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole(["super_admin", "admin", "operations_manager", "operations_agent"]);
  const canApprove = auth.hasAnyRole(["super_admin", "admin", "operations_manager"]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const rate = useGetPriceByIdQuery({ id: id || "", lang });
  const [updatePrice] = useUpdatePriceMutation();

  const submitMut = useMutation({
    mutationFn: async () => {
      await updatePrice({ id: id || "", body: { status: "pending" }, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setSubmitConfirm(false); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  const approveMut = useMutation({
    mutationFn: async () => {
      await updatePrice({ id: id || "", body: { status: "approved" }, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setApproveConfirm(false); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  const rejectMut = useMutation({
    mutationFn: async (reason: string) => {
      await updatePrice({ id: id || "", body: { status: "rejected" }, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setRejectOpen(false); setRejectReason(""); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  if (rate.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!rate.data) return <div className="p-6 text-muted-foreground">{t("rates.no_rate")}</div>;

  const r = rate.data;
  const hotelName = lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar);
  const supplierName = lang === "ar" ? (r.supplier?.name_ar || r.supplier?.name_en) : (r.supplier?.name_en || r.supplier?.name_ar);
  const editable = canWrite && !r.is_archived;

  return (
    <>
      <PageHeader
        title={`${r.code} — ${hotelName}`}
        subtitle={`${supplierName} · ${formatDate(r.valid_from)} → ${formatDate(r.valid_to)}`}
        children={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/rates")}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <StatusPill status={r.status} />
            {editable && (
              <Button size="sm" variant="outline" asChild>
                <Link to={`/rates/new?edit=${id}`}>
                  <Pencil className="h-4 w-4" />{t("actions.edit")}
                </Link>
              </Button>
            )}
            {canWrite && r.status === "draft" && !r.is_archived && (
              <Button size="sm" onClick={() => setSubmitConfirm(true)}>
                <Send className="h-4 w-4" />{t("actions.submit_approval")}
              </Button>
            )}
            {canApprove && r.status === "pending" && (
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
        <ProfileView r={r} lang={lang} t={t} />
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
      <KV k={t("rates.room_type")} v={lang === "ar" ? (r.room?.name_ar || r.room?.name_en) : (r.room?.name_en || r.room?.name_ar)} />
      <KV k={t("rates.view")} v={r.hotel_view ? (lang === "ar" ? (r.hotel_view.name_ar || r.hotel_view.name_en) : (r.hotel_view.name_en || r.hotel_view.name_ar)) : null} />
      <KV k={t("rates.meal_plan")} v={r.meal_plan_type} />
      <KV k={t("label.currency")} v={<span className="font-mono">{r.currency?.code || ""}</span>} />
      <KV k={t("rates.valid_from")} v={formatDate(r.valid_from)} />
      <KV k={t("rates.valid_to")} v={formatDate(r.valid_to)} />
      <KV k={t("rates.cost")} v={<span className="font-mono">{Number(r.cost_per_night).toFixed(2)}</span>} />
      <KV k={t("rates.selling")} v={r.selling_price ? <span className="font-mono">{Number(r.selling_price).toFixed(2)}</span> : null} />
      <KV k={t("rates.margin")} v={margin} />
      <div className="md:col-span-3"><KV k={t("label.notes")} v={r.notes} /></div>
      <div className="md:col-span-3"><KV k={t("rates.cancellation")} v={r.cancellation_policy} /></div>
    </CardContent></Card>
  );
}

