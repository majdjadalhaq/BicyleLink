import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import TEST_ID from "./Nav.testid";

const Nav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <ul>
      <Link to="/" data-testid={TEST_ID.linkToHome}>
        <li>Home</li>
      </Link>
      <Link to="/user" data-testid={TEST_ID.linkToUsers}>
        <li>Users</li>
      </Link>
      {user ? (
        <li>
          <button
            type="button"
            onClick={handleLogout}
            data-testid={TEST_ID.linkToLogout}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
              font: "inherit",
              padding: 0,
            }}
          >
            Logout
          </button>
        </li>
      ) : (
        <>
          <Link to="/signup" data-testid={TEST_ID.linkToSignUp}>
            <li>Sign Up</li>
          </Link>
          <Link to="/login" data-testid={TEST_ID.linkToLogin}>
            <li>Login</li>
          </Link>
        </>
      )}
    </ul>
  );
};

export default Nav;
