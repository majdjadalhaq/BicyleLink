import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";
import { useTheme } from "../contexts/ThemeContext";
import useUnreadCount from "../hooks/useUnreadCount";
import NavLinks from "./Nav/NavLinks";
import NavProfile from "./Nav/NavProfile";
import NavNotifications from "./Nav/NavNotifications";
const Nav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = useUnreadCount(user);

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setIsProfileOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
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
          <NavNotifications user={user} />

          <NavProfile
            user={user}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            handleLogout={handleLogout}
            profileRef={profileRef}
          />
        </div>
      </div>
    </nav>
  );
};

export default Nav;
