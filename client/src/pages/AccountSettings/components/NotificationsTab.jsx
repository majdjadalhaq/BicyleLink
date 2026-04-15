import PropTypes from "prop-types";
import ToggleRow from "./ToggleRow";

const NotificationsTab = ({
  user,
  handleSettingsChange,
  isUpdatingSettings,
}) => {
  return (
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
  );
};

NotificationsTab.propTypes = {
  user: PropTypes.object,
  handleSettingsChange: PropTypes.func.isRequired,
  isUpdatingSettings: PropTypes.bool,
};

export default NotificationsTab;
