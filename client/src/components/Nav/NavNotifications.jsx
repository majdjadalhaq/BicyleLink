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
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notif-button"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <FaBell size={18} />
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-header">
            <span>Notifications</span>
            <div className="notif-header-actions">
              {unread > 0 && (
                <button
                  type="button"
                  className="notif-mark-all"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                className="notif-close"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications</div>
          ) : (
            <ul className="notif-list">
              {notifications.slice(0, 10).map((n) => (
                <li
                  key={n._id}
                  className={`notif-item ${n.read ? "" : "unread"}`}
                >
                  <button
                    type="button"
                    className="notif-item-btn"
                    onClick={async () => {
                      if (!n.read) await markAsRead(n._id);
                      setIsOpen(false);
                      navigate(n.link || "/inbox");
                    }}
                  >
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-body">{n.body}</div>
                    <div className="notif-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="notif-footer">
            <button
              type="button"
              className="notif-viewall"
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
