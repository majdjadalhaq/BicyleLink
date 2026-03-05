import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import useApi from "../../../hooks/useApi";
import { useSocket } from "../../../hooks/useSocket";

export const useInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [view, setView] = useState("active");
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [typingRooms, setTypingRooms] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionType, setSelectionType] = useState(null); // 'archive', 'delete', or null
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute: executeApi } = useApi();
  const socket = useSocket();

  const handleResponse = useCallback(
    (response) => {
      const convs = response.result || [];
      setConversations(convs);
      setIsInitialLoading(false);
      setIsRefreshing(false);
      if (socket) {
        convs.forEach((c) => {
          if (c.otherUser?._id) {
            socket.emit("check_online_status", c.otherUser._id);
          }
        });
      }
    },
    [socket],
  );
  const { error, performFetch, cancelFetch } = useFetch(
    `/messages/inbox?archived=${view === "archived"}`,
    handleResponse,
  );

  const refreshInbox = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const data = await executeApi(
      `/api/messages/inbox?archived=${view === "archived"}`,
    );
    if (data?.success) {
      handleResponse(data);
    } else {
      setIsRefreshing(false);
    }
  }, [view, executeApi, handleResponse, isRefreshing]);

  const handleSetView = useCallback(
    (newView) => {
      if (newView === view) return;
      setIsInitialLoading(true);
      setConversations([]);
      setView(newView);
    },
    [view],
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [performFetch, cancelFetch]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join_room", { userId: user._id, room: `user_${user._id}` });

    socket.on("user_status_change", (data) => {
      setOnlineStatuses((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }));
    });
    socket.on("receive_message", () => {
      refreshInbox();
    });
    socket.on("online_status_result", (data) => {
      setOnlineStatuses((prev) => ({ ...prev, [data.userId]: data.isOnline }));
    });
    socket.on("typing_status", (data) => {
      if (data.userId !== user._id) {
        setTypingRooms((prev) => ({ ...prev, [data.room]: data.isTyping }));
      }
    });

    return () => {
      socket.off("user_status_change");
      socket.off("online_status_result");
      socket.off("typing_status");
      socket.off("receive_message");
    };
  }, [socket, user?._id, performFetch]);

  const toggleRoomSelection = useCallback((room) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    const data = await executeApi("/api/messages/read-all", { method: "POST" });
    if (data?.success) {
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
    }
  }, [executeApi]);

  const handleBulkAction = useCallback(async () => {
    const actionType = selectionType;
    const rooms = Array.from(selectedRooms);
    if (rooms.length === 0) return;

    const promises = rooms.map((room) => {
      if (actionType === "delete") {
        return executeApi(`/api/messages/${room}`, { method: "DELETE" });
      } else {
        return executeApi(`/api/messages/archive/${room}`, {
          method: "POST",
          body: { status: view === "active" },
        });
      }
    });

    const results = await Promise.all(promises);
    const successfulRooms = rooms.filter((_, i) => results[i]?.success);

    setConversations((prev) =>
      prev.filter((c) => !successfulRooms.includes(c.room)),
    );
    setSelectedRooms(new Set());
    setSelectionType(null);
  }, [selectedRooms, selectionType, view, executeApi]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.otherUser?.name?.toLowerCase().includes(q) ||
        conv.listing?.title?.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const formatTime = useCallback((dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  }, []);

  const openChat = useCallback(
    (conv) => {
      setConversations((prev) =>
        prev.map((c) => (c.room === conv.room ? { ...c, unreadCount: 0 } : c)),
      );
      const isWarning = conv.room.startsWith("admin-warning");
      const listingParam = isWarning ? "admin-warning" : conv.listing?._id;
      let chatUrl = `/chat/${listingParam}?receiverId=${conv.otherUser?._id}`;
      if (isWarning) chatUrl += `&room=${conv.room}`;
      navigate(chatUrl);
    },
    [navigate],
  );

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadCount || 0), 0),
    [conversations],
  );

  return {
    conversations,
    view,
    setView: handleSetView,
    onlineStatuses,
    typingRooms,
    searchQuery,
    setSearchQuery,
    selectionType,
    setSelectionType,
    selectedRooms,
    setSelectedRooms,
    isLoading: isInitialLoading,
    isRefreshing,
    error,
    toggleRoomSelection,
    handleMarkAllRead,
    handleBulkAction,
    filteredConversations,
    formatTime,
    openChat,
    totalUnread,
  };
};
