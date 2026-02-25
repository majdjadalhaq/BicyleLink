import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading reports...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto p-8 mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl text-center">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          Error
        </h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] space-y-6 bg-light-bg dark:bg-dark-bg">
      <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-2">
        <Link to="/admin" className="hover:text-amber-500 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200">
          Report Moderation
        </span>
      </nav>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community Flags
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Review and resolve reports to maintain platform safety
          </p>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-sm">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Total Reports:
            </span>
            <span className="text-lg font-bold text-amber-500">
              {reports.length}
            </span>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
        <div className="flex bg-gray-100 dark:bg-dark-surface p-1 rounded-xl shadow-inner border border-gray-200 dark:border-dark-border min-w-max">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === "resolved"
                ? "bg-emerald-500 text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === "dismissed"
                ? "bg-gray-500 text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setStatusFilter("dismissed")}
          >
            Dismissed
          </button>
          <div className="w-px bg-gray-300 dark:bg-gray-700 mx-2 my-1"></div>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-blue-500 text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All Reports
          </button>
        </div>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-input/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-light-border dark:border-dark-border">
                <th className="px-6 py-4 font-semibold w-52">Reporter</th>
                <th className="px-6 py-4 font-semibold w-48">
                  Flagged Content
                </th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">
                  Reason & Context
                </th>
                <th className="px-6 py-4 font-semibold w-32">Status</th>
                <th className="px-6 py-4 font-semibold w-32">Submitted</th>
                <th className="px-6 py-4 font-semibold w-40 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-4">
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
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        No reports found
                      </h3>
                      <p className="text-sm">
                        Great job! The platform is looking clean under the
                        &quot;{statusFilter}&quot; filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex flex-shrink-0 items-center justify-center text-sm shadow-sm border border-amber-200 dark:border-amber-500/30">
                          {report.reporterId?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {report.reporterId?.name || "Deleted User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {report.reporterId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            report.targetType === "Listing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                          }`}
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
                            className="text-sm font-semibold text-gray-900 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors inline-flex items-center gap-1 group/link truncate max-w-[160px]"
                          >
                            <span className="truncate">
                              {report.targetType === "Listing"
                                ? report.target.title
                                : report.target.name}
                            </span>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="opacity-0 group-hover/link:opacity-100 flex-shrink-0 -translate-x-1 group-hover/link:translate-x-0 transition-all"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="text-sm italic text-gray-400 dark:text-gray-500">
                            Deleted {report.targetType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-gray-50 dark:bg-dark-input/50 border border-gray-100 dark:border-gray-800 rounded-lg p-3 max-h-[80px] overflow-y-auto custom-scrollbar">
                        <p
                          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                          title={report.reason}
                        >
                          {report.reason}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : report.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            report.status === "pending"
                              ? "bg-amber-500 animate-pulse"
                              : report.status === "resolved"
                                ? "bg-emerald-500"
                                : "bg-gray-500"
                          }`}
                        ></span>
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white rounded-lg text-xs font-bold transition-colors"
                              title="Mark as Resolved"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "dismissed")
                              }
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-500 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-xs font-bold transition-colors"
                              title="Dismiss Report"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 italic px-2">
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
    </div>
  );
};

export default ReportManagement;
