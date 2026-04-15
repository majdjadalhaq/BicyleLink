import PropTypes from "prop-types";
import InputField from "../../../components/form/InputField";
import SubmitButton from "../../../components/form/SubmitButton";
import StatusMessage from "../../../components/ui/StatusMessage";
import ExpandableSection from "./ExpandableSection";

const SecurityDeleteAccount = ({
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
}) => {
  return (
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
          This action is <strong>irreversible</strong>. All your listings,
          messages, and data will be permanently deleted.
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
            {isRequestingDeleteCode ? "Sending..." : "Send Deletion Code"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
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
  );
};

SecurityDeleteAccount.propTypes = {
  deleteCode: PropTypes.string,
  setDeleteCode: PropTypes.func,
  isDeleteCodeSent: PropTypes.bool,
  setIsDeleteCodeSent: PropTypes.func,
  isRequestingDeleteCode: PropTypes.bool,
  deleteReqError: PropTypes.string,
  isDeleting: PropTypes.bool,
  deleteError: PropTypes.string,
  performDeleteCodeReq: PropTypes.func,
  handleDeleteAccount: PropTypes.func,
};

export default SecurityDeleteAccount;
