import type { ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";

export type KpiTone = "primary" | "warning" | "success" | "info" | "muted" | "destructive";

export const KPI_TONE: Record<KpiTone, { bg: string; fg: string; ring: string; bar: string }> = {
  primary:     { bg: "bg-primary/10",     fg: "text-primary",                              ring: "ring-primary/30",     bar: "bg-primary" },
  warning:     { bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400",        ring: "ring-amber-500/30",   bar: "bg-amber-500" },
  success:     { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400",    ring: "ring-emerald-500/30", bar: "bg-emerald-500" },
  info:        { bg: "bg-sky-500/10",     fg: "text-sky-600 dark:text-sky-400",            ring: "ring-sky-500/30",     bar: "bg-sky-500" },
  muted:       { bg: "bg-muted",          fg: "text-muted-foreground",                     ring: "ring-border",         bar: "bg-muted-foreground/40" },
  destructive: { bg: "bg-destructive/10", fg: "text-destructive",                          ring: "ring-destructive/30", bar: "bg-destructive" },
};

export function KpiCard({
  icon: Icon, label, value, tone = "muted", active, onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  tone?: KpiTone;
  active?: boolean;
  onClick?: () => void;
}) {
  const T = KPI_TONE[tone];
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border bg-card p-4 text-start transition-all",
        onClick && "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "ring-2", active && T.ring,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", T.bg, T.fg)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
          <div className="text-xl font-bold leading-tight">{value ?? "—"}</div>
        </div>
      </div>
      {onClick && (
        <span className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-start scale-x-0 transition-transform group-hover:scale-x-100",
          T.bar,
        )} />
      )}
    </Comp>
  );
}

export function StatusPill({
  label, count, tone = "muted", active, onClick,
}: {
  label: string;
  count?: number;
  tone?: KpiTone;
  active?: boolean;
  onClick: () => void;
}) {
  const T = KPI_TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
        active
          ? cn(T.bg, T.fg, "border-transparent shadow-sm")
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          active ? "bg-background/60" : "bg-muted",
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
