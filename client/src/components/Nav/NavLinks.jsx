import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { getNavLinks } from "./navConfig";

/* ─── SVG Icons ─────────────────────────────────────────────────────── */
export const Icons = {
  home: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  login: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  ),
  signup: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  sell: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  favorites: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  listings: (size = 18) => (
    <svg
      width={size}
      height={size}
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
  ),
  inbox: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  settings: (size = 18) => (
    <svg
      width={size}
      height={size}
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
  ),
  admin: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  users: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  adminListings: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  reports: (size = 18) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
};

/* ─── Desktop Nav Links (center zone) ──────────────────────────────── */
export const DesktopNavLinks = ({ user, unreadCount }) => {
  const links = getNavLinks(user).filter(
    (l) => !l.mobileOnly && !l.rightZone && !l.profileDropdownOnly,
  );

  return (
    <ul className="flex items-center gap-4 h-full">
      {links.map((link) => {
        const icon = Icons[link.iconKey] || Icons.home;
        const isAdminLink = link.isAdmin;

        return (
          <li
            key={link.path + link.label}
            className="relative group/navitem h-full flex items-center"
          >
            <NavLink
              to={link.path}
              data-testid={link.testId}
              title={link.label}
              aria-label={link.label}
              end={link.path === "/"}
              className={({ isActive }) => {
                const base =
                  "relative flex items-center h-9 px-3 rounded-xl overflow-hidden transition-all duration-200 ";
                if (isAdminLink && isActive)
                  return (
                    base +
                    "text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                  );
                if (isAdminLink)
                  return (
                    base +
                    "text-violet-500/70 dark:text-violet-400/70 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
                  );
                if (isActive)
                  return (
                    base +
                    "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  );
                return (
                  base +
                  "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-white/5"
                );
              }}
            >
              <span className="flex-shrink-0 transition-all duration-200 relative z-10">
                {icon(16)}
              </span>
              {link.hasUnreadBadge && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold text-white bg-red-500 border-[1.5px] border-white dark:border-[#121212] rounded-full px-0.5 z-30">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="overflow-hidden max-w-0 group-hover/navitem:max-w-[90px] opacity-0 group-hover/navitem:opacity-100 transition-all duration-200 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/navitem:ml-1.5 flex items-center gap-1">
                {link.label}
                {link.subLinks && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-50"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </span>
            </NavLink>

            {/* Dropdown for subLinks */}
            {link.subLinks && (
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible translate-y-2 group-hover/navitem:opacity-100 group-hover/navitem:visible group-hover/navitem:translate-y-0 transition-all duration-200 z-[110]">
                <div className="w-48 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl py-2 overflow-hidden">
                  <div className="px-4 py-1.5 mb-1 border-b border-gray-50 dark:border-white/5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {link.label} Tools
                    </span>
                  </div>
                  {link.subLinks.map((sub) => {
                    const subIcon = Icons[sub.iconKey] || Icons.home;
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                          {subIcon(14)}
                        </span>
                        {sub.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

/* ─── Mobile Bottom Tab Bar ──────────────────────────────────────────── */
export const MobileNavLinks = ({ user, unreadCount }) => {
  const allLinks = getNavLinks(user);
  // Filter for mobile bottom tabs
  const links = allLinks.filter(
    (l) => !l.desktopOnly && !l.noMobileTab && !l.profileDropdownOnly,
  );

  return (
    <ul className="flex items-stretch h-full w-full px-2">
      {links.map((link) => {
        const icon = Icons[link.iconKey] || Icons.home;
        const isCTA = link.isCTA;
        const isAdminCTA = isCTA && link.isAdminDashboard;

        return (
          <li
            key={link.path + link.label}
            className="flex flex-1 items-center justify-center"
          >
            <NavLink
              to={link.path}
              data-testid={link.testId}
              title={link.label}
              aria-label={link.label}
              end={link.path === "/"}
              className={({ isActive }) => {
                if (isCTA)
                  return "flex flex-col items-center justify-center gap-1 -mt-3";
                return (
                  "relative flex flex-1 flex-col items-center justify-center h-full gap-1 py-1 transition-colors duration-200 " +
                  (isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400")
                );
              }}
            >
              {isCTA ? (
                <>
                  <span
                    className={`w-11 h-11 flex items-center justify-center rounded-full text-white shadow-lg ${
                      isAdminCTA
                        ? "bg-violet-500 shadow-violet-500/30"
                        : "bg-emerald-500 shadow-emerald-500/30"
                    }`}
                  >
                    {icon(20)}
                  </span>
                  <span
                    className={`text-[10px] font-black leading-none mt-1 ${
                      isAdminCTA
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {link.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="relative">
                    {icon(18)}
                    {link.hasUnreadBadge && unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[14px] h-[14px] text-[8px] font-bold text-white bg-red-500 border border-white dark:border-[#121212] rounded-full px-0.5">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold leading-none mt-0.5">
                    {link.label}
                  </span>
                  {/* Subtle active indicator dot */}
                  <div className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-500 opacity-0 transition-opacity duration-200 [.active_&]:opacity-100" />
                </>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

DesktopNavLinks.propTypes = {
  user: PropTypes.object,
  unreadCount: PropTypes.number,
};

MobileNavLinks.propTypes = {
  user: PropTypes.object,
  unreadCount: PropTypes.number,
};

const NavLinks = DesktopNavLinks;
NavLinks.propTypes = DesktopNavLinks.propTypes;
export default NavLinks;
