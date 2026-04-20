import { useState } from "react";
import PropTypes from "prop-types";

const MessageItem = ({
  msg,
  user,
  onCopyUsername,
  onImageClick,
  copyFeedback,
  isAdminWarning,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content || "");

  const handleSave = () => {
    if (editContent.trim() !== msg.content) {
      onEdit(msg._id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(msg.content);
    setIsEditing(false);
  };

  const isSender = (msg.senderId._id || msg.senderId) === user._id;
  const senderName = msg.senderId.name || "User";

  if (isAdminWarning) {
    return (
      <div className="mx-auto max-w-sm bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-center">
        <div className="text-sm font-black text-amber-700 dark:text-amber-400 mb-1 flex items-center justify-center gap-1.5 uppercase tracking-wider">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          System Warning
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

  // Deleted message — show tombstone
  if (msg.isDeleted) {
    return (
      <div
        className={`flex flex-col max-w-[75%] ${isSender ? "ml-auto items-end" : "mr-auto items-start"}`}
      >
        <div className="rounded-2xl px-4 py-2.5 text-sm italic text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700">
          This message was deleted.
        </div>
        <div className="text-[10px] mt-1 text-gray-400">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  const canEdit =
    isSender &&
    !isEditing &&
    msg.content !== "[Image]" &&
    !msg.content?.startsWith("[Location:");

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
              <div className="flex gap-4 mt-2">
                <a
                  href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-widest"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-widest"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Directions
                </a>
              </div>
            </div>
          </div>
        )}
        {msg.content &&
          msg.content !== "[Image]" &&
          !msg.content.startsWith("[Location:") && (
            <div className="text-sm leading-relaxed">
              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/40"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-2 py-1 bg-white text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  {msg.content}
                  {msg.isEdited && (
                    <span className="text-[9px] opacity-70 italic mt-0.5">
                      (edited)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
      </div>

      <div
        className={`text-[10px] mt-1 flex items-center gap-2 ${isSender ? "text-gray-400" : "text-gray-400 dark:text-gray-500"}`}
      >
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="hover:text-emerald-500 transition-colors"
            title="Edit message"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        {isSender && !isEditing && onDelete && (
          <button
            onClick={() => onDelete(msg._id)}
            className="hover:text-red-400 transition-colors"
            title="Delete message"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
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
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default MessageItem;
