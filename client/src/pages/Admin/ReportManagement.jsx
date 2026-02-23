import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";
import "./ReportManagement.css";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const { showToast } = useToast();
  const { execute } = useApi();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await execute("/api/admin/reports");
      if (data?.success) {
        setReports(data.reports);
      } else {
        setError(data?.message || data?.msg || "Failed to load reports");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const data = await execute(`/api/admin/reports/${id}`, {
        method: "PATCH",
        body: { status },
      });
      if (data?.success) {
        setReports((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: data.report.status } : r,
          ),
        );
        showToast(`Report marked as ${status}`, "success");
      } else {
        showToast(
          data?.message || data?.msg || "Failed to update report status",
          "error",
        );
        // Refetch reports to ensure UI is consistent with server state if an error occurred during update
        fetchReports();
      }
    } catch {
      showToast("Failed to update report status", "error");
      fetchReports();
    }
  };

  const filteredReports = reports.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );

  if (error)
    return (
      <div className="admin-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="report-management">
      <nav className="admin-breadcrumbs">
        <Link to="/admin">Dashboard</Link>
        <span className="separator">/</span>
        <span className="current">Report Moderation</span>
      </nav>

      <header className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">Community Flags</h1>
          <p className="admin-header__subtitle">
            Review and resolve reports to maintain platform safety
          </p>
        </div>
        <div className="admin-header__right">
          <div className="report-stats">
            <div className="stat-pill">
              <span className="stat-label">Total Reports:</span>
              <span className="stat-value">{reports.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-controls">
        <div className="filter-group-glass">
          <button
            className={`filter-btn-pill ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn-pill ${statusFilter === "resolved" ? "active" : ""}`}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved
          </button>
          <button
            className={`filter-btn-pill ${statusFilter === "dismissed" ? "active" : ""}`}
            onClick={() => setStatusFilter("dismissed")}
          >
            Dismissed
          </button>
          <div className="divider"></div>
          <button
            className={`filter-btn-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Reports
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper-premium">
        <table className="admin-table-modern">
          <thead>
            <tr>
              <th className="col-reporter">Reporter</th>
              <th className="col-target">Flagged Content</th>
              <th className="col-reason">Reason & Context</th>
              <th className="col-status">Status</th>
              <th className="col-date">Submitted</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-cell">
                  <div className="empty-state-content">
                    <div className="empty-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                    </div>
                    <h3>No reports found</h3>
                    <p>
                      Great job! The platform is looking clean under the &quot;
                      {statusFilter}&quot; filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report._id} className="report-row">
                  <td className="col-reporter">
                    <div className="reporter-info">
                      <div className="reporter-avatar">
                        {report.reporterId?.name?.charAt(0) || "U"}
                      </div>
                      <div className="reporter-details">
                        <span className="reporter-name">
                          {report.reporterId?.name || "Deleted User"}
                        </span>
                        <span className="reporter-email">
                          {report.reporterId?.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="col-target">
                    <div className="target-info">
                      <span
                        className={`type-badge-mini type--${report.targetType.toLowerCase()}`}
                      >
                        {report.targetType}
                      </span>
                      {report.target ? (
                        <Link
                          to={
                            report.targetType === "Listing"
                              ? `/listings/${report.targetId}`
                              : `/profile/${report.targetId}`
                          }
                          className="target-link-modern"
                        >
                          {report.targetType === "Listing"
                            ? report.target.title
                            : report.target.name}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="deleted-target-modern">
                          Deleted {report.targetType}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="col-reason">
                    <div className="reason-container">
                      <div className="reason-text" title={report.reason}>
                        {report.reason}
                      </div>
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`status-pill status--${report.status}`}>
                      <span className="dot"></span>
                      {report.status}
                    </span>
                  </td>
                  <td className="col-date">
                    <span className="date-display">
                      {new Date(report.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="action-button-group">
                      {report.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(report._id, "resolved")
                            }
                            className="btn-action-modern btn-resolve-modern"
                            title="Mark as Resolved"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(report._id, "dismissed")
                            }
                            className="btn-action-modern btn-dismiss-modern"
                            title="Dismiss Report"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="action-completed-text">
                          No actions
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportManagement;
