import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/settings")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const q = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("system_settings").select("*").order("key");
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title={t("settings.title")} />
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("settings.title")}</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y">
              {q.data?.map((s: any) => (
                <div key={s.key} className="grid grid-cols-3 gap-4 py-3 text-sm">
                  <dt className="font-medium text-muted-foreground">{s.key}</dt>
                  <dd className="col-span-2 font-mono">{JSON.stringify(s.value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
