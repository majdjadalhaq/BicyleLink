import { CloseIcon, CheckCircleIcon } from "./AdminIcons";

const WarningHistoryModal = ({ user, warnings, isLoading, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-10 shadow-2xl animate-scaleIn border border-white/10 max-h-[85vh] flex flex-col">
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
          <div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">
              Subject: behavioral dossier
            </span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              Historical Archives
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-[10px]">
                Retrieving Records...
              </p>
            </div>
          ) : warnings.length === 0 ? (
            <div className="bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem] p-12 text-center text-gray-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                <CheckCircleIcon size={32} />
              </div>
              <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                Pristine Conduct Log
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {warnings.map((warning) => (
                <div
                  key={warning._id}
                  className="group p-6 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-3xl transition-all hover:bg-white dark:hover:bg-white/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      {new Date(warning.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    {warning.read && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-emerald-500/10">
                        Intercepted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                    &quot;{warning.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            Seal Records
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WarningHistoryModal;
