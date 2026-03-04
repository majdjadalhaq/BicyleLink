import { useEffect, useState, useRef } from "react";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import ListingCard from "../../components/ListingCard";
import { LoadingState } from "../../components/ui";
import EmptyState from "../../components/ui/EmptyState/EmptyState";
import { motion } from "framer-motion";

/* ─── Grid column detector (same pattern as Home) ──────────────── */
const useGridCols = (gridRef) => {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    if (!gridRef.current) return;
    const measure = () => {
      const el = gridRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const colsStr = style.getPropertyValue("grid-template-columns");
      if (colsStr && colsStr !== "none") {
        setCols(colsStr.trim().split(/\s+/).length);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [gridRef]);
  return cols;
};

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const gridRef = useRef(null);
  const gridCols = useGridCols(gridRef);

  const { isLoading, error, performFetch } = useFetch(
    `/listings?ownerId=${user?._id}`,
    (response) => {
      setListings(response.result);
    },
  );

  useEffect(() => {
    if (user) {
      performFetch();
    }
  }, [user]);

  const activeCount = listings.filter((l) => l.status === "active").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  if (isLoading) return <LoadingState message="Loading your bikes..." />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-red-500">
        Error: {error.toString()}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)] pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          My Listings
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your bikes and track their status.
        </p>
      </div>

      {/* Stats bar */}
      {listings.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {activeCount} Active
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {soldCount} Sold
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {listings.length === 0 ? (
        <div className="py-12 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
          <EmptyState
            title="No listings yet"
            message="Use the 'Sell a Bike' button in the navigation to create your first listing."
            icon={
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <polyline points="15 6 10 6 6 10.5 4.5 13" />
                <polyline points="19 17.5 19 9 14 3 7.5 3" />
              </svg>
            }
          />
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {listings.map((listing, i) => {
            const row = Math.floor(i / gridCols);
            const col = i % gridCols;
            return (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                transition={{
                  duration: 0.55,
                  delay: row * 0.18 + col * 0.08,
                  ease: [0.2, 0.8, 0.2, 1],
                }}
              >
                <ListingCard
                  listing={listing}
                  isOwnerView={true}
                  onUpdated={performFetch}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;
