import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

const cls: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-transparent",
  inactive: "bg-zinc-100 text-zinc-700 border-transparent",
  archived: "bg-zinc-200 text-zinc-600 border-transparent",
  draft: "bg-zinc-100 text-zinc-700 border-transparent",
  pending_approval: "bg-amber-100 text-amber-800 border-transparent",
  approved: "bg-emerald-100 text-emerald-800 border-transparent",
  rejected: "bg-rose-100 text-rose-800 border-transparent",
  expired: "bg-rose-100 text-rose-700 border-transparent",
  terminated: "bg-rose-100 text-rose-700 border-transparent",
  suspended: "bg-amber-100 text-amber-800 border-transparent",
  closed: "bg-zinc-200 text-zinc-600 border-transparent",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  const { t } = useI18n();
  if (!status) return null;
  return <Badge className={cls[status] ?? "bg-zinc-100 text-zinc-700 border-transparent"}>{t(`status.${status}`, status)}</Badge>;
}
