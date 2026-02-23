import { useEffect, useState, useCallback } from "react";
import useApi from "./useApi";
import { useSocket } from "./useSocket";

export default function useNotifications(user) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const { execute } = useApi();
  const socket = useSocket();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const data = await execute("/api/notifications");
    if (data?.success) {
      setItems(data.result);
    }
  }, [user, execute]);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const data = await execute("/api/notifications/unread-count");
    if (data?.success) {
      setUnread(data.result);
    }
  }, [user, execute]);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchNotifications();
        await fetchUnread();
      } else {
        setItems([]);
        setUnread(0);
      }
    };
    loadData();
  }, [user, fetchNotifications, fetchUnread]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notification) => {
      setItems((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnread((prev) => prev + 1);
      }
    };

    socket.on("new_notification", handleNewNotification);
    return () => socket.off("new_notification", handleNewNotification);
  }, [socket, user]);

  const markAsRead = useCallback(
    async (id) => {
      const data = await execute(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (data?.success) {
        setItems((prev) =>
          prev.map((n) => (n._id === id ? { ...n, _id: id, read: true } : n)),
        );
        setUnread((prev) => Math.max(prev - 1, 0));
      }
    },
    [execute],
  );

  return { items, unread, markAsRead, refresh: fetchNotifications };
}
