import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Send, Check, Undo2, LogIn, LogOut, Ban, UserX } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { dbErrorMessage } from "@/lib/db-errors";
import { BookingForm } from "./-form";
import { RoomsTab, useBookingRooms } from "./-rooms";
import { GuestsTab } from "./-guests";
import { EntityAttachments } from "@/components/entity-attachments";
import { EntityHistory } from "@/components/entity-history";
import { BkStatusBadge, BK_WRITE_ROLES } from "./index";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canWrite = auth.hasAnyRole([...BK_WRITE_ROLES]);
  const canManage = auth.hasAnyRole(["super_admin", "admin", "sales_manager", "operations_manager"]);
  const [editing, setEditing] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState<"cancelled" | "no_show" | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const b = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, customer:customers(name_en,name_ar,customer_type,email,phone), quotation:quotations(quotation_no)")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const rooms = useBookingRooms(id);

  const history = useQuery({
    queryKey: ["booking-status-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status_history")
        .select("*")
        .eq("booking_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusMut = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      const patch: any = { status };
      if (reason !== undefined) patch.cancellation_reason = reason;
      const { error } = await supabase.from("bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      setConfirmStatus(null); setCancelOpen(null); setCancelReason("");
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["booking-status-history", id] });
      qc.invalidateQueries({ queryKey: ["bookings-metrics"] });
      qc.invalidateQueries({ queryKey: ["entity-history", "bookings", id] });
    },
    onError: (e: any) => { setConfirmStatus(null); toast.error(dbErrorMessage(e, t)); },
  });

  if (b.isLoading) return <div className="p-6 text-muted-foreground">{t("label.loading")}</div>;
  if (!b.data) return <div className="p-6 text-muted-foreground">{t("bk.no_found")}</div>;

  const r = b.data;
  const customerName = lang === "ar" ? (r.customer?.name_ar || r.customer?.name_en) : (r.customer?.name_en || r.customer?.name_ar);
  const editableHeader = canWrite && r.status === "draft" && !r.deleted_at;
  const editableRooms = canWrite && r.status === "draft" && !r.deleted_at;
  const confirmableRooms = canWrite && ["draft", "pending_confirmation"].includes(r.status) && !r.deleted_at;
  const editableGuests = canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status) && !r.deleted_at;

  const actions: { key: string; label: string; status: string; icon: React.ComponentType<{ className?: string }>; variant?: "destructive" | "outline"; show: boolean; needsReason?: boolean }[] = [
    { key: "submit", label: t("bk.submit"), status: "pending_confirmation", icon: Send, show: canWrite && r.status === "draft" },
    { key: "return", label: t("bk.return_draft"), status: "draft", icon: Undo2, variant: "outline", show: canWrite && r.status === "pending_confirmation" },
    { key: "confirm", label: t("bk.confirm"), status: "confirmed", icon: Check, show: canManage && r.status === "pending_confirmation" },
    { key: "check_in", label: t("bk.check_in"), status: "checked_in", icon: LogIn, show: canWrite && r.status === "confirmed" },
    { key: "check_out", label: t("bk.check_out"), status: "checked_out", icon: LogOut, show: canWrite && r.status === "checked_in" },
    { key: "no_show", label: t("bk.no_show_action"), status: "no_show", icon: UserX, variant: "destructive", show: canManage && r.status === "confirmed", needsReason: true },
    { key: "cancel", label: t("bk.cancel"), status: "cancelled", icon: Ban, variant: "destructive", show: canWrite && ["draft", "pending_confirmation", "confirmed"].includes(r.status), needsReason: true },
  ];

  return (
    <>
      <PageHeader
        title={`${r.booking_no} — ${customerName ?? ""}`}
        subtitle={`${formatDate(r.booking_date)} · ${r.currency}${r.quotation ? ` · ${t("bk.source_quotation")}: ${r.quotation.quotation_no}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/bookings" })}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("actions.back")}
            </Button>
            <BkStatusBadge status={r.status} t={t} />
            {editableHeader && !editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />{t("actions.edit")}
              </Button>
            )}
            {actions.filter((a) => a.show).map((a) => (
              <Button key={a.key} size="sm" variant={(a.variant as any) ?? "default"}
                onClick={() => a.needsReason ? setCancelOpen(a.status as any) : setConfirmStatus(a.status)}>
                <a.icon className="h-4 w-4" />{a.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="general">{t("bk.tab.general")}</TabsTrigger>
            <TabsTrigger value="rooms">{t("bk.tab.rooms")}</TabsTrigger>
            <TabsTrigger value="guests">{t("bk.tab.guests")}</TabsTrigger>
            <TabsTrigger value="attachments">{t("tab.attachments")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("bk.tab.timeline")}</TabsTrigger>
            <TabsTrigger value="history">{t("bk.tab.history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {editing ? (
              <BookingForm initial={r} onSaved={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["booking", id] }); }} />
            ) : (
              <Card>
                <CardContent className="grid gap-x-8 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <KV k={t("bk.number")} v={<span dir="ltr">{r.booking_no}</span>} />
                  <KV k={t("bk.customer")} v={`${customerName ?? "—"} — ${t(`ctype.${r.customer?.customer_type}`, r.customer?.customer_type ?? "")}`} />
                  <KV k={t("filter.status")} v={<BkStatusBadge status={r.status} t={t} />} />
                  <KV k={t("label.currency")} v={r.currency} />
                  <KV k={t("bk.booking_date")} v={formatDate(r.booking_date)} />
                  <KV k={t("bk.source")} v={r.quotation_id
                    ? <Link to="/quotations/$id" params={{ id: r.quotation_id }} className="text-primary hover:underline">{t("bk.source_quotation")} — {r.quotation?.quotation_no}</Link>
                    : t("bk.source_direct")} />
                  <KV k={t("bk.special_requests")} v={r.special_requests ?? "—"} />
                  <KV k={t("label.notes")} v={r.notes ?? "—"} />
                  {r.cancellation_reason && <KV k={t("bk.cancel_reason")} v={r.cancellation_reason} />}
                  {r.confirmed_at && <KV k={t("bk.confirm")} v={formatDateTime(r.confirmed_at, lang)} />}
                  {r.checked_in_at && <KV k={t("bk.check_in")} v={formatDateTime(r.checked_in_at, lang)} />}
                  {r.checked_out_at && <KV k={t("bk.check_out")} v={formatDateTime(r.checked_out_at, lang)} />}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rooms">
            <RoomsTab bookingId={id} currency={r.currency} editable={editableRooms} confirmable={confirmableRooms} />
          </TabsContent>

          <TabsContent value="guests">
            <GuestsTab bookingId={id} editable={editableGuests} />
          </TabsContent>

          <TabsContent value="attachments"><EntityAttachments entityType="booking" entityId={id} /></TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("bk.history.from")}</TableHead>
                      <TableHead>{t("bk.history.to")}</TableHead>
                      <TableHead>{t("history.time")}</TableHead>
                      <TableHead>{t("label.notes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(history.data?.length ?? 0) === 0 && (
                      <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{t("bk.history.empty")}</TableCell></TableRow>
                    )}
                    {history.data?.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.from_status ? <Badge variant="outline">{t(`bkstatus.${h.from_status}`)}</Badge> : "—"}</TableCell>
                        <TableCell><BkStatusBadge status={h.to_status} t={t} /></TableCell>
                        <TableCell dir="ltr" className="text-xs whitespace-nowrap">{formatDateTime(h.created_at, lang)}</TableCell>
                        <TableCell className="text-xs">{h.reason ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history"><EntityHistory entityType="bookings" entityId={id} /></TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(v) => !v && setConfirmStatus(null)}
        title={t("bk.confirm_status")}
        description={confirmStatus ? t(`bkstatus.${confirmStatus}`) : ""}
        onConfirm={() => confirmStatus && statusMut.mutate({ status: confirmStatus })}
      />

      <Dialog open={!!cancelOpen} onOpenChange={(v) => { if (!v) { setCancelOpen(null); setCancelReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <label className="text-sm">{t("bk.cancel_reason")} *</label>
            <Textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="destructive" disabled={!cancelReason.trim() || statusMut.isPending}
              onClick={() => cancelOpen && statusMut.mutate({ status: cancelOpen, reason: cancelReason.trim() })}>
              {cancelOpen === "no_show" ? t("bk.no_show_action") : t("bk.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm font-medium">{v ?? "—"}</span>
    </div>
  );
}
