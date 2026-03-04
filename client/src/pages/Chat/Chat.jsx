import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";

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
    handleEditMessage,
  } = useChat(listingId, user, receiverId, roomParam);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Please log in to chat.
        </p>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] max-w-4xl mx-auto w-full bg-light-surface dark:bg-dark-surface border-x border-light-border dark:border-dark-border">
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
        onEdit={handleEditMessage}
      />

      {isUploading && (
        <div className="h-1 w-full bg-gray-200 dark:bg-dark-border">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
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
          className="overlay-backdrop flex items-center justify-center"
          onClick={() => setSelectedImageUrl(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center text-xl hover:bg-black/80 transition-colors"
            onClick={() => setSelectedImageUrl(null)}
            aria-label="Close preview"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageUrl}
              alt="Full size preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
