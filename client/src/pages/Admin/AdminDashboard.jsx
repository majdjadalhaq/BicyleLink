import { useEffect, useState } from "react";
import { Link } from "react-router";
import StatCard from "../../components/Admin/StatCard";
import ActivityGraph from "../../components/Admin/ActivityGraph";
import {
  WarnIcon,
  PromoteIcon,
  StarIcon,
  ArrowRightIcon,
} from "./components/AdminIcons";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500/10 border-b-emerald-400 rounded-full animate-spin-slow"></div>
          </div>
        </div>
        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
          Synchronizing Neural Link...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-12 mt-12 bg-white dark:bg-[#1a1a1a] border border-red-100 dark:border-red-900/20 rounded-[2.5rem] text-center shadow-xl">
        <div className="flex justify-center mb-6 text-emerald-500">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Connection Interrupted
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          Re-establish Link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              System Admin
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
            Command Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Project real-time metrics and platform governance.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/reports"
            className="group relative flex items-center gap-4 px-6 py-4 bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-[#2a2a2a] rounded-3xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Security Alerts
              </span>
              <span className="font-black text-gray-900 dark:text-white tracking-tight">
                {stats.pendingReports} Pending Reports
              </span>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${stats.pendingReports > 0 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}
            >
              <WarnIcon size={20} />
            </div>
          </Link>
        </div>
      </header>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Global Citizens"
          value={stats.totalUsers}
          icon={<PromoteIcon size={24} />}
          color="primary"
        />
        <StatCard
          title="Active Inventory"
          value={stats.totalListings}
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
          color="success"
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Premium Slot"
            value={stats.featuredListings}
            icon={<StarIcon size={24} />}
            color="warning"
          />
        </div>
      </div>

      {/* Analytics & Tools Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ActivityGraph data={stats.recentListings} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] border border-gray-100 dark:border-[#2a2a2a] shadow-sm flex flex-col gap-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Management Gateways
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group font-bold text-sm"
              >
                <span>User Registry</span>
                <ArrowRightIcon
                  strokeWidth="3"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                to="/admin/listings"
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group font-bold text-sm"
              >
                <span>Catalogue Manager</span>
                <ArrowRightIcon
                  strokeWidth="3"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                to="/admin/reports"
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all group font-bold text-sm"
              >
                <span>Justice Console</span>
                <ArrowRightIcon
                  strokeWidth="3"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
          </div>

          <div className="bg-emerald-600 dark:bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-2xl font-black tracking-tight mb-2">
                Platform Health
              </h4>
              <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                All systems are operational. Global load is within normal
                parameters.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Real-time Monitoring Active
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg
                width="160"
                height="160"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
