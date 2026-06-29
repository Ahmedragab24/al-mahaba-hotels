import { useState, useEffect } from "react";
import { db } from "@/lib/api/db";
import { apiClient } from "@/lib/api/api-client";
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
import { ShieldOff, Plus, Loader2, Pencil, Trash2, AlertTriangle, Eye, User } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/features/authSlice";
import { hasRole, hasAnyRole, isAdmin, canAccessModule } from "@/lib/auth-utils";
import { MODULES } from "@/lib/modules";
import { formatDateTime } from "@/lib/format";
import { createStaffUser } from "@/lib/users.functions";
import { useGetCountriesQuery } from "@/store/services/attributes/countries";
import { useGetCitiesQuery } from "@/store/services/attributes/cities";
import { PermissionKey, UserRole, getDefaultPermissions, permissionsFromArray, permissionsToArray } from "@/types/permissions";

export default function UsersPage() {
  const { t, lang, dir } = useI18n();
  const auth = useSelector(selectAuth);
  const qc = useQueryClient();
  const [permUser, setPermUser] = useState<any | null>(null);

  // Add Dialog States
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [visibleModules, setVisibleModules] = useState<Record<string, boolean>>({});
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    type: "sales_manager" as UserRole,
    country_id: "",
    city_id: "",
    status: "1",
    image: null as File | null,
  });

  const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
  };

  const { data: apiCountriesResponse } = useGetCountriesQuery({ all: 1 });
  const countriesArray = extractArray(apiCountriesResponse);

  const { data: apiCitiesResponse } = useGetCitiesQuery(
    { country_id: newUser.country_id, all: 1 },
    { skip: !newUser.country_id }
  );
  const citiesArray = extractArray(apiCitiesResponse);

  const { data: editCitiesResponse } = useGetCitiesQuery(
    { country_id: editingUser?.country_id, all: 1 },
    { skip: !editingUser?.country_id }
  );
  const editCitiesArray = extractArray(editCitiesResponse);

  const q = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const rawUsers = await apiClient.users.getAll();
      const users = extractArray(rawUsers);

      const allowedRoles = [
        "super_admin",
        "financial_manager",
        "sales_manager",
        "employee",
        "viewer"
      ];

      return users
        .map((u: any) => ({
          ...u,
          roles: u.type ? [u.type] : []
        }))
        .filter((u: any) => u.roles.some((r: string) => allowedRoles.includes(r)));

    },
  });

  const createMutation = useMutation({
    mutationFn: async (variables: { formData: FormData; role: string }) => {
      try {
        const res = await apiClient.users.create(variables.formData);
        if (res && res.id) {
          try {
            await db.from("user_roles").upsert({ user_id: res.id, role: variables.role });
          } catch (roleErr) {
            console.warn("Failed to assign user role or blocks", roleErr);
          }
        }
        return res;
      } catch (err) {
        console.warn("apiClient user creation failed", err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم إضافة الموظف بنجاح" : "Staff added successfully");
      setAddDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        type: "sales_manager",
        country_id: "",
        city_id: "",
        status: "1",
        image: null,
      });
      setVisibleModules({});
      qc.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  const isSuperAdmin = hasRole(auth, "super_admin");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newUser.name);
    formData.append("email", newUser.email);
    formData.append("password", newUser.password);
    formData.append("phone", newUser.phone);
    formData.append("type", newUser.type);
    if (newUser.country_id) formData.append("country_id", String(newUser.country_id));
    if (newUser.city_id) formData.append("city_id", String(newUser.city_id));
    formData.append("status", String(newUser.status));

    if (newUser.image) {
      formData.append("image", newUser.image);
    }

    // Add permissions
    MODULES.forEach((m: any) => {
      const isVisible = !!visibleModules[m.key];
      if (isVisible) {
        formData.append(`permissions[${m.key}]`, "true");
      }
    });

    createMutation.mutate({ formData, role: newUser.type });
  };

  const handleOpenAddDialog = () => {
    const initialVisible: Record<string, boolean> = {};
    const defaultPerms = getDefaultPermissions("sales_manager");
    MODULES.forEach((m: any) => {
      initialVisible[m.key] = defaultPerms.includes(m.key as PermissionKey);
    });
    setVisibleModules(initialVisible);
    setNewUser({
      name: "",
      email: "",
      password: "",
      phone: "",
      type: "sales_manager",
      country_id: "",
      city_id: "",
      status: "1",
      image: null,
    });
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (u: any) => {
    const initialVisible: Record<string, boolean> = {};
    const userType = u.type || u.roles?.[0] || "sales_agent";

    // Try to use existing permissions, otherwise use defaults for the role
    if (u.permissions && typeof u.permissions === "object") {
      const permKeys = Array.isArray(u.permissions)
        ? u.permissions
        : permissionsToArray(u.permissions);

      MODULES.forEach((m: any) => {
        initialVisible[m.key] = permKeys.includes(m.key as PermissionKey);
      });
    } else {
      const defaultPerms = getDefaultPermissions(userType as UserRole);
      MODULES.forEach((m: any) => {
        initialVisible[m.key] = defaultPerms.includes(m.key as PermissionKey);
      });
    }

    setVisibleModules(initialVisible);
    setEditingUser({
      ...u,
      country_id: u.country_id || u.country?.id || "",
      city_id: u.city_id || u.city?.id || "",
      type: userType,
      password: "" // Don't show existing password
    });
    setEditDialogOpen(true);
  };

  const handleOpenViewDialog = async (userId: string) => {
    try {
      const userData = await apiClient.users.getById(userId);
      setViewingUser(userData);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error(lang === "ar" ? "فشل في جلب بيانات المستخدم" : "Failed to fetch user data");
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (variables: { id: string; formData: FormData; role: string }) => {
      try {
        const res = await apiClient.users.update(variables.id, variables.formData);
        try {
          await db.from("user_roles").delete().eq("user_id", variables.id);
          await db.from("user_roles").insert({ user_id: variables.id, role: variables.role });
        } catch (roleErr) {
          console.warn("Failed to update user role", roleErr);
        }
        return res;
      } catch (err) {
        console.warn("apiClient user update failed", err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم تعديل الموظف بنجاح" : "Staff updated successfully");
      setEditDialogOpen(false);
      setEditingUser(null);
      qc.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData();
    formData.append("name", editingUser.name || editingUser.full_name_en || editingUser.full_name_ar || "");
    formData.append("email", editingUser.email || "");
    formData.append("phone", editingUser.phone || "");
    formData.append("type", editingUser.type);
    formData.append("status", String(editingUser.status || "1"));
    if (editingUser.country_id) formData.append("country_id", String(editingUser.country_id));
    if (editingUser.city_id) formData.append("city_id", String(editingUser.city_id));

    if (editingUser.image instanceof File) {
      formData.append("image", editingUser.image);
    }

    formData.append("_method", "PUT");

    // Add permissions
    MODULES.forEach((m: any) => {
      const isVisible = !!visibleModules[m.key];
      if (isVisible) {
        formData.append(`permissions[${m.key}]`, "true");
      }
    });

    updateMutation.mutate({ id: editingUser.id, formData, role: editingUser.type });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.users.delete(id);
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم حذف الموظف بنجاح" : "Staff deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingUserId(null);
      qc.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

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
                  <TableHead>{t("label.user_type")}</TableHead>
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
                {(Array.isArray(q.data) ? q.data : Array.isArray(q.data?.data) ? q.data.data : [])?.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-muted/20">
                    <TableCell className="font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-start font-medium text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {u.type ? (
                        <Badge
                          className={
                            u.type === "super_admin"
                              ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-transparent rounded-full"
                              : u.type === "sales_manager"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent rounded-full"
                                : u.type === "finance_manager"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-transparent rounded-full"
                                  : u.type === "viewer"
                                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-transparent rounded-full"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-transparent rounded-full"
                          }
                        >
                          {t(`role.${u.type}`)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.locked_until && new Date(u.locked_until) > new Date() ? (
                        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-transparent rounded-full">
                          {t("users.locked")}
                        </Badge>
                      ) : u.status === 1 ? (
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenViewDialog(u.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditDialog(u)}
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={u.roles?.includes("super_admin")}
                            onClick={() => {
                              setDeletingUserId(u.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={u.roles?.includes("super_admin")}
                            onClick={() => setPermUser(u)}
                            className="rounded-xl border-border/60 hover:bg-muted font-medium text-xs py-1.5 h-auto cursor-pointer"
                          >
                            <ShieldOff className="h-3.5 w-3.5 me-1" />
                            {t("perm.manage")}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isSuperAdmin && <PermissionsDialog user={permUser} onClose={() => setPermUser(null)} />}

        {/* View User Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="text-lg font-bold text-foreground">
                {lang === "ar" ? "تفاصيل المستخدم" : "User Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {lang === "ar" ? "معلومات المستخدم وصلاحياته" : "User information and permissions"}
              </DialogDescription>
            </DialogHeader>

            {viewingUser && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  {viewingUser.image ? (
                    <img
                      src={typeof viewingUser.image === 'string' ? viewingUser.image : URL.createObjectURL(viewingUser.image)}
                      alt={viewingUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {(viewingUser.name || viewingUser.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{viewingUser.name || "—"}</h3>
                    <p className="text-sm text-muted-foreground">{viewingUser.email || "—"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "المعلومات الأساسية" : "Basic Information"}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">{lang === "ar" ? "رقم الهاتف" : "Phone"}</span>
                      <span className="font-medium">{viewingUser.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{lang === "ar" ? "نوع المستخدم" : "User Type"}</span>
                      <Badge className="mt-1">{t(`role.${viewingUser.type}`)}</Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{lang === "ar" ? "الحالة" : "Status"}</span>
                      <Badge className={viewingUser.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
                        {viewingUser.status === 1 ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{lang === "ar" ? "البلد" : "Country"}</span>
                      <span className="font-medium">{viewingUser.country?.name_ar || viewingUser.country?.name_en || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{lang === "ar" ? "المدينة" : "City"}</span>
                      <span className="font-medium">{viewingUser.city?.name_ar || viewingUser.city?.name_en || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "الصلاحيات" : "Permissions"}</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {viewingUser.permissions && Array.isArray(viewingUser.permissions) && viewingUser.permissions.length > 0 ? (
                      viewingUser.permissions.map((perm: string) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))
                    ) : viewingUser.permissions && typeof viewingUser.permissions === "object" ? (
                      Object.keys(viewingUser.permissions).map((key) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs col-span-2">{lang === "ar" ? "لا توجد صلاحيات" : "No permissions"}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                className="rounded-xl border-border/50 h-10 text-sm"
                onClick={() => setViewDialogOpen(false)}
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Staff Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-lg font-bold text-foreground">
                {lang === "ar" ? "إضافة موظف جديد" : "Add New Staff Member"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {lang === "ar"
                  ? "أدخل تفاصيل حساب الموظف وحدد صلاحياته للوصول إلى النظام."
                  : "Enter staff details and define their access permissions."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col overflow-hidden mt-4">
              <Tabs defaultValue="account" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted mb-4">
                  <TabsTrigger value="account" className="rounded-md text-xs font-semibold py-2">
                    {lang === "ar" ? "بيانات الحساب" : "Account Info"}
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="rounded-md text-xs font-semibold py-2">
                    {lang === "ar" ? "صلاحيات الوصول" : "Access Permissions"}
                  </TabsTrigger>
                </TabsList>

                {/* Account Details Tab */}
                <TabsContent value="account" className="flex-1 overflow-y-auto px-4 space-y-5">
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "المعلومات الشخصية" : "Personal Information"}</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الاسم" : "Name"}</Label>
                        <Input
                          id="name"
                          required
                          placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
                          className="rounded-lg bg-background border-border h-9 text-sm"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                          <Input
                            id="phone"
                            required
                            placeholder="+966512345678"
                            pattern="^\+[1-9]\d{1,14}$"
                            className="rounded-lg bg-background border-border h-9 text-sm"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="name@company.com"
                            className="rounded-lg bg-background border-border h-9 text-sm"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "معلومات الحساب" : "Account Information"}</Label>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
                          <Input
                            id="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="rounded-lg bg-background border-border h-9 text-sm"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="user_type" className="text-xs font-medium text-muted-foreground">{t("label.user_type")}</Label>
                          <Select
                            value={newUser.type}
                            onValueChange={(val) => setNewUser({ ...newUser, type: val as import("@/hooks/use-auth").AppRole })}
                          >
                            <SelectTrigger id="user_type" className="rounded-lg bg-background border-border h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super_admin">{t("role.super_admin")}</SelectItem>
                              <SelectItem value="financial_manager">{t("role.financial_manager")}</SelectItem>
                              <SelectItem value="sales_manager">{t("role.sales_manager")}</SelectItem>
                              <SelectItem value="employee">{t("role.employee")}</SelectItem>
                              <SelectItem value="viewer">{t("role.viewer")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="country_id" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "البلد" : "Country"}</Label>
                          <Select
                            value={newUser.country_id}
                            onValueChange={(val) => setNewUser({ ...newUser, country_id: val, city_id: "" })}
                          >
                            <SelectTrigger id="country_id" className="rounded-lg bg-background border-border h-9 text-sm">
                              <SelectValue placeholder={lang === "ar" ? "اختر البلد" : "Select Country"} />
                            </SelectTrigger>
                            <SelectContent>
                              {countriesArray.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {lang === "ar" ? (c.name_ar || c.name_en || c.name) : (c.name_en || c.name_ar || c.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="city_id" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "المدينة" : "City"}</Label>
                          <Select
                            value={newUser.city_id}
                            onValueChange={(val) => setNewUser({ ...newUser, city_id: val })}
                            disabled={!newUser.country_id}
                          >
                            <SelectTrigger id="city_id" className="rounded-lg bg-background border-border h-9 text-sm">
                              <SelectValue placeholder={lang === "ar" ? "اختر المدينة" : "Select City"} />
                            </SelectTrigger>
                            <SelectContent>
                              {citiesArray.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  {lang === "ar" ? (c.name_ar || c.name_en || c.name) : (c.name_en || c.name_ar || c.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الحالة" : "Status"}</Label>
                          <Select
                            value={newUser.status}
                            onValueChange={(val) => setNewUser({ ...newUser, status: val })}
                          >
                            <SelectTrigger id="status" className="rounded-lg bg-background border-border h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">{lang === "ar" ? "نشط" : "Active"}</SelectItem>
                              <SelectItem value="0">{lang === "ar" ? "غير نشط" : "Inactive"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="image" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الصورة الشخصية" : "Profile Picture"}</Label>
                          <div className="flex items-center gap-2">
                            {newUser.image ? (
                              <img
                                src={URL.createObjectURL(newUser.image)}
                                alt="Profile preview"
                                className="w-8 h-8 rounded-full object-cover border border-border"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                <span className="text-xs font-bold text-muted-foreground">
                                  {(newUser.name || newUser.email || "U").charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="rounded-lg bg-background border-border h-9 text-sm pt-1.5 flex-1"
                              onChange={(e) => setNewUser({ ...newUser, image: e.target.files?.[0] || null })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="flex-1 overflow-y-auto px-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "صلاحيات الوصول" : "Access Permissions"}</Label>
                  </div>
                  <div className="space-y-2">
                    {MODULES.map((m: any) => {
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

        {/* Edit Staff Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-lg font-bold text-foreground">
                {lang === "ar" ? "تعديل موظف" : "Edit Staff Member"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {lang === "ar"
                  ? "تعديل تفاصيل حساب الموظف وصلاحياته."
                  : "Update staff details and their access permissions."}
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-hidden mt-4">
                <Tabs defaultValue="account" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1 mb-4">
                    <TabsTrigger value="account" className="rounded-md text-xs font-semibold py-2">
                      {lang === "ar" ? "بيانات الحساب" : "Account Info"}
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="rounded-md text-xs font-semibold py-2">
                      {lang === "ar" ? "صلاحيات الوصول" : "Access Permissions"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Account Details Tab */}
                  <TabsContent value="account" className="flex-1 overflow-y-auto px-4 space-y-5">
                    {/* Personal Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                        <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "المعلومات الشخصية" : "Personal Information"}</Label>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_name" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الاسم" : "Name"}</Label>
                          <Input
                            id="edit_name"
                            required
                            placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
                            className="rounded-lg bg-background border-border h-9 text-sm"
                            value={editingUser.name || editingUser.full_name_en || editingUser.full_name_ar || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_phone" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                            <Input
                              id="edit_phone"
                              required
                              placeholder="+966500000000"
                              pattern="^\+[1-9]\d{1,14}$"
                              className="rounded-lg bg-background border-border h-9 text-sm"
                              value={editingUser.phone || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_email" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                            <Input
                              id="edit_email"
                              type="email"
                              required
                              placeholder="email@example.com"
                              className="rounded-lg bg-background border-border h-9 text-sm"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="w-1 h-4 bg-primary rounded-full"></div>
                        <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "معلومات الحساب" : "Account Information"}</Label>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="edit_user_type" className="text-xs font-medium text-muted-foreground">{t("label.user_type")}</Label>
                          <Select
                            value={editingUser.type}
                            onValueChange={(val) => setEditingUser({ ...editingUser, type: val as import("@/hooks/use-auth").AppRole })}
                          >
                            <SelectTrigger id="edit_user_type" className="rounded-lg bg-background border-border h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super_admin">{t("role.super_admin")}</SelectItem>
                              <SelectItem value="financial_manager">{t("role.financial_manager")}</SelectItem>
                              <SelectItem value="sales_manager">{t("role.sales_manager")}</SelectItem>
                              <SelectItem value="employee">{t("role.employee")}</SelectItem>
                              <SelectItem value="viewer">{t("role.viewer")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_country_id" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "البلد" : "Country"}</Label>
                            <Select
                              value={String(editingUser.country_id || "")}
                              onValueChange={(val) => setEditingUser({ ...editingUser, country_id: val, city_id: "" })}
                            >
                              <SelectTrigger id="edit_country_id" className="rounded-lg bg-background border-border h-9 text-sm">
                                <SelectValue placeholder={lang === "ar" ? "اختر البلد" : "Select Country"} />
                              </SelectTrigger>
                              <SelectContent>
                                {countriesArray.map((c: any) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {lang === "ar" ? (c.name_ar || c.name_en || c.name) : (c.name_en || c.name_ar || c.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_city_id" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "المدينة" : "City"}</Label>
                            <Select
                              value={String(editingUser.city_id || "")}
                              onValueChange={(val) => setEditingUser({ ...editingUser, city_id: val })}
                              disabled={!editingUser.country_id}
                            >
                              <SelectTrigger id="edit_city_id" className="rounded-lg bg-background border-border h-9 text-sm">
                                <SelectValue placeholder={lang === "ar" ? "اختر المدينة" : "Select City"} />
                              </SelectTrigger>
                              <SelectContent>
                                {editCitiesArray.map((c: any) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {lang === "ar" ? (c.name_ar || c.name_en || c.name) : (c.name_en || c.name_ar || c.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_status" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الحالة" : "Status"}</Label>
                            <Select
                              value={String(editingUser.status || "1")}
                              onValueChange={(val) => setEditingUser({ ...editingUser, status: val })}
                            >
                              <SelectTrigger id="edit_status" className="rounded-lg bg-background border-border h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">{lang === "ar" ? "نشط" : "Active"}</SelectItem>
                                <SelectItem value="0">{lang === "ar" ? "غير نشط" : "Inactive"}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="edit_image" className="text-xs font-medium text-muted-foreground">{lang === "ar" ? "الصورة الشخصية" : "Profile Picture"}</Label>
                            <div className="flex items-center gap-2">
                              {editingUser.image ? (
                                typeof editingUser.image === 'string' ? (
                                  <img
                                    src={editingUser.image}
                                    alt="Current profile"
                                    className="w-8 h-8 rounded-full object-cover border border-border"
                                  />
                                ) : (
                                  <img
                                    src={URL.createObjectURL(editingUser.image)}
                                    alt="New profile"
                                    className="w-8 h-8 rounded-full object-cover border border-border"
                                  />
                                )
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                  <span className="text-xs font-bold text-muted-foreground">
                                    {(editingUser.name || editingUser.email || "U").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <Input
                                id="edit_image"
                                type="file"
                                accept="image/*"
                                className="rounded-lg bg-background border-border h-9 text-sm pt-1.5 flex-1"
                                onChange={(e) => setEditingUser({ ...editingUser, image: e.target.files?.[0] || null })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Permissions Details Tab */}
                  <TabsContent value="permissions" className="flex-1 overflow-y-auto px-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <Label className="text-sm font-bold text-foreground">{lang === "ar" ? "صلاحيات الوصول" : "Access Permissions"}</Label>
                    </div>
                    <div className="space-y-2">
                      {MODULES.map((m: any) => (
                        <div
                          key={m.key}
                          className="flex items-center justify-between rounded-xl border p-2.5 bg-background/30 hover:bg-background/50 transition-all text-xs"
                        >
                          <div className="font-semibold text-foreground">{t(m.labelKey)}</div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold ${!!visibleModules[m.key] ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                }`}
                            >
                              {!!visibleModules[m.key] ? (lang === "ar" ? "مسموح" : "Allowed") : (lang === "ar" ? "محجوب" : "Blocked")}
                            </span>
                            <Switch
                              checked={!!visibleModules[m.key]}
                              onCheckedChange={(checked) => setVisibleModules(prev => ({ ...prev, [m.key]: checked }))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="pt-4 border-t flex sm:justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-border/50 h-9 text-sm"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingUser(null);
                    }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-lg h-9 text-sm"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="loading-icon h-4 w-4 animate-spin" />
                    ) : (
                      lang === "ar" ? "حفظ التغييرات" : "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-center text-xl">
                {lang === "ar" ? "حذف الموظف؟" : "Delete Staff Member?"}
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {lang === "ar"
                  ? "هل أنت متأكد من رغبتك في حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this staff member? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center flex-row gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto flex-1 rounded-xl"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto flex-1 rounded-xl"
                disabled={deleteMutation.isPending || !deletingUserId}
                onClick={() => {
                  if (deletingUserId) deleteMutation.mutate(deletingUserId);
                }}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {lang === "ar" ? "حذف الموظف" : "Delete Staff"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}

function PermissionsDialog({ user, onClose }: { user: any | null; onClose: () => void }) {
  const { t, lang } = useI18n();
  const qc = useQueryClient();

  // Local state for permissions to allow immediate UI updates
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>({});

  // Initialize local permissions when user changes
  useEffect(() => {
    if (user?.permissions && typeof user.permissions === "object" && !Array.isArray(user.permissions)) {
      const perms: Record<string, boolean> = {};
      Object.keys(user.permissions).forEach(key => {
        perms[key] = user.permissions[key] === "true" || user.permissions[key] === true;
      });
      setLocalPerms(perms);
    } else {
      setLocalPerms({});
    }
  }, [user]);

  const toggle = useMutation({
    mutationFn: async ({ key, isGranted }: { key: string; isGranted: boolean }) => {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone || "");
      formData.append("type", user.type);
      formData.append("status", String(user.status || "1"));
      if (user.country?.id) formData.append("country_id", String(user.country.id));
      if (user.city?.id) formData.append("city_id", String(user.city.id));

      const currentPerms = (user.permissions && typeof user.permissions === "object" && !Array.isArray(user.permissions))
        ? { ...user.permissions }
        : {};

      if (isGranted) {
        currentPerms[key] = "true";
      } else {
        delete currentPerms[key];
      }

      Object.keys(currentPerms).forEach(k => {
        if (currentPerms[k] === "true" || currentPerms[k] === true) {
          formData.append(`permissions[${k}]`, "true");
        }
      });

      await apiClient.users.update(user.id, formData);
    },
    onSuccess: (_, variables) => {
      // Update local state immediately for UI feedback
      setLocalPerms(prev => ({ ...prev, [variables.key]: variables.isGranted }));
      qc.invalidateQueries({ queryKey: ["users-list"] });
      toast.success(t("toast.saved"));
    },
    onError: (e: any) => toast.error(e.message),
  });

  const name = user ? ((lang === "ar" ? user.name_ar || user.name : user.name_en || user.name) || user.email) : "";

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("perm.manage")} — {name}</DialogTitle>
          <DialogDescription>{t("perm.dialog_desc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1">
          {MODULES.map((m: any) => {
            const isGranted = user?.permissions && typeof user.permissions === "object" && !Array.isArray(user.permissions)
              ? (user.permissions[m.key] === "true" || user.permissions[m.key] === true)
              : false;

            // Use local state if available, otherwise use user permissions
            const checked = localPerms[m.key] !== undefined ? localPerms[m.key] : isGranted;

            return (
              <div key={m.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="text-sm font-medium">{t(m.labelKey)}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!checked ? "text-destructive" : "text-muted-foreground"}`}>
                    {!checked ? t("perm.hidden") : t("perm.visible")}
                  </span>
                  <Switch
                    checked={checked}
                    disabled={toggle.isPending}
                    onCheckedChange={(checked) => {
                      // Update local state immediately for instant feedback
                      setLocalPerms(prev => ({ ...prev, [m.key]: checked }));
                      toggle.mutate({ key: m.key, isGranted: checked });
                    }}
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

export { UsersPage as Component };
