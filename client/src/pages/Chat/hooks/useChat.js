import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "../../../hooks/useSocket";
import { uploadToCloudinary } from "../../../utils/cloudinary";

const useChat = (listingId, user, receiverId, roomParam) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [listing, setListing] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Use the global socket from SocketProvider — no second connection created here
  const socket = useSocket();
  const typingTimeoutRef = useRef(null);
  const sellerId = receiverId?._id || receiverId;

  const isAdminWarning =
    listingId === "admin-warning" || roomParam?.startsWith("admin-warning");
  const room = isAdminWarning
    ? roomParam || `admin-warning-${user?._id}`
    : `${listingId}_${[user?._id, sellerId].sort().join("_")}`;

  // Fetch message history and listing data
  useEffect(() => {
    if (!room || !user) return;

    fetch(`/api/messages/${room}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.result);
      })
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setIsLoadingHistory(false));

    if (isAdminWarning) {
      setListing({
        _id: "system",
        title: "Administrator Warning",
        images: [
          "https://placehold.co/400x400/6a1b9a/ffffff?text=System+Notice",
        ],
      });
      setOtherUserName("System");
    } else {
      fetch(`/api/listings/${listingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setListing(data.result);
            // Derive other user's name from the listing's seller info
            const seller = data.result?.sellerId;
            if (seller && (seller._id || seller) !== user._id) {
              setOtherUserName(seller.name || "");
            }
          }
        })
        .catch((err) => console.error("Failed to load listing:", err));

      // If the current user is the seller, fetch the buyer/receiver profile
      if (sellerId && sellerId !== user._id) {
        fetch(`/api/users/${sellerId}/profile`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.user?.name) {
              setOtherUserName((prev) => prev || data.user.name);
            }
          })
          .catch(() => {});
      }
    }
  }, [room, user, listingId, isAdminWarning, sellerId]);

  // Attach socket event listeners to the global socket
  useEffect(() => {
    if (!socket || !user || !room) return;

    socket.emit("join_room", { room, userId: user._id });
    socket.emit("check_online_status", sellerId);

    const onReceiveMessage = (message) => {
      if (message.room === room) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onTypingStatus = (data) => {
      if (data.userId !== user._id && data.room === room) {
        setIsOtherTyping(data.isTyping);
      }
    };

    const onUserStatusChange = (data) => {
      if (data.userId === sellerId) setIsOnline(data.status === "online");
    };

    const onOnlineStatusResult = (data) => {
      if (data.userId === sellerId) setIsOnline(data.isOnline);
    };

    const onMessageUpdated = (updatedMessage) => {
      if (updatedMessage.room === room) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
        );
      }
    };

    const onMessageDeleted = (deletedId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === deletedId ? { ...m, isDeleted: true, content: "" } : m,
        ),
      );
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_status", onTypingStatus);
    socket.on("user_status_change", onUserStatusChange);
    socket.on("online_status_result", onOnlineStatusResult);
    socket.on("message_updated", onMessageUpdated);
    socket.on("message_deleted", onMessageDeleted);

    return () => {
      // Remove listeners only — do NOT disconnect the global socket
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_status", onTypingStatus);
      socket.off("user_status_change", onUserStatusChange);
      socket.off("online_status_result", onOnlineStatusResult);
      socket.off("message_updated", onMessageUpdated);
      socket.off("message_deleted", onMessageDeleted);
    };
  }, [socket, room, user, sellerId]);

  const handleTyping = useCallback(() => {
    if (!socket || !user || !room) return;
    socket.emit("typing", { room, userId: user._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room, userId: user._id });
    }, 3000);
  }, [socket, user, room]);

  const handleSendMessage = useCallback(
    (content, extras = {}) => {
      if (
        !socket ||
        !user ||
        (!content.trim() && !extras.mediaUrl && !extras.location)
      )
        return;

      const messageData = {
        room,
        senderId: user._id,
        receiverId: sellerId,
        listingId,
        content,
        ...extras,
      };

      socket.emit("send_message", messageData);
      socket.emit("stop_typing", { room, userId: user._id });
      setNewMessage("");
      setIsMenuOpen(false);
    },
    [socket, user, room, sellerId, listingId],
  );

  const handleScroll = useCallback(() => {
    if (isFetchingMore || !hasMore || messages.length === 0) return;
    const oldestMessageTime = messages[0]?.createdAt;
    if (!oldestMessageTime) return;

    setIsFetchingMore(true);
    fetch(`/api/messages/${room}?before=${oldestMessageTime}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.result.length === 0) setHasMore(false);
          else setMessages((prev) => [...data.result, ...prev]);
        }
      })
      .catch((err) => console.error("Failed to load more messages:", err))
      .finally(() => setIsFetchingMore(false));
  }, [messages, room, isFetchingMore, hasMore]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const secureUrl = await uploadToCloudinary(file);
      const optimizedUrl = secureUrl.replace(
        "/upload/",
        "/upload/w_800,c_limit,q_auto,f_auto/",
      );
      handleSendMessage("[Image]", {
        mediaUrl: optimizedUrl,
        mediaType: "image",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    if (!newContent.trim()) return;
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? data.result : m)),
        );
        socket?.emit("edit_message", data.result);
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/message`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, isDeleted: true, content: "" } : m,
          ),
        );
        socket?.emit("delete_message", { messageId, room });
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setIsLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let shortAddress = "Shared Location";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          if (res.ok) {
            const data = await res.json();
            const parts = data?.address || {};
            shortAddress =
              parts.road || parts.suburb || parts.city || "Current Location";
          }
        } catch (err) {
          console.error(err);
        }
        handleSendMessage(`[Location: ${shortAddress}]`, {
          mediaType: "location",
          location: { lat: latitude, lng: longitude, address: shortAddress },
        });
        setIsLocationLoading(false);
      },
      () => {
        alert("Unable to retrieve location");
        setIsLocationLoading(false);
      },
    );
  };

  const handleCopyUsername = (username) => {
    navigator.clipboard.writeText(username).then(() => {
      setCopyFeedback(username);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    listing,
    otherUserName,
    isLoadingHistory,
    isOtherTyping,
    isOnline,
    isFetchingMore,
    handleTyping,
    handleSendMessage,
    handleScroll,
    handleImageUpload,
    handleSendLocation,
    handleCopyUsername,
    copyFeedback,
    isMenuOpen,
    setIsMenuOpen,
    isUploading,
    uploadProgress,
    isLocationLoading,
    selectedImageUrl,
    setSelectedImageUrl,
    isAdminWarning,
    handleEditMessage,
    handleDeleteMessage,
  };
};

export default useChat;
