import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Breadcrumbs component that accepts a list of items for navigation.
 * Each item should have a label and a path.
 */
const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation();
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  if (isAuthPage) return null;

  return (
    <nav
      aria-label="breadcrumb"
      className="py-3 px-4 sm:px-0 max-w-7xl mx-auto w-full"
    >
      <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link
            to="/"
            className="hover:text-emerald-500 transition-colors font-medium"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.path || index}
              className="flex items-center gap-2"
              aria-current={isLast ? "page" : undefined}
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              {isLast ? (
                <span className="text-emerald-500 font-semibold">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-emerald-500 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
    }),
  ),
};

export default Breadcrumbs;
