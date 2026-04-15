import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SPRING } from "../../constants/design-tokens";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  className = "",
  leftIcon,
  rightIcon,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 focus:ring-emerald-500",
    secondary:
      "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 focus:ring-gray-300",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 focus:ring-red-500",
    glass:
      "backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 text-white hover:bg-white/20",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-xl gap-2",
    md: "px-6 py-3 text-xs rounded-2xl gap-2.5",
    lg: "px-8 py-4 text-sm rounded-[1.25rem] gap-3",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.SNAPPY}
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span className="leading-none">{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "glass", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  className: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  type: PropTypes.string,
};

export default Button;
