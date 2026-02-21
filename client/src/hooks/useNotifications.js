import { useMemo, useState } from "react";

const MOCK = [
  {
    id: "n1",
    type: "message",
    title: "New message",
    body: "New message received",
    link: "/inbox",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "n2",
    type: "favorite",
    title: "Added to favorites",
    body: "Someone added your listing to favorites",
    link: "/my-listings",
    read: true,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
];

export default function useNotifications(user) {
  const [overrides, setOverrides] = useState({}); // store read status changes

  const items = useMemo(() => {
    if (!user) return [];
    return MOCK.map((n) =>
      overrides[n.id] ? { ...n, ...overrides[n.id] } : n,
    );
  }, [user, overrides]);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAsRead = (id) => {
    setOverrides((prev) => ({ ...prev, [id]: { read: true } }));
  };

  return { items, unread, markAsRead };
}
