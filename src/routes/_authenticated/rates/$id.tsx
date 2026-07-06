import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@/store/queryBridge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { canWriteModule, canApproveModule } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
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
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = canWriteModule(auth, "rates");
  const canApprove = canApproveModule(auth, "rates");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  const rate = useGetPriceByIdQuery({ id: id || "", lang });
  const [updatePrice] = useUpdatePriceMutation();

  const submitMut = useMutation({
    mutationFn: async () => {
      const r = rate.data;
      if (!r) return;

      const body = {
        hotel_id: Number(r.hotel_id),
        room_id: Number(r.room_id),
        hotel_view_id: r.hotel_view_id ? Number(r.hotel_view_id) : null,
        currency_id: Number(r.currency_id || r.currency),
        valid_from: r.valid_from ? r.valid_from.split('T')[0] : "",
        valid_to: r.valid_to ? r.valid_to.split('T')[0] : "",
        meal_plan_type: r.meal_plan_type || "inclusive",
        cost_per_night: Number(r.cost_per_night),
        selling_price: r.selling_price ? Number(r.selling_price) : null,
        tax_type: r.tax_type || "inclusive_tax",
        tax_rate: r.tax_rate !== undefined && r.tax_rate !== null ? Number(r.tax_rate) : 15,
        status: "valid",
        is_direct: !!r.is_direct,
        supplier_id: !r.is_direct && r.supplier_id ? Number(r.supplier_id) : null,
        is_archived: r.is_archived ? 1 : 0,
        notes_ar: r.notes_ar || null,
        notes_en: r.notes_en || null,
        cancellation_policy_ar: r.cancellation_policy_ar || null,
        cancellation_policy_en: r.cancellation_policy_en || null,
      } as any;

      if (body.meal_plan_type === "inclusive") {
        body.meal_plan_inclusive_details = r.meal_plan_inclusive_details ?? r.meal_plan_details?.map((d: any) => d.id) ?? [];
      } else {
        body.meal_plan_exclusive_prices = r.meal_plan_exclusive_prices ?? r.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.price }), {}) ?? {};
      }

      await updatePrice({ id: id || "", body, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setSubmitConfirm(false); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  const approveMut = useMutation({
    mutationFn: async () => {
      const r = rate.data;
      if (!r) return;

      const body = {
        hotel_id: Number(r.hotel_id),
        room_id: Number(r.room_id),
        hotel_view_id: r.hotel_view_id ? Number(r.hotel_view_id) : null,
        currency_id: Number(r.currency_id || r.currency),
        valid_from: r.valid_from ? r.valid_from.split('T')[0] : "",
        valid_to: r.valid_to ? r.valid_to.split('T')[0] : "",
        meal_plan_type: r.meal_plan_type || "inclusive",
        cost_per_night: Number(r.cost_per_night),
        selling_price: r.selling_price ? Number(r.selling_price) : null,
        tax_type: r.tax_type || "inclusive_tax",
        tax_rate: r.tax_rate !== undefined && r.tax_rate !== null ? Number(r.tax_rate) : 15,
        status: "valid",
        is_direct: !!r.is_direct,
        supplier_id: !r.is_direct && r.supplier_id ? Number(r.supplier_id) : null,
        is_archived: r.is_archived ? 1 : 0,
        notes_ar: r.notes_ar || null,
        notes_en: r.notes_en || null,
        cancellation_policy_ar: r.cancellation_policy_ar || null,
        cancellation_policy_en: r.cancellation_policy_en || null,
      } as any;

      if (body.meal_plan_type === "inclusive") {
        body.meal_plan_inclusive_details = r.meal_plan_inclusive_details ?? r.meal_plan_details?.map((d: any) => d.id) ?? [];
      } else {
        body.meal_plan_exclusive_prices = r.meal_plan_exclusive_prices ?? r.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.price }), {}) ?? {};
      }

      await updatePrice({ id: id || "", body, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setApproveConfirm(false); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  const rejectMut = useMutation({
    mutationFn: async (reason: string) => {
      const r = rate.data;
      if (!r) return;

      const body = {
        hotel_id: Number(r.hotel_id),
        room_id: Number(r.room_id),
        hotel_view_id: r.hotel_view_id ? Number(r.hotel_view_id) : null,
        currency_id: Number(r.currency_id || r.currency),
        valid_from: r.valid_from ? r.valid_from.split('T')[0] : "",
        valid_to: r.valid_to ? r.valid_to.split('T')[0] : "",
        meal_plan_type: r.meal_plan_type || "inclusive",
        cost_per_night: Number(r.cost_per_night),
        selling_price: r.selling_price ? Number(r.selling_price) : null,
        tax_type: r.tax_type || "inclusive_tax",
        tax_rate: r.tax_rate !== undefined && r.tax_rate !== null ? Number(r.tax_rate) : 15,
        status: "expired",
        rejection_reason: reason,
        is_direct: !!r.is_direct,
        supplier_id: !r.is_direct && r.supplier_id ? Number(r.supplier_id) : null,
        is_archived: r.is_archived ? 1 : 0,
        notes_ar: r.notes_ar || null,
        notes_en: r.notes_en || null,
        cancellation_policy_ar: r.cancellation_policy_ar || null,
        cancellation_policy_en: r.cancellation_policy_en || null,
      } as any;

      if (body.meal_plan_type === "inclusive") {
        body.meal_plan_inclusive_details = r.meal_plan_inclusive_details ?? r.meal_plan_details?.map((d: any) => d.id) ?? [];
      } else {
        body.meal_plan_exclusive_prices = r.meal_plan_exclusive_prices ?? r.meal_plan_details?.reduce((acc: any, d: any) => ({ ...acc, [d.id]: d.price }), {}) ?? {};
      }

      await updatePrice({ id: id || "", body, lang }).unwrap();
    },
    onSuccess: () => { toast.success(t("toast.saved")); qc.invalidateQueries({ queryKey: ["getPriceById"] }); setRejectOpen(false); setRejectReason(""); },
    onError: (e: any) => toast.error(e?.data?.message || e?.message || t("toast.error")),
  });

  if (rate.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!rate.data) return <div className="p-6 text-muted-foreground">{t("rates.no_rate")}</div>;

  const r = rate.data;
  const hotelName = lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar);
  const supplierName = r.supplier
    ? (lang === "ar" ? (r.supplier.name_ar || r.supplier.name_en) : (r.supplier.name_en || r.supplier.name_ar))
    : t("rates.source.direct", "Direct");
  const editable = canWrite;

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
            {r.status_text && r.status_text !== t(`status.${r.status}`) ? (
              <Badge className={r.status === "expired" || r.status_text === "منتهي" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-transparent" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-transparent"}>{r.status_text}</Badge>
            ) : (
              <StatusPill status={r.status} />
            )}
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
  const formatDays = (daysList?: string[]) => {
    if (!daysList || daysList.length === 0) return "—";
    const dayNamesAr: Record<string, string> = {
      Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت"
    };
    const dayNamesEn: Record<string, string> = {
      Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat"
    };
    return daysList.map(d => lang === "ar" ? dayNamesAr[d] || d : dayNamesEn[d] || d).join(lang === "ar" ? "، " : ", ");
  };

  const margin = r.profit_margin !== null && r.profit_margin !== undefined
    ? Number(r.profit_margin).toFixed(2) + " %"
    : r.selling_price && r.cost_per_night
      ? (((Number(r.selling_price) - Number(r.cost_per_night)) / Number(r.cost_per_night)) * 100).toFixed(2) + " %"
      : null;
  return (
    <Card><CardContent className="grid grid-cols-1 gap-x-6 p-4 md:grid-cols-3">
      <KV k={t("label.code")} v={<span className="font-mono">{r.code}</span>} />
      <KV k={t("rates.hotel")} v={lang === "ar" ? (r.hotel?.name_ar || r.hotel?.name_en) : (r.hotel?.name_en || r.hotel?.name_ar)} />
      <KV k={t("rates.supplier")} v={r.is_direct ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t("rates.is_direct_short")}</span> : (lang === "ar" ? (r.supplier?.name_ar || r.supplier?.name_en) : (r.supplier?.name_en || r.supplier?.name_ar))} />

      <KV k={t("rates.room")} v={lang === "ar" ? (r.room?.name_ar || r.room?.name_en) : (r.room?.name_en || r.room?.name_ar)} />

      <KV k={t("rates.meal_plan")} v={
        <div>
          <div>
            {r.meal_plan_type === "exclusive" && (!r.meal_plan_details || r.meal_plan_details.length === 0)
              ? (lang === "ar" ? "بدون وجبات (إقامة فقط)" : "Room Only")
              : (t(`board.${r.meal_plan_type}`) || r.meal_plan_type)}
          </div>
          {r.meal_plan_details && r.meal_plan_details.length > 0 && (
            <ul className="mt-1 space-y-1">
              {r.meal_plan_details.map((d: any) => (
                <li key={d.id} className="text-xs flex gap-2">
                  <span className="text-muted-foreground">- {d.label || t(`board.${d.key}`)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      } />

      <KV k={t("rates.taxes")} v={`${r.tax_type === "inclusive_tax" ? t("rates.tax_inclusive_yes") : t("rates.tax_inclusive_no")} (${r.tax_type === "inclusive_tax" ? r.tax_rate : 0}%)`} />

      <KV k={t("label.currency")} v={<span className="font-mono">{r.currency?.code || ""}</span>} />
      <KV k={t("rates.valid_from")} v={formatDate(r.valid_from)} />
      <KV k={t("rates.valid_to")} v={formatDate(r.valid_to)} />

      {/* Pricing Details Section */}
      <div className="md:col-span-3 border-t my-4 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
          {lang === "ar" ? "تفاصيل الأسعار" : "Pricing Details"}
        </h3>
        {r.is_weekend_weekday ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekday Card */}
            <Card className="border border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 shadow-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                    {lang === "ar" ? "وسط الأسبوع (Weekday)" : "Weekday"}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {formatDays(r.days)}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                    <div className="text-[10px] text-muted-foreground">{t("rates.cost")}</div>
                    <div className="font-mono text-sm font-semibold mt-1 text-slate-700 dark:text-slate-300">
                      {Number(r.cost_per_night || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                    <div className="text-[10px] text-muted-foreground">{t("rates.selling")}</div>
                    <div className="font-mono text-sm font-semibold mt-1 text-amber-600 dark:text-amber-500">
                      {r.selling_price ? Number(r.selling_price).toFixed(2) : "—"}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                    <div className="text-[10px] text-muted-foreground">{t("rates.taxes")}</div>
                    <div className="font-mono text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-500">
                      {r.tax_rate != null ? `${r.tax_type === "inclusive_tax" ? r.tax_rate : 0} %` : "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekend Card */}
            {r.weekend_cost_per_night !== null && r.weekend_cost_per_night !== undefined && (
              <Card className="border border-amber-200/30 dark:border-amber-900/30 bg-amber-50/5 dark:bg-amber-950/5 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-amber-100/20">
                    <span className="font-semibold text-sm text-amber-800 dark:text-amber-400">
                      {lang === "ar" ? "نهاية الأسبوع (Weekend)" : "Weekend"}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-amber-100/40 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border-transparent">
                      {formatDays(r.weekend_days)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                      <div className="text-[10px] text-muted-foreground">{t("rates.cost")}</div>
                      <div className="font-mono text-sm font-semibold mt-1 text-slate-700 dark:text-slate-300">
                        {Number(r.weekend_cost_per_night).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                      <div className="text-[10px] text-muted-foreground">{t("rates.selling")}</div>
                      <div className="font-mono text-sm font-semibold mt-1 text-amber-600 dark:text-amber-500">
                        {r.weekend_selling_price ? Number(r.weekend_selling_price).toFixed(2) : "—"}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-border/40">
                      <div className="text-[10px] text-muted-foreground">{t("rates.taxes")}</div>
                      <div className="font-mono text-sm font-semibold mt-1 text-emerald-600 dark:text-emerald-500">
                        {r.tax_rate != null ? `${r.tax_type === "inclusive_tax" ? r.tax_rate : 0} %` : "—"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/40 text-center">
              <div className="text-xs text-muted-foreground">{t("rates.cost")}</div>
              <div className="font-mono text-base font-bold mt-1 text-slate-800 dark:text-slate-200">
                {Number(r.cost_per_night || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/40 text-center">
              <div className="text-xs text-muted-foreground">{t("rates.selling")}</div>
              <div className="font-mono text-base font-bold mt-1 text-amber-600 dark:text-amber-500">
                {r.selling_price ? Number(r.selling_price).toFixed(2) : "—"}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-border/40 text-center">
              <div className="text-xs text-muted-foreground">{t("rates.taxes")}</div>
              <div className="font-mono text-base font-bold mt-1 text-emerald-600 dark:text-emerald-500">
                {r.tax_rate != null ? `${r.tax_type === "inclusive_tax" ? r.tax_rate : 0} %` : "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-3"><KV k={t("label.notes")} v={r.notes} /></div>
      <div className="md:col-span-3"><KV k={t("rates.cancellation")} v={r.cancellation_policy} /></div>
    </CardContent></Card>
  );
}

