import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";
import AdminLoadingState from "./components/AdminLoadingState";
import AdminErrorState from "./components/AdminErrorState";
import AdminPageHeader, { BackToAdminLink } from "./components/AdminPageHeader";
import AdminStatusBadge from "./components/AdminStatusBadge";
import {
  ShieldIcon,
  ExternalLinkIcon,
  ResolveIcon,
  DismissIcon,
  DeleteIcon,
} from "./components/AdminIcons";

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
  const handleDeleteReport = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently purge this report record?",
      )
    )
      return;
    try {
      const data = await execute(`/api/admin/reports/${id}`, {
        method: "DELETE",
      });
      if (data?.success) {
        setReports((prev) => prev.filter((r) => r._id !== id));
        showToast("Report record purged", "success");
      } else {
        showToast(
          data?.message || data?.msg || "Failed to purge report",
          "error",
        );
      }
    } catch {
      showToast("Error purging report record", "error");
    }
  };

  const filteredReports = reports.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  if (loading)
    return (
      <AdminLoadingState message="Scanning Platform Flags..." color="amber" />
    );

  if (error)
    return (
      <AdminErrorState
        error={error}
        onRetry={fetchReports}
        title="Signal Interrupted"
        buttonText="Re-establish Connection"
        color="amber"
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <AdminPageHeader
        badge="Integrity Shield"
        badgeColor="amber"
        title="Safety Console"
        subtitle="Review and resolve priority flags to maintain ecosystem health."
        showPulse
      >
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Active Signal Count
          </span>
          <span className="text-2xl font-black text-amber-500 tracking-tighter tabular-nums">
            {reports.length.toString().padStart(3, "0")}
          </span>
        </div>
        <BackToAdminLink color="amber" />
      </AdminPageHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        <div className="grid grid-cols-2 sm:flex bg-gray-100/50 dark:bg-black/20 p-1.5 rounded-[1.25rem] border border-gray-200/50 dark:border-white/5 backdrop-blur-xl w-full sm:w-auto gap-1.5 sm:gap-0">
          {[
            { id: "pending", label: "Pending", color: "amber" },
            { id: "resolved", label: "Resolved", color: "emerald" },
            { id: "dismissed", label: "Dismissed", color: "gray" },
            { id: "all", label: "All Logs", color: "blue" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center ${
                statusFilter === tab.id
                  ? `bg-white dark:bg-[#1a1a1a] text-${tab.color}-500 shadow-xl shadow-black/5`
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-5">Source Agent</th>
                <th className="px-5 py-5 text-center">Protocol Node</th>
                <th className="px-5 py-5">Data & Intelligence</th>
                <th className="px-5 py-5 text-center">Status</th>
                <th className="px-5 py-5 text-center">Timestamp</th>
                <th className="px-5 py-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-6 grayscale opacity-40">
                      <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                        <ShieldIcon size={48} strokeWidth="1.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Area is Secure
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          No priority flags detected in this sector.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] group"
                  >
                    <td className="px-5 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-500/20 shadow-sm transition-transform group-hover:scale-110">
                          {report.reporterId?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white truncate text-sm leading-tight">
                            {report.reporterId?.name || "Terminated Node"}
                          </p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {report.reporterId?.email || "Encrypted ID"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AdminStatusBadge
                          label={report.targetType}
                          variant={
                            report.targetType === "Listing"
                              ? "listing"
                              : "profile"
                          }
                          className="text-[9px] rounded-lg"
                        />
                        {report.target ? (
                          <Link
                            to={
                              report.targetType === "Listing"
                                ? `/listings/${report.targetId}`
                                : `/profile/${report.targetId}`
                            }
                            className="text-xs font-bold text-gray-900 dark:text-gray-200 hover:text-amber-500 transition-colors inline-flex items-center gap-1.5 truncate max-w-[140px]"
                          >
                            {report.targetType === "Listing"
                              ? report.target.title
                              : report.target.name}
                            <ExternalLinkIcon
                              size={10}
                              className="opacity-0 group-hover:opacity-100 transition-all"
                            />
                          </Link>
                        ) : (
                          <span className="text-xs italic text-gray-400 uppercase font-black tracking-widest opacity-50">
                            Null Link
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-6">
                      <div className="bg-gray-100/50 dark:bg-black/20 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 group-hover:border-amber-500/20 transition-colors">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          &ldquo;{report.reason}&rdquo;
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-6 text-center">
                      <AdminStatusBadge
                        label={report.status}
                        variant={report.status}
                        pulse={true}
                      />
                    </td>
                    <td className="px-5 py-6 text-center text-xs font-bold text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-6 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              className="relative flex items-center h-10 px-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 group/op"
                              title="Resolve Intelligence"
                            >
                              <span className="flex-shrink-0">
                                <ResolveIcon />
                              </span>
                              <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                                Resolve
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "dismissed")
                              }
                              className="relative flex items-center h-10 px-3 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 group/op"
                              title="Dismiss Intelligence"
                            >
                              <span className="flex-shrink-0">
                                <DismissIcon />
                              </span>
                              <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                                Dismiss
                              </span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="relative flex items-center h-10 px-3 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 group/op"
                          title="Purge Record"
                        >
                          <span className="flex-shrink-0">
                            <DeleteIcon />
                          </span>
                          <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                            Purge
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredReports.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#2a2a2a]">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                No priority flags detected
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#2a2a2a] p-6 shadow-sm flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      {report.reporterId?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white leading-none">
                        {report.reporterId?.name || "Terminated Node"}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                        Source Agent
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      report.status === "pending"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                        : report.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                      Protocol Node
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mb-2 border ${
                        report.targetType === "Listing"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      }`}
                    >
                      {report.targetType}
                    </span>
                    {report.target && (
                      <Link
                        to={
                          report.targetType === "Listing"
                            ? `/listings/${report.targetId}`
                            : `/profile/${report.targetId}`
                        }
                        className="text-xs font-bold text-gray-900 dark:text-gray-200 block truncate hover:text-amber-500 transition-colors"
                      >
                        {report.targetType === "Listing"
                          ? report.target.title
                          : report.target.name}
                      </Link>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                      Timestamp
                    </span>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 block">
                    Intelligence Log
                  </span>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    &ldquo;{report.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {report.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(report._id, "resolved")
                        }
                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                      >
                        <ResolveIcon size={16} strokeWidth="3" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(report._id, "dismissed")
                        }
                        className="flex-1 py-4 bg-amber-500/10 text-amber-600 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-amber-500/20 transition-all hover:bg-amber-500 hover:text-white flex items-center justify-center gap-2"
                      >
                        <DismissIcon size={16} strokeWidth="3" />
                        <span>Dismiss</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="w-14 h-14 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center border border-red-500/20 transition-all hover:bg-red-500 hover:text-white"
                    title="Purge Record"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
