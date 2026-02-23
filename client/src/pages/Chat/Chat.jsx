import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Chat.module.css";

// Subcomponents
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

// Hook
import useChat from "./hooks/useChat";

const Chat = () => {
  const { id: listingId } = useParams();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");
  const roomParam = searchParams.get("room");
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
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
  } = useChat(listingId, user, receiverId, roomParam);

  if (!user) {
    return (
      <div className={styles.chatError}>
        <p>Please log in to chat.</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ChatHeader
        onBack={() => navigate("/inbox")}
        listing={listing}
        isOnline={isOnline}
      />

      <MessageList
        messages={messages}
        user={user}
        onCopyUsername={handleCopyUsername}
        onImageClick={setSelectedImageUrl}
        copyFeedback={copyFeedback}
        isFetchingMore={isFetchingMore}
        onScroll={handleScroll}
        isLoadingHistory={isLoadingHistory}
        isOtherTyping={isOtherTyping}
        isAdminWarning={isAdminWarning}
      />

      {isUploading && (
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {isAdminWarning ? null : (
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onImageUpload={handleImageUpload}
          onSendLocation={handleSendLocation}
          isUploading={isUploading}
          isLocationLoading={isLocationLoading}
        />
      )}

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
