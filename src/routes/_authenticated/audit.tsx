import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/audit")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  component: AuditPage,
});

function AuditPage() {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader title={t("audit.title")} />
      <div className="p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("audit.time")}</TableHead>
                  <TableHead>{t("audit.user")}</TableHead>
                  <TableHead>{t("audit.action")}</TableHead>
                  <TableHead>{t("audit.entity")}</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>}
                {!q.isLoading && (q.data?.length ?? 0) === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("label.no_results")}</TableCell></TableRow>}
                {q.data?.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(a.created_at, lang)}</TableCell>
                    <TableCell dir="ltr" className="text-xs">{a.user_email ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                    <TableCell>{a.entity_type ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs text-muted-foreground">{a.entity_id ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
