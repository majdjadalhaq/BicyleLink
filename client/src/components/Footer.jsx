import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  if (isAuthPage) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border py-10 px-6 text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 text-center md:text-left">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold text-emerald-500 mb-4">
            🚲 BiCycleL
          </h3>
          <p className="leading-relaxed text-gray-500 dark:text-gray-400 max-w-sm">
            The premium marketplace for second-hand bicycles. Buy and sell with
            confidence.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Explore
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="hover:text-emerald-500 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/listing/create"
                className="hover:text-emerald-500 transition-colors"
              >
                Sell a Bike
              </Link>
            </li>
            <li>
              <Link
                to="/user"
                className="hover:text-emerald-500 transition-colors"
              >
                Community
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Legal
          </h4>
          <ul className="space-y-2">
            <li>
              <span className="opacity-50 cursor-not-allowed">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="opacity-50 cursor-not-allowed">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="opacity-50 cursor-not-allowed">
                Cookie Policy
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-light-border dark:border-dark-border text-center text-sm text-gray-400 dark:text-gray-500">
        <p>&copy; {year} BiCycleL. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
