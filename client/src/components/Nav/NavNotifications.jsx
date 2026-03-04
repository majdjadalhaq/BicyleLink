import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import useNotifications from "../../hooks/useNotifications";
import PropTypes from "prop-types";

const BellIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const NavNotifications = ({ user, isOpen, setIsOpen }) => {
  const {
    items: notifications,
    unread,
    markAllAsRead,
  } = useNotifications(user);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* ── Click-outside to close ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setIsOpen]);

  /* ── Auto-reset unread count when opened ── */
  useEffect(() => {
    if (isOpen && unread > 0) {
      markAllAsRead();
    }
  }, [isOpen, unread, markAllAsRead]);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#10B77F] hover:bg-gray-100 dark:hover:bg-white/5 focus:outline-none transition-all duration-200"
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold leading-none text-white bg-red-500 rounded-full border-[1.5px] border-white dark:border-[#121212]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Notifications dropdown"
          className="absolute right-[-12px] sm:right-0 mt-2 w-[calc(100vw-24px)] sm:w-80 max-h-[420px] overflow-auto bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 scrollbar-hide"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#1a1a1a] z-10 rounded-t-2xl">
            <span className="font-black text-sm text-gray-900 dark:text-white">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  type="button"
                  className="text-xs text-[#10B77F] hover:text-[#0EA572] transition-colors font-bold"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <svg
                  width="12"
                  height="12"
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
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="flex justify-center mb-3 text-gray-300 dark:text-gray-600">
                <BellIcon />
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                No notifications yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/5 pb-2">
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n._id}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 ${
                    n.read
                      ? "opacity-75 border-transparent"
                      : "bg-[#10B77F]/5 dark:bg-[#10B77F]/8 border-[#10B77F]"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-4 focus:outline-none block"
                    onMouseDown={(e) => {
                      // Prevent default to avoid focus issues
                      e.preventDefault();
                      if (
                        (n.type === "review_permission" ||
                          n.type === "review") &&
                        n.listingId
                      ) {
                        navigate(`/listings/${n.listingId}`);
                      } else {
                        navigate(n.link || "/inbox");
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1">
                        <p
                          className={`text-sm leading-snug ${
                            n.read
                              ? "font-medium text-gray-700 dark:text-gray-300"
                              : "font-bold text-gray-900 dark:text-white"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

NavNotifications.propTypes = {
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

export default NavNotifications;
