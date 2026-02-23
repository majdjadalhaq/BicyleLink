import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../Chat.module.css";
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
    <div className={styles.messagesContainer} onScroll={onScroll}>
      {isFetchingMore && (
        <div className={styles.loadingMore}>Loading history...</div>
      )}
      {isLoadingHistory ? (
        <div className={styles.loading}>Loading conversation...</div>
      ) : messages.length === 0 ? (
        <div className={styles.empty}>No messages yet. Say hello!</div>
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
        <div className={styles.typingIndicator}>Someone is typing...</div>
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
