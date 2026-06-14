import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { MODULES } from "@/lib/modules";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/users")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: UsersPage,
});

function UsersPage() {
  const { t, lang } = useI18n();
  const auth = useAuth();
  const [permUser, setPermUser] = useState<any | null>(null);
  const q = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const rolesMap = new Map<string, string[]>();
      (roles ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesMap.set(r.user_id, arr);
      });
      const allowedRoles = ["super_admin", "sales_manager", "finance_manager", "viewer"];
      return (profiles ?? [])
        .map((p: any) => ({ ...p, roles: rolesMap.get(p.id) ?? [] }))
        .filter((u: any) => u.roles.some((r: string) => allowedRoles.includes(r)));
    },
  });
  const isSuperAdmin = auth.hasRole("super_admin");

  return (
    <>
      <PageHeader title={t("users.title")} />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("label.email")}</TableHead>
                  <TableHead>{t("label.role")}</TableHead>
                  <TableHead>{t("users.last_login")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  {isSuperAdmin && <TableHead className="text-end">{t("perm.manage")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
                )}
                {!q.isLoading && (q.data?.length ?? 0) === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>
                )}
                {q.data?.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{lang === "ar" ? (u.full_name_ar || u.full_name_en) : (u.full_name_en || u.full_name_ar)}</TableCell>
                    <TableCell dir="ltr">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r: string) => <Badge key={r} variant="secondary">{t(`role.${r}`)}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(u.last_login_at, lang)}</TableCell>
                    <TableCell>
                      {u.locked_until && new Date(u.locked_until) > new Date()
                        ? <Badge className="bg-rose-100 text-rose-800 border-transparent">{t("users.locked")}</Badge>
                        : u.is_active
                          ? <Badge className="bg-emerald-100 text-emerald-800 border-transparent">{t("status.active")}</Badge>
                          : <Badge variant="secondary">{t("status.inactive")}</Badge>}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-end">
                        <Button variant="outline" size="sm" disabled={u.roles.includes("super_admin")} onClick={() => setPermUser(u)}>
                          <ShieldOff className="h-4 w-4" /> {t("perm.manage")}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {isSuperAdmin && <PermissionsDialog user={permUser} onClose={() => setPermUser(null)} />}
      </div>
    </>
  );
}

function PermissionsDialog({ user, onClose }: { user: any | null; onClose: () => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const blocks = useQuery({
    queryKey: ["module-blocks", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("user_module_blocks").select("id,module_key").eq("user_id", user.id)).data ?? [],
  });
  const toggle = useMutation({
    mutationFn: async ({ key, blocked }: { key: string; blocked: boolean }) => {
      if (blocked) {
        const row: any = blocks.data?.find((b: any) => b.module_key === key);
        const { error } = await supabase.from("user_module_blocks").delete().eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_module_blocks").insert({ user_id: user.id, module_key: key });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["module-blocks", user?.id] }); toast.success(t("toast.saved")); },
    onError: (e: any) => toast.error(e.message),
  });
  const name = user ? ((lang === "ar" ? user.full_name_ar : user.full_name_en) || user.email) : "";
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("perm.manage")} — {name}</DialogTitle>
          <DialogDescription>{t("perm.dialog_desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1">
          {MODULES.map((m) => {
            const blocked = !!blocks.data?.some((b: any) => b.module_key === m.key);
            return (
              <div key={m.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="text-sm font-medium">{t(m.labelKey)}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${blocked ? "text-destructive" : "text-muted-foreground"}`}>
                    {blocked ? t("perm.hidden") : t("perm.visible")}
                  </span>
                  <Switch
                    checked={!blocked}
                    disabled={blocks.isLoading || toggle.isPending}
                    onCheckedChange={() => toggle.mutate({ key: m.key, blocked })}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{t("perm.super_admin_note")}</p>
      </DialogContent>
    </Dialog>
  );
}
