import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { NotificationContext } from "./NotificationContextRegistry";
import useApi from "../hooks/useApi";
import { useSocket } from "../hooks/useSocket";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const { execute } = useApi();
  const socket = useSocket();
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await execute("/api/notifications");
      if (data?.success) {
        setItems(data.result);
      }
    } catch {
      // Silence errors
    }
  }, [user, execute]);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const data = await execute("/api/notifications/unread-count");
      if (data?.success) {
        setUnread(data.result);
      }
    } catch {
      // Silence errors
    }
  }, [user, execute]);

  const initialLoadRef = useRef(false);

  // Initial load
  // Fixed: always call fetchNotifications safely
  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setItems([]);
        setUnread(0);
      });
      return;
    }

    let isMounted = true;

    async function loadData() {
      if (user && isMounted && !initialLoadRef.current) {
        initialLoadRef.current = true;
        await fetchNotifications();
        await fetchUnread();
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, fetchNotifications, fetchUnread]);
  // Handle logout/reset
  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setItems([]);
        setUnread(0);
      });
    }
  }, [user]);

  // Socket listener
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notification) => {
      setItems((prev) => [notification, ...prev]);
      if (!notification.read) {
        setUnread((prev) => prev + 1);
      }
    };

    // Join personal room for real-time notifications
    socket.emit("join_room", { userId: user._id, room: `user_${user._id}` });

    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, user, showToast]);

  const markAsRead = useCallback(
    (id) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnread((prev) => Math.max(prev - 1, 0));

      // Fire and forget API call
      execute(`/api/notifications/${id}/read`, {
        method: "PATCH",
      }).catch(() => {
        // Handle failure if needed, though rare
      });
    },
    [execute],
  );

  const markAllAsRead = useCallback(async () => {
    const data = await execute("/api/notifications/read-all", {
      method: "PATCH",
    });
    if (data?.success) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    }
  }, [execute]);

  const value = useMemo(
    () => ({
      notifications: items,
      unreadCount: unread,
      markAsRead,
      markAllAsRead,
      refresh: fetchNotifications,
    }),
    [items, unread, markAsRead, markAllAsRead, fetchNotifications],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
