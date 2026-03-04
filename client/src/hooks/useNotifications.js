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

  const itemsWithLink = context.notifications.map((n) => {
    if (n.type === "review_permission" && n.listingId) {
      return { ...n, link: `/listings/${n.listingId}/review` };
    }

    if (n.type === "new_review" && n.listingId) {
      return { ...n, link: `/listings/${n.listingId}` };
    }

    return n;
  });
  return {
    items: itemsWithLink,
    unread: context.unreadCount,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    refresh: context.refresh,
  };
}
