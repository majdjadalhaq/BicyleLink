import { CloseIcon } from "./AdminIcons";

const WarningModal = ({
  user,
  warningMessage,
  onMessageChange,
  onSubmit,
  onClose,
  isSending,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-10 shadow-2xl animate-scaleIn border border-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />

        <header className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">
              Protocol: Formal Warning
            </span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              Cautionary Transmission
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          >
            <CloseIcon />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-wide">
              Target Identity:{" "}
              <span className="font-black text-amber-600 dark:text-amber-200">
                {user.name}
              </span>
              <br />
              This transmission will be logged as an official platform
              infraction notification.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              Message Content
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-3xl px-6 py-5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 min-h-[160px] resize-none transition-all"
              placeholder="Specify findings and required actions..."
              value={warningMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-gray-50 dark:bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              Terminate
            </button>
            <button
              type="submit"
              disabled={isSending || !warningMessage.trim()}
              className="flex-1 px-8 py-4 bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-20"
            >
              {isSending ? "Transmitting..." : "Send Transmission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarningModal;
