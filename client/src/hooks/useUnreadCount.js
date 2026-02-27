import { useState, useEffect, useRef } from "react";
import { useSocket } from "./useSocket";

/**
 * Custom hook that polls the server for the current user's unread message count.
 * Returns the unread count as a number (0 when not logged in or on error).
 *
 * @param {object|null} user - The currently authenticated user (null when logged out).
 * @param {number} [intervalMs=30000] - How often (in ms) to re-poll.
 */
const useUnreadCount = (user, intervalMs = 30000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // No user → nothing to fetch
    if (!user) {
      setUnreadCount(0);
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/messages/unread-total", {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) return; // Silently ignore auth errors
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) setUnreadCount(data.result);
      } catch (err) {
        if (err.name !== "AbortError") {
          // Silently fail — unread count is non-critical
        }
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, intervalMs);

    if (socket && user) {
      socket.emit("join_room", { userId: user._id, room: `user_${user._id}` });
      socket.on("receive_message", fetchCount);
      socket.on("messages_read", () => {
        // If we get a signal that messages were read in a room, refresh the total
        fetchCount();
      });
    }

    return () => {
      clearInterval(id);
      if (socket) {
        socket.off("receive_message", fetchCount);
      }
    };
  }, [user, intervalMs, socket]);

  return unreadCount;
};

export default useUnreadCount;
