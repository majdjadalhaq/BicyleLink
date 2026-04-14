import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";

/**
 * Headless component that syncs Socket.io events with the TanStack Query cache.
 * Handles real-time notifications and unread message counts.
 */
export const NotificationSocketSync = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !user?._id) return;

    // Join the user's personal notification room
    socket.emit("join_room", { userId: user._id, room: `user_${user._id}` });

    const handleNewNotification = (notification) => {
      // 1. Update notification list cache
      queryClient.setQueryData(["notifications"], (prev) => {
        if (!prev) return [notification];
        // Prevent duplicates
        if (prev.some(n => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });

      // 2. Increment unread count if applicable
      if (!notification.read) {
        queryClient.setQueryData(["notifications", "unread-count"], (prev) => (prev || 0) + 1);
      }
    };

    const handleSync = () => {
      // Invalidate queries to trigger a fresh fetch from the server
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    const handleNewMessage = (msg) => {
      if (msg && msg.receiverId === user._id) {
        queryClient.setQueryData(["messages", "unread-total"], (prev) => (prev || 0) + 1);
      }
    };

    // Listen for events
    socket.on("new_notification", handleNewNotification);
    socket.on("notifications_updated", handleSync);
    socket.on("messages_read", handleSync);
    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notifications_updated", handleSync);
      socket.off("messages_read", handleSync);
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, user?._id, queryClient]);

  return null;
};
