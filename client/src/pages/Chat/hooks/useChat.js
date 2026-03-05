import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { uploadToCloudinary } from "../../../utils/cloudinary";

const useChat = (listingId, user, receiverId, roomParam) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [listing, setListing] = useState(null);
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

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sellerId = receiverId?._id || receiverId;

  const isAdminWarning =
    listingId === "admin-warning" || roomParam?.startsWith("admin-warning");
  const room = isAdminWarning
    ? roomParam || `admin-warning-${user?._id}`
    : `${listingId}_${[user?._id, sellerId].sort().join("_")}`;

  // Fetch History and Listing
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
    } else {
      fetch(`/api/listings/${listingId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setListing(data.result);
        })
        .catch((err) => console.error("Failed to load listing:", err));
    }
  }, [room, user, listingId, isAdminWarning]);

  // Socket
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(window.location.origin);
    socketRef.current.emit("join_room", { room, userId: user._id });
    socketRef.current.emit("check_online_status", sellerId);

    // Sync 'mark as read' state app-wide instantly on entry
    socketRef.current.emit("read_room", { room, userId: user._id });

    socketRef.current.on("receive_message", (message) => {
      if (message.room === room) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("typing_status", (data) => {
      if (data.userId !== user._id && data.room === room) {
        setIsOtherTyping(data.isTyping);
      }
    });

    socketRef.current.on("user_status_change", (data) => {
      if (data.userId === sellerId) setIsOnline(data.status === "online");
    });

    socketRef.current.on("online_status_result", (data) => {
      if (data.userId === sellerId) setIsOnline(data.isOnline);
    });

    socketRef.current.on("message_updated", (updatedMessage) => {
      if (updatedMessage.room === room) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
        );
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [room, user, sellerId]);

  const handleTyping = useCallback(() => {
    if (!socketRef.current || !user || !room) return;
    socketRef.current.emit("typing", { room, userId: user._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", { room, userId: user._id });
    }, 3000);
  }, [user, room]);

  const handleSendMessage = useCallback(
    (content, extras = {}) => {
      if (!user || (!content.trim() && !extras.mediaUrl && !extras.location))
        return;

      const messageData = {
        room,
        senderId: user._id,
        receiverId: sellerId,
        listingId,
        content,
        ...extras,
      };

      socketRef.current.emit("send_message", messageData);
      socketRef.current.emit("stop_typing", { room, userId: user._id });
      setNewMessage("");
      setIsMenuOpen(false);
    },
    [user, room, sellerId, listingId],
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
        // Emit socket event for real-time update
        socketRef.current.emit("edit_message", data.result);
      }
    } catch (err) {
      console.error("Failed to edit message:", err);
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
  };
};

export default useChat;
