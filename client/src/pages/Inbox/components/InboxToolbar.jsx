import PropTypes from "prop-types";

const InboxToolbar = ({
  searchQuery,
  setSearchQuery,
  view,
  setView,
  selectionType,
  setSelectionType,
  setSelectedRooms,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name or listing…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-white/5 rounded-2xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#10B77F] focus:ring-2 focus:ring-[#10B77F]/20 transition-all placeholder:text-gray-400"
          aria-label="Search conversations"
        />
      </div>
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl self-start border border-gray-200 dark:border-white/5">
        {["active", "archived"].map((v) => (
          <button
            key={v}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === v
                ? "bg-[#10B77F] text-white shadow-md shadow-[#10B77F]/20"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => {
              setView(v);
              setSelectionType(null);
              setSelectedRooms(new Set());
            }}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Archive Toggle */}
        {(selectionType === null || selectionType === "archive") && (
          <button
            onClick={() => {
              setSelectionType((p) => (p === "archive" ? null : "archive"));
              setSelectedRooms(new Set());
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
              selectionType === "archive"
                ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                : "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:text-emerald-500"
            }`}
          >
            {selectionType === "archive" ? (
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            )}
            {selectionType === "archive"
              ? "Cancel"
              : view === "active"
                ? "Archive"
                : "Unarchive"}
          </button>
        )}

        {/* Delete Toggle */}
        {(selectionType === null || selectionType === "delete") && (
          <button
            onClick={() => {
              setSelectionType((p) => (p === "delete" ? null : "delete"));
              setSelectedRooms(new Set());
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
              selectionType === "delete"
                ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20"
                : "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/5 hover:border-red-500/30 hover:text-red-500"
            }`}
          >
            {selectionType === "delete" ? (
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            )}
            {selectionType === "delete" ? "Cancel" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
};

InboxToolbar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  setView: PropTypes.func.isRequired,
  selectionType: PropTypes.string,
  setSelectionType: PropTypes.func.isRequired,
  setSelectedRooms: PropTypes.func.isRequired,
};

export default InboxToolbar;
