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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldOff, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { MODULES } from "@/lib/modules";
import { formatDateTime } from "@/lib/format";
import { createStaffUser } from "@/lib/users.functions";

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
  const { t, lang, dir } = useI18n();
  const auth = useAuth();
  const qc = useQueryClient();
  const [permUser, setPermUser] = useState<any | null>(null);

  // Add Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState({
    full_name_ar: "",
    full_name_en: "",
    email: "",
    password: "",
    role: "sales_agent",
  });

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
      // Allow all system/staff roles to show up in the table
      const allowedRoles = [
        "super_admin",
        "admin",
        "sales_manager",
        "sales_agent",
        "operations_manager",
        "operations_agent",
        "finance_manager",
        "finance_agent",
        "viewer"
      ];
      return (profiles ?? [])
        .map((p: any) => ({ ...p, roles: rolesMap.get(p.id) ?? [] }))
        .filter((u: any) => u.roles.some((r: string) => allowedRoles.includes(r)));
    },
  });

  const createMutation = useMutation({
    mutationFn: (variables: any) => createStaffUser({ data: variables }),
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم إضافة الموظف بنجاح" : "Staff added successfully");
      setAddDialogOpen(false);
      setNewUser({
        full_name_ar: "",
        full_name_en: "",
        email: "",
        password: "",
        role: "sales_agent",
      });
      setVisibleModules({});
      qc.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  const isSuperAdmin = auth.hasRole("super_admin");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compute blocked modules (any module that is NOT visible in the visibleModules map)
    const blocked_modules = MODULES
      .filter((m) => !visibleModules[m.key])
      .map((m) => m.key);

    createMutation.mutate({
      ...newUser,
      blocked_modules,
    });
  };

  const handleOpenAddDialog = () => {
    const initialVisible: Record<string, boolean> = {};
    MODULES.forEach((m) => {
      initialVisible[m.key] = true;
    });
    setVisibleModules(initialVisible);
    setNewUser({
      full_name_ar: "",
      full_name_en: "",
      email: "",
      password: "",
      role: "sales_agent",
    });
    setAddDialogOpen(true);
  };

  return (
    <>
      <PageHeader title={t("users.title")} />

      <div className="p-6 space-y-4" dir={dir}>

        {/* Top bar for adding staff */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "قائمة الموظفين وإدارة الصلاحيات" : "Staff and Permissions Management"}
          </h2>
          <Button
            onClick={handleOpenAddDialog}
            className="bg-[#a8702c] hover:bg-[#915f23] text-white rounded-xl flex items-center gap-2 cursor-pointer shadow-sm px-5 h-11"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{lang === "ar" ? "إضافة موظف جديد" : "Add New Staff"}</span>
          </Button>
        </div>

        <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>{t("label.name")}</TableHead>
                  <TableHead>{t("label.email")}</TableHead>
                  <TableHead>{t("label.role")}</TableHead>
                  <TableHead>{t("users.last_login")}</TableHead>
                  <TableHead>{t("label.status")}</TableHead>
                  {isSuperAdmin && <TableHead className="text-end w-32">{t("perm.manage")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-[#a8702c] mx-auto mb-2" />
                      {t("label.loading")}
                    </TableCell>
                  </TableRow>
                )}
                {!q.isLoading && (q.data?.length ?? 0) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      {t("label.no_results")}
                    </TableCell>
                  </TableRow>
                )}
                {q.data?.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-muted/20">
                    <TableCell className="font-bold text-foreground">
                      {lang === "ar" ? (u.full_name_ar || u.full_name_en) : (u.full_name_en || u.full_name_ar)}
                    </TableCell>
                    <TableCell dir="ltr" className="text-start font-medium text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r: string) => (
                          <Badge key={r} variant="secondary" className="rounded-full px-2.5 py-0.5">
                            {t(`role.${r}`)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(u.last_login_at, lang)}
                    </TableCell>
                    <TableCell>
                      {u.locked_until && new Date(u.locked_until) > new Date() ? (
                        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-transparent rounded-full">
                          {t("users.locked")}
                        </Badge>
                      ) : u.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent rounded-full">
                          {t("status.active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          {t("status.inactive")}
                        </Badge>
                      )}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={u.roles.includes("super_admin")}
                          onClick={() => setPermUser(u)}
                          className="rounded-xl border-border/60 hover:bg-muted font-medium text-xs py-1.5 h-auto cursor-pointer"
                        >
                          <ShieldOff className="h-3.5 w-3.5 me-1" />
                          {t("perm.manage")}
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

        {/* Add Staff Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="text-lg font-bold text-foreground">
                {lang === "ar" ? "إضافة موظف جديد" : "Add New Staff Member"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {lang === "ar"
                  ? "أدخل تفاصيل حساب الموظف وحدد صلاحياته للوصول إلى النظام."
                  : "Enter staff details and define their access permissions."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
                  <TabsTrigger value="account" className="rounded-lg text-xs font-semibold py-2">
                    {lang === "ar" ? "بيانات الحساب" : "Account Info"}
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="rounded-lg text-xs font-semibold py-2">
                    {lang === "ar" ? "صلاحيات الوصول" : "Access Permissions"}
                  </TabsTrigger>
                </TabsList>

                {/* Account Details Tab */}
                <TabsContent value="account" className="space-y-3 pt-3">
                  <div className="space-y-1">
                    <Label htmlFor="full_name_ar" className="text-xs font-semibold">{lang === "ar" ? "الاسم الكامل (بالعربية)" : "Full Name (Arabic)"}</Label>
                    <Input
                      id="full_name_ar"
                      required
                      placeholder="محمد علي"
                      className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm"
                      value={newUser.full_name_ar}
                      onChange={(e) => setNewUser({ ...newUser, full_name_ar: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="full_name_en" className="text-xs font-semibold">{lang === "ar" ? "الاسم الكامل (بالإنجليزية)" : "Full Name (English)"}</Label>
                    <Input
                      id="full_name_en"
                      required
                      placeholder="Mohamed Ali"
                      className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm"
                      value={newUser.full_name_en}
                      onChange={(e) => setNewUser({ ...newUser, full_name_en: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-semibold">{lang === "ar" ? "البريد الإلكتروني" : "Email Address"}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="name@company.com"
                      className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-semibold">{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs font-semibold">{lang === "ar" ? "الدور / الوظيفة" : "System Role"}</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                    >
                      <SelectTrigger id="role" className="rounded-xl bg-background/50 focus:bg-background h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{lang === "ar" ? "مدير" : "Administrator"}</SelectItem>
                        <SelectItem value="sales_manager">{lang === "ar" ? "مدير مبيعات" : "Sales Manager"}</SelectItem>
                        <SelectItem value="sales_agent">{lang === "ar" ? "موظف مبيعات" : "Sales Agent"}</SelectItem>
                        <SelectItem value="operations_manager">{lang === "ar" ? "مدير عمليات" : "Operations Manager"}</SelectItem>
                        <SelectItem value="operations_agent">{lang === "ar" ? "موظف عمليات" : "Operations Agent"}</SelectItem>
                        <SelectItem value="finance_manager">{lang === "ar" ? "مدير مالية" : "Finance Manager"}</SelectItem>
                        <SelectItem value="finance_agent">{lang === "ar" ? "موظف مالية" : "Finance Agent"}</SelectItem>
                        <SelectItem value="viewer">{lang === "ar" ? "مشاهد فقط" : "Viewer"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-3 pt-3">
                  <Label className="text-xs font-bold text-foreground block mb-1">
                    {lang === "ar" ? "أقسام النظام المتاحة للموظف:" : "Modules Available to Staff:"}
                  </Label>
                  <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {MODULES.map((m) => {
                      const isVisible = visibleModules[m.key] !== false;
                      return (
                        <div
                          key={m.key}
                          className="flex items-center justify-between rounded-xl border p-2.5 bg-background/30 hover:bg-background/50 transition-all text-xs"
                        >
                          <div className="font-semibold text-foreground">{t(m.labelKey)}</div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold ${isVisible ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                }`}
                            >
                              {isVisible ? (lang === "ar" ? "مسموح" : "Allowed") : (lang === "ar" ? "محجوب" : "Blocked")}
                            </span>
                            <Switch
                              checked={isVisible}
                              onCheckedChange={(checked) =>
                                setVisibleModules((prev) => ({ ...prev, [m.key]: checked }))
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-4 border-t flex sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border/50 h-10 text-sm"
                  onClick={() => setAddDialogOpen(false)}
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#a8702c] hover:bg-[#915f23] text-white rounded-xl px-5 h-10 text-sm"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin me-1" />
                  ) : null}
                  {lang === "ar" ? "إضافة وحفظ" : "Add Staff"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
