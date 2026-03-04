import PropTypes from "prop-types";

/**
 * Consistent page wrapper component.
 * @param {"centered" | "full" | "narrow"} variant
 */
const PageContainer = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10",
    centered:
      "min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 sm:p-8",
    full: "w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10",
    narrow: "max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10",
  };

  return (
    <div
      className={`bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </div>
  );
};

PageContainer.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "centered", "full", "narrow"]),
  className: PropTypes.string,
};

export default PageContainer;
