import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Check, X, Mail, Phone, Building2, FileText, Trash2 } from "lucide-react";
import {
  useGetSupplierRequestsQuery,
  useUpdateSupplierRequestStatusMutation,
  useDeleteSupplierRequestMutation,
} from "@/store/services/supplier-requests/supplierRequestsService";
import { toast } from "sonner";

type App = {
  id: string;
  company_name_ar: string;
  company_name_en: string;
  supplier_type_id: number;
  tax_number: string;
  commercial_register: string;
  country_id: number;
  city_id: number;
  address: string;
  website: string;
  contact_name: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  submitted_at: string;
  rejection_reason: string | null;
  country_name?: string;
  city_name?: string;
  supplier_type_name?: string;
};

export default function SupplierApplicationsPage() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"all" | "pending" | "accepted" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<App | null>(null);
  const [rejecting, setRejecting] = useState<App | null>(null);
  const [reason, setReason] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: appsArray, isLoading } = useGetSupplierRequestsQuery({
    lang,
    search: search || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupplierRequestStatusMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteSupplierRequestMutation();

  const handleApprove = async (id: string) => {
    try {
      await updateStatus({ id, body: { status: "accepted" } }).unwrap();
      setSelected(null);
      toast.success(t("supplier.applications.approved"));
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || String(err));
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    try {
      await updateStatus({ id: rejecting.id, body: { status: "rejected", rejection_reason: reason } }).unwrap();
      setRejecting(null);
      setReason("");
      toast.success(t("supplier.applications.rejected"));
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || String(err));
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const allRows: App[] = useMemo(() => {
    const arr = Array.isArray(appsArray)
      ? appsArray
      : (Array.isArray((appsArray as any)?.data) ? (appsArray as any).data : []);
    return arr.map((a: any) => ({
      id: a.id,
      company_name_ar: a.company_name_ar || a.name_ar || "",
      company_name_en: a.company_name_en || a.name_en || "",
      supplier_type_id: a.supplier_type_id || 1,
      tax_number: a.tax_number || "",
      commercial_register: a.commercial_register || "",
      country_id: a.country_id || 0,
      city_id: a.city_id || 0,
      address: a.address || "",
      website: a.website || "",
      contact_name: a.contact_name || "",
      contact_position: a.contact_position || "",
      contact_email: a.contact_email || "",
      contact_phone: a.contact_phone || "",
      status: a.status || "pending",
      submitted_at: a.created_at || new Date().toISOString(),
      rejection_reason: a.rejection_reason || null,
      country_name: lang === "ar" ? (a.country?.name_ar || a.country?.name || "") : (a.country?.name_en || a.country?.name || ""),
      city_name: lang === "ar" ? (a.city?.name_ar || a.city?.name || "") : (a.city?.name_en || a.city?.name || ""),
      supplier_type_name: lang === "ar" ? (a.supplier_type?.name_ar || a.supplier_type?.name || "") : (a.supplier_type?.name_en || a.supplier_type?.name || ""),
    }));
  }, [appsArray, lang]);

  const filteredRows = tab === "all"
    ? allRows
    : allRows.filter((r) => {
      if (tab === "pending") return r.status === "pending" || r.status === "under_review";
      if (tab === "accepted") return r.status === "accepted";
      if (tab === "rejected") return r.status === "rejected";
      return true;
    });

  const counts = {
    pending: allRows.filter((r) => r.status === "pending" || r.status === "under_review").length,
    accepted: allRows.filter((r) => r.status === "accepted").length,
    rejected: allRows.filter((r) => r.status === "rejected").length,
    all: allRows.length,
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title={t("supplier.applications.title")} subtitle={t("supplier.applications.subtitle")} children={
        <Input placeholder={t("actions.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
      } />



      <Tabs value={tab} onValueChange={(value) => setTab(value as "all" | "pending" | "accepted" | "rejected")} dir={lang === "ar" ? "rtl" : "ltr"}>
        <TabsList dir={lang === "ar" ? "rtl" : "ltr"}>
          <TabsTrigger value="all">{t("supplier.applications.tab_all")} ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">{t("supplier.applications.tab_pending")} ({counts.pending})</TabsTrigger>
          <TabsTrigger value="accepted">{t("supplier.applications.tab_approved")} ({counts.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">{t("supplier.applications.tab_rejected")} ({counts.rejected})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredRows.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">{t("supplier.applications.empty")}</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filteredRows.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(app)}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{lang === "ar" ? app.company_name_ar : app.company_name_en}</h3>
                        <Badge variant="outline">{app.supplier_type_name || app.supplier_type_id}</Badge>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{app.contact_email}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{app.contact_phone}</span>
                        <span>{new Date(app.submitted_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {(app.status === "pending" || app.status === "under_review") && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(app.id)} disabled={isUpdating || isDeleting}>
                            <Check className="h-4 w-4 me-1" />{t("actions.approve")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRejecting(app)} disabled={isUpdating || isDeleting}>
                            <X className="h-4 w-4 me-1" />{t("actions.reject")}
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(app.id)} disabled={isUpdating || isDeleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{lang === "ar" ? selected.company_name_ar : selected.company_name_en}</DialogTitle>
                <DialogDescription>{selected.supplier_type_name || selected.supplier_type_id} · <StatusBadge status={selected.status} /></DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Field icon={<Building2 className="h-4 w-4" />} label={t("label.name_en")} value={selected.company_name_en} />
                <Field icon={<Building2 className="h-4 w-4" />} label={t("label.name_ar")} value={selected.company_name_ar} />
                {selected.tax_number && <Field icon={<FileText className="h-4 w-4" />} label={t("label.tax_number")} value={selected.tax_number} />}
                {selected.commercial_register && <Field icon={<FileText className="h-4 w-4" />} label={t("label.cr")} value={selected.commercial_register} />}
                {selected.country_name && <Field icon={<Building2 className="h-4 w-4" />} label={t("label.country")} value={selected.country_name} />}
                {selected.city_name && <Field icon={<Building2 className="h-4 w-4" />} label={t("label.city")} value={selected.city_name} />}
                {selected.address && <Field icon={<FileText className="h-4 w-4" />} label={t("label.address")} value={selected.address} />}
                {selected.website && <Field icon={<FileText className="h-4 w-4" />} label={t("label.website")} value={selected.website} />}
                <Field icon={<Mail className="h-4 w-4" />} label={t("supplier.apply.contact_name")} value={selected.contact_name} />
                {selected.contact_position && <Field icon={<Mail className="h-4 w-4" />} label={t("supplier.apply.contact_position")} value={selected.contact_position} />}
                <Field icon={<Mail className="h-4 w-4" />} label={t("label.email")} value={selected.contact_email} />
                <Field icon={<Phone className="h-4 w-4" />} label={t("label.phone")} value={selected.contact_phone} />
                {selected.rejection_reason && (
                  <Field icon={<FileText className="h-4 w-4 text-destructive" />} label={t("supplier.applications.rejection_reason")} value={selected.rejection_reason} />
                )}
              </div>
              <DialogFooter className="flex flex-row justify-between items-center gap-2">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)} disabled={isUpdating || isDeleting}>
                  <Trash2 className="h-4 w-4 me-1" />{t("actions.delete") || (lang === "ar" ? "حذف" : "Delete")}
                </Button>
                {(selected.status === "pending" || selected.status === "under_review") && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setRejecting(selected); setSelected(null); }}>
                      <X className="h-4 w-4 me-1" />{t("actions.reject")}
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(selected.id)} disabled={isUpdating || isDeleting}>
                      {isUpdating ? <Loader2 className="h-4 w-4 me-1 animate-spin" /> : <Check className="h-4 w-4 me-1" />}
                      {t("actions.approve")}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("supplier.applications.reject_title")}</DialogTitle>
            <DialogDescription>{t("supplier.applications.reject_desc")}</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder={t("supplier.applications.reason_placeholder")} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(null)}>{t("actions.cancel")}</Button>
            <Button variant="destructive" onClick={() => handleReject()} disabled={!reason.trim() || isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
              {t("actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "هل أنت متأكد من حذف هذا الطلب؟" : "Are you sure you want to delete this request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? "لا يمكن التراجع عن هذا الإجراء بعد إتمامه."
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2">
            <AlertDialogCancel disabled={isDeleting}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (deletingId) {
                  try {
                    await deleteRequest(deletingId).unwrap();
                    setDeletingId(null);
                    setSelected(null);
                    toast.success(lang === "ar" ? "تم حذف الطلب بنجاح" : "Request deleted successfully");
                  } catch (err: any) {
                    toast.error(err?.data?.message || err?.message || String(err));
                  }
                }
              }}
            >
              {isDeleting && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
              {lang === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const variant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary", under_review: "secondary", approved: "default", rejected: "destructive", accepted: "default",
  };
  const translationKey = `supplier.applications.status_${status}`;
  const label = t(translationKey);
  return <Badge variant={variant[status] ?? "outline"}>{label === translationKey ? status : label}</Badge>;
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1"><div className="text-xs text-muted-foreground">{label}</div><div>{value}</div></div>
    </div>
  );
}

export { SupplierApplicationsPage as Component };
