import { useRef } from "react";
import PropTypes from "prop-types";
import styles from "../Chat.module.css";

const ChatInput = ({
  newMessage,
  setNewMessage,
  onSend,
  onTyping,
  isMenuOpen,
  setIsMenuOpen,
  onImageUpload,
  onSendLocation,
  isUploading,
  isLocationLoading,
}) => {
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(newMessage);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
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
              onClick={onSendLocation}
            >
              <span className={styles.menuIcon}>📍</span> Send Location
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onImageUpload(e.target.files[0])}
        hidden
        accept="image/*"
      />

      <input
        type="text"
        className={styles.input}
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          onTyping();
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
  );
};

ChatInput.propTypes = {
  newMessage: PropTypes.string.isRequired,
  setNewMessage: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
  onImageUpload: PropTypes.func.isRequired,
  onSendLocation: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
  isLocationLoading: PropTypes.bool.isRequired,
};

export default ChatInput;
