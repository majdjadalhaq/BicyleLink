import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";

import useUnreadCount from "../hooks/useUnreadCount";
import useNotifications from "../hooks/useNotifications";
import NavLinks from "./Nav/NavLinks";
import NavProfile from "./Nav/NavProfile";
import NavNotifications from "./Nav/NavNotifications";
import { ThemeToggle } from "./ui";

const Nav = () => {
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadMessagesCount = useUnreadCount(user);
  useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

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
      className="sticky top-0 z-50 w-full bg-light-surface/90 dark:bg-dark-bg/90 backdrop-blur-lg border-b border-light-border dark:border-dark-border transition-colors duration-300"
      data-testid={TEST_ID.container}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT: Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2"
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
              className="btn-icon text-gray-500 dark:text-gray-400 hover:text-emerald-500"
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
          <div className="hidden md:flex md:items-center md:space-x-6 md:flex-1 md:justify-end">
            {/* Nav Links */}
            <div className="flex items-center space-x-6">
              <NavLinks user={user} unreadCount={unreadMessagesCount} />
            </div>

            {/* Actions (Theme, Notif, Profile) */}
            <div className="flex items-center space-x-2 pl-6 border-l border-light-border dark:border-dark-border">
              <ThemeToggle />

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
        className={`md:hidden ${isOpen ? "block animate-slideDown" : "hidden"} border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-bg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NavLinks user={user} unreadCount={unreadMessagesCount} isMobile />
        </div>

        <div className="pt-4 pb-3 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center px-5 justify-between">
            <div className="flex items-center space-x-3">
              <ThemeToggle />
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
              isProfileOpen={true}
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
