import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { ProfileIcon, SettingsIcon, LogoutIcon, UserAvatarIcon } from "./NavIcons";
import { Icons } from "./NavLinksIcons";

const ProfileDropdown = ({
  user,
  isOpen,
  setIsOpen,
  unreadMessagesCount,
  onLogout,
  profileHref,
  settingsRef,
}) => {
  return (
    <div className="relative group/profile" ref={settingsRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-transparent transition-all hover:ring-[#10B77F]/20 group-hover/profile:bg-[#10B77F]/10"
        onClick={() => setIsOpen(!isOpen)}
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
        className={`absolute right-0 top-full pt-2 transition-all duration-300 z-[120] ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:translate-y-0 group-hover/profile:pointer-events-auto"}`}
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
            {Icons.listings(16)}
            My Listings
          </Link>
          <Link
            to="/favorites"
            className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#10B77F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            {Icons.favorites(16)}
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
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 mx-1 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-[calc(100%-8px)]"
          >
            <LogoutIcon />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

ProfileDropdown.propTypes = {
  user: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  unreadMessagesCount: PropTypes.number.isRequired,
  onLogout: PropTypes.func.isRequired,
  profileHref: PropTypes.string.isRequired,
  settingsRef: PropTypes.object.isRequired,
};

export default ProfileDropdown;
