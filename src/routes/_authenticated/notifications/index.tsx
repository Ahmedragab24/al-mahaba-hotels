import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteAllNotificationsMutation,
} from "@/store/api";
import { formatDateTime } from "@/lib/format";
import { CheckCheck, Trash2, Bell, Inbox, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function NotificationsPage() {
  const { t, lang, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const { data: notifications = [], isLoading, refetch } = useGetNotificationsQuery();
  const { data: unreadData, refetch: refetchCount } = useGetUnreadNotificationsCountQuery();
  const [markAsRead, { isLoading: isMarking }] = useMarkNotificationAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAllNotifications, { isLoading: isDeletingAll }] = useDeleteAllNotificationsMutation();

  const unreadCount = typeof unreadData === "object" ? unreadData?.count : (unreadData ?? 0);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => n.read_at === null);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success(lang === "ar" ? "تم تحديد الإشعار كمقروء" : "Notification marked as read");
      refetch();
      refetchCount();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success(lang === "ar" ? "تم تحديد كل الإشعارات كمقروءة" : "All notifications marked as read");
      refetch();
      refetchCount();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success(lang === "ar" ? "تم حذف الإشعار" : "Notification deleted");
      refetch();
      refetchCount();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications().unwrap();
      toast.success(lang === "ar" ? "تم حذف كل الإشعارات" : "All notifications deleted");
      setShowConfirmDeleteAll(false);
      refetch();
      refetchCount();
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Failed to delete all notifications");
    }
  };

  const ar = (a: string, e: string) => (lang === "ar" ? a : e);

  const actions = (
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || isLoading}
          className="flex items-center gap-1.5"
        >
          <CheckCheck className="h-4 w-4" />
          {ar("تحديد الكل كمقروء", "Mark all as read")}
        </Button>
      )}
      {notifications.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowConfirmDeleteAll(true)}
          disabled={isDeletingAll || isLoading}
          className="flex items-center gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          {ar("حذف الكل", "Delete all")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title={ar("الإشعارات", "Notifications")}
        subtitle={ar(
          `إجمالي الإشعارات: ${notifications.length} · غير المقروءة: ${unreadCount}`,
          `Total Notifications: ${notifications.length} · Unread: ${unreadCount}`
        )}
        children={actions}
      />

      <div className="space-y-6 p-4 sm:p-6" dir={dir}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-[260px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                {ar("الكل", "All")}
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ms-1.5 px-1 py-0.2 text-[10px]">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                {ar("غير المقروءة", "Unread")}
                {unreadCount > 0 && (
                  <Badge variant="default" className="ms-1.5 px-1 py-0.2 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading && (
              <div className="flex py-24 items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground/60 mb-2">
                  <Inbox className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {ar("لا توجد إشعارات", "No notifications")}
                </h3>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  {activeTab === "unread"
                    ? ar("لقد قرأت جميع الإشعارات المتاحة بنجاح.", "You have successfully read all notifications.")
                    : ar("لا توجد إشعارات في سجل حسابك بعد.", "There are no notifications in your history yet.")}
                </p>
              </div>
            )}

            {!isLoading && filteredNotifications.length > 0 && (
              <div className="divide-y divide-border/60">
                {filteredNotifications.map((n) => {
                  const isRead = n.read_at !== null;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start justify-between gap-4 p-4 sm:p-5 transition-colors text-start",
                        !isRead && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className="flex gap-3 min-w-0">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5",
                            isRead
                              ? "bg-muted text-muted-foreground/60"
                              : "bg-primary/15 text-primary"
                          )}
                        >
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn("text-sm font-semibold text-foreground truncate", !isRead && "text-primary")}>
                              {lang === "ar" ? n.title : n.title_en}
                            </h4>
                            {!isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed break-words whitespace-pre-wrap max-w-2xl">
                            {lang === "ar" ? n.message : n.message_en}
                          </p>
                          <div className="text-[10px] text-muted-foreground font-medium pt-0.5">
                            {formatDateTime(n.created_at, lang)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={ar("تحديد كمقروء", "Mark as read")}
                            disabled={isMarking}
                            onClick={() => handleMarkAsRead(n.id)}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title={ar("حذف", "Delete")}
                          disabled={isDeleting}
                          onClick={() => handleDelete(n.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showConfirmDeleteAll}
        onOpenChange={setShowConfirmDeleteAll}
        title={ar("حذف جميع الإشعارات؟", "Delete all notifications?")}
        description={ar(
          "هل أنت متأكد من أنك تريد حذف جميع إشعاراتك بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.",
          "Are you sure you want to permanently delete all your notifications? This action cannot be undone."
        )}
        destructive
        onConfirm={handleDeleteAll}
      />
    </>
  );
}
