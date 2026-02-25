import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import { useSocket } from "../../hooks/useSocket";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [view, setView] = useState("active");
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [typingRooms, setTypingRooms] = useState({});
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

    socket.emit("join_room", {
      userId: user._id,
      room: `user_${user._id}`,
    });

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
      setOnlineStatuses((prev) => ({
        ...prev,
        [data.userId]: data.isOnline,
      }));
    });

    socket.on("typing_status", (data) => {
      if (data.userId !== user._id) {
        setTypingRooms((prev) => ({
          ...prev,
          [data.room]: data.isTyping,
        }));
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
    const newStatus = !currentStatus;
    const data = await executeApi(`/api/messages/archive/${room}`, {
      method: "POST",
      body: { status: newStatus },
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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My Conversations
        </h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} type="inbox" />
          ))}
        </div>
      </div>
    );
  }
  if (error)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-red-500">
        Error loading chats: {error}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-light-bg dark:bg-dark-bg min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Conversations
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl w-fit">
        <button
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === "active" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
          onClick={() => setView("active")}
        >
          Active
        </button>
        <button
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${view === "archived" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}
          onClick={() => setView("archived")}
        >
          Archived
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            {view === "active"
              ? "No active conversations yet"
              : "No archived conversations"}
          </div>
        ) : (
          conversations.map((conv) => {
            const isTyping = typingRooms[conv.room];
            return (
              <div
                key={conv.room}
                className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${conv.unreadCount > 0 ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10" : "bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"}`}
                onClick={() => {
                  const isWarning = conv.room.startsWith("admin-warning");
                  const listingParam = isWarning
                    ? "admin-warning"
                    : conv.listing?._id;
                  let chatUrl = `/chat/${listingParam}?receiverId=${conv.otherUser?._id}`;
                  if (isWarning) chatUrl += `&room=${conv.room}`;
                  navigate(chatUrl);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {conv.unreadCount > 0 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    )}
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.listing?.images?.[0] || "/placeholder.png"}
                        alt={conv.listing?.title || "Listing"}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-light-surface dark:border-dark-surface ${onlineStatuses[conv.otherUser?._id] ? "bg-emerald-500" : "bg-gray-400"}`}
                        title={
                          onlineStatuses[conv.otherUser?._id]
                            ? "Online"
                            : "Offline"
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {conv.otherUser?.name || "Unknown User"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.listing?.title || "Untitled Listing"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="btn-icon w-8 h-8 text-sm"
                      onClick={(e) => handleMarkUnread(e, conv.room)}
                      title="Mark as Unread"
                    >
                      🔵
                    </button>
                    <button
                      className="btn-icon w-8 h-8 text-sm"
                      onClick={(e) =>
                        handleArchive(e, conv.room, view === "archived")
                      }
                      title={
                        view === "active"
                          ? "Archive Conversation"
                          : "Unarchive Conversation"
                      }
                    >
                      {view === "active" ? "📥" : "📤"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pl-2">
                  {isTyping ? (
                    <p className="text-xs text-emerald-500 italic animate-pulse">
                      Typing...
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 mr-2">
                        {conv.lastMessage?.mediaType === "image"
                          ? "🖼️ Image"
                          : conv.lastMessage?.mediaType === "location"
                            ? "📍 Location"
                            : conv.lastMessage?.content || "No message content"}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {conv.lastMessage?.createdAt
                          ? new Date(
                              conv.lastMessage.createdAt,
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Inbox;
