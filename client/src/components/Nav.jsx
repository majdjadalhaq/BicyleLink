import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";
import { FaUserCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import useUnreadCount from "../hooks/useUnreadCount";

const Nav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useUnreadCount(user);

  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

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
              <Link to="/profile" className="profile-icon">
                <FaUserCircle size={28} />
              </Link>
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
