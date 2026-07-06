import React from "react";
import type { Notification as ApiNotification } from "@/types/api";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: ApiNotification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
  compact?: boolean;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
  compact = false,
}: NotificationCardProps) {
  const { lang } = useI18n();
  const id = String(notification.id || "");
  const isRead = notification.read_at !== null && notification.read_at !== undefined;

  const nData = notification.data || {};
  const userName = nData.user_name || "";
  const userType = nData.user_type || "";
  const userEmail = nData.user_email || "";

  const title = lang === "ar"
    ? (nData.title_ar || (notification as any).title || "إشعار جديد")
    : (nData.title_en || (notification as any).title_en || (notification as any).title || "New Notification");

  const message = lang === "ar"
    ? (nData.message_ar || (notification as any).message || `سجل مستخدم جديد باسم ${userName} (${userType}). ${userEmail ? "البريد: " + userEmail : ""}`)
    : (nData.message_en || (notification as any).message_en || (notification as any).message || `New user registered: ${userName} (${userType}). ${userEmail ? "Email: " + userEmail : ""}`);

  const timeFormatted = formatDateTime(notification.created_at, lang);

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  return (
    <div
      className={cn(
        "group relative flex items-start justify-between gap-4 p-4 sm:p-5 rounded-xl border border-border/40 bg-card transition-all duration-300 hover:shadow-sm hover:border-border/80 text-start",
        !isRead && "bg-primary/5 hover:bg-primary/10 border-primary/20",
        compact && "p-3 sm:p-3 rounded-lg border-none shadow-none bg-transparent hover:bg-muted/50"
      )}
    >
      <div className="flex gap-3.5 min-w-0">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ring-1 ring-border/20",
            isRead
              ? "bg-muted text-muted-foreground/70"
              : "bg-primary/15 text-primary shadow-sm shadow-primary/10 scale-105"
          )}
        >
          {isRead ? (
            <MailOpen className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4 animate-bounce" style={{ animationDuration: "2s" }} />
          )}
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                "text-sm font-semibold text-foreground tracking-tight leading-none",
                !isRead && "text-primary font-bold",
                compact && "line-clamp-1 text-xs"
              )}
            >
              {title}
            </h4>
            {!isRead && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
            )}
          </div>
          <p
            className={cn(
              "text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap max-w-2xl",
              compact && "line-clamp-2 text-[11px]"
            )}
          >
            {message}
          </p>
          <div className="text-[10px] text-muted-foreground font-medium pt-0.5 tracking-wide">
            {timeFormatted}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {!isRead && onMarkAsRead && (
          <Button
            variant="ghost"
            size="icon"
            title={ar("تحديد كمقروء", "Mark as read")}
            disabled={isMarkingRead}
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(id);
            }}
            className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg"
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            title={ar("حذف", "Delete")}
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
