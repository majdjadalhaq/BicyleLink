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
          className="btn-icon text-gray-400 hover:text-emerald-500 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Attach Media"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        {isMenuOpen && (
          <div className="absolute bottom-12 left-0 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg py-1 min-w-[160px] animate-slideUp z-10">
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Send Image</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors flex items-center gap-3"
              onClick={onSendLocation}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Send Location</span>
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
