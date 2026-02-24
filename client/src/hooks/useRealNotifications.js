import { useState, useEffect, useMemo } from "react";
import axios from "axios";

/**
 * Custom hook to manage real notifications from the backend.
 * Works independently from the MOCK-based hook.
 */
export default function useRealNotifications(user) {
  // State to store notifications fetched from the backend
  const [notifications, setNotifications] = useState([]);

  // State to store local overrides, e.g., marking a notification as read
  const [overrides, setOverrides] = useState({});

  // Fetch notifications whenever a user is present
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications", {
          withCredentials: true,
        });

        if (res.data.success) {
          setNotifications(res.data.result); // Save backend notifications
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Merge backend notifications with any local overrides (like read status)
  const items = useMemo(() => {
    if (!user) return [];
    return notifications.map((n) =>
      overrides[n._id] ? { ...n, ...overrides[n._id] } : n,
    );
  }, [user, notifications, overrides]);

  // Count unread notifications
  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // Mark a notification as read locally and update backend
  const markAsRead = (id) => {
    setOverrides((prev) => ({ ...prev, [id]: { read: true } }));

    // Update the backend so it persists
    axios
      .patch(`/api/notifications/${id}/read`, {}, { withCredentials: true })
      .catch(console.error);
  };

  // Return notifications, unread count, and markAsRead function
  return { items, unread, markAsRead };
}
