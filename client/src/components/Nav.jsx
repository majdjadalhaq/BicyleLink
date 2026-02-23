import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";
import { FaBell } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import useUnreadCount from "../hooks/useUnreadCount";
import useNotifications from "../hooks/useNotifications";

import NavLinks from "./Nav/NavLinks";
import NavProfile from "./Nav/NavProfile";

const Nav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = useUnreadCount(user);
  const {
    items: notifications,
    unread: notifUnread,
    markAsRead,
  } = useNotifications(user);

  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <nav className="navbar" data-testid={TEST_ID.container}>
      {/* LEFT: Brand Logo */}
      <div className="navbar-brand-container">
        <Link to="/" className="navbar-brand" data-testid={TEST_ID.linkToHome}>
          🚲 BiCycleL
        </Link>

        <button
          className={`hamburger-menu ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          type="button"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      {/* MIDDLE & RIGHT: Collapsible Content */}
      <div className={`navbar-collapse ${isOpen ? "show" : ""}`}>
        {/* MIDDLE: Navigation Links */}
        <NavLinks user={user} unreadCount={unreadCount} />

        {/* RIGHT: Theme + Notifications + Profile/Auth */}
        <div className="navbar-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Notifications Bell (only when logged in) */}
          {user && (
            <div className="notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className="notif-button"
                onClick={() => {
                  setIsNotifOpen((p) => !p);
                  setIsProfileOpen(false);
                }}
                aria-label="Notifications"
              >
                <FaBell size={18} />
                {notifUnread > 0 && (
                  <span className="notif-badge">{notifUnread}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="notif-dropdown" role="menu">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button
                      type="button"
                      className="notif-close"
                      onClick={() => setIsNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications</div>
                  ) : (
                    <ul className="notif-list">
                      {notifications.slice(0, 6).map((n) => (
                        <li
                          key={n.id}
                          className={`notif-item ${n.read ? "" : "unread"}`}
                        >
                          <button
                            type="button"
                            className="notif-item-btn"
                            onClick={() => {
                              markAsRead(n.id);
                              setIsNotifOpen(false);
                              navigate(n.link || "/inbox");
                            }}
                          >
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-body">{n.body}</div>
                            {n.createdAt && (
                              <div className="notif-time">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            )}
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
                        setIsNotifOpen(false);
                        navigate("/inbox");
                      }}
                    >
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <NavProfile
            user={user}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            setIsNotifOpen={setIsNotifOpen}
            handleLogout={handleLogout}
            profileRef={profileRef}
          />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
