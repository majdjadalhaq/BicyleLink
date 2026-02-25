import PropTypes from "prop-types";

const MessageItem = ({
  msg,
  user,
  onCopyUsername,
  onImageClick,
  copyFeedback,
  isAdminWarning,
}) => {
  const isSender = (msg.senderId._id || msg.senderId) === user._id;
  const senderName = msg.senderId.name || "User";

  if (isAdminWarning) {
    return (
      <div className="mx-auto max-w-sm bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-center">
        <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
          <span className="mr-1">⚠️</span> Administrator Warning
        </div>
        <div className="text-sm text-amber-600 dark:text-amber-300">
          {msg.content}
        </div>
        <div className="text-[10px] text-amber-400 mt-2">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col max-w-[75%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"}`}
    >
      {!isSender && (
        <button
          type="button"
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1 hover:text-emerald-500 transition-colors cursor-pointer"
          onClick={() => onCopyUsername(senderName)}
          title="Click to copy username"
        >
          {senderName}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copyFeedback === senderName && (
            <span className="text-emerald-500 text-[10px] font-bold">
              Copied!
            </span>
          )}
        </button>
      )}

      <div
        className={`rounded-2xl px-4 py-2.5 ${isSender ? "bg-emerald-500 text-white rounded-br-md" : "bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-bl-md"}`}
      >
        {msg.mediaType === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt="Shared attachment"
            className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity mb-1"
            onClick={() => onImageClick(msg.mediaUrl)}
          />
        )}
        {msg.mediaType === "location" && msg.location && (
          <div className="rounded-lg overflow-hidden border border-light-border dark:border-dark-border mb-1">
            <img
              src={`https://static-maps.yandex.ru/1.x/?ll=${msg.location.lng},${msg.location.lat}&z=14&l=map&pt=${msg.location.lng},${msg.location.lat},pm2rdm`}
              alt="Location Preview"
              className="w-[250px] h-[150px] object-cover cursor-pointer"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`,
                  "_blank",
                )
              }
            />
            <div className="p-2 bg-light-bg dark:bg-dark-bg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {msg.location.address || "Live Location"}
              </p>
              <div className="flex gap-2 mt-1.5">
                <a
                  href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-400"
                >
                  📍 Open Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-400"
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
            <div className="text-sm leading-relaxed">{msg.content}</div>
          )}
      </div>

      <div
        className={`text-[10px] mt-1 ${isSender ? "text-gray-400" : "text-gray-400 dark:text-gray-500"}`}
      >
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  msg: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onCopyUsername: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  copyFeedback: PropTypes.string,
  isAdminWarning: PropTypes.bool,
};

export default MessageItem;
