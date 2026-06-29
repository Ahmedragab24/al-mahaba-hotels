import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

const cls: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  inactive: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-transparent",
  archived: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-500 border-transparent",
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-transparent",
  pending_approval: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-transparent",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  expired: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  terminated: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-transparent",
  suspended: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-transparent",
  closed: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-500 border-transparent",
};

export function StatusPill({ status }: { status: string | null | undefined }) {
  const { t } = useI18n();
  if (!status) return null;
  return <Badge className={cls[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-transparent"}>{t(`status.${status}`, status)}</Badge>;
}
