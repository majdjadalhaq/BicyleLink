import AccountSettingsSidebar from "./components/AccountSettingsSidebar";
import SecurityTab from "./components/SecurityTab";
import NotificationsTab from "./components/NotificationsTab";
import { useAccountSettings } from "./hooks/useAccountSettings";

/* ─── Main Component ──────────────────────────────────────────── */
const AccountSettings = () => {
  const accountProps = useAccountSettings();
  const { user, activeTab, setActiveTab, success } = accountProps;

  const tabs = [
    {
      id: "security",
      label: "Security",
      icon: (
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
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium">
            Manage your security and notification preferences.
          </p>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl font-bold text-sm border border-emerald-100 dark:border-emerald-500/20 animate-in slide-in-from-top-2 duration-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <AccountSettingsSidebar
            user={user}
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">
            {activeTab === "security" && <SecurityTab {...accountProps} />}

            {activeTab === "notifications" && (
              <NotificationsTab
                user={user}
                handleSettingsChange={accountProps.handleSettingsChange}
                isUpdatingSettings={accountProps.isUpdatingSettings}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
