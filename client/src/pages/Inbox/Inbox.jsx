import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
import useApi from "../../hooks/useApi";
import { useSocket } from "../../hooks/useSocket";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import styles from "./Inbox.module.css";

/**
 * Inbox component displays a list of all active conversations for the logged-in user.
 * It shows the latest message and details about the listing and the other participant.
 */
const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [view, setView] = useState("active"); // 'active' or 'archived'
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const [typingRooms, setTypingRooms] = useState({}); // room -> bool
  const navigate = useNavigate();
  const { user } = useAuth();
  const { execute: executeApi } = useApi();
  const socket = useSocket();

  // Fetch inbox data from the API
  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/messages/inbox?archived=${view === "archived"}`,
    (response) => {
      const convs = response.result || [];
      setConversations(convs);

      // Request initial online status for all contacts
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

  // Join personal room for Inbox notifications
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
      // Re-fetch inbox so new messages immediately bubble to the top
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
      <div className={styles.container}>
        <h1 className={styles.title}>My Conversations</h1>
        <div className={styles.list}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} type="inbox" />
          ))}
        </div>
      </div>
    );
  }
  if (error)
    return <div className={styles.container}>Error loading chats: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Conversations</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${view === "active" ? styles.activeTab : ""}`}
          onClick={() => setView("active")}
        >
          Active
        </button>
        <button
          className={`${styles.tab} ${view === "archived" ? styles.activeTab : ""}`}
          onClick={() => setView("archived")}
        >
          Archived
        </button>
      </div>

      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.empty}>
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
                className={`${styles.card} ${conv.unreadCount > 0 ? styles.unreadCard : ""}`}
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
                <div className={styles.cardHeader}>
                  <div className={styles.listingInfo}>
                    {conv.unreadCount > 0 && (
                      <div className={styles.unreadDot} title="Unread" />
                    )}
                    <div className={styles.imageWrapper}>
                      <img
                        src={conv.listing?.images?.[0] || "/placeholder.png"}
                        alt={conv.listing?.title || "Listing"}
                        className={styles.listingImage}
                      />
                      <div
                        className={`${styles.presenceDot} ${
                          onlineStatuses[conv.otherUser?._id]
                            ? styles.online
                            : styles.offline
                        }`}
                        title={
                          onlineStatuses[conv.otherUser?._id]
                            ? "Online"
                            : "Offline"
                        }
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <h3 className={styles.otherUserName}>
                        {conv.otherUser?.name || "Unknown User"}
                      </h3>
                      <p className={styles.listingTitle}>
                        {conv.listing?.title || "Untitled Listing"}
                      </p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.unreadButton}
                      onClick={(e) => handleMarkUnread(e, conv.room)}
                      title="Mark as Unread"
                    >
                      🔵
                    </button>
                    <button
                      className={styles.archiveButton}
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

                <div className={styles.lastMessage}>
                  {isTyping ? (
                    <p className={styles.typingText}>Typing...</p>
                  ) : (
                    <>
                      <p className={styles.messagePreview}>
                        {conv.lastMessage?.mediaType === "image"
                          ? "🖼️ Image"
                          : conv.lastMessage?.mediaType === "location"
                            ? "📍 Location"
                            : conv.lastMessage?.content || "No message content"}
                      </p>
                      <span className={styles.timeStamp}>
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
