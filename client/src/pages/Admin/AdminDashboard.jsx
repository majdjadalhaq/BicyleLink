import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/Admin/StatCard";
import ActivityGraph from "../../components/Admin/ActivityGraph";
import "./AdminDashboard.css";

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
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading global statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Dashboard Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn--primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Admin Command Center</h1>
          <p className="admin-header__subtitle">
            Platform overview and management metrics
          </p>
        </div>
        {stats.pendingReports > 0 && (
          <div className="admin-header__actions">
            <Link to="/admin/reports" className="btn btn--warning">
              {stats.pendingReports} Pending Reports
            </Link>
          </div>
        )}
      </header>

      <div className="admin-stats-grid">
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

      <div className="admin-main-content">
        <ActivityGraph data={stats.recentListings} />
      </div>

      <div className="admin-action-cards">
        <Link to="/admin/users" className="admin-action-card">
          <div className="admin-action-card__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
          <div className="admin-action-card__content">
            <h3>Manage Users</h3>
            <p>View, block, or assign admin privileges to community members.</p>
          </div>
          <div className="admin-action-card__arrow">→</div>
        </Link>

        <Link to="/admin/listings" className="admin-action-card">
          <div className="admin-action-card__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
          <div className="admin-action-card__content">
            <h3>Moderate Listings</h3>
            <p>Review all active bikes, promote listings, or remove content.</p>
          </div>
          <div className="admin-action-card__arrow">→</div>
        </Link>

        <Link to="/admin/reports" className="admin-action-card">
          <div className="admin-action-card__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
          <div className="admin-action-card__content">
            <h3>Review Reports</h3>
            <p>
              Handle flagged content and user reports to keep the platform safe.
            </p>
          </div>
          <div className="admin-action-card__arrow">→</div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
