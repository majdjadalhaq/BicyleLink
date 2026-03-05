import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useApi from "../../hooks/useApi";
import AdminLoadingState from "./components/AdminLoadingState";
import AdminErrorState from "./components/AdminErrorState";
import AdminStatusBadge from "./components/AdminStatusBadge";
import AdminPageHeader, { BackToAdminLink } from "./components/AdminPageHeader";
import {
  SearchIcon,
  ImageIcon,
  EditIcon,
  StarIcon,
  DeleteIcon,
} from "./components/AdminIcons";

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { execute } = useApi();

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await execute("/admin/listings");

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
      const data = await execute(`/admin/listings/${id}/featured`, {
        method: "PATCH",
      });
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
      const data = await execute(`/admin/listings/${id}`, {
        method: "DELETE",
      });
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
      <AdminLoadingState
        message="Indexing Global Catalogue..."
        color="emerald"
      />
    );

  if (error)
    return (
      <AdminErrorState
        error={error}
        onRetry={fetchListings}
        title="Catalogue Offline"
        buttonText="Reset Transceiver"
        color="emerald"
      />
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <AdminPageHeader
        badge="Inventory Console"
        badgeColor="emerald"
        title="Catalogue Manager"
        subtitle="Monitor, moderate, and promote units across the marketplace."
        showPulse
      >
        <div className="relative group w-full lg:w-80">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <SearchIcon />
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
        <BackToAdminLink color="emerald" />
      </AdminPageHeader>

      <div className="space-y-6">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                <th className="px-5 py-5">Unit Detail</th>
                <th className="px-5 py-5">Source</th>
                <th className="px-5 py-5 text-center">Value</th>
                <th className="px-5 py-5 text-center">Status</th>
                <th className="px-5 py-5 text-center">Protocol</th>
                <th className="px-5 py-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-300">
                        <SearchIcon size={40} strokeWidth="1.5" />
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
                    <td className="px-5 py-6">
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
                              <ImageIcon size={24} strokeWidth="2" />
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
                    <td className="px-5 py-6">
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
                    <td className="px-5 py-6 text-center">
                      <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                        €{listing.price}
                      </span>
                    </td>
                    <td className="px-5 py-6 text-center">
                      <AdminStatusBadge
                        label={listing.status}
                        variant={
                          listing.status === "active"
                            ? "active"
                            : listing.status === "sold"
                              ? "sold"
                              : "pending"
                        }
                      />
                    </td>
                    <td className="px-5 py-6 text-center">
                      <AdminStatusBadge
                        label={
                          listing.isFeatured ? "Priority Item" : "Standard"
                        }
                        variant={listing.isFeatured ? "featured" : "standard"}
                      />
                    </td>
                    <td className="px-5 py-6 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/listings/${listing._id}/edit`)
                          }
                          className="relative flex items-center h-10 px-3 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-500 hover:border-emerald-500 hover:text-emerald-500 rounded-xl transition-all duration-300 shadow-sm group/op"
                          title="Modify Record"
                        >
                          <span className="flex-shrink-0">
                            <EditIcon />
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
                            <StarIcon />
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
                            <DeleteIcon />
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
                    <EditIcon
                      size={16}
                      className="text-gray-400 group-hover:text-emerald-500"
                    />
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
                    <StarIcon
                      size={16}
                      className={
                        listing.isFeatured
                          ? "text-white"
                          : "text-gray-400 group-hover:text-amber-500"
                      }
                    />
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
                    <DeleteIcon size={16} />
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
