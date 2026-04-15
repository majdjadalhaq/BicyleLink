import PropTypes from "prop-types";
import InputField from "../../../components/form/InputField";
import SubmitButton from "../../../components/form/SubmitButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import ExpandableSection from "./ExpandableSection";

const SecurityChangeEmail = ({
  user,
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
}) => {
  return (
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
        <form onSubmit={handleEmailRequest} className="space-y-4 max-w-md">
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
        <form onSubmit={handleEmailVerify} className="space-y-4 max-w-md">
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
  );
};

SecurityChangeEmail.propTypes = {
  user: PropTypes.object,
  newEmail: PropTypes.string,
  setNewEmail: PropTypes.func,
  emailCode: PropTypes.string,
  setEmailCode: PropTypes.func,
  isEmailCodeSent: PropTypes.bool,
  setIsEmailCodeSent: PropTypes.func,
  isRequestingEmail: PropTypes.bool,
  emailReqError: PropTypes.string,
  isVerifyingEmail: PropTypes.bool,
  emailVerifyError: PropTypes.string,
  handleEmailRequest: PropTypes.func,
  handleEmailVerify: PropTypes.func,
};

export default SecurityChangeEmail;
