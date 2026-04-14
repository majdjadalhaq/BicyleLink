import { Link } from "react-router";
import PropTypes from "prop-types";
import { UserAvatarIcon, ProfileIcon, SettingsIcon, LogoutIcon } from "./NavIcons";
import { Icons } from "./NavLinksIcons";

const MobileSettingsSheet = ({ user, profileHref, onLogout, onClose }) => {
  if (!user) return null;

  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-[#1a1a1a] rounded-t-3xl border-t border-gray-200 dark:border-white/10 shadow-2xl pb-safe translate-y-0 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
            Menu
          </p>
          <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
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
              <p className="text-sm font-bold truncate text-gray-900 dark:text-white">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email || ""}
              </p>
            </div>
          </div>
          <Link
            to={profileHref}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
          >
            <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
              <ProfileIcon />
            </span>
            <span>View Profile</span>
          </Link>
          <Link
            to="/account-settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
          >
            <span className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-xl">
              <SettingsIcon />
            </span>
            <span>Account Settings</span>
          </Link>
          <Link
            to="/about"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
          >
            <span className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 rounded-xl">
              {Icons.about(18)}
            </span>
            <span>About BiCycleL</span>
          </Link>
          <div className="my-2 border-t border-gray-100 dark:border-white/5" />
          <button
            onClick={onLogout}
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
  );
};

MobileSettingsSheet.propTypes = {
  user: PropTypes.object,
  profileHref: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MobileSettingsSheet;
