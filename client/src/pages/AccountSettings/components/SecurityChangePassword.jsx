import PropTypes from "prop-types";
import InputField from "../../../components/form/InputField";
import SubmitButton from "../../../components/form/SubmitButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import ExpandableSection from "./ExpandableSection";

const SecurityChangePassword = ({
  user,
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
}) => {
  return (
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
            {isRequestingPassCode ? "Sending..." : "Send Security Code"}
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
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
  );
};

SecurityChangePassword.propTypes = {
  user: PropTypes.object,
  passwordCode: PropTypes.string,
  setPasswordCode: PropTypes.func,
  newPassword: PropTypes.string,
  setNewPassword: PropTypes.func,
  isPasswordCodeSent: PropTypes.bool,
  setIsPasswordCodeSent: PropTypes.func,
  isChangingPassword: PropTypes.bool,
  passwordError: PropTypes.string,
  isRequestingPassCode: PropTypes.bool,
  passReqError: PropTypes.string,
  performPassCodeReq: PropTypes.func,
  handlePasswordChange: PropTypes.func,
};

export default SecurityChangePassword;
