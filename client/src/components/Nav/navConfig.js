/**
 * Navigation Configuration — Role Matrix
 *
 * rightZone: true       → desktop right zone only (profile button area)
 * desktopOnly: true     → excluded from mobile bottom bar
 * mobileOnly: true      → excluded from desktop center nav
 * noMobileTab: true     → excluded from mobile bottom bar (profile dropdown item)
 * isCTA: true           → Sell button gets emerald circle CTA style on mobile
 * isAdmin: true         → violet color on desktop
 * profileDropdownOnly   → shown only in desktop profile dropdown, not center nav or mobile
 */

export const getNavLinks = (user) => {
  const role = user?.role || "guest";

  // ── Guest ──────────────────────────────────────────────────────────
  if (!user) {
    return [
      { path: "/", label: "Home", iconKey: "home" },
      { path: "/login", label: "Login", iconKey: "login" },
      { path: "/signup", label: "Sign Up", iconKey: "signup" },
      // About: desktop right zone + mobile bottom bar
      {
        path: "/about",
        label: "About",
        iconKey: "about",
      },
    ];
  }

  // ── Admin ──────────────────────────────────────────────────────────
  if (role === "admin") {
    return [
      // Desktop: Inbox in right zone
      {
        path: "/inbox",
        label: "Inbox",
        iconKey: "inbox",
        hasUnreadBadge: true,
        rightZone: true,
        desktopOnly: true,
      },
      // Desktop-only admin sub-pages (center nav)
      {
        path: "/admin",
        label: "Dashboard",
        iconKey: "admin",
        rightZone: true,
        desktopOnly: true,
        isAdmin: true,
        isAdminDashboard: true,
        subLinks: [
          {
            path: "/admin/listings",
            label: "Listings",
            iconKey: "adminListings",
          },
          { path: "/admin/users", label: "Users", iconKey: "users" },
          { path: "/admin/reports", label: "Reports", iconKey: "reports" },
        ],
      },
      // Settings → right zone (not mobile)
      {
        path: "/account-settings",
        label: "Settings",
        iconKey: "settings",
        rightZone: true,
        noMobileTab: true,
      },
      // Mobile admin tabs
      {
        path: "/",
        label: "Home",
        iconKey: "home",
        mobileOnly: true,
      },
      {
        path: "/inbox",
        label: "Chat",
        iconKey: "inbox",
        hasUnreadBadge: true,
        mobileOnly: true,
      },
      {
        path: "/admin",
        label: "Dashboard",
        iconKey: "admin",
        isCTA: true, // Dashboard as primary CTA for admin mobile
        isAdminDashboard: true,
        mobileOnly: true,
      },
      {
        path: "/admin/users",
        label: "Users",
        iconKey: "users",
        mobileOnly: true,
      },
      {
        path: "/admin/reports",
        label: "Reports",
        iconKey: "reports",
        mobileOnly: true,
      },
    ];
  }

  // ── Regular User ───────────────────────────────────────────────────
  return [
    // ── Desktop Center Nav ──────────────────────────────────────────
    // Sell (Now in Right Zone on PC, Center CTA on Mobile)
    {
      path: "/listing/create",
      label: "Sell",
      iconKey: "sell",
      isCTA: true,
      testId: "linkToCreateListing",
      rightZone: true, // Appears in right zone on PC
      desktopOnly: true, // shown on desktop right zone only
    },

    // Inbox (Now in Profile Dropdown only on PC)
    {
      path: "/inbox",
      label: "Messages",
      iconKey: "inbox",
      hasUnreadBadge: true,
      profileDropdownOnly: true, // Desktop: Profile Dropdown
    },
    // My Listings → desktop profile dropdown only (not center, not mobile tab)
    {
      path: "/my-listings",
      label: "My Listings",
      iconKey: "listings",
      profileDropdownOnly: true,
    },
    // Favorites → desktop profile dropdown only (not center, not mobile tab)
    {
      path: "/favorites",
      label: "Favorites",
      iconKey: "favorites",
      profileDropdownOnly: true,
    },
    // Settings → right zone (desktop only, no mobile tab)
    {
      path: "/account-settings",
      label: "Settings",
      iconKey: "settings",
      rightZone: true,
      noMobileTab: true,
    },

    // ── Mobile-Only Bottom Bar tabs ─────────────────────────────────
    // Home
    {
      path: "/",
      label: "Home",
      iconKey: "home",
      mobileOnly: true,
    },
    // Chat (Early in mobile User nav)
    {
      path: "/inbox",
      label: "Chat",
      iconKey: "inbox",
      hasUnreadBadge: true,
      mobileOnly: true,
    },
    // Sell (CTA center)
    {
      path: "/listing/create",
      label: "Sell",
      iconKey: "sell",
      isCTA: true,
      mobileOnly: true,
    },
    // Favorites (mobile)
    {
      path: "/favorites",
      label: "Favs",
      iconKey: "favorites",
      mobileOnly: true,
    },
    // My Listings (mobile)
    {
      path: "/my-listings",
      label: "Listings",
      iconKey: "listings",
      mobileOnly: true,
    },
  ];
};
