import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../../hooks/useAuth";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../util/config";
import styles from "./Chat.module.css";

/**
 * Chat component handles real-time messaging between users.
 * It uses Socket.io for live updates and fetches message history on mount.
 */
const Chat = () => {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [listing, setListing] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // New state for media sharing
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null); // For fullscreen preview
  const [uploadProgress, setUploadProgress] = useState(0);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Generate a unique room ID based on listing and both participant IDs
  const sellerId = receiverId?._id || receiverId;
  const room = `${listingId}_${[user?._id, sellerId].sort().join("_")}`;

  // 1. Fetch Chat History and Listing Details from the server
  useEffect(() => {
    if (!room || !user) return;

    // Fetch history
    fetch(`/api/messages/${room}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setMessages(data.result);
        }
      })
      .catch((err) => console.error("Failed to load history:", err))
      .finally(() => setIsLoadingHistory(false));

    // Fetch listing info for header context
    fetch(`/api/listings/${listingId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setListing(data.result);
        }
      })
      .catch((err) => console.error("Failed to load listing:", err));
  }, [room, user, listingId]);

  // 2. Initialize Socket Connection and Listeners
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(window.location.origin);
    socketRef.current.emit("join_room", { room, userId: user._id });
    socketRef.current.emit("check_online_status", sellerId);

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("typing_status", (data) => {
      if (data.userId !== user._id && data.room === room) {
        setIsOtherTyping(data.isTyping);
      }
    });

    socketRef.current.on("user_status_change", (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.status === "online");
      }
    });

    socketRef.current.on("online_status_result", (data) => {
      if (data.userId === sellerId) {
        setIsOnline(data.isOnline);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [room, user, sellerId]);

  // 3. Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!socketRef.current || !user || !room) return;
    socketRef.current.emit("typing", { room, userId: user._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", { room, userId: user._id });
    }, 3000);
  };

  const handleScroll = () => {
    if (!containerRef.current || isFetchingMore || !hasMore) return;
    if (containerRef.current.scrollTop === 0) {
      setIsFetchingMore(true);
      const oldestMessageTime = messages[0]?.createdAt;
      fetch(`/api/messages/${room}?before=${oldestMessageTime}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.result.length === 0) {
              setHasMore(false);
            } else {
              setMessages((prev) => [...data.result, ...prev]);
            }
          }
        })
        .catch((err) => console.error("Failed to load more messages:", err))
        .finally(() => setIsFetchingMore(false));
    }
  };

  const handleSendMessage = (content, extras = {}) => {
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
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Start progress
    setIsMenuOpen(false);

    try {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Using Fetch for now, simulating progress since native fetch doesn't support progress events
      // For real progress we usually use Axios or XHR
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const response = await fetch(url, { method: "POST", body: data });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error("Image upload failed");
      const json = await response.json();

      // Cloudinary Optimization: Add transformation parameters to the URL
      // w_800: limit width to 800px
      // c_limit: scale down if larger
      // q_auto, f_auto: optimize quality and format
      const optimizedUrl = json.secure_url.replace(
        "/upload/",
        "/upload/w_800,c_limit,q_auto,f_auto/",
      );

      handleSendMessage("[Image]", {
        mediaUrl: optimizedUrl,
        mediaType: "image",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please check your connection.");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationLoading(true);
    setIsMenuOpen(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address = "Unknown Location";
        let shortAddress = "Shared Location";

        try {
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          if (res.ok) {
            const data = await res.json();
            address = data.display_name;
            // Extract the most relevant part (e.g., street or suburb)
            const parts = data.address;
            shortAddress =
              parts.road ||
              parts.suburb ||
              parts.city ||
              parts.town ||
              "Current Location";
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
        }

        handleSendMessage(`[Location: ${shortAddress}]`, {
          mediaType: "location",
          location: {
            lat: latitude,
            lng: longitude,
            address: address,
          },
        });
        setIsLocationLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location");
        setIsLocationLoading(false);
      },
    );
  };

  const handleCopyUsername = (username) => {
    if (!username) return;
    navigator.clipboard.writeText(username).then(() => {
      setCopyFeedback(username);
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const handleBack = () => {
    navigate("/inbox");
  };

  if (!user) {
    return (
      <div className={styles.chatError}>
        <p>Please log in to chat.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  let displayPrice = listing?.price;
  if (listing?.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <header className={styles.chatHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          ←
        </button>
        <div className={styles.headerInfo}>
          <h2 className={styles.chatTitle}>
            {listing?.title || "Chat"}
            <span
              className={isOnline ? styles.onlineDot : styles.offlineDot}
            ></span>
          </h2>
          {displayPrice && (
            <span className={styles.listingPrice}>€{displayPrice}</span>
          )}
        </div>
      </header>

      <div className={styles.messagesContainer} onScroll={handleScroll}>
        {isFetchingMore && (
          <div className={styles.loadingMore}>Loading history...</div>
        )}
        {isLoadingHistory ? (
          <div className={styles.loading}>Loading conversation...</div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, index) => {
            const isSender = (msg.senderId._id || msg.senderId) === user._id;
            const senderName = msg.senderId.name || "User";

            return (
              <div
                key={index}
                className={`${styles.message} ${
                  isSender ? styles.sent : styles.received
                }`}
              >
                {!isSender && (
                  <div
                    className={styles.senderName}
                    onClick={() => handleCopyUsername(senderName)}
                    title="Click to copy username"
                  >
                    {senderName}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.copyIcon}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copyFeedback === senderName && (
                      <span className={styles.copyFeedback}>Copied!</span>
                    )}
                  </div>
                )}

                <div className={styles.mediaContainer}>
                  {msg.mediaType === "image" && msg.mediaUrl && (
                    <img
                      src={msg.mediaUrl}
                      alt="Shared attachment"
                      className={styles.messageImage}
                      onClick={() => setSelectedImageUrl(msg.mediaUrl)}
                    />
                  )}
                  {msg.mediaType === "location" && msg.location && (
                    <div className={styles.locationCard}>
                      <img
                        src={`https://static-maps.yandex.ru/1.x/?ll=${msg.location.lng},${msg.location.lat}&z=14&l=map&pt=${msg.location.lng},${msg.location.lat},pm2rdm`}
                        alt="Location Preview"
                        className={styles.mapPreview}
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`,
                            "_blank",
                          )
                        }
                      />
                      <div className={styles.locationInfo}>
                        <p className={styles.addressText}>
                          {msg.location.address || "Live Location"}
                        </p>
                        <div className={styles.locationActions}>
                          <a
                            href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionButton}
                          >
                            📍 Open Maps
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${msg.location.lat},${msg.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionButton}
                          >
                            🚗 Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.content &&
                    msg.content !== "[Image]" &&
                    !msg.content.startsWith("[Location:") && (
                      <div className={styles.messageText}>{msg.content}</div>
                    )}
                </div>

                <div className={styles.timeStamp}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })
        )}
        {isOtherTyping && (
          <div className={styles.typingIndicator}>Someone is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isUploading && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(newMessage);
        }}
        className={styles.inputForm}
      >
        <div style={{ position: "relative", display: "flex" }}>
          <button
            type="button"
            className={styles.attachmentButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Attach Media"
          >
            📎
          </button>
          {isMenuOpen && (
            <div className={styles.attachmentMenu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className={styles.menuIcon}>🖼️</span> Send Image
              </button>
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleSendLocation}
              >
                <span className={styles.menuIcon}>📍</span> Send Location
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          hidden
          accept="image/*"
        />

        <input
          type="text"
          className={styles.input}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder={
            isUploading
              ? "Uploading image..."
              : isLocationLoading
                ? "Getting location..."
                : "Type your message..."
          }
          autoComplete="off"
          disabled={isUploading || isLocationLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!newMessage.trim() || isUploading || isLocationLoading}
        >
          Send
        </button>
      </form>

      {/* Image Preview Modal */}
      {selectedImageUrl && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImageUrl(null)}
        >
          <button
            className={styles.modalCloseBtn}
            onClick={() => setSelectedImageUrl(null)}
            aria-label="Close preview"
          >
            ✕
          </button>

          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImageUrl} alt="Full size preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
