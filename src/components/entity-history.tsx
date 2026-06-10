import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

const SKIP_FIELDS = new Set(["updated_at", "created_at", "id"]);

function changedFields(oldV: Record<string, unknown> | null, newV: Record<string, unknown> | null): { field: string; from: unknown; to: unknown }[] {
  if (!oldV && newV) return [];
  if (!oldV || !newV) return [];
  const out: { field: string; from: unknown; to: unknown }[] = [];
  for (const key of Object.keys(newV)) {
    if (SKIP_FIELDS.has(key)) continue;
    if (JSON.stringify(oldV[key] ?? null) !== JSON.stringify(newV[key] ?? null)) {
      out.push({ field: key, from: oldV[key], to: newV[key] });
    }
  }
  return out;
}

function short(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 40 ? s.slice(0, 40) + "…" : s;
}

export function EntityHistory({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { t, lang } = useI18n();
  const q = useQuery({
    queryKey: ["entity-history", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id,action,user_email,created_at,old_values,new_values")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("history.action")}</TableHead>
              <TableHead>{t("history.user")}</TableHead>
              <TableHead>{t("history.time")}</TableHead>
              <TableHead>{t("history.changes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.isLoading && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{t("label.loading")}</TableCell></TableRow>
            )}
            {!q.isLoading && (q.data?.length ?? 0) === 0 && (
              <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{t("history.empty")}</TableCell></TableRow>
            )}
            {q.data?.map((row: any) => {
              const changes = row.action === "update" ? changedFields(row.old_values, row.new_values) : [];
              return (
                <TableRow key={row.id}>
                  <TableCell><Badge variant="outline">{t(`history.action.${row.action}`, row.action)}</Badge></TableCell>
                  <TableCell className="text-xs">{row.user_email ?? "—"}</TableCell>
                  <TableCell dir="ltr" className="text-xs whitespace-nowrap">{formatDateTime(row.created_at, lang)}</TableCell>
                  <TableCell>
                    {row.action === "create" && <span className="text-xs text-muted-foreground">{t("history.action.create")}</span>}
                    {row.action === "delete" && <span className="text-xs text-muted-foreground">{t("history.action.delete")}</span>}
                    {row.action === "update" && (
                      <div className="flex flex-col gap-0.5">
                        {changes.slice(0, 6).map((c) => (
                          <span key={c.field} className="text-xs">
                            <span className="font-mono text-muted-foreground">{c.field}</span>: {short(c.from)} → <span className="font-medium">{short(c.to)}</span>
                          </span>
                        ))}
                        {changes.length > 6 && <span className="text-xs text-muted-foreground">+{changes.length - 6}</span>}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
