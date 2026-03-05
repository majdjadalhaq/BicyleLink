import PropTypes from "prop-types";

const ConversationCard = ({
  conv,
  isSelected,
  hasUnread,
  isTyping,
  isOnline,
  selectionType,
  onToggleSelection,
  onOpenChat,
  formatTime,
}) => {
  return (
    <div
      className={`group relative p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg"
          : hasUnread
            ? "bg-[var(--bg-surface)] dark:bg-[#10221C] border-[#10B77F]/30 dark:border-[#10B77F]/40 shadow-[0_8px_30px_rgba(16,183,127,0.06)]"
            : "bg-white dark:bg-[#10221C]/30 border-gray-100 dark:border-white/5 hover:border-[#10B77F]/20 hover:bg-[var(--bg-surface)] dark:hover:bg-[#10221C]/50 hover:shadow-md"
      }`}
      onClick={() =>
        selectionType ? onToggleSelection(conv.room) : onOpenChat(conv)
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === "Enter" &&
        (selectionType ? onToggleSelection(conv.room) : onOpenChat(conv))
      }
      aria-label={
        selectionType
          ? `Select conversation with ${conv.otherUser?.name || "User"}`
          : `Open conversation with ${conv.otherUser?.name || "User"}`
      }
    >
      {/* Selection Indicator */}
      {selectionType && (
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20"
                : "bg-white/50 dark:bg-black/20 border-gray-300 dark:border-white/20"
            }`}
          >
            {isSelected && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Unread accent */}
      {hasUnread && !selectionType && (
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#10B77F] rounded-r-full shadow-[0_0_12px_rgba(16,183,127,0.4)]" />
      )}

      <div
        className={`flex items-center gap-4 transition-transform duration-300 ${selectionType ? "translate-x-8" : ""}`}
      >
        {/* Avatar (Left) */}
        <div className="relative flex-shrink-0">
          {conv.otherUser?.avatarUrl || conv.otherUser?.avatar ? (
            <img
              src={conv.otherUser.avatarUrl || conv.otherUser.avatar}
              alt={conv.otherUser.name || "User"}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-[#10B77F]/20 group-hover:border-[#10B77F]/50 transition-colors drop-shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#10B77F]/10 dark:bg-[#10B77F]/5 border border-[#10B77F]/20 flex items-center justify-center text-[#10B77F] font-black text-xl shadow-inner">
              {conv.otherUser?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          <div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1a1a1a] transition-colors ${
              isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        </div>

        {/* Content (Center) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3
              className={`text-sm truncate ${
                hasUnread
                  ? "font-black text-gray-900 dark:text-white"
                  : "font-bold text-gray-800 dark:text-gray-100"
              }`}
            >
              {conv.otherUser?.name || "Unknown User"}
            </h3>
            <span className="text-[10px] font-bold text-gray-400 ml-2 flex-shrink-0 tabular-nums">
              {formatTime(conv.lastMessage?.createdAt)}
            </span>
          </div>

          {conv.listing?.title && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate mb-1.5 font-black uppercase tracking-wider bg-emerald-500/5 dark:bg-emerald-500/10 self-start px-2 py-0.5 rounded-full border border-emerald-500/10">
              {conv.listing.title}
            </p>
          )}

          {isTyping ? (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-emerald-500 font-bold italic">
                typing
              </span>
            </div>
          ) : (
            <p
              className={`text-xs truncate ${
                hasUnread
                  ? "text-gray-700 dark:text-gray-300 font-semibold"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {conv.lastMessage?.mediaType === "image" ? (
                <span className="flex items-center gap-1">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Photo
                </span>
              ) : conv.lastMessage?.mediaType === "location" ? (
                <span className="flex items-center gap-1">
                  <svg
                    width="11"
                    height="11"
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
                  Location
                </span>
              ) : (
                conv.lastMessage?.content || "No messages yet"
              )}
            </p>
          )}
        </div>

        {/* Listing Preview (Right) */}
        {conv.listing?.images?.[0] && (
          <div className="relative flex-shrink-0 ml-2">
            <img
              src={conv.listing.images[0]}
              alt={conv.listing.title}
              className="w-14 h-14 rounded-2xl object-cover border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform duration-500"
            />
            {hasUnread && (
              <div className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center px-1 shadow-glow-strong border-2 border-white dark:border-[#1a1a1a]">
                <span className="text-[9px] font-black text-white">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </span>
              </div>
            )}
          </div>
        )}

        {!conv.listing?.images?.[0] && hasUnread && (
          <div className="flex-shrink-0 min-w-[20px] h-[20px] rounded-full bg-emerald-500 flex items-center justify-center px-1 shadow-lg shadow-emerald-500/40">
            <span className="text-[8px] font-black text-white">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

ConversationCard.propTypes = {
  conv: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  hasUnread: PropTypes.bool.isRequired,
  isTyping: PropTypes.bool,
  isOnline: PropTypes.bool,
  selectionType: PropTypes.string,
  onToggleSelection: PropTypes.func.isRequired,
  onOpenChat: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
};

export default ConversationCard;
