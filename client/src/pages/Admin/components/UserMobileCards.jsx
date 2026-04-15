import PropTypes from "prop-types";
import { Link } from "react-router";
import {
  BlockIcon,
  UnblockIcon,
  WarnIcon,
  HistoryIcon,
  PromoteIcon,
} from "./AdminIcons";

const UserMobileCards = ({
  users,
  currentUser,
  handleToggleBlock,
  setSelectedUserForWarning,
  handleViewWarnings,
  handleToggleRole,
}) => {
  return (
    <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <div
          key={user._id}
          className={`bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-[#2a2a2a] p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-xl ${
            user.isBlocked ? "opacity-60 saturate-50" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={
                    user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`
                  }
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-[#2a2a2a] shadow-md"
                />
              </div>
              <div className="min-w-0">
                <Link
                  to={`/profile/${user._id}`}
                  className="font-black text-gray-900 dark:text-white hover:text-emerald-500 transition-colors truncate block text-lg"
                >
                  {user.name}
                </Link>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 block">
                  ID: {user._id.slice(-6)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                  user.role === "admin"
                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                  user.isBlocked
                    ? "bg-red-500/10 text-red-600 border-red-500/10"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                }`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50/50 dark:bg-black/20 rounded-2xl mb-6">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
              Credentials
            </span>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
              {user.email}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              onClick={() => handleToggleBlock(user._id)}
              disabled={user._id === currentUser._id}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                user.isBlocked
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white"
              } disabled:opacity-20`}
            >
              {user.isBlocked ? (
                <UnblockIcon size={14} />
              ) : (
                <BlockIcon size={14} />
              )}
              <span>{user.isBlocked ? "Unblock" : "Block"}</span>
            </button>

            <button
              onClick={() => setSelectedUserForWarning(user)}
              disabled={user._id === currentUser._id}
              className="flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
            >
              <WarnIcon size={14} />
              <span>Warn</span>
            </button>

            <button
              onClick={() => handleViewWarnings(user)}
              disabled={user._id === currentUser._id}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-20"
            >
              <HistoryIcon size={14} />
              <span>History</span>
            </button>

            <button
              onClick={() => handleToggleRole(user._id)}
              disabled={user._id === currentUser._id}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                user.role === "admin"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
              } disabled:opacity-20`}
            >
              <PromoteIcon size={14} />
              <span>{user.role === "admin" ? "Demote" : "Promote"}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

UserMobileCards.propTypes = {
  users: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  handleToggleBlock: PropTypes.func.isRequired,
  setSelectedUserForWarning: PropTypes.func.isRequired,
  handleViewWarnings: PropTypes.func.isRequired,
  handleToggleRole: PropTypes.func.isRequired,
};

export default UserMobileCards;
