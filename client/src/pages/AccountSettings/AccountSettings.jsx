import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import StatusMessage from "../../components/ui/StatusMessage";
import NavItem from "./components/NavItem";
import ExpandableSection from "./components/ExpandableSection";
import ToggleRow from "./components/ToggleRow";
import { useAccountSettings } from "./hooks/useAccountSettings";

/* ─── Main Component ──────────────────────────────────────────── */
const AccountSettings = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    success,
    passwordCode,
    setPasswordCode,
    newPassword,
    setNewPassword,
    isPasswordCodeSent,
    setIsPasswordCodeSent,
    isChangingPassword,
    passwordError,
    isRequestingPassCode,
    passReqError,
    performPassCodeReq,
    handlePasswordChange,
    newEmail,
    setNewEmail,
    emailCode,
    setEmailCode,
    isEmailCodeSent,
    setIsEmailCodeSent,
    isRequestingEmail,
    emailReqError,
    isVerifyingEmail,
    emailVerifyError,
    handleEmailRequest,
    handleEmailVerify,
    deleteCode,
    setDeleteCode,
    isDeleteCodeSent,
    setIsDeleteCodeSent,
    isRequestingDeleteCode,
    deleteReqError,
    isDeleting,
    deleteError,
    performDeleteCodeReq,
    handleDeleteAccount,
    isUpdatingSettings,
    handleSettingsChange,
  } = useAccountSettings();

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
          {/* ── Sidebar ── */}
          <aside className="md:w-60 flex-shrink-0">
            {/* Profile Card */}
            <div className="mb-6 p-5 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-3 mx-auto shadow-lg shadow-emerald-500/20">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="text-center text-sm font-black text-gray-900 dark:text-white truncate">
                {user?.name}
              </h2>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {user?.email}
              </p>
            </div>

            <nav className="flex md:flex-col gap-2">
              {tabs.map((tab) => (
                <NavItem
                  key={tab.id}
                  {...tab}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">
            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                {/* Change Password */}
                <ExpandableSection
                  title="Change Password"
                  subtitle="Update your account password with a security code"
                  icon={
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
                  }
                >
                  {!isPasswordCodeSent ? (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        We&apos;ll send a 6-digit code to{" "}
                        <strong className="text-gray-700 dark:text-gray-300">
                          {user?.email}
                        </strong>
                        .
                      </p>
                      <StatusMessage type="error" message={passReqError} />
                      <button
                        type="button"
                        onClick={() => performPassCodeReq({ method: "POST" })}
                        disabled={isRequestingPassCode}
                        className="mt-3 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isRequestingPassCode ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        )}
                        {isRequestingPassCode
                          ? "Sending..."
                          : "Send Security Code"}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handlePasswordChange}
                      className="space-y-4 max-w-md"
                    >
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Code sent to {user?.email}
                      </p>
                      <InputField
                        name="passwordCode"
                        label="Security Code"
                        value={passwordCode}
                        onChange={setPasswordCode}
                        placeholder="6-digit Security Code"
                      />
                      <InputField
                        name="newPassword"
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="New Password"
                      />
                      <StatusMessage type="error" message={passwordError} />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPasswordCodeSent(false)}
                          className="px-5 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl font-bold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <SubmitButton
                          isLoading={isChangingPassword}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-sm"
                        >
                          Update Password
                        </SubmitButton>
                      </div>
                    </form>
                  )}
                </ExpandableSection>

                {/* Change Email */}
                <ExpandableSection
                  title="Change Email Address"
                  subtitle={`Current: ${user?.email}`}
                  icon={
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                >
                  {!isEmailCodeSent ? (
                    <form
                      onSubmit={handleEmailRequest}
                      className="space-y-4 max-w-md"
                    >
                      <InputField
                        name="newEmail"
                        label="New Email"
                        type="email"
                        value={newEmail}
                        onChange={setNewEmail}
                        placeholder="New Email Address"
                      />
                      <StatusMessage type="error" message={emailReqError} />
                      <SubmitButton
                        isLoading={isRequestingEmail}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-sm"
                      >
                        Send Verification Code
                      </SubmitButton>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleEmailVerify}
                      className="space-y-4 max-w-md"
                    >
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Code sent to {newEmail}
                      </p>
                      <InputField
                        name="emailCode"
                        label="Verification Code"
                        value={emailCode}
                        onChange={setEmailCode}
                        placeholder="6-digit Verification Code"
                      />
                      <StatusMessage type="error" message={emailVerifyError} />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEmailCodeSent(false)}
                          className="px-5 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl font-bold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <SubmitButton
                          isLoading={isVerifyingEmail}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-sm"
                        >
                          Verify &amp; Update
                        </SubmitButton>
                      </div>
                    </form>
                  )}
                </ExpandableSection>

                {/* Danger Zone */}
                <ExpandableSection
                  title="Delete Account"
                  subtitle="Permanently remove your account and all data"
                  danger
                  icon={
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  }
                >
                  <div className="p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/10 mb-5">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      This action is <strong>irreversible</strong>. All your
                      listings, messages, and data will be permanently deleted.
                    </p>
                  </div>

                  {!isDeleteCodeSent ? (
                    <div>
                      <StatusMessage type="error" message={deleteReqError} />
                      <button
                        type="button"
                        onClick={() => performDeleteCodeReq({ method: "POST" })}
                        disabled={isRequestingDeleteCode}
                        className="mt-3 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isRequestingDeleteCode ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        )}
                        {isRequestingDeleteCode
                          ? "Sending..."
                          : "Send Deletion Code"}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleDeleteAccount}
                      className="space-y-4 max-w-md"
                    >
                      <InputField
                        name="deleteCode"
                        label="Deletion Code"
                        value={deleteCode}
                        onChange={setDeleteCode}
                        placeholder="6-digit Security Code"
                      />
                      <StatusMessage type="error" message={deleteError} />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setIsDeleteCodeSent(false)}
                          className="px-5 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl font-bold text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <SubmitButton
                          isLoading={isDeleting}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-colors text-sm"
                        >
                          Confirm Deletion
                        </SubmitButton>
                      </div>
                    </form>
                  )}
                </ExpandableSection>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 animate-in slide-in-from-right-4 duration-300">
                <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6">
                  Notification Preferences
                </h2>
                <div>
                  <ToggleRow
                    id="notif-messages"
                    label="Message Alerts"
                    description="Get notified when someone sends you a message."
                    checked={user?.notificationSettings?.messages !== false}
                    onChange={(val) => handleSettingsChange("messages", val)}
                    disabled={isUpdatingSettings}
                  />
                  <ToggleRow
                    id="notif-reviews"
                    label="Review Notifications"
                    description="Receive alerts when someone reviews your listing."
                    checked={user?.notificationSettings?.reviews !== false}
                    onChange={(val) => handleSettingsChange("reviews", val)}
                    disabled={isUpdatingSettings}
                  />
                  <ToggleRow
                    id="notif-favorites"
                    label="Favorite Alerts"
                    description="Know when someone saves your listing to favorites."
                    checked={user?.notificationSettings?.favorites !== false}
                    onChange={(val) => handleSettingsChange("favorites", val)}
                    disabled={isUpdatingSettings}
                  />
                  <ToggleRow
                    id="notif-marketing"
                    label="Marketing Emails"
                    description="Updates about new features, promotions, and tips."
                    checked={user?.notificationSettings?.marketing !== false}
                    onChange={(val) => handleSettingsChange("marketing", val)}
                    disabled={isUpdatingSettings}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
