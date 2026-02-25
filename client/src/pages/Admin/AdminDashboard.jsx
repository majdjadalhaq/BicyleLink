import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/Admin/StatCard";
import ActivityGraph from "../../components/Admin/ActivityGraph";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.msg || "Failed to load admin stats");
        }
      } catch {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading global statistics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8 mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          Dashboard Error
        </h2>
        <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] space-y-8 bg-light-bg dark:bg-dark-bg">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-light-surface dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Command Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Platform overview and management metrics
          </p>
        </div>
        {stats.pendingReports > 0 && (
          <div>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-white text-amber-500 rounded-full text-xs font-bold">
                {stats.pendingReports}
              </span>
              Pending Reports
            </Link>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          color="primary"
        />
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m16 10-4 4-4-4" />
            </svg>
          }
          color="success"
        />
        <StatCard
          title="Featured Items"
          value={stats.featuredListings}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          color="warning"
        />
      </div>

      <div>
        <ActivityGraph data={stats.recentListings} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="group bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-md flex flex-col"
        >
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Manage Users
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
            View, block, or assign admin privileges to community members.
          </p>
          <div className="mt-4 text-emerald-500 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Go to Users <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>

        <Link
          to="/admin/listings"
          className="group bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md flex flex-col"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Moderate Listings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
            Review all active bikes, promote listings, or remove content.
          </p>
          <div className="mt-4 text-blue-500 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Go to Listings <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="group bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border hover:border-amber-500 dark:hover:border-amber-500 transition-all hover:shadow-md flex flex-col"
        >
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Review Reports
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
            Handle flagged content and user reports to keep the platform safe.
          </p>
          <div className="mt-4 text-amber-500 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Go to Reports <span aria-hidden="true">&rarr;</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
