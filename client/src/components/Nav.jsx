import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";
import { useTheme } from "../contexts/ThemeContext";

const Nav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/messages/unread-total");
        if (!res.ok) {
          if (res.status === 401) return;
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) setUnreadCount(data.result);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch unread count:", err);
        }
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const navItemClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

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
        <ul className="navbar-links">
          <li>
            <NavLink to="/" className={navItemClass}>
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/listing/create"
              className={navItemClass}
              data-testid={TEST_ID.linkToCreateListing}
            >
              Sell a Bike
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/user"
              className={navItemClass}
              data-testid={TEST_ID.linkToUsers}
            >
              Community
            </NavLink>
          </li>

          <li>
            <NavLink to="/favorites" className={navItemClass}>
              Favorites
            </NavLink>
          </li>

          {user && (
            <li>
              <NavLink to="/my-listings" className={navItemClass}>
                My Listings
              </NavLink>
            </li>
          )}

          {user && (
            <li>
              <NavLink to="/inbox" className={navItemClass}>
                Inbox
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </NavLink>
            </li>
          )}
        </ul>

        {/* RIGHT: Theme + Auth Actions */}
        <div className="navbar-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          {user ? (
            <>
              <span className="user-greeting">Hi, {user.name || "User"}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-nav btn-logout"
                data-testid={TEST_ID.linkToLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-nav btn-secondary"
                data-testid={TEST_ID.linkToLogin}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-nav btn-primary"
                data-testid={TEST_ID.linkToSignUp}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
