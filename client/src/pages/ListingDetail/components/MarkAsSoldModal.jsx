/**
 * Modal for the owner to mark a listing as sold and record the buyer.
 * Co-located with ListingDetail as it is feature-specific, not globally reusable.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Array<{_id: string, name: string, email: string}>} props.candidates
 * @param {boolean} props.isLoading
 * @param {string} props.selectedBuyerId
 * @param {function(string): void} props.onBuyerChange
 * @param {function(): void} props.onConfirm
 * @param {function(): void} props.onClose
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
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Mark as Sold</h3>
        <p>Who bought this item? Select from your chats:</p>

        {isLoading ? (
          <div>Loading buyers...</div>
        ) : (
          <div className="buyer-selection">
            <select
              value={selectedBuyerId}
              onChange={(e) => onBuyerChange(e.target.value)}
              className="buyer-select"
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

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-confirm"
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
