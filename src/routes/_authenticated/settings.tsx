import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useCurrencies } from "@/lib/lookups";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, DollarSign, ShieldAlert, Globe, Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: SettingsPage,
});

const defaultSettings: Record<string, any> = {
  "company.name_ar": "",
  "company.name_en": "",
  "company.default_currency": "SAR",
  "finance.base_currency": "SAR",
  "quotation.approval_threshold": 10000,
  "security.session_timeout_minutes": 30,
  "security.max_failed_attempts": 5,
  "security.lock_duration_minutes": 15,
  "security.password_min_length": 8,
  "localization.default_language": "ar",
};

function SettingsPage() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const currenciesQuery = useCurrencies();

  const q = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [formState, setFormState] = useState<Record<string, any>>(defaultSettings);

  useEffect(() => {
    if (q.data) {
      const loadedForm: Record<string, any> = { ...defaultSettings };
      q.data.forEach((item: any) => {
        loadedForm[item.key] = item.value;
      });
      setFormState(loadedForm);
    }
  }, [q.data]);

  const updateSetting = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (q.data) {
      const loadedForm: Record<string, any> = { ...defaultSettings };
      q.data.forEach((item: any) => {
        loadedForm[item.key] = item.value;
      });
      setFormState(loadedForm);
      toast.info(lang === "ar" ? "تمت استعادة الإعدادات الأصلية" : "Original settings restored");
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (updatedSettings: Record<string, any>) => {
      const payload = Object.entries(updatedSettings).map(([key, value]) => ({
        key,
        value,
      }));
      const { error } = await supabase.from("system_settings").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("toast.saved"));
      qc.invalidateQueries({ queryKey: ["system-settings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || t("toast.error"));
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formState);
  };

  const currencies = currenciesQuery.data ?? [];

  return (
    <>
      <PageHeader title={t("settings.title")} />
      <div className="p-6  mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
        <Card className="border border-border/50 bg-card/60 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-6">
            <CardTitle className="text-xl font-bold text-foreground">
              {t("settings.title")}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? "إدارة الإعدادات العامة والمالية وإعدادات الأمان والتوطين للنظام."
                : "Manage general, financial, security, and localization parameters for the system."}
            </CardDescription>
          </CardHeader>

          {q.isLoading || currenciesQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t("label.loading")}</span>
            </div>
          ) : (
            <>
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="flex w-full rounded-none border-b border-border/40 bg-muted/20 p-0 h-12">
                  <TabsTrigger
                    value="company"
                    className="flex-1 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all gap-2"
                  >
                    <Building className="h-4 w-4" />
                    <span>{t("settings.company")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="finance"
                    className="flex-1 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>{t("settings.finance")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex-1 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all gap-2"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>{t("settings.security")}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="localization"
                    className="flex-1 py-3 text-sm font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{t("settings.localization")}</span>
                  </TabsTrigger>
                </TabsList>

                <CardContent className="p-8">
                  {/* Company Settings */}
                  <TabsContent value="company" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_name_ar" className="text-sm font-medium">
                          {t("settings.company_name_ar")}
                        </Label>
                        <Input
                          id="company_name_ar"
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["company.name_ar"] ?? ""}
                          onChange={(e) => updateSetting("company.name_ar", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_name_en" className="text-sm font-medium">
                          {t("settings.company_name_en")}
                        </Label>
                        <Input
                          id="company_name_en"
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["company.name_en"] ?? ""}
                          onChange={(e) => updateSetting("company.name_en", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label htmlFor="default_currency" className="text-sm font-medium">
                          {t("settings.default_currency")}
                        </Label>
                        <Select
                          value={formState["company.default_currency"] ?? ""}
                          onValueChange={(val) => updateSetting("company.default_currency", val)}
                        >
                          <SelectTrigger id="default_currency" className="bg-background/50 focus:bg-background">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((c: any) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.code} - {lang === "ar" ? c.name_ar : c.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Financial Settings */}
                  <TabsContent value="finance" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="base_currency" className="text-sm font-medium">
                          {t("settings.base_currency")}
                        </Label>
                        <Select
                          value={formState["finance.base_currency"] ?? ""}
                          onValueChange={(val) => updateSetting("finance.base_currency", val)}
                        >
                          <SelectTrigger id="base_currency" className="bg-background/50 focus:bg-background">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((c: any) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.code} - {lang === "ar" ? c.name_ar : c.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approval_threshold" className="text-sm font-medium">
                          {t("settings.approval_threshold")}
                        </Label>
                        <Input
                          id="approval_threshold"
                          type="number"
                          min={0}
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["quotation.approval_threshold"] ?? ""}
                          onChange={(e) =>
                            updateSetting("quotation.approval_threshold", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 bg-muted/20 border border-border/30 rounded-xl p-4 mt-2">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t("settings.approval_threshold_desc")}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Security Settings */}
                  <TabsContent value="security" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="session_timeout" className="text-sm font-medium">
                          {t("settings.session_timeout")}
                        </Label>
                        <Input
                          id="session_timeout"
                          type="number"
                          min={1}
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["security.session_timeout_minutes"] ?? ""}
                          onChange={(e) =>
                            updateSetting("security.session_timeout_minutes", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_attempts" className="text-sm font-medium">
                          {t("settings.max_attempts")}
                        </Label>
                        <Input
                          id="max_attempts"
                          type="number"
                          min={1}
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["security.max_failed_attempts"] ?? ""}
                          onChange={(e) =>
                            updateSetting("security.max_failed_attempts", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lock_duration" className="text-sm font-medium">
                          {t("settings.lock_duration")}
                        </Label>
                        <Input
                          id="lock_duration"
                          type="number"
                          min={1}
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["security.lock_duration_minutes"] ?? ""}
                          onChange={(e) =>
                            updateSetting("security.lock_duration_minutes", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pwd_min" className="text-sm font-medium">
                          {t("settings.pwd_min")}
                        </Label>
                        <Input
                          id="pwd_min"
                          type="number"
                          min={1}
                          className="bg-background/50 focus:bg-background transition-all"
                          value={formState["security.password_min_length"] ?? ""}
                          onChange={(e) =>
                            updateSetting("security.password_min_length", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Localization Settings */}
                  <TabsContent value="localization" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="default_lang" className="text-sm font-medium">
                        {t("settings.default_lang")}
                      </Label>
                      <Select
                        value={formState["localization.default_language"] ?? ""}
                        onValueChange={(val) => updateSetting("localization.default_language", val)}
                      >
                        <SelectTrigger id="default_lang" className="bg-background/50 focus:bg-background">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية (Arabic)</SelectItem>
                          <SelectItem value="en">English (English)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>

              <CardFooter className="flex justify-end gap-3 border-t border-border/40 p-8 bg-muted/10">
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 cursor-pointer active:scale-95 transition-all"
                  onClick={handleReset}
                  disabled={saveMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t("actions.cancel")}</span>
                </Button>
                <Button
                  size="default"
                  className="gap-2 cursor-pointer active:scale-95 transition-all"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saveMutation.isPending ? t("actions.saving") : t("actions.save")}</span>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
