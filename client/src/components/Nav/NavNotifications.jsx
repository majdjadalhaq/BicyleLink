import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import useNotifications from "../../hooks/useNotifications";
import PropTypes from "prop-types";

const NavNotifications = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { items: notifications, unread, markAsRead } = useNotifications(user);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notif-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell size={18} />
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown" role="menu">
          <div className="notif-header">
            <span>Notifications</span>
            <button
              type="button"
              className="notif-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
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
};

export default NavNotifications;
