import { useInbox } from "./hooks/useInbox";
import Skeleton from "../../components/Skeleton/Skeleton.jsx";
import EmptyState from "../../components/ui/EmptyState/EmptyState.jsx";
import InboxToolbar from "./components/InboxToolbar";
import ConversationCard from "./components/ConversationCard";

const Inbox = () => {
  const {
    conversations,
    view,
    setView,
    onlineStatuses,
    typingRooms,
    searchQuery,
    setSearchQuery,
    selectionType,
    setSelectionType,
    selectedRooms,
    setSelectedRooms,
    isLoading,
    isRefreshing,
    error,
    toggleRoomSelection,
    handleMarkAllRead,
    handleBulkAction,
    filteredConversations,
    formatTime,
    openChat,
    totalUnread,
  } = useInbox();

  // No early return for loading to avoid layout shift (shaking)
  // We'll show skeletons inside the content area instead

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-bold text-red-500">
            Failed to load conversations
          </p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Messages
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 font-medium">
              {conversations.length} conversation
              {conversations.length !== 1 && "s"}
              {totalUnread > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-[#10B77F]/10 text-[#10B77F] text-[10px] font-black uppercase tracking-wider border border-[#10B77F]/20">
                  {totalUnread} unread
                </span>
              )}
            </p>
          </div>

          {/* New Mark Al Read Button */}
          {totalUnread > 0 && selectionType === null && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B77F]/10 hover:bg-[#10B77F]/20 text-[#10B77F] rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-[#10B77F]/20"
            >
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* Search + View Switcher */}
        <InboxToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          view={view}
          setView={setView}
          selectionType={selectionType}
          setSelectionType={setSelectionType}
          setSelectedRooms={setSelectedRooms}
        />

        {/* Selection Action Bar */}
        {selectionType && selectedRooms.size > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-[#1a1a1a] border border-emerald-500/20 rounded-3xl shadow-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/20">
                  {selectedRooms.size}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAction}
                  className={`px-6 py-2.5 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all ${
                    selectionType === "archive"
                      ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                      : "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                  }`}
                >
                  Confirm{" "}
                  {selectionType === "archive"
                    ? view === "active"
                      ? "Archive"
                      : "Unarchive"
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex flex-col gap-2 min-h-[400px]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} type="inbox" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div
              className={`py-12 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 transition-opacity duration-300 ${isRefreshing ? "opacity-60" : "opacity-100"}`}
            >
              <EmptyState
                title={
                  searchQuery
                    ? "No matching conversations"
                    : view === "active"
                      ? "Your inbox is clear"
                      : "No archived conversations"
                }
                message={
                  searchQuery
                    ? "Try a different search term."
                    : view === "active"
                      ? "Start by messaging a seller from a listing page."
                      : "Nothing archived yet."
                }
                icon={
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
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 transition-all duration-500">
              {filteredConversations.map((conv) => {
                const isTyping = typingRooms[conv.room];
                const isOnline = onlineStatuses[conv.otherUser?._id];
                const hasUnread = conv.unreadCount > 0;

                return (
                  <ConversationCard
                    key={conv.room}
                    conv={conv}
                    isSelected={selectedRooms.has(conv.room)}
                    hasUnread={hasUnread}
                    isTyping={isTyping}
                    isOnline={isOnline}
                    selectionType={selectionType}
                    onToggleSelection={toggleRoomSelection}
                    onOpenChat={openChat}
                    formatTime={formatTime}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
