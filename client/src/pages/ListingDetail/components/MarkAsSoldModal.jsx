/**
 * Modal for the owner to mark a listing as sold and record the buyer.
 * Co-located with ListingDetail as it is feature-specific, not globally reusable.
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-dark-surface p-8 rounded-xl w-[90%] max-w-[450px] shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white mt-0">
          Mark as Sold
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Who bought this item? Select from your chats:
        </p>

        {isLoading ? (
          <div className="my-6 text-gray-500">Loading buyers...</div>
        ) : (
          <div className="my-6">
            <select
              value={selectedBuyerId}
              onChange={(e) => onBuyerChange(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-lg text-base bg-white dark:bg-dark-input text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald outline-none transition-shadow"
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

        <div className="flex justify-end gap-4 mt-8">
          <button
            className="bg-gray-100 dark:bg-dark-input hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedBuyerId && selectedBuyerId !== "other"}
            onClick={onConfirm}
          >
            Confirm Sold
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAsSoldModal;
