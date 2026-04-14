import { Check, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Premium Password Strength Meter with kinetic feedback.
 */
const PasswordStrengthMeter = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Number check", test: (p) => /[0-9]/.test(p) },
    { label: "Special character", test: (p) => /[@$!%*?&]/.test(p) },
  ];

  const strength = requirements.filter((req) => req.test(password)).length;

  const getStrengthText = (s) => {
    if (s === 0) return "Start typing...";
    if (s <= 2) return "Vulnerable";
    if (s <= 3) return "Average";
    if (s <= 4) return "Secure";
    return "Ironclad";
  };

  const getStrengthColor = (s) => {
    if (s <= 2) return "oklch(65% 0.25 20)"; // Vivid Red
    if (s <= 3) return "oklch(75% 0.2 60)"; // Amber
    if (s <= 4) return "oklch(75% 0.2 120)"; // Lime/Green
    return "oklch(70% 0.25 160)"; // Elite Emerald
  };

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 mb-8"
    >
      {/* Dynamic Bar */}
      <div className="relative">
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(strength / 5) * 100}%`,
              backgroundColor: getStrengthColor(strength),
            }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {/* Animated Shield Marker */}
        <AnimatePresence>
          {strength === 5 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -right-1 -top-6 text-[#10B77F]"
            >
              <ShieldCheck size={18} fill="currentColor" fillOpacity={0.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Security Level
        </span>
        <motion.span
          key={strength}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ color: getStrengthColor(strength) }}
        >
          {getStrengthText(strength)}
        </motion.span>
      </div>

      {/* Checklist Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 },
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-500 ${
                isMet
                  ? "bg-[#10B77F]/5 border-[#10B77F]/20 text-[#10B77F]"
                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400"
              }`}
            >
              <div
                className={`transition-transform duration-500 ${isMet ? "scale-110" : "scale-100 opacity-40"}`}
              >
                {isMet ? (
                  <Check size={12} strokeWidth={4} />
                ) : (
                  <X size={12} strokeWidth={4} />
                )}
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight ${isMet ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}
              >
                {req.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string,
};

export default PasswordStrengthMeter;
