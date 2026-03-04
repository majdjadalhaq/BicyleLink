import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import { useSocket } from "../../hooks/useSocket";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [view, setView] = useState("active");
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [typingRooms, setTypingRooms] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionType, setSelectionType] = useState(null); // 'archive', 'delete', or null
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute: executeApi } = useApi();
  const socket = useSocket();

  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/messages/inbox?archived=${view === "archived"}`,
    (response) => {
      const convs = response.result || [];
      setConversations(convs);
      if (socket) {
        convs.forEach((c) => {
          if (c.otherUser?._id) {
            socket.emit("check_online_status", c.otherUser._id);
          }
        });
      }
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [view]);

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
      performFetch();
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

  const toggleRoomSelection = (room) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  };

  const handleMarkAllRead = async () => {
    const data = await executeApi("/api/messages/read-all", { method: "POST" });
    if (data?.success) {
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
    }
  };

  const handleBulkAction = async () => {
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
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.otherUser?.name?.toLowerCase().includes(q) ||
        conv.listing?.title?.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const formatTime = (dateStr) => {
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
  };

  const openChat = (conv) => {
    setConversations((prev) =>
      prev.map((c) => (c.room === conv.room ? { ...c, unreadCount: 0 } : c)),
    );
    const isWarning = conv.room.startsWith("admin-warning");
    const listingParam = isWarning ? "admin-warning" : conv.listing?._id;
    let chatUrl = `/chat/${listingParam}?receiverId=${conv.otherUser?._id}`;
    if (isWarning) chatUrl += `&room=${conv.room}`;
    navigate(chatUrl);
  };

  const totalUnread = conversations.reduce(
    (s, c) => s + (c.unreadCount || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Messages
          </h1>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} type="inbox" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-bold text-red-500">
            Failed to load conversations
          </p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-medium">
              {conversations.length} conversation
              {conversations.length !== 1 && "s"}
              {totalUnread > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[#10B77F]/10 text-[#10B77F] text-[10px] font-black uppercase tracking-wider border border-[#10B77F]/20">
                  {totalUnread} unread
                </span>
              )}
            </p>
          </div>

          {/* New Mark Al Read Button */}
          {totalUnread > 0 && selectionType === null && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B77F]/10 hover:bg-[#10B77F]/20 text-[#10B77F] rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-[#10B77F]/20"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* Search + View Switcher */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name or listing…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-white/5 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#10B77F] focus:ring-2 focus:ring-[#10B77F]/20 transition-all placeholder:text-gray-400"
              aria-label="Search conversations"
            />
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl self-start border border-gray-200 dark:border-white/5">
            {["active", "archived"].map((v) => (
              <button
                key={v}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  view === v
                    ? "bg-[#10B77F] text-white shadow-md shadow-[#10B77F]/20"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => {
                  setView(v);
                  setSelectionType(null);
                  setSelectedRooms(new Set());
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Archive Toggle */}
            {(selectionType === null || selectionType === "archive") && (
              <button
                onClick={() => {
                  setSelectionType((p) => (p === "archive" ? null : "archive"));
                  setSelectedRooms(new Set());
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  selectionType === "archive"
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500"
                }`}
              >
                {selectionType === "archive" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                )}
                {selectionType === "archive"
                  ? "Cancel"
                  : view === "active"
                    ? "Archive"
                    : "Unarchive"}
              </button>
            )}

            {/* Delete Toggle */}
            {(selectionType === null || selectionType === "delete") && (
              <button
                onClick={() => {
                  setSelectionType((p) => (p === "delete" ? null : "delete"));
                  setSelectedRooms(new Set());
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  selectionType === "delete"
                    ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20"
                    : "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/5 hover:border-red-500/30 hover:text-red-500"
                }`}
              >
                {selectionType === "delete" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                )}
                {selectionType === "delete" ? "Cancel" : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Selection Action Bar */}
        {selectionType && selectedRooms.size > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-[#1a1a1a] border border-emerald-500/20 rounded-3xl shadow-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/20">
                  {selectedRooms.size}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAction}
                  className={`px-6 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all ${
                    selectionType === "archive"
                      ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                      : "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                  }`}
                >
                  Confirm{" "}
                  {selectionType === "archive"
                    ? view === "active"
                      ? "Archive"
                      : "Unarchive"
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex flex-col gap-2">
          {filteredConversations.length === 0 ? (
            <div className="py-12 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5">
              <EmptyState
                title={
                  searchQuery
                    ? "No matching conversations"
                    : view === "active"
                      ? "Your inbox is clear"
                      : "No archived conversations"
                }
                message={
                  searchQuery
                    ? "Try a different search term."
                    : view === "active"
                      ? "Start by messaging a seller from a listing page."
                      : "Nothing archived yet."
                }
                icon={
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isTyping = typingRooms[conv.room];
              const isOnline = onlineStatuses[conv.otherUser?._id];
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv.room}
                  className={`group relative p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
                    selectedRooms.has(conv.room)
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg"
                      : hasUnread
                        ? "bg-[var(--bg-surface)] dark:bg-[#10221C] border-[#10B77F]/30 dark:border-[#10B77F]/40 shadow-[0_8px_30px_rgba(16,183,127,0.06)]"
                        : "bg-white dark:bg-[#10221C]/30 border-gray-100 dark:border-white/5 hover:border-[#10B77F]/20 hover:bg-[var(--bg-surface)] dark:hover:bg-[#10221C]/50 hover:shadow-md"
                  }`}
                  onClick={() =>
                    selectionType
                      ? toggleRoomSelection(conv.room)
                      : openChat(conv)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (selectionType
                      ? toggleRoomSelection(conv.room)
                      : openChat(conv))
                  }
                  aria-label={
                    selectionType
                      ? `Select conversation with ${conv.otherUser?.name || "User"}`
                      : `Open conversation with ${conv.otherUser?.name || "User"}`
                  }
                >
                  {/* Selection Indicator */}
                  {selectionType && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedRooms.has(conv.room)
                            ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20"
                            : "bg-white/50 dark:bg-black/20 border-gray-300 dark:border-white/20"
                        }`}
                      >
                        {selectedRooms.has(conv.room) && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Unread accent */}
                  {hasUnread && !selectionType && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#10B77F] rounded-r-full shadow-[0_0_12px_rgba(16,183,127,0.4)]" />
                  )}

                  <div
                    className={`flex items-center gap-4 transition-transform duration-300 ${selectionType ? "translate-x-8" : ""}`}
                  >
                    {/* Avatar (Left) */}
                    <div className="relative flex-shrink-0">
                      {conv.otherUser?.avatarUrl || conv.otherUser?.avatar ? (
                        <img
                          src={
                            conv.otherUser.avatarUrl || conv.otherUser.avatar
                          }
                          alt={conv.otherUser.name || "User"}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-[#10B77F]/20 group-hover:border-[#10B77F]/50 transition-colors drop-shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#10B77F]/10 dark:bg-[#10B77F]/5 border border-[#10B77F]/20 flex items-center justify-center text-[#10B77F] font-black text-xl shadow-inner">
                          {conv.otherUser?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <div
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1a1a1a] transition-colors ${
                          isOnline
                            ? "bg-emerald-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        title={isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    {/* Content (Center) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`text-sm truncate ${
                            hasUnread
                              ? "font-black text-gray-900 dark:text-white"
                              : "font-bold text-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {conv.otherUser?.name || "Unknown User"}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 ml-2 flex-shrink-0 tabular-nums">
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>

                      {conv.listing?.title && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate mb-1.5 font-black uppercase tracking-wider bg-emerald-500/5 dark:bg-emerald-500/10 self-start px-2 py-0.5 rounded-full border border-emerald-500/10">
                          {conv.listing.title}
                        </p>
                      )}

                      {isTyping ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {[0, 150, 300].map((delay) => (
                              <span
                                key={delay}
                                className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-emerald-500 font-bold italic">
                            typing
                          </span>
                        </div>
                      ) : (
                        <p
                          className={`text-xs truncate ${
                            hasUnread
                              ? "text-gray-700 dark:text-gray-300 font-semibold"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {conv.lastMessage?.mediaType === "image" ? (
                            <span className="flex items-center gap-1">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  ry="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              Photo
                            </span>
                          ) : conv.lastMessage?.mediaType === "location" ? (
                            <span className="flex items-center gap-1">
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              Location
                            </span>
                          ) : (
                            conv.lastMessage?.content || "No messages yet"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Listing Preview (Right) */}
                    {conv.listing?.images?.[0] && (
                      <div className="relative flex-shrink-0 ml-2">
                        <img
                          src={conv.listing.images[0]}
                          alt={conv.listing.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform duration-500"
                        />
                        {hasUnread && (
                          <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center px-1 shadow-glow-strong border-2 border-white dark:border-[#1a1a1a]">
                            <span className="text-[9px] font-black text-white">
                              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {!conv.listing?.images?.[0] && hasUnread && (
                      <div className="flex-shrink-0 min-w-[20px] h-[20px] rounded-full bg-emerald-500 flex items-center justify-center px-1 shadow-lg shadow-emerald-500/40">
                        <span className="text-[8px] font-black text-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions removed as per user request */}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
