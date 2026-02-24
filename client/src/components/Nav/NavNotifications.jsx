import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import useNotifications from "../../hooks/useNotifications";
import PropTypes from "prop-types";

const NavNotifications = ({ user, isOpen, setIsOpen, setIsProfileOpen }) => {
  const {
    items: notifications,
    unread,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Auto-close profile when opening notifications
  const toggleOpen = () => {
    if (!isOpen) setIsProfileOpen(false);
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-emerald hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none transition-colors"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <FaBell size={20} />
        {unread > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full border-2 border-white dark:border-dark-surface">
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-auto bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-xl shadow-lg z-50 animate-in slide-in-from-top-2 duration-200 hide-scrollbar"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <span className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  type="button"
                  className="text-sm text-emerald hover:text-emerald-hover transition-colors font-medium"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-dark-border">
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n._id}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-dark-bg ${n.read ? "opacity-80" : "bg-emerald/5 dark:bg-emerald/10"}`}
                >
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 focus:outline-none"
                    onClick={async () => {
                      if (!n.read) await markAsRead(n._id);
                      setIsOpen(false);
                      navigate(n.link || "/inbox");
                    }}
                  >
                    <div
                      className={`text-sm ${n.read ? "font-medium text-gray-700 dark:text-gray-300" : "font-semibold text-gray-900 dark:text-white"}`}
                    >
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {n.body}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="p-3 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 sticky bottom-0">
            <button
              type="button"
              className="w-full py-2 text-sm font-medium text-center text-emerald hover:text-emerald-hover transition-colors rounded-lg hover:bg-emerald/10"
              onClick={() => {
                setIsOpen(false);
                navigate("/inbox");
              }}
            >
              View Inbox
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

NavNotifications.propTypes = {
  user: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  setIsProfileOpen: PropTypes.func.isRequired,
};

export default NavNotifications;
