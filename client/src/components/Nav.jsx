import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";
import { useTheme } from "../contexts/ThemeContext";
import useUnreadCount from "../hooks/useUnreadCount";
import useNotifications from "../hooks/useNotifications";
import NavLinks from "./Nav/NavLinks";
import NavProfile from "./Nav/NavProfile";
import NavNotifications from "./Nav/NavNotifications";

const Nav = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadMessagesCount = useUnreadCount(user);
  useNotifications(); // Subscribe to global notification context for reactivity

  const navigate = useNavigate();
  const location = useLocation();

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
    <nav
      className="sticky top-0 z-50 w-full glass-panel shadow-sm transition-colors duration-300"
      data-testid={TEST_ID.container}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT: Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
              data-testid={TEST_ID.linkToHome}
            >
              🚲 BiCycleL
            </Link>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-emerald hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald transition-colors"
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* MIDDLE & RIGHT: Desktop Layout */}
          <div className="hidden md:flex md:items-center md:space-x-8 md:flex-1 md:justify-end border-none">
            {/* Nav Links */}
            <div className="flex items-center space-x-6">
              <NavLinks user={user} unreadCount={unreadMessagesCount} />
            </div>

            {/* Actions (Theme, Notif, Profile) */}
            <div className="flex items-center space-x-4 pl-6 border-l border-gray-200 dark:border-dark-border">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-emerald transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              <NavNotifications
                user={user}
                isOpen={isNotifOpen}
                setIsOpen={setIsNotifOpen}
                setIsProfileOpen={setIsProfileOpen}
              />

              <NavProfile
                user={user}
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                handleLogout={handleLogout}
                profileRef={profileRef}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Collapse */}
      <div
        className={`md:hidden ${isOpen ? "block" : "hidden"} border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLinks user={user} unreadCount={unreadMessagesCount} isMobile />
        </div>

        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center px-5 justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-emerald transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
              </button>
            </div>
            {user && (
              <NavNotifications
                user={user}
                isOpen={isNotifOpen}
                setIsOpen={setIsNotifOpen}
                setIsProfileOpen={setIsProfileOpen}
              />
            )}
          </div>

          <div className="mt-3 px-2 space-y-1">
            <NavProfile
              user={user}
              isProfileOpen={true} // Always open inline for mobile
              setIsProfileOpen={() => {}}
              handleLogout={handleLogout}
              profileRef={profileRef}
              isMobile
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
