import PropTypes from "prop-types";
import { Link } from "react-router";
import {
  BlockIcon,
  UnblockIcon,
  WarnIcon,
  HistoryIcon,
  StarIcon,
} from "./AdminIcons";

const UserTableRow = ({
  user,
  currentUser,
  handleToggleBlock,
  setSelectedUserForWarning,
  handleViewWarnings,
  handleToggleRole,
}) => {
  return (
    <tr
      className={`transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] group ${
        user.isBlocked ? "opacity-60 saturate-50" : ""
      }`}
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`
              }
              alt=""
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-[#2a2a2a] shadow-md group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="min-w-0">
            <Link
              to={`/profile/${user._id}`}
              className="font-black text-gray-900 dark:text-white hover:text-emerald-500 transition-colors truncate block text-base"
            >
              {user.name}
            </Link>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 block">
              {user._id.slice(-6)}
            </span>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
            {user.email}
          </span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            user.role === "admin"
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm"
              : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-8 py-6 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
            user.isBlocked
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
          ></span>
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      </td>
      <td className="px-8 py-6 text-right pr-12">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleToggleBlock(user._id)}
            disabled={user._id === currentUser._id}
            className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 disabled:opacity-20 group/op ${
              user.isBlocked
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                : "bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white"
            }`}
            title={user.isBlocked ? "Unblock Agent" : "Deactivate Agent"}
          >
            <span className="flex-shrink-0">
              {user.isBlocked ? <UnblockIcon /> : <BlockIcon />}
            </span>
            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
              {user.isBlocked ? "Unblock" : "Block"}
            </span>
          </button>

          <button
            onClick={() => setSelectedUserForWarning(user)}
            disabled={user._id === currentUser._id}
            className="relative flex items-center h-10 px-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-20 group/op"
            title="Transmit Warning"
          >
            <span className="flex-shrink-0">
              <WarnIcon />
            </span>
            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
              Warn
            </span>
          </button>

          <button
            onClick={() => handleViewWarnings(user)}
            disabled={user._id === currentUser._id}
            className="relative flex items-center h-10 px-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all duration-300 disabled:opacity-20 group/op"
            title="Dossier History"
          >
            <span className="flex-shrink-0">
              <HistoryIcon />
            </span>
            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
              History
            </span>
          </button>

          <div className="w-px h-8 bg-gray-100 dark:bg-white/10 mx-1" />

          <button
            onClick={() => handleToggleRole(user._id)}
            disabled={user._id === currentUser._id}
            className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 disabled:opacity-20 group/op ${
              user.role === "admin"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
            }`}
            title={
              user.role === "admin" ? "Demote Specialist" : "Promote to Admin"
            }
          >
            <span className="flex-shrink-0">
              <StarIcon />
            </span>
            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
              {user.role === "admin" ? "Demote" : "Promote"}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
};

UserTableRow.propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  handleToggleBlock: PropTypes.func.isRequired,
  setSelectedUserForWarning: PropTypes.func.isRequired,
  handleViewWarnings: PropTypes.func.isRequired,
  handleToggleRole: PropTypes.func.isRequired,
};

export default UserTableRow;
