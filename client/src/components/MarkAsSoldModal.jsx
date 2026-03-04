import PropTypes from "prop-types";

/**
 * Shared Modal for the owner to mark a listing as sold and record the buyer.
 */
const MarkAsSoldModal = ({
  isOpen,
  candidates,
  isLoading,
  selectedBuyerId,
  onBuyerChange,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-3xl w-full max-w-[450px] shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0">
              Mark as Sold
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
              Record the transaction
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
          Who bought this bike? Select from your recent chats to allow them to
          review your sale.
        </p>

        {isLoading ? (
          <div className="my-8 flex flex-col items-center justify-center gap-3 py-6 rounded-2xl bg-gray-50 dark:bg-white/5">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Loading buyers...
            </span>
          </div>
        ) : (
          <div className="my-6">
            <select
              value={selectedBuyerId}
              onChange={(e) => onBuyerChange(e.target.value)}
              className="w-full p-4 border border-gray-200 dark:border-dark-border rounded-xl text-base bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold appearance-none cursor-pointer"
            >
              <option value="">-- Select Buyer --</option>
              {candidates.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
              <option value="other">Other / Sold Outside App</option>
            </select>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-[1.5] bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            disabled={
              isLoading || (!selectedBuyerId && selectedBuyerId !== "other")
            }
            onClick={onConfirm}
          >
            Confirm Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

MarkAsSoldModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  candidates: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  selectedBuyerId: PropTypes.string.isRequired,
  onBuyerChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MarkAsSoldModal;
