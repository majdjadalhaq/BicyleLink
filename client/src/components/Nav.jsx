import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import "../styles/Nav.css";

const Nav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
