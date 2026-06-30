import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/store/api";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function NotificationsPopover() {
  const { t, lang, dir } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useGetNotificationsQuery();
  const { data: unreadData, refetch: refetchCount } = useGetUnreadNotificationsCountQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllRead] = useMarkAllNotificationsAsReadMutation();

  const unreadCount = typeof unreadData === "object" ? unreadData?.count : (unreadData ?? 0);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllRead().unwrap();
      toast.success(lang === "ar" ? "تم تحديد الكل كمقروء" : "All notifications marked as read");
      refetch();
      refetchCount();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(id).unwrap();
        refetch();
        refetchCount();
      } catch (err) {
        console.warn("Failed to mark as read", err);
      }
    }
    setOpen(false);
    navigate("/notifications");
  };

  const latestNotifications = notifications.slice(0, 5);
  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-[1.15rem] w-[1.15rem]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground tabular-nums ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0" dir={dir}>
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <span className="font-semibold text-sm">
            {ar("الإشعارات", "Notifications")}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-auto text-xs px-2 py-1 text-primary hover:text-primary/95 flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {ar("تحديد الكل كمقروء", "Mark all read")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading && (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && latestNotifications.length === 0 && (
            <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground gap-1.5 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs font-medium">{ar("لا توجد إشعارات حالياً", "No notifications yet")}</p>
            </div>
          )}
          {!isLoading && latestNotifications.length > 0 && (
            <div className="divide-y">
              {latestNotifications.map((n) => {
                const isRead = n.read_at !== null;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, isRead)}
                    className={cn(
                      "flex flex-col gap-1 p-4 text-start transition-colors cursor-pointer hover:bg-muted/50",
                      !isRead && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("text-xs font-semibold text-foreground line-clamp-1", !isRead && "text-primary")}>
                        {lang === "ar" ? n.title : n.title_en}
                      </span>
                      {!isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {lang === "ar" ? n.message : n.message_en}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                      {formatDateTime(n.created_at, lang)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2.5 text-center bg-muted/20">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-primary hover:underline block py-1"
          >
            {ar("عرض كل الإشعارات", "View all notifications")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
