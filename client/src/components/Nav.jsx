import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";

import { useUnreadMessagesCount } from "../hooks/useMessages";
import { useNotifications } from "../hooks/useNotifications";
import useKeyboardFocus from "../hooks/useKeyboardFocus";
import { DesktopNavLinks, MobileNavLinks } from "./Nav/NavLinks";
import { Icons } from "./Nav/NavLinksIcons";
import NavNotifications from "./Nav/NavNotifications";
import { ThemeToggle } from "./ui";
import {
  LogoutIcon,
  SettingsIcon,
  ProfileIcon,
  UserAvatarIcon,
  NavLogo,
} from "./Nav/NavIcons";
import MobileSettingsSheet from "./Nav/MobileSettingsSheet";
import AdminMenu from "./Nav/AdminMenu";

const Nav = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const isKeyboardOpen = useKeyboardFocus();
  const { data: unreadMessagesCount = 0 } = useUnreadMessagesCount();
  useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef(null);
  const prevPathname = useRef(location.pathname);

  // Reset navigation states on route change
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      // eslint-disable-next-line
      setIsNotifOpen(false);
      setIsProfileOpen(false);
      setIsMobileSettingsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    setIsMobileSettingsOpen(false);
    await logout();
    navigate("/login");
  };

  const profileHref = user
    ? `/profile/${encodeURIComponent(user.name || user._id || user.id)}`
    : "/login";

  return (
    <>
      <nav
        className="sticky top-0 left-0 right-0 z-50 w-full bg-white/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-200 dark:border-[#1e1e1e] transition-all duration-300"
        data-testid={TEST_ID.container}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <NavLogo />

            <div className="hidden md:flex flex-1 items-center justify-center h-full">
              <DesktopNavLinks user={user} unreadCount={unreadMessagesCount} />
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <ThemeToggle />

              {!user && (
                <Link
                  to="/about"
                  className="group/aboutlink hidden md:flex items-center h-9 px-3 rounded-xl text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <span className="flex-shrink-0">{Icons.about(16)}</span>
                  <span className="overflow-hidden max-w-0 group-hover/aboutlink:max-w-[60px] opacity-0 group-hover/aboutlink:opacity-100 transition-all duration-200 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/aboutlink:ml-1.5">
                    About
                  </span>
                </Link>
              )}

              {user && user.role !== "admin" && (
                <Link
                  to="/listing/create"
                  className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {Icons.sell(18)}
                  <span>Sell</span>
                </Link>
              )}

              {user?.role === "admin" && <AdminMenu />}

              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse hidden md:block" />
              ) : (
                <div className="flex items-center gap-1.5">
                  {user && (
                    <div className="md:hidden">
                      <NavNotifications
                        user={user}
                        isOpen={isNotifOpen}
                        setIsOpen={(val) => {
                          setIsNotifOpen(val);
                          if (val) setIsMobileSettingsOpen(false);
                        }}
                      />
                    </div>
                  )}

                  {user && (
                    <button
                      onClick={() => {
                        setIsMobileSettingsOpen(true);
                        setIsNotifOpen(false);
                      }}
                      className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="profile"
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#10B77F]/10 flex items-center justify-center text-[#10B77F] font-bold text-xs ring-1 ring-[#10B77F]/20">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>
                  )}

                  {user && (
                    <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
                      <NavNotifications
                        user={user}
                        isOpen={isNotifOpen}
                        setIsOpen={(val) => setIsNotifOpen(val)}
                      />
                      <div className="relative group/profile" ref={settingsRef}>
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-transparent transition-all hover:ring-[#10B77F]/20 group-hover/profile:bg-[#10B77F]/10"
                          onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt="profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                              <UserAvatarIcon />
                            </div>
                          )}
                        </button>
                        <div
                          className={`absolute right-0 top-full pt-2 transition-all duration-300 z-[120] ${isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:translate-y-0 group-hover/profile:pointer-events-auto"}`}
                        >
                          <div className="w-64 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                            <div className="px-4 py-3 mb-1 border-b border-gray-100 dark:border-white/5">
                              <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                {user.name || "User"}
                              </p>
                            </div>
                            <Link
                              to={profileHref}
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <ProfileIcon />
                              View Profile
                            </Link>
                            <Link
                              to="/inbox"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors relative"
                            >
                              <div className="relative">
                                {Icons.inbox(16)}
                                {unreadMessagesCount > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
                                )}
                              </div>
                              Messages
                            </Link>
                            <Link
                              to="/my-listings"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <Icons.listings size={16} />
                              My Listings
                            </Link>
                            <Link
                              to="/favorites"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <Icons.favorites size={16} />
                              Favorites
                            </Link>
                            <Link
                              to="/account-settings"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <SettingsIcon />
                              Account Settings
                            </Link>
                            <Link
                              to="/about"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              {Icons.about(16)}About BiCycleL
                            </Link>
                            <div className="my-1.5 mx-3 border-t border-gray-100 dark:border-white/5" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-[calc(100%-8px)]"
                            >
                              <LogoutIcon />
                              Log Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!isKeyboardOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-gray-200 dark:border-[#1e1e1e] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <MobileNavLinks user={user} unreadCount={unreadMessagesCount} />
        </div>
      )}

      {isMobileSettingsOpen && (
        <MobileSettingsSheet
          user={user}
          profileHref={profileHref}
          onLogout={handleLogout}
          onClose={() => setIsMobileSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default Nav;
