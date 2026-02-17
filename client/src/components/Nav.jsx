import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";

const Nav = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      try {
        const res = await fetch("/api/messages/unread-total");
        if (!res.ok) {
          if (res.status === 401) return; // Silent for unauthorized
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.result);
        }
      } catch (err) {
        // Only log serious unexpected errors
        if (err.name !== "AbortError") {
          console.error("Failed to fetch unread count:", err);
        }
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds as a fallback
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" data-testid={TEST_ID.container}>
      {/* LEFT: Brand Logo */}
      <div className="navbar-brand">
        <Link to="/" className="navbar-brand" data-testid={TEST_ID.linkToHome}>
          🚲 BiCycleL
        </Link>
      </div>

      {/* MIDDLE: Navigation Links */}
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/listing/create"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
            data-testid={TEST_ID.linkToCreateListing}
          >
            Sell a Bike
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
            data-testid={TEST_ID.linkToUsers}
          >
            Community
          </NavLink>
        </li>
        {user && (
          <li>
            <NavLink
              to="/inbox"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              Inbox
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </NavLink>
          </li>
        )}
      </ul>

      {/* RIGHT: Auth Actions */}
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="user-greeting">Hi, {user.name || "User"}</span>
            <button
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
    </nav>
  );
};

export default Nav;
