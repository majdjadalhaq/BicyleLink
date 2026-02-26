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
          <div className="flex flex-col items-center gap-4 text-emerald-500/50">
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            No messages yet. Say hello!
          </div>
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
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
          <div className="flex gap-1">
            <span
              className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
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
