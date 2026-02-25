import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import MessageItem from "./MessageItem";

const MessageList = ({
  messages,
  user,
  onCopyUsername,
  onImageClick,
  copyFeedback,
  isFetchingMore,
  onScroll,
  isLoadingHistory,
  isOtherTyping,
  isAdminWarning,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-light-bg dark:bg-dark-bg"
      onScroll={onScroll}
    >
      {isFetchingMore && (
        <div className="text-center text-sm text-emerald-500 animate-pulse py-2">
          Loading history...
        </div>
      )}
      {isLoadingHistory ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Loading conversation...
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
          No messages yet. Say hello! 👋
        </div>
      ) : (
        messages.map((msg, index) => (
          <MessageItem
            key={index}
            msg={msg}
            user={user}
            onCopyUsername={onCopyUsername}
            onImageClick={onImageClick}
            copyFeedback={copyFeedback}
            isAdminWarning={isAdminWarning}
          />
        ))
      )}
      {isOtherTyping && (
        <div className="text-sm text-gray-400 dark:text-gray-500 italic animate-pulse pl-2">
          Someone is typing...
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  onCopyUsername: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  copyFeedback: PropTypes.string,
  isFetchingMore: PropTypes.bool.isRequired,
  onScroll: PropTypes.func.isRequired,
  isLoadingHistory: PropTypes.bool.isRequired,
  isOtherTyping: PropTypes.bool.isRequired,
  isAdminWarning: PropTypes.bool,
};

export default MessageList;
