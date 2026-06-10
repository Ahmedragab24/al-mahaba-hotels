import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Check, X, Copy, Mail, Phone, Building2, FileText } from "lucide-react";
import {
  listSupplierApplications,
  approveSupplierApplication,
  rejectSupplierApplication,
} from "@/lib/supplier-applications.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/supplier-applications")({
  ssr: false,
  component: SupplierApplicationsPage,
});

type App = {
  id: string; name_ar: string; name_en: string; supplier_type: string;
  contact_name: string; contact_email: string; contact_phone: string;
  country_code: string | null; status: string; submitted_at: string;
  rejection_reason: string | null;
};

function SupplierApplicationsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<App | null>(null);
  const [rejecting, setRejecting] = useState<App | null>(null);
  const [reason, setReason] = useState("");
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-applications"],
    queryFn: () => listSupplierApplications(),
  });

  const approve = useMutation({
    mutationFn: (id: string) => approveSupplierApplication({ data: { id } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["supplier-applications"] });
      setSelected(null);
      setCredentials({ email: res.email, password: res.password });
      toast.success(t("supplier.applications.approved"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  const reject = useMutation({
    mutationFn: () => rejectSupplierApplication({ data: { id: rejecting!.id, reason } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-applications"] });
      setRejecting(null); setReason("");
      toast.success(t("supplier.applications.rejected"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : String(e)),
  });

  const rows = (data?.rows ?? []) as App[];
  const filtered = rows.filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return r.name_ar.toLowerCase().includes(s) || r.name_en.toLowerCase().includes(s)
      || r.contact_email.toLowerCase().includes(s) || r.contact_name.toLowerCase().includes(s);
  });

  const counts = {
    pending: rows.filter((r) => r.status === "pending" || r.status === "under_review").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader title={t("supplier.applications.title")} subtitle={t("supplier.applications.subtitle")} />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Input placeholder={t("actions.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">{t("supplier.applications.tab_pending")} ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">{t("supplier.applications.tab_approved")} ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">{t("supplier.applications.tab_rejected")} ({counts.rejected})</TabsTrigger>
          <TabsTrigger value="all">{t("supplier.applications.tab_all")} ({counts.all})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">{t("supplier.applications.empty")}</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filtered.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(app)}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{lang === "ar" ? app.name_ar : app.name_en}</h3>
                        <Badge variant="outline">{t(`supplier.type.${app.supplier_type}`)}</Badge>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{app.contact_email}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{app.contact_phone}</span>
                        <span>{new Date(app.submitted_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</span>
                      </div>
                    </div>
                    {(app.status === "pending" || app.status === "under_review") && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" onClick={() => approve.mutate(app.id)} disabled={approve.isPending}>
                          <Check className="h-4 w-4 me-1" />{t("actions.approve")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejecting(app)}>
                          <X className="h-4 w-4 me-1" />{t("actions.reject")}
                        </Button>
                      </div>
                    )}
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
                <DialogTitle>{lang === "ar" ? selected.name_ar : selected.name_en}</DialogTitle>
                <DialogDescription>{t(`supplier.type.${selected.supplier_type}`)} · <StatusBadge status={selected.status} /></DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Field icon={<Building2 className="h-4 w-4" />} label={t("label.name_en")} value={selected.name_en} />
                <Field icon={<Building2 className="h-4 w-4" />} label={t("label.name_ar")} value={selected.name_ar} />
                <Field icon={<Mail className="h-4 w-4" />} label={t("supplier.apply.contact_name")} value={selected.contact_name} />
                <Field icon={<Mail className="h-4 w-4" />} label={t("label.email")} value={selected.contact_email} />
                <Field icon={<Phone className="h-4 w-4" />} label={t("label.phone")} value={selected.contact_phone} />
                {selected.rejection_reason && (
                  <Field icon={<FileText className="h-4 w-4 text-destructive" />} label={t("supplier.applications.rejection_reason")} value={selected.rejection_reason} />
                )}
              </div>
              {(selected.status === "pending" || selected.status === "under_review") && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setRejecting(selected); setSelected(null); }}>
                    <X className="h-4 w-4 me-1" />{t("actions.reject")}
                  </Button>
                  <Button onClick={() => approve.mutate(selected.id)} disabled={approve.isPending}>
                    {approve.isPending ? <Loader2 className="h-4 w-4 me-1 animate-spin" /> : <Check className="h-4 w-4 me-1" />}
                    {t("actions.approve")}
                  </Button>
                </DialogFooter>
              )}
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
            <Button variant="destructive" onClick={() => reject.mutate()} disabled={!reason.trim() || reject.isPending}>
              {reject.isPending && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
              {t("actions.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials dialog */}
      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("supplier.applications.creds_title")}</DialogTitle>
            <DialogDescription>{t("supplier.applications.creds_desc")}</DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-3">
              <CredRow label={t("label.email")} value={credentials.email} />
              <CredRow label={t("auth.password")} value={credentials.password} />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>{t("actions.close") || "OK"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const variant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary", under_review: "secondary", approved: "default", rejected: "destructive",
  };
  return <Badge variant={variant[status] ?? "outline"}>{t(`supplier.applications.status_${status}`)}</Badge>;
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1"><div className="text-xs text-muted-foreground">{label}</div><div>{value}</div></div>
    </div>
  );
}

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-sm truncate">{value}</div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
}
