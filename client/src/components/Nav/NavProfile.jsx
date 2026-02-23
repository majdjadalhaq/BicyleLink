import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";
import TEST_ID from "../Nav.testid";

const NavProfile = ({
  user,
  isProfileOpen,
  setIsProfileOpen,
  setIsNotifOpen,
  handleLogout,
  profileRef,
}) => {
  if (!user) {
    return (
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
    );
  }

  return (
    <div className="profile-dropdown-container" ref={profileRef}>
      <button
        type="button"
        className="profile-toggle"
        onClick={() => {
          setIsProfileOpen((p) => !p);
          setIsNotifOpen(false);
        }}
        aria-label="User menu"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="profile" className="nav-avatar" />
        ) : (
          <FaUserCircle size={28} />
        )}
      </button>

      {isProfileOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <p className="profile-name">{user.name}</p>
            <p className="profile-email">{user.email}</p>
          </div>
          <hr className="dropdown-divider" />
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="dropdown-item"
              style={{ fontWeight: "600", color: "var(--color-primary-main)" }}
            >
              Admin Dashboard
            </Link>
          )}
          <Link
            to={`/profile/${user._id || user.id}`}
            className="dropdown-item"
          >
            My Profile
          </Link>
          <Link to="/profile/edit" className="dropdown-item">
            Edit Profile
          </Link>
          <Link to="/my-listings" className="dropdown-item">
            My Listings
          </Link>
          <Link to="/favorites" className="dropdown-item">
            Favorites
          </Link>
          <Link to="/account-settings" className="dropdown-item">
            Account Settings
          </Link>
          <hr className="dropdown-divider" />
          <button
            type="button"
            onClick={handleLogout}
            className="dropdown-item logout"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

NavProfile.propTypes = {
  user: PropTypes.object,
  isProfileOpen: PropTypes.bool.isRequired,
  setIsProfileOpen: PropTypes.func.isRequired,
  setIsNotifOpen: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
  profileRef: PropTypes.object.isRequired,
};

export default NavProfile;
