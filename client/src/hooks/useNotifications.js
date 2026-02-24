import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContextRegistry";

export default function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return safe defaults if outside provider
    return {
      items: [],
      unread: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      refresh: () => {},
    };
  }

  return {
    items: context.notifications,
    unread: context.unreadCount,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    refresh: context.refresh,
  };
}
