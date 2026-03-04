import { Link, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);
  if (isAuthPage) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-[#0e0e0e] border-t border-gray-200 dark:border-[#1e1e1e] pt-12 pb-24 md:pb-8 px-6 text-gray-500 dark:text-gray-400 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 text-center md:text-left">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
                <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
                <path d="M12 6V3" />
              </svg>
            </div>
            <span className="text-xl font-black text-emerald-500">
              BiCycleL
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 dark:text-gray-500 max-w-sm mx-auto md:mx-0">
            The community-driven marketplace for pre-loved bicycles. Find your
            next ride or pass yours on to a new rider.
          </p>
        </div>

        {/* Ride */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Ride
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Browse Bikes
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/listing/create"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Sell a Bike
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
            Legal
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <span className="opacity-40 cursor-not-allowed">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="opacity-40 cursor-not-allowed">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="opacity-40 cursor-not-allowed">
                Cookie Policy
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-200 dark:border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-600">
        <p>&copy; {year} BiCycleL. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made for cyclists, by cyclists
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
            <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
            <path d="M12 6V3" />
          </svg>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
