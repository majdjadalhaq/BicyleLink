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
  isMobile,
}) => {
  if (!user) {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-2 mt-4 px-3">
          <Link
            to="/login"
            className="block text-center px-4 py-2 border border-emerald text-emerald rounded-md font-medium hover:bg-emerald/10 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block text-center px-4 py-2 bg-emerald hover:bg-emerald-hover text-white rounded-md font-medium transition-colors"
          >
            Sign Up
          </Link>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-3">
        <Link
          to="/login"
          className="px-4 py-2 text-sm font-medium text-emerald border border-emerald rounded-md hover:bg-emerald/10 transition-colors"
          data-testid={TEST_ID.linkToLogin}
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 text-sm font-medium text-white bg-emerald hover:bg-emerald-hover rounded-md shadow-sm transition-colors"
          data-testid={TEST_ID.linkToSignUp}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const dropdownMenuItems = (
    <>
      {user.role === "admin" && (
        <Link
          to="/admin"
          className="block px-4 py-2 text-sm font-semibold text-emerald hover:bg-gray-100 dark:hover:bg-dark-bg"
        >
          Admin Dashboard
        </Link>
      )}
      <Link
        to={`/profile/${user._id || user.id}`}
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-emerald"
      >
        My Profile
      </Link>
      <Link
        to="/profile/edit"
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-emerald"
      >
        Edit Profile
      </Link>
      <Link
        to="/my-listings"
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-emerald"
      >
        My Listings
      </Link>
      <Link
        to="/favorites"
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-emerald"
      >
        Favorites
      </Link>
      <Link
        to="/account-settings"
        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-emerald"
      >
        Account Settings
      </Link>
      <div className="border-t border-gray-100 dark:border-dark-border mt-1"></div>
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        Logout
      </button>
    </>
  );

  if (isMobile) {
    return (
      <div className="mt-4">
        <div className="flex items-center px-4 mb-3">
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-transparent"
              />
            ) : (
              <FaUserCircle className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div className="ml-3">
            <div className="text-base font-medium leading-none text-gray-800 dark:text-white mb-1">
              {user.name}
            </div>
            <div className="text-sm font-medium leading-none text-gray-500">
              {user.email}
            </div>
          </div>
        </div>
        <div className="space-y-1">{dropdownMenuItems}</div>
      </div>
    );
  }

  return (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        className="flex items-center focus:outline-none"
        onClick={() => {
          setIsProfileOpen((p) => !p);
          if (setIsNotifOpen) setIsNotifOpen(false);
        }}
        aria-label="User menu"
        aria-expanded={isProfileOpen}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="profile"
            className="h-8 w-8 rounded-full object-cover border-2 border-transparent hover:border-emerald transition-colors"
          />
        ) : (
          <FaUserCircle className="h-8 w-8 text-gray-500 hover:text-emerald transition-colors" />
        )}
      </button>

      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark-surface ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-dark-border z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="py-1">{dropdownMenuItems}</div>
        </div>
      )}
    </div>
  );
};

NavProfile.propTypes = {
  user: PropTypes.object,
  isProfileOpen: PropTypes.bool.isRequired,
  setIsProfileOpen: PropTypes.func.isRequired,
  setIsNotifOpen: PropTypes.func,
  handleLogout: PropTypes.func.isRequired,
  profileRef: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
};

export default NavProfile;
