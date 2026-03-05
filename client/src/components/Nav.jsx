import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import TEST_ID from "./Nav.testid";

import useUnreadCount from "../hooks/useUnreadCount";
import useNotifications from "../hooks/useNotifications";
import useKeyboardFocus from "../hooks/useKeyboardFocus";
import { DesktopNavLinks, MobileNavLinks } from "./Nav/NavLinks";
import { Icons } from "./Nav/NavLinksIcons";
import NavNotifications from "./Nav/NavNotifications";
import { ThemeToggle } from "./ui";

/* ─── Inline SVG helpers ─────────────────────────────────────────────── */

const LogoutIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UserAvatarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

const Nav = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const isKeyboardOpen = useKeyboardFocus();
  const unreadMessagesCount = useUnreadCount(user);
  useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const settingsRef = useRef(null);

  const isMinimalNav = false; // Restoring full nav branding as per user request

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsNotifOpen(false);
    setIsMobileSettingsOpen(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [location.pathname]);

  useEffect(() => {
    // No-op handler for settingsRef if needed, but the click-outside logic for click-based states is removed
  }, []);

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
            {/* LEFT: Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="group flex items-center transition-all duration-500"
              >
                {/* Logo Icon (Mechanical B) */}
                <img
                  src="/favicon.png"
                  alt="BiCycleL"
                  className="h-9 w-9 md:h-10 md:w-10 object-contain relative z-10 transition-all duration-500 ease-out group-hover:scale-110 drop-shadow-glow"
                />

                {/* Brand Text & Link icon - Hidden on Mobile, Hidden entirely by default, Expands only on hover */}
                <div className="hidden md:flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-w-0 opacity-0 group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-1.5">
                  <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white transition-colors">
                    icycle
                  </span>

                  <div className="flex items-center text-emerald-500 ml-0.5">
                    {/* The 'L' which is actually a Link icon */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0 md:w-5 md:h-5 text-[#10B77F]"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* CENTER: Desktop link centering */}
            {!isMinimalNav && (
              <div className="hidden md:flex flex-1 items-center justify-center h-full">
                <div className="flex items-center gap-8">
                  <DesktopNavLinks
                    user={user}
                    unreadCount={unreadMessagesCount}
                  />
                </div>
              </div>
            )}

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* About Link (PC Right Zone for guests only) */}
              {!isMinimalNav && !user && (
                <Link
                  to="/about"
                  aria-label="About BiCycleL"
                  className="group/aboutlink hidden md:flex items-center h-9 px-3 rounded-xl text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-white/5 focus-visible:text-emerald-600 dark:focus-visible:text-emerald-400 focus-visible:bg-gray-100 dark:focus-visible:bg-white/5 transition-all duration-200"
                >
                  <span className="flex-shrink-0">{Icons.about(16)}</span>
                  <span className="overflow-hidden max-w-0 group-hover/aboutlink:max-w-[60px] group-focus-within/aboutlink:max-w-[60px] opacity-0 group-hover/aboutlink:opacity-100 group-focus-within/aboutlink:opacity-100 transition-all duration-200 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/aboutlink:ml-1.5 group-focus-within/aboutlink:ml-1.5">
                    About
                  </span>
                </Link>
              )}

              {/* Sell Button (PC Right Zone for regular users only) */}
              {!isMinimalNav && user && user.role !== "admin" && (
                <Link
                  to="/listing/create"
                  aria-label="Create new listing"
                  className="hidden md:flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {Icons.sell(18)}
                  <span>Sell</span>
                </Link>
              )}

              {/* Admin Dashboard consolidated menu (Desktop Right Zone) */}
              {!isMinimalNav && user?.role === "admin" && (
                <div className="hidden md:block relative group/adminmenu">
                  <button
                    className="flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-violet-500 dark:text-violet-400 transition-all duration-500"
                    aria-label="Admin Tools"
                  >
                    <span className="opacity-80 group-hover/adminmenu:scale-110 transition-transform duration-500">
                      {Icons.admin(18)}
                    </span>
                    {/* Expanding Label Interaction */}
                    <div className="max-w-0 overflow-hidden group-hover/adminmenu:max-w-[100px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                      <span className="text-xs font-black uppercase tracking-widest pl-1 whitespace-nowrap">
                        Dashboard
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Tools */}
                  <div className="absolute right-0 top-full pt-2 pointer-events-none opacity-0 translate-y-2 group-hover/adminmenu:pointer-events-auto group-hover/adminmenu:opacity-100 group-hover/adminmenu:translate-y-0 transition-all duration-300 z-[120]">
                    <div className="w-56 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-violet-500/10 shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 mb-1">
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">
                          Management
                        </span>
                      </div>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="opacity-70">{Icons.admin(14)}</span>
                        Overview
                      </Link>
                      <Link
                        to="/admin/listings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="opacity-70">
                          {Icons.adminListings(14)}
                        </span>
                        Listings
                      </Link>
                      <Link
                        to="/admin/users"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="opacity-70">{Icons.users(14)}</span>
                        Users
                      </Link>
                      <Link
                        to="/admin/reports"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="opacity-70">{Icons.reports(14)}</span>
                        Reports
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Only render auth-dependent actions once loading is complete */}
              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse hidden md:block" />
              ) : (
                <div className="flex items-center gap-1.5">
                  {/* Mobile: Notifications Top-Bar */}
                  {!isMinimalNav && user && (
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

                  {/* Mobile: Profile Picture / Settings Top-Bar */}
                  {!isMinimalNav && user && (
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

                  {/* Desktop Only Actions */}
                  {!isMinimalNav && user && (
                    <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-white/10">
                      {/* Notifications */}
                      <NavNotifications
                        user={user}
                        isOpen={isNotifOpen}
                        setIsOpen={(val) => {
                          setIsNotifOpen(val);
                        }}
                      />

                      {/* Unified Profile/Settings Dropdown */}
                      <div className="relative group/profile" ref={settingsRef}>
                        <button
                          className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-transparent transition-all hover:ring-[#10B77F]/20 group-hover/profile:ring-[#10B77F]/40 group-hover/profile:bg-[#10B77F]/10"
                          aria-label="User menu"
                          onClick={() => navigate(profileHref)}
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

                        {/* Hover Dropdown */}
                        <div className="absolute right-0 top-full pt-2 pointer-events-none opacity-0 translate-y-2 group-hover/profile:pointer-events-auto group-hover/profile:opacity-100 group-hover/profile:translate-y-0 transition-all duration-300 z-[120]">
                          <div className="w-64 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
                            {/* User Header */}
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

                            {/* Inbox / Messages (PC Profile Dropdown only) */}
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
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="8" y1="6" x2="21" y2="6" />
                                <line x1="8" y1="12" x2="21" y2="12" />
                                <line x1="8" y1="18" x2="21" y2="18" />
                                <line x1="3" y1="6" x2="3.01" y2="6" />
                                <line x1="3" y1="12" x2="3.01" y2="12" />
                                <line x1="3" y1="18" x2="3.01" y2="18" />
                              </svg>
                              My Listings
                            </Link>
                            <Link
                              to="/favorites"
                              className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
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
                              {Icons.about(16)}
                              About BiCycleL
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

      {/* MOBILE BOTTOM TAB BAR */}
      {!isKeyboardOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border-t border-gray-200 dark:border-[#1e1e1e] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <MobileNavLinks user={user} unreadCount={unreadMessagesCount} />
        </div>
      )}

      {/* MOBILE SETTINGS BOTTOM SHEET */}
      {isMobileSettingsOpen && user && (
        <>
          <div
            className="md:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileSettingsOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-[#1a1a1a] rounded-t-3xl border-t border-gray-200 dark:border-white/10 shadow-2xl pb-safe">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                Menu
              </p>
              <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <UserAvatarIcon />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email || ""}
                  </p>
                </div>
              </div>
              <Link
                to={profileHref}
                onClick={() => setIsMobileSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
                  <ProfileIcon />
                </span>
                <span>View Profile</span>
              </Link>
              <Link
                to="/account-settings"
                onClick={() => setIsMobileSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
                  <SettingsIcon />
                </span>
                <span>Account Settings</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileSettingsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 rounded-xl">
                  {Icons.about(18)}
                </span>
                <span>About BiCycleL</span>
              </Link>
              <div className="my-2 border-t border-gray-100 dark:border-white/5" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors"
              >
                <span className="w-9 h-9 flex items-center justify-center bg-red-50 dark:hover:bg-red-500/10 rounded-xl">
                  <LogoutIcon />
                </span>
                <span>Log Out</span>
              </button>
              <div className="h-4" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Nav;
