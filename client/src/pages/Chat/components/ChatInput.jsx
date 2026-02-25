import { useRef } from "react";
import PropTypes from "prop-types";

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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-3 py-3 border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface flex-shrink-0"
    >
      <div className="relative">
        <button
          type="button"
          className="btn-icon text-gray-500 hover:text-emerald-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Attach Media"
        >
          📎
        </button>
        {isMenuOpen && (
          <div className="absolute bottom-12 left-0 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg py-1 min-w-[160px] animate-slideUp z-10">
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>🖼️</span> Send Image
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors flex items-center gap-2"
              onClick={onSendLocation}
            >
              <span>📍</span> Send Location
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
        className="flex-1 input-emerald py-2.5 text-sm"
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
        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
