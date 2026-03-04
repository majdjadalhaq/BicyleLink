import PropTypes from "prop-types";

const SectionHeader = ({
  title,
  subtitle,
  children,
  className = "",
  size = "default",
}) => {
  const sizes = {
    sm: "text-base",
    default: "text-lg",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-light-border dark:border-dark-border ${className}`}
    >
      <div>
        <h2
          className={`font-bold text-gray-900 dark:text-white ${sizes[size]}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-muted mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "default", "lg", "xl"]),
};

export default SectionHeader;
