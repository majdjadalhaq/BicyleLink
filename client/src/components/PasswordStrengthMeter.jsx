import { Check, X } from "lucide-react";

const PasswordStrengthMeter = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "At least 1 lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "At least 1 number", test: (p) => /[0-9]/.test(p) },
    { label: "At least 1 special character (@$!%*?&)", test: (p) => /[@$!%*?&]/.test(p) },
  ];

  const getStrength = (password) => {
    return requirements.filter((req) => req.test(password)).length;
  };

  const strength = getStrength(password);

  const getStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const strengthColors = {
    bar: [
      "bg-gray-300 dark:bg-white/10",
      "bg-red-500",
      "bg-red-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-emerald-500",
    ],
    text: [
      "text-gray-400",
      "text-red-500",
      "text-red-500",
      "text-amber-500",
      "text-yellow-500",
      "text-emerald-500",
    ],
  };

  if (!password) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${strengthColors.bar[strength]}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Password Strength
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${strengthColors.text[strength]}`}>
          {getStrengthText(strength)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                isMet
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400"
              }`}
            >
              {isMet ? (
                <Check size={12} strokeWidth={3} className="shrink-0" />
              ) : (
                <X size={12} strokeWidth={3} className="shrink-0 opacity-40" />
              )}
              <span className="text-[10px] font-bold leading-none">
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
