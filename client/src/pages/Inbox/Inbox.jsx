import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef(null);

  // Fetch inbox data from the API
  const { isLoading, error, performFetch, cancelFetch } = useFetch(
    `/messages/inbox?archived=${view === "archived"}`,
    (response) => {
      const convs = response.result || [];
      setConversations(convs);

      // Request initial online status for all contacts
      if (socketRef.current) {
        convs.forEach((c) => {
          if (c.otherUser?._id) {
            socketRef.current.emit("check_online_status", c.otherUser._id);
          }
        });
      }
    },
  );

  useEffect(() => {
    performFetch();
    return () => cancelFetch();
  }, [view]);

  // Socket Connection for Real-time Presence
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(window.location.origin);

    // Join personal room to receive status updates from any contact
    socketRef.current.emit("join_room", {
      userId: user._id,
      room: `user_${user._id}`,
    });

    socketRef.current.on("user_status_change", (data) => {
      setOnlineStatuses((prev) => ({
        ...prev,
        [data.userId]: data.status === "online",
      }));
    });

    socketRef.current.on("online_status_result", (data) => {
      setOnlineStatuses((prev) => ({
        ...prev,
        [data.userId]: data.isOnline,
      }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const handleArchive = async (e, room, currentStatus) => {
    e.stopPropagation(); // Prevent navigation to chat
    const newStatus = !currentStatus;
    try {
      const res = await fetch(`/api/messages/archive/${room}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) => prev.filter((c) => c.room !== room));
      }
    } catch (err) {
      console.error("Failed to update archive status:", err);
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
        // Local update to show the dot immediately
        setConversations((prev) =>
          prev.map((c) => (c.room === room ? { ...c, unreadCount: 1 } : c)),
        );
      }
    } catch (err) {
      console.error("Failed to mark as unread:", err);
    }
  };

  // Handle loading and error states
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
          conversations.map((conv) => (
            <div
              key={conv.room}
              className={styles.card}
              onClick={() =>
                navigate(
                  `/chat/${conv.listing?._id}?receiverId=${conv.otherUser?._id}`,
                )
              }
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
                <p className={styles.messagePreview}>
                  {conv.lastMessage?.content || "No message content"}
                </p>
                <span className={styles.timeStamp}>
                  {conv.lastMessage?.createdAt
                    ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;
