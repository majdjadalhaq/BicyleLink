import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleArchive = async (e, room, currentStatus) => {
    e.stopPropagation();
    const data = await executeApi(`/api/messages/archive/${room}`, {
      method: "POST",
      body: { status: !currentStatus },
    });
    if (data?.success) {
      setConversations((prev) => prev.filter((c) => c.room !== room));
    }
  };

  const handleMarkUnread = async (e, room) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/messages/unread/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) => (c.room === room ? { ...c, unreadCount: 1 } : c)),
        );
      }
    } catch (err) {
      console.error("Failed to mark as unread:", err);
    }
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
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                  {totalUnread} unread
                </span>
              )}
            </p>
          </div>
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
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400"
              aria-label="Search conversations"
            />
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl self-start border border-gray-200 dark:border-white/5">
            {["active", "archived"].map((v) => (
              <button
                key={v}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  view === v
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

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
                  className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    hasUnread
                      ? "bg-white dark:bg-[#1e1e1e] border-emerald-200/60 dark:border-emerald-500/20 shadow-sm"
                      : "bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-white/5 hover:border-emerald-200/60 dark:hover:border-white/10"
                  }`}
                  onClick={() => openChat(conv)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openChat(conv)}
                  aria-label={`Open conversation with ${conv.otherUser?.name || "User"}`}
                >
                  {/* Unread accent */}
                  {hasUnread && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-500 rounded-r-full" />
                  )}

                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-13 h-13 w-[52px] h-[52px] rounded-2xl overflow-hidden bg-emerald-500/10 border border-gray-100 dark:border-white/5">
                        {conv.otherUser?.avatarUrl ||
                        conv.listing?.images?.[0] ? (
                          <img
                            src={
                              conv.otherUser?.avatarUrl ||
                              conv.listing?.images?.[0]
                            }
                            alt={conv.otherUser?.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-500 font-black text-lg">
                            {conv.otherUser?.name?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1a1a1a] transition-colors ${
                          isOnline
                            ? "bg-emerald-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        title={isOnline ? "Online" : "Offline"}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`text-sm truncate ${
                            hasUnread
                              ? "font-black text-gray-900 dark:text-white"
                              : "font-bold text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {conv.otherUser?.name || "Unknown User"}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 ml-2 flex-shrink-0 tabular-nums">
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>

                      {conv.listing?.title && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mb-1 font-bold uppercase tracking-wider">
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

                    {/* Unread count */}
                    {hasUnread && (
                      <div className="flex-shrink-0 min-w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center px-1 shadow-md shadow-emerald-500/30">
                        <span className="text-[9px] font-black text-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-3.5 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                    <button
                      className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all border border-transparent hover:border-emerald-400/30"
                      onClick={(e) => handleMarkUnread(e, conv.room)}
                      title="Mark as Unread"
                      aria-label="Mark as Unread"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l1.12-1.15a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </button>
                    <button
                      className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all border border-transparent hover:border-emerald-400/30"
                      onClick={(e) =>
                        handleArchive(e, conv.room, view === "archived")
                      }
                      title={view === "active" ? "Archive" : "Unarchive"}
                      aria-label={
                        view === "active"
                          ? "Archive conversation"
                          : "Unarchive conversation"
                      }
                    >
                      {view === "active" ? (
                        <svg
                          width="12"
                          height="12"
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
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="21 8 21 21 3 21 3 8" />
                          <rect x="1" y="3" width="22" height="5" />
                          <polyline points="10 12 12 10 14 12" />
                          <line x1="12" y1="10" x2="12" y2="16" />
                        </svg>
                      )}
                    </button>
                  </div>
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
