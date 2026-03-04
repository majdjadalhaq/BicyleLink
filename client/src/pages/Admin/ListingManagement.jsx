import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/listings");
      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
      } else {
        setError(data.msg || "Failed to load listings");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleFeatured = async (id) => {
    try {
      const response = await fetch(`/api/admin/listings/${id}/featured`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (data.success) {
        setListings((prev) =>
          prev.map((l) =>
            l._id === id ? { ...l, isFeatured: data.listing.isFeatured } : l,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured status", err);
    }
  };

  const handleDeleteListing = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone.",
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setListings((prev) => prev.filter((l) => l._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete listing", err);
    }
  };

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ownerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
          Indexing Global Catalogue...
        </p>
      </div>
    );

  if (error)
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
          Catalogue Offline
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          {error}
        </p>
        <button
          onClick={fetchListings}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Reset Transceiver
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              Inventory Console
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
            Catalogue Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Monitor, moderate, and promote units across the marketplace.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group w-full lg:w-80">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <label htmlFor="admin-search" className="sr-only">
              Search by title or owner
            </label>
            <input
              id="admin-search"
              name="admin-search"
              type="text"
              placeholder="Search by title or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-[1.5rem] text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-sm"
            />
          </div>
          <Link
            to="/admin"
            className="hidden sm:flex px-6 py-4 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-sm transition-all hover:border-emerald-500 hover:text-emerald-500 shadow-sm whitespace-nowrap"
          >
            ← Command Center
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                  <th className="px-8 py-5">Unit Detail</th>
                  <th className="px-8 py-5 w-48">Source</th>
                  <th className="px-8 py-5 w-32 text-center">Value</th>
                  <th className="px-8 py-5 w-40 text-center">Status</th>
                  <th className="px-8 py-5 w-40 text-center">Protocol</th>
                  <th className="px-8 py-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-300">
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          No matching units found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr
                      key={listing._id}
                      className="transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative flex-shrink-0">
                            {listing.images?.[0] ? (
                              <img
                                src={listing.images[0]}
                                alt=""
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-[#2a2a2a] shadow-md group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                  />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            )}
                            {listing.isFeatured && (
                              <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-lg border-2 border-white dark:border-[#1a1a1a] shadow-lg animate-pulse">
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  stroke="none"
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/listings/${listing._id}`}
                              className="font-black text-gray-900 dark:text-white hover:text-emerald-500 transition-colors truncate block text-base"
                            >
                              {listing.title}
                            </Link>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1 group-hover:text-emerald-500/70 transition-colors">
                              {listing.category} —{" "}
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Link
                          to={`/profile/${listing.ownerId?._id}`}
                          className="flex items-center gap-3 group/owner"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-[10px] border border-emerald-500/20 shadow-sm group-hover/owner:bg-emerald-500 group-hover/owner:text-white transition-all">
                            {listing.ownerId?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                            {listing.ownerId?.name || "Anonymous"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                          €{listing.price}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            listing.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                              : listing.status === "sold"
                                ? "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            listing.isFeatured
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {listing.isFeatured ? "Priority Item" : "Standard"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right pr-12">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <button
                            onClick={() =>
                              navigate(`/listings/${listing._id}/edit`)
                            }
                            className="relative flex items-center h-10 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-500 hover:border-emerald-500 hover:text-emerald-500 rounded-xl transition-all duration-300 shadow-sm group/op"
                            title="Modify Record"
                          >
                            <span className="flex-shrink-0">
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
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </span>
                            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                              Edit
                            </span>
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(listing._id)}
                            className={`relative flex items-center h-10 px-3 rounded-xl transition-all duration-300 shadow-sm group/op ${
                              listing.isFeatured
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-400 hover:border-amber-500 hover:text-amber-500"
                            }`}
                            title={
                              listing.isFeatured
                                ? "Lower Priority"
                                : "Boost Visibility"
                            }
                          >
                            <span className="flex-shrink-0">
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
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </span>
                            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                              {listing.isFeatured ? "Unboost" : "Boost"}
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteListing(listing._id)}
                            className="relative flex items-center h-10 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 shadow-sm group/op"
                            title="Purge Record"
                          >
                            <span className="flex-shrink-0">
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
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </span>
                            <span className="overflow-hidden max-w-0 group-hover/op:max-w-[100px] opacity-0 group-hover/op:opacity-100 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold ml-0 group-hover/op:ml-2">
                              Delete
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
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredListings.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#2a2a2a]">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                No matching units found
              </p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-sm flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        listing.status === "active"
                          ? "bg-emerald-500/80 text-white border-emerald-400"
                          : listing.status === "sold"
                            ? "bg-gray-900/80 text-white border-gray-700"
                            : "bg-amber-500/80 text-white border-amber-400"
                      }`}
                    >
                      {listing.status}
                    </span>
                    {listing.isFeatured && (
                      <span className="bg-amber-500/90 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-amber-400">
                        Priority
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/90 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                    <span className="text-xl font-black text-emerald-500 tracking-tighter">
                      €{listing.price}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-2 block truncate"
                  >
                    {listing.title}
                  </Link>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {listing.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/profile/${listing.ownerId?._id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                      {listing.ownerId?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {listing.ownerId?.name || "Anonymous"}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">
                        Owner Identity
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => navigate(`/listings/${listing._id}/edit`)}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-2xl transition-all group"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 group-hover:text-emerald-500"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-emerald-500">
                      Edit
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(listing._id)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all group ${
                      listing.isFeatured
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "bg-gray-50 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={
                        listing.isFeatured
                          ? "text-white"
                          : "text-gray-400 group-hover:text-amber-500"
                      }
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        listing.isFeatured
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-amber-500"
                      }`}
                    >
                      {listing.isFeatured ? "Unboost" : "Boost"}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteListing(listing._id)}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all group font-black uppercase text-[10px] tracking-widest"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span>Delete</span>
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

export default ListingManagement;
