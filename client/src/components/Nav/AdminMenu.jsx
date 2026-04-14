import { Link } from "react-router";
import { Icons } from "./NavLinksIcons";

const AdminMenu = () => {
  return (
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
            <span className="opacity-70">{Icons.adminListings(14)}</span>
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
  );
};

export default AdminMenu;
