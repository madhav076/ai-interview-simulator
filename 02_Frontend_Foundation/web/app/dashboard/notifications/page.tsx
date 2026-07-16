"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardBody, Button, Spinner } from "@/components/ui";
import { Bell, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { getUserNotifications, markNotificationAsRead, NotificationRecord } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setNotifications(data.notifications || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Spinner size="medium" />
          <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">Syncing updates...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-slate-655 dark:text-zinc-400">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="ml-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Stay updated on your interview progress, results, and platform announcements.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <section className="mt-8 mb-8">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={`transition-all duration-300 ${
                  notification.isRead 
                    ? "opacity-60 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10" 
                    : "border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/5 dark:bg-indigo-950/5 ring-1 ring-indigo-500/5"
                }`}
              >
                <CardBody className="flex items-start sm:items-center justify-between p-5 gap-5">
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm ${notification.isRead ? "font-semibold text-slate-700 dark:text-zinc-300" : "font-extrabold text-slate-900 dark:text-zinc-100"}`}>
                      {notification.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${notification.isRead ? "text-slate-550 dark:text-zinc-400" : "text-slate-700 dark:text-zinc-300"}`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 font-medium">
                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : "N/A"}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="flex gap-1.5 items-center shrink-0 text-xs py-1.5 px-3"
                    >
                      <CheckCircle2 size={13} />
                      <span className="hidden sm:inline">Mark as Read</span>
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="py-12 text-center p-6 flex flex-col items-center">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-150">Inbox is empty</p>
              <p className="text-xs text-slate-450 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                You have no active notifications at this time. We will let you know when action is required.
              </p>
            </CardBody>
          </Card>
        )}
      </section>
    </DashboardLayout>
  );
}
